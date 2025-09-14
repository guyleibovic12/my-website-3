from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from io import BytesIO

app = FastAPI()

# לאפשר גישה מה-frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"message": "Backend is running ✅"}

@app.post("/upload")
async def upload(file: UploadFile):
    """בדיקת העלאת קובץ בלבד"""
    try:
        content = await file.read()

        # קריאה של הקובץ
        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content))

        return {
            "filename": file.filename,
            "columns": df.columns.tolist(),
            "total_rows": len(df),
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
