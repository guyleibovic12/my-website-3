from typing import Dict, Optional, Tuple
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from .utils import add_time_features, add_lags, prepare_dataframe, recursive_forecast

class ForecastModelRegistry:
    def __init__(self):
        self.models: Dict[str, RandomForestRegressor] = {}
        self.data_by_group: Dict[str, pd.DataFrame] = {}
        self.stocks: Dict[str, float] = {}

    def _group_key(self, store_id: Optional[str], sku: Optional[str]):
        if store_id and sku:
            return f"store={store_id}|sku={sku}"
        elif store_id:
            return f"store={store_id}"
        elif sku:
            return f"sku={sku}"
        return "all"

    def ingest(self, df: pd.DataFrame, date_col: str, store_col: Optional[str], sku_col: Optional[str], target_col: str, stock_col: Optional[str] = None):
        df = prepare_dataframe(df, date_col, target_col)
        for col in [store_col, sku_col]:
            if col and col in df.columns:
                df[col] = df[col].astype(str)

        def aggregate_group(g: pd.DataFrame):
            agg = g.groupby(date_col)[target_col].sum().reset_index()
            stock_val = 0.0
            if stock_col and stock_col in g.columns:
                latest = g.sort_values(date_col).iloc[-1]
                try:
                    stock_val = float(latest[stock_col])
                except Exception:
                    stock_val = 0.0
            return agg, stock_val

        if store_col and sku_col and store_col in df.columns and sku_col in df.columns:
            for (store, sku), g in df.groupby([store_col, sku_col]):
                agg, stk = aggregate_group(g)
                key = self._group_key(store, sku)
                self.data_by_group[key] = agg
                self.stocks[key] = stk
        elif store_col and store_col in df.columns:
            for store, g in df.groupby(store_col):
                agg, stk = aggregate_group(g)
                key = self._group_key(store, None)
                self.data_by_group[key] = agg
                self.stocks[key] = stk
        else:
            agg, stk = aggregate_group(df)
            self.data_by_group["all"] = agg
            self.stocks["all"] = stk
        return list(self.data_by_group.keys())

    def train(self, date_col: str, target_col: str):
        trained = []
        for key, data in self.data_by_group.items():
            if len(data) < 60:
                continue
            Xy = add_lags(add_time_features(data.copy(), date_col), target_col).dropna()
            if len(Xy) < 30:
                continue
            X = Xy.drop(columns=[target_col])
            y = Xy[target_col].values
            model = RandomForestRegressor(n_estimators=250, random_state=42)
            model.fit(X, y)
            self.models[key] = model
            trained.append(key)
        return trained

    def forecast(self, horizon_days: int, store_id: Optional[str], sku: Optional[str], date_col: str, target_col: str):
        key = self._group_key(store_id, sku)
        data = self.data_by_group.get(key) or self.data_by_group.get("all")
        model = self.models.get(key) or self.models.get("all")
        if data is None or model is None:
            return []
        hist = add_lags(add_time_features(data.copy(), date_col), target_col).dropna()
        return recursive_forecast(model, hist, date_col, target_col, steps=horizon_days)

    def stock_for(self, store_id: Optional[str], sku: Optional[str]) -> float:
        key = self._group_key(store_id, sku)
        return float(self.stocks.get(key, 0.0))
