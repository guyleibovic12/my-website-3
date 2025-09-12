from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TrainRequest(BaseModel):
    date_col: str = Field(default="date")
    store_col: Optional[str] = Field(default="store_id")
    sku_col: Optional[str] = Field(default=None)
    target_col: str = Field(default="qty")
    age_col: Optional[str] = Field(default=None)
    gender_col: Optional[str] = Field(default=None)
    family_col: Optional[str] = Field(default=None)
    sole_col: Optional[str] = Field(default=None)
    stock_col: Optional[str] = Field(default=None)

class ForecastRequest(BaseModel):
    horizon_days: int = Field(default=14, ge=1, le=365)
    store_id: Optional[str] = None
    sku: Optional[str] = None

class PlanRequest(BaseModel):
    horizon_days: int = Field(default=90, ge=7, le=365)
    store_id: Optional[str] = None
    sku: Optional[str] = None

class BacktestRequest(BaseModel):
    test_days: int = Field(default=28, ge=7, le=180)
    store_id: Optional[str] = None
    sku: Optional[str] = None

class TrainSummary(BaseModel):
    models_trained: int
    groups: List[str]

class ForecastResponse(BaseModel):
    predictions: List[Dict[str, Any]]

class PlanRow(BaseModel):
    group: str
    stock_on_hand: float
    sales_last_90d: float
    forecast_next_90d: float
    recommended_order: float

class PlanResponse(BaseModel):
    rows: List[PlanRow]
