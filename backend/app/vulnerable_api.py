"""
Intentionally vulnerable "Library Management" API.

This is a MOCK target for API documentation + fuzzing experiments. It is
deliberately fragile:
  * No try/except, no defensive checks beyond Pydantic's default coercion.
  * Endpoints assume happy-path data and will raise (HTTP 500) on bad logic.
  * The "database" is a plain in-memory dict seeded in the lifespan handler.

Do NOT use any of these patterns in production.
"""

from contextlib import asynccontextmanager
from datetime import date
from enum import Enum

from fastapi import FastAPI
from pydantic import BaseModel, EmailStr


# --------------------------------------------------------------------------- #
# In-memory "database". Populated lazily in the lifespan context manager so
# that merely importing `app` (e.g. from the schema exporter) has no side
# effects and never hangs.
# --------------------------------------------------------------------------- #
db: dict[str, dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- startup: seed the fake DB -------------------------------------- #
    db["users"] = {
        1: {
            "user_id": 1,
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "is_active": True,
        }
    }
    db["books"] = {
        101: {
            "book_id": 101,
            "title": "The Pragmatic Programmer",
            "copies_available": 3,
            "book_status": "available",
        }
    }
    db["loans"] = {}  # loan_id -> {user_id, book_id}
    db["counters"] = {"user": 1, "book": 101, "loan": 0}
    yield
    # ---- shutdown: drop everything -------------------------------------- #
    db.clear()


app = FastAPI(
    title="Vulnerable Library Management API",
    description="A deliberately fragile FastAPI target for fuzzing.",
    version="0.1.0",
    lifespan=lifespan,
)


# --------------------------------------------------------------------------- #
# Models & Enums — strict types on purpose.
# --------------------------------------------------------------------------- #
class BookStatus(str, Enum):
    available = "available"
    checked_out = "checked_out"
    reserved = "reserved"
    lost = "lost"


class UserCreate(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    is_active: bool


class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    is_active: bool


class Book(BaseModel):
    book_id: int
    title: str
    copies_available: int
    book_status: BookStatus


class LoanRequest(BaseModel):
    user_id: int
    book_id: int
    due_date: date


# --------------------------------------------------------------------------- #
# Endpoints. Note the total absence of guards: missing keys, empty results,
# and impossible arithmetic are all left to explode into 500s.
# --------------------------------------------------------------------------- #
@app.get("/users/{user_id}")
def get_user(user_id: int):
    # KeyError -> 500 if the user does not exist.
    return db["users"][user_id]


@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    # Silently overwrites on id collision; no existence check.
    db["users"][user.user_id] = user.model_dump()
    db["counters"]["user"] = user.user_id
    return db["users"][user.user_id]


@app.put("/users/{user_id}")
def update_user(user_id: int, payload: UserUpdate):
    # Mutates in place; KeyError -> 500 if the user is absent.
    record = db["users"][user_id]
    record["name"] = payload.name
    record["email"] = payload.email
    record["is_active"] = payload.is_active
    return record


@app.delete("/users/{user_id}", status_code=200)
def delete_user(user_id: int):
    # pop without default -> KeyError -> 500 on unknown id.
    return db["users"].pop(user_id)


@app.get("/books/{book_id}")
def get_book(book_id: int):
    return db["books"][book_id]


@app.post("/books", status_code=201)
def create_book(book: Book):
    db["books"][book.book_id] = book.model_dump()
    return db["books"][book.book_id]


@app.post("/loans", status_code=201)
def create_loan(loan: LoanRequest):
    # Multiple ways to 500: unknown user, unknown book, or going negative
    # on stock (no >0 check before decrementing).
    user = db["users"][loan.user_id]
    book = db["books"][loan.book_id]

    book["copies_available"] = book["copies_available"] - 1
    book["book_status"] = BookStatus.checked_out.value

    db["counters"]["loan"] += 1
    loan_id = db["counters"]["loan"]
    db["loans"][loan_id] = {
        "loan_id": loan_id,
        "user_id": user["user_id"],
        "book_id": book["book_id"],
        "due_date": loan.due_date.isoformat(),
    }
    return db["loans"][loan_id]


@app.delete("/loans/{loan_id}", status_code=200)
def return_loan(loan_id: int):
    # KeyError on unknown loan; also blindly bumps stock back up.
    loan = db["loans"].pop(loan_id)
    book = db["books"][loan["book_id"]]
    book["copies_available"] = book["copies_available"] + 1
    book["book_status"] = BookStatus.available.value
    return {"returned": loan}
