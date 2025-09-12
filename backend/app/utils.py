import pandas as pd
import numpy as np

def prepare_dataframe(df: pd.DataFrame, date_col: str, target_col: str):
    df = df.copy()
    df[date_col] = pd.to_datetime(df[date_col])
    df = df.sort_values(date_col)
    df[target_col] = pd.to_numeric(df[target_col], errors="coerce").fillna(0.0)
    return df

def add_time_features(df: pd.DataFrame, date_col: str):
    d = df.copy()
    dt = d[date_col]
    d["dow"] = dt.dt.dayofweek
    d["dom"] = dt.dt.day
    d["month"] = dt.dt.month
    d["week"] = dt.dt.isocalendar().week.astype(int)
    return d

def add_lags(df: pd.DataFrame, target_col: str, lags=(1,2,3,7,14,28)):
    d = df.copy()
    for L in lags:
        d[f"lag_{L}"] = d[target_col].shift(L)
    d["roll7"] = d[target_col].rolling(7).mean()
    d["roll28"] = d[target_col].rolling(28).mean()
    return d

def recursive_forecast(model, history_df, date_col, target_col, steps: int):
    df = history_df.copy()
    freq = pd.infer_freq(df[date_col]) or "D"
    preds = []
    last_known = df.iloc[-1:].copy()
    for _ in range(steps):
        next_date = (last_known[date_col].iloc[0] + pd.tseries.frequencies.to_offset(freq))
        row = last_known.copy()
        row[date_col] = next_date
        for col in list(row.columns):
            if col.startswith("lag_"):
                L = int(col.split("_")[1])
                row[col] = row[target_col].iloc[0] if L==1 else row[f"lag_{L-1}"].iloc[0]
        if "roll7" in row.columns:
            vals = [row.get(f"lag_{k}", np.nan).iloc[0] for k in range(1,8)]
            row["roll7"] = np.nanmean(vals)
        if "roll28" in row.columns:
            vals = [row.get(f"lag_{k}", np.nan).iloc[0] for k in range(1,29)]
            row["roll28"] = np.nanmean(vals)
        row = row.drop(columns=[target_col], errors="ignore").assign(
            dow=next_date.dayofweek, dom=next_date.day, month=next_date.month, week=int(next_date.isocalendar().week)
        )
        X_next = row.drop(columns=[c for c in row.columns if c == target_col])
        yhat = float(model.predict(X_next)[0])
        preds.append({"date": next_date.strftime("%Y-%m-%d"), "yhat": max(0.0, yhat)})
        row[target_col] = yhat
        last_known = row
    return preds
