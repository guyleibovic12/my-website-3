from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

app = FastAPI()

# לאפשר חיבור מה-frontend ב-Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # אפשר להגביל לכתובת ה-frontend שלך
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Backend is running"}


@app.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    try:
        # קריאה של קובץ Excel/CSV
        contents = await file.read()

        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            return {"error": "Only .csv or .xlsx files are supported"}

        # החזרת מידע לדוגמה
        return {
            "filename": file.filename,
            "columns": df.columns.tolist(),
            "rows": len(df),
            "preview": df.head(10).to_dict(orient="records"),
        }

    except Exception as e:
        return {"error": str(e)}
