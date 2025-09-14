from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
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
async def ingest(file: UploadFile, 
                 date_col: str = Form(...),
                 store_col: str = Form(...),
                 sku_col: str = Form(...),
                 qty_col: str = Form(...),
                 stock_col: str = Form(""),
                 age_col: str = Form(""),
                 gender_col: str = Form(""),
                 family_col: str = Form(""),
                 sole_col: str = Form("")):
    """
    קריאת קובץ אקסל/CSV והחזרת rows ל-frontend
    """
    content = await file.read()
    if file.filename.endswith(".xlsx"):
        df = pd.read_excel(BytesIO(content))
    else:
        df = pd.read_csv(BytesIO(content))

    # רק עמודות נדרשות
    used_cols = [c for c in [date_col, store_col, sku_col, qty_col,
                             stock_col, age_col, gender_col, family_col, sole_col] if c and c in df.columns]
    df = df[used_cols]

    rows = df.to_dict(orient="records")
    return {"rows": rows, "groups": used_cols}

@app.post("/train")
async def train(config: dict):
    """
    'אימון' פשוט: חישוב מכירות מצטברות + תחזית לעונה הבאה
    """
    try:
        # לוודא שהגיעו נתונים
        if "rows" not in config or not config["rows"]:
            return {"error": "לא התקבלו נתונים"}

        df = pd.DataFrame(config["rows"])

        # לוודא שיש עמודות בסיסיות
        if "qty" not in df.columns:
            return {"error": "עמודת qty חסרה"}

        # חישוב סיכומים
        total_sold = df["qty"].sum()
        avg_sales = df["qty"].mean()

        # תחזית פשוטה לעונה הבאה (פי 1.1 מהממוצע * מספר שורות)
        forecast = int(avg_sales * len(df) * 1.1)

        return {
            "models_trained": 1,
            "summary": {
                "total_sold": int(total_sold),
                "avg_sales": float(avg_sales),
                "forecast_next_season": forecast
            }
        }

    except Exception as e:
        return {"error": str(e)}
