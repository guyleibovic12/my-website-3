from fastapi import FastAPI, UploadFile, File
import pandas as pd
import io

app = FastAPI()

# בריאות
@app.get("/health")
def health():
    return {"status": "ok"}

# העלאת קובץ
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents)) if file.filename.endswith(".xlsx") else pd.read_csv(io.BytesIO(contents))
    return {
        "rows": len(df),
        "columns": list(df.columns)
    }

# תחזית פשוטה (placeholder)
@app.post("/forecast")
async def forecast():
    return {
        "message": "תחזית לדוגמה",
        "expected_sales": 12345,
        "recommended_stock": 15000
    }
