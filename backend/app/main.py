from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
from typing import Optional, List

from .schemas import TrainRequest, ForecastRequest, TrainSummary, ForecastResponse, PlanRequest, PlanResponse, PlanRow
from .model import ForecastModelRegistry

app = FastAPI(title="תחזית מכירות", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REG = ForecastModelRegistry()
CFG = {"date_col": "date", "store_col": "store_id", "sku_col": None, "target_col": "qty", "stock_col": None}

@app.get("/health")
def health():
    return {"status": "ok", "groups": list(REG.data_by_group.keys()), "models": list(REG.models.keys())}

@app.post("/ingest")
async def ingest(file: UploadFile = File(...),
                 date_col: str="date",
                 store_col: Optional[str]="store_id",
                 sku_col: Optional[str]=None,
                 target_col: str="qty",
                 stock_col: Optional[str]=None,
                 age_col: Optional[str]=None,
                 gender_col: Optional[str]=None,
                 family_col: Optional[str]=None,
                 sole_col: Optional[str]=None):
    try:
        content = await file.read()
        try:
            df = pd.read_csv(BytesIO(content))
        except Exception:
            df = pd.read_csv(BytesIO(content), encoding="cp1255")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV read error: {e}")

    groups = REG.ingest(df, date_col, store_col, sku_col, target_col, stock_col)
    CFG.update(dict(date_col=date_col, store_col=store_col, sku_col=sku_col, target_col=target_col, stock_col=stock_col))
    return {"groups": groups, "rows": len(df)}

@app.post("/train", response_model=TrainSummary)
def train(req: TrainRequest):
    CFG.update(dict(date_col=req.date_col, store_col=req.store_col, sku_col=req.sku_col, target_col=req.target_col, stock_col=req.stock_col))
    groups = REG.train(req.date_col, req.target_col)
    return TrainSummary(models_trained=len(groups), groups=groups)

@app.post("/forecast", response_model=ForecastResponse)
def forecast(req: ForecastRequest):
    preds = REG.forecast(req.horizon_days, req.store_id, req.sku, CFG["date_col"], CFG["target_col"])
    return ForecastResponse(predictions=preds)

@app.post("/plan", response_model=PlanResponse)
def plan(req: PlanRequest):
    rows: List[PlanRow] = []
    targets = [(None, None)] if not (req.store_id or req.sku) else [(req.store_id, req.sku)]
    if targets == [(None, None)] and REG.data_by_group:
        targets = []
        for key in REG.data_by_group.keys():
            store_id = None; sku = None
            if key.startswith("store=") and "|sku=" in key:
                parts = key.split("|")
                store_id = parts[0].split("=")[1]
                sku = parts[1].split("=")[1]
            elif key.startswith("store="):
                store_id = key.split("=")[1]
            elif key.startswith("sku="):
                sku = key.split("=")[1]
            targets.append((store_id, sku))

    for (store_id, sku) in targets:
        key = REG._group_key(store_id, sku)
        df = REG.data_by_group.get(key) or REG.data_by_group.get("all")
        if df is None or df.empty:
            continue
        try:
            last_date = df[CFG["date_col"]].max()
            window_start = last_date - pd.Timedelta(days=90)
            sales_last_90 = float(df[df[CFG["date_col"]] > window_start][CFG["target_col"]].sum())
        except Exception:
            sales_last_90 = float(df.tail(90)[CFG["target_col"]].sum())

        preds = REG.forecast(req.horizon_days, store_id, sku, CFG["date_col"], CFG["target_col"]) or []
        forecast_sum = float(sum(p["yhat"] for p in preds))
        stock = REG.stock_for(store_id, sku)
        recommended = max(0.0, forecast_sum - stock)

        rows.append(PlanRow(
            group=key,
            stock_on_hand=round(stock, 2),
            sales_last_90d=round(sales_last_90, 2),
            forecast_next_90d=round(forecast_sum, 2),
            recommended_order=round(recommended, 2)
        ))
    return PlanResponse(rows=rows)
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}
