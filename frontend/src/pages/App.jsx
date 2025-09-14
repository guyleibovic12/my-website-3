import React, { useState } from 'react';
import api from '../api';
import UploadCSV from '../components/UploadCSV';

export default function App() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  const onUpload = async (file, mapping) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      Object.entries(mapping).forEach(([k, v]) => fd.append(k, v));

      const res = await api.post("/ingest", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setRows(res.data.rows || []);
      alert(`קובץ נטען בהצלחה (${res.data.rows.length} שורות)`);
    } catch (err) {
      console.error(err);
      alert("שגיאה בהעלאת קובץ");
    }
  };

  const onTrain = async () => {
    try {
      const res = await api.post("/train", { rows });
      if (res.data.error) {
        alert(res.data.error);
      } else {
        setSummary(res.data.summary);
        alert("אימון הושלם");
      }
    } catch (err) {
      console.error(err);
      alert("שגיאה באימון");
    }
  };

  const onForecast = () => {
    alert("פונקציית תחזית (forecast) תתווסף בהמשך 🚀");
  };

  const onPlan = () => {
    alert("פונקציית תכנון עונה (plan) תתווסף בהמשך 📊");
  };

  return (
    <div className="container">
      <h1>תחזית מכירות</h1>
      <UploadCSV onUpload={onUpload} />

      <div className="card">
        <h3>פעולות</h3>
        <div className="row">
          <button onClick={onTrain}>אימון מודלים</button>
          <button className="secondary" onClick={onForecast}>תחזית</button>
          <button onClick={onPlan}>תכנון עונה</button>
        </div>
      </div>

      {summary && (
        <div className="card">
          <h3>סיכום</h3>
          <ul>
            <li>סה״כ מכירות: {summary.total_sold}</li>
            <li>מכירות ממוצעות: {summary.avg_sales.toFixed(2)}</li>
            <li>תחזית לעונה הבאה: {summary.forecast_next_season}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
