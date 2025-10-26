from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from typing import Annotated, Optional
import sqlite3

con = sqlite3.connect('memos.db', check_same_thread=False)
cur = con.cursor()


app = FastAPI()



@app.post("/memos")
async def create_memo(
    title: Annotated[str, Form()],
    content: Annotated[str, Form()]
):
    
    cur = con.cursor()
    
    try:
        cur.execute(
            "INSERT INTO memos (title, content) VALUES (?, ?)",
            (title, content)
        )
        con.commit()
        last_id = cur.lastrowid
        return JSONResponse(jsonable_encoder({"message": "메모 생성 성공", "id": last_id}))
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@app.get("/memos")
async def get_memos(sorted: str = "ASC", sortedBy: str = "createAt"):
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    rows = cur.execute(f"""
        SELECT id, title, content, createAt
        FROM memos
        ORDER BY {sortedBy} {sorted}
    """).fetchall()
    return JSONResponse(jsonable_encoder([dict(row) for row in rows]))


app.mount("/", StaticFiles(directory="static", html=True), name="static")