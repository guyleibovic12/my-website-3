import React, { useEffect, useState } from 'react';
import { health, ingest, train, forecast, plan } from '../api';
import UploadCSV from '../components/UploadCSV.jsx';
import ForecastChart from '../components/ForecastChart.jsx';
import PlanTable from '../components/PlanTable.jsx';

export default function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [groups, setGroups] = useState([]);
  const [preds, setPreds] = useState([]);
  const [planRows, setPlanRows] = useState([]);
  const [cfg, setCfg] = useState({ date_col: 'date', store_col: 'store_id', sku_col: '', target_col: 'qty', stock_col: '' });

  useEffect(() => {
    health().then(res => setHealthStatus(res.message)).catch(() => setHealthStatus(null));
  }, []);

  const onUpload = async (file, mapping) => {
    try {
      const res = await ingest(file, mapping);
      setGroups(res.groups || []);
      setCfg(mapping);
      alert(`קובץ נטען בהצלחה. נמצאו ${res.groups?.length || 0} קבוצות`);
    } catch (err) {
      alert("שגיאה בהעלאת קובץ");
    }
  };

  const onTrain = async () => {
    try {
      const res = await train({ ...cfg, sku_col: cfg.sku_col || null });
      alert(`אימון הושלם. מספר מודלים: ${res.models_trained}`);
    } catch {
      alert("שגיאה באימון");
    }
  };

  const onForecast = async () => {
    const horizon = parseInt(prompt("כמה ימים קדימה לחזות?"), 10) || 14;
    const store_id = prompt("סניף (רשות)") || null;
    const sku = prompt("דגם/מק״ט (רשות)") || null;
    const res = await forecast({ horizon_days: horizon, store_id, sku });
    setPreds(res.predictions || []);
  };

  const onPlan = async () => {
    const horizon = parseInt(prompt("כמה ימים קדימה לתכנון?"), 10) || 90;
    const store_id = prompt("סניף (רשות)") || null;
    const sku = prompt("דגם/מק״ט (רשות)") || null;
    const res = await plan({ horizon_days: horizon, store_id, sku });
    setPlanRows(res.rows || []);
  };

  return (
    <div className="container">
      <h1>תחזית מכירות</h1>
      <span>סטטוס שרת: {healthStatus || 'לא מחובר'}</span>

      <UploadCSV onUpload={onUpload} />

      <div>
        <button onClick={onTrain}>אימון</button>
        <button onClick={onForecast}>חזוי</button>
        <button onClick={onPlan}>תכנון עונה</button>
      </div>

      <ForecastChart data={preds} />
      <PlanTable rows={planRows} />
    </div>
  );
}
