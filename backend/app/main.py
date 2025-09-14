from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

app = FastAPI()

# אפשר גישה מה-frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # עדיף לשים את ה-URL של ה-frontend במקום *
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    try:
        # קריאת הקובץ שהועלה
        content = await file.read()

        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(content))
        elif file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            return {"error": "Only .xlsx or .csv files are supported"}

        # החזרת מידע בסיסי
        return {
            "rows": len(df),
            "columns": list(df.columns),
            "preview": df.head(5).to_dict(orient="records")
        }

    except Exception as e:
        return {"error": str(e)}
