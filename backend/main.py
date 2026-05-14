from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from database import get_connection, init_db

app = FastAPI()


# 앱 시작 시 DB 초기화
@app.on_event("startup")
def startup():
    init_db()


class TaskCreate(BaseModel):
    title: str


class TaskStatusUpdate(BaseModel):
    status: str  # todo | in_progress | done


# 전체 업무 목록 조회
@app.get("/api/tasks")
def get_tasks():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


# 업무 추가
@app.post("/api/tasks", status_code=201)
def create_task(body: TaskCreate):
    conn = get_connection()
    cursor = conn.execute("INSERT INTO tasks (title) VALUES (?)", (body.title,))
    conn.commit()
    task_id = cursor.lastrowid
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return dict(row)


# 상태 변경
@app.patch("/api/tasks/{task_id}")
def update_task_status(task_id: int, body: TaskStatusUpdate):
    valid_statuses = {"todo", "in_progress", "done"}
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="유효하지 않은 상태값입니다.")
    conn = get_connection()
    result = conn.execute(
        "UPDATE tasks SET status = ? WHERE id = ?", (body.status, task_id)
    )
    conn.commit()
    if result.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="업무를 찾을 수 없습니다.")
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return dict(row)


# 업무 삭제
@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    conn = get_connection()
    result = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="업무를 찾을 수 없습니다.")


# 프론트엔드 정적 파일 서빙 (API 라우트 등록 후 마지막에 마운트)
app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")
