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
    return {"message": "Backend is running"}


@app.post("/ingest")
async def ingest(
    file: UploadFile,
    date_col: str = Form(...),
    store_col: str = Form(...),
    sku_col: str = Form(...),
    qty_col: str = Form(...),
    stock_col: str = Form(""),
    age_col: str = Form(""),
    gender_col: str = Form(""),
    family_col: str = Form(""),
    sole_col: str = Form(""),
):
    """קליטת קובץ Excel/CSV והחזרת נתונים ל-frontend"""
    try:
        content = await file.read()

        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content))

        used_cols = [
            c
            for c in [
                date_col,
                store_col,
                sku_col,
                qty_col,
                stock_col,
                age_col,
                gender_col,
                family_col,
                sole_col,
            ]
            if c and c in df.columns
        ]

        rows = df[used_cols].to_dict(orient="records")
        return {"rows": rows, "columns": used_cols, "total_rows": len(rows)}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/train")
async def train(
    rows: str = Form(...),
):
    """אימון פשוט על בסיס נתוני FormData"""
    try:
        import json
        rows = json.loads(rows)
        df = pd.DataFrame(rows)

        if "qty" not in df.columns:
            return {"error": "עמודת qty חסרה"}

        total_sold = df["qty"].sum()
        avg_sales = df["qty"].mean()
        forecast = int(avg_sales * len(df) * 1.1)

        return {
            "models_trained": 1,
            "summary": {
                "total_sold": int(total_sold),
                "avg_sales": float(avg_sales),
                "forecast_next_season": forecast,
            },
        }
    except Exception as e:
        return {"error": str(e)}


@app.post("/forecast")
async def forecast(
    rows: str = Form(...),
    horizon_days: int = Form(30),
):
    """תחזית לדוגמה"""
    try:
        import json
        rows = json.loads(rows)
        df = pd.DataFrame(rows)

        if "qty" not in df.columns:
            return {"error": "עמודת qty חסרה"}

        avg_sales = df["qty"].mean()
        forecast_values = [int(avg_sales * (1 + i * 0.05)) for i in range(horizon_days)]

        return {"forecast": forecast_values}
    except Exception as e:
        return {"error": str(e)}
