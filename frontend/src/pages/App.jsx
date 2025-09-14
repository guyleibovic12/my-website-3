import React, { useState, useEffect } from 'react';
import api from '../api';
import UploadCSV from '../components/UploadCSV';
import ForecastChart from '../components/ForecastChart';
import PlanTable from '../components/PlanTable';

export default function App() {
  const [health, setHealth] = useState(null);
  const [groups, setGroups] = useState([]);
  const [cfg, setCfg] = useState({ date_col: 'date', store_col: 'store_id', qty_col: 'qty' });
  const [summary, setSummary] = useState(null);   // נוספה שמירת פלט התחזית

  // בדיקת תקינות השרת
  useEffect(() => {
    api.get('/')
      .then((res) => setHealth(res.message))
      .catch(() => setHealth(null));
  }, []);

  // העלאת קובץ
  const onUpload = async (file, mapping) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/ingest', fd, { params: mapping });
      setGroups(res.data.groups || []);
      setCfg(mapping);
      alert(`הועלו ${res.data.groups?.length || 0} קבוצות נתונים`);
    } catch (err) {
      alert("שגיאה בהעלאת קובץ");
      console.error(err);
    }
  };

  // אימון
  const onTrain = async () => {
    try {
      const body = { rows: groups };
      const res = await api.post('/train', body);
      if (res.data.error) {
        alert("שגיאה באימון: " + res.data.error);
      } else {
        setSummary(res.data.summary);
        alert("אימון הושלם בהצלחה!");
      }
    } catch (err) {
      alert("שגיאה באימון");
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>תחזית מכירות</h1>
        <span className="muted">סטטוס שרת: {health ? 'מחובר' : 'לא מחובר'}</span>
      </div>

      <div style={{ marginTop: 16 }} className="grid">
        <UploadCSV onUpload={onUpload} />
      </div>

      <div className="card">
        <h3>פעולות</h3>
        <div className="row">
          <button onClick={onTrain}>אימון מודלים</button>
        </div>
      </div>

      {/* הצגת תוצאות התחזית */}
      {summary && (
        <div className="card">
          <h3>סיכום תחזית</h3>
          <ul>
            <li>סה"כ נמכר: {summary.total_sold}</li>
            <li>מכירה ממוצעת: {summary.avg_sales.toFixed(2)}</li>
            <li>תחזית לעונה הבאה: {summary.forecast_next_season}</li>
          </ul>
        </div>
      )}

      {/* גרף + טבלה (לא חובה, אם יש לך קומפוננטות מוכנות) */}
      <ForecastChart data={groups} />
      <PlanTable rows={groups} />

      <div className="card">
        <h3>טיפים</h3>
        <ul className="muted">
          <li>אפשר לעבוד עם עמודות בעברית – רק לשים שהעמודות תואמות בקובץ.</li>
          <li>העלאת נתונים טובה = תחזיות אמינות יותר (לפחות 6 חודשים של נתוני מכירות).</li>
        </ul>
      </div>
    </div>
  );
}
