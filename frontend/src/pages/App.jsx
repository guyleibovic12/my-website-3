import React, { useEffect, useState } from 'react'
import { api } from '../api'
import UploadCSV from '../components/UploadCSV.jsx'
import ForecastChart from '../components/ForecastChart.jsx'
import PlanTable from '../components/PlanTable.jsx'

export default function App() {
  const [health, setHealth] = useState(null)
  const [groups, setGroups] = useState([])
  const [preds, setPreds] = useState([])
  const [planRows, setPlanRows] = useState([])
  const [cfg, setCfg] = useState({ date_col:'date', store_col:'store_id', sku_col:'', target_col:'qty', stock_col:'' })

  useEffect(() => { api.health().then(setHealth).catch(()=>setHealth(null)) }, [])

  const onUpload = async (file, mapping) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.ingest(fd, mapping)
    setGroups(res.groups || [])
    setCfg(mapping)
    alert(`הועלו ${res.rows} שורות. נמצאו ${res.groups?.length||0} קבוצות.`)
  }

  const onTrain = async () => {
    const body = { ...cfg, sku_col: cfg.sku_col || null }
    const res = await api.train(body)
    alert(`אומנו ${res.models_trained} מודלים`)
  }

  const onForecast = async () => {
    const horizon = parseInt(prompt('כמה ימים לחיזוי?', '14')) || 14
    const store_id = prompt('סניף (רשות):', '') || null
    const sku = prompt('דגם/מק״ט (רשות):', '') || null
    const res = await api.forecast({ horizon_days: horizon, store_id, sku })
    setPreds(res.predictions || [])
  }

  const onPlan = async () => {
    const horizon = parseInt(prompt('משך עונה (ימים)?', '90')) || 90
    const store_id = prompt('סניף (רשות):', '') || null
    const sku = prompt('דגם/מק״ט (רשות):', '') || null
    const res = await api.plan({ horizon_days: horizon, store_id, sku })
    setPlanRows(res.rows || [])
  }

  return (
    <div className="container">
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <h1>תחזית מכירות</h1>
        <span className="muted">סטטוס שרת: {health ? 'פועל' : 'כבוי'}</span>
      </div>

      <div style={{marginTop:16}} className="grid">
        <UploadCSV onUpload={onUpload} />

        <div className="card">
          <h3>פעולות</h3>
          <div className="row">
            <button onClick={onTrain}>אימון מודלים</button>
            <button className="secondary" onClick={onForecast}>חיזוי</button>
            <button onClick={onPlan}>תכנון עונה</button>
          </div>
          {groups?.length ? <p className="muted" style={{marginTop:8}}>קבוצות: {groups.join(', ')}</p> : <p className="muted">טרם נטענו נתונים.</p>}
        </div>

        <ForecastChart data={preds} />
        <PlanTable rows={planRows} />

        <div className="card">
          <h3>טיפים</h3>
          <ul className="muted">
            <li>אפשר לעבוד עם עמודות בעברית – רק למפות את שמות העמודות בטופס.</li>
            <li>המלצת הזמנה = תחזית עונתית פחות מלאי נוכחי (לא שלילי).</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
