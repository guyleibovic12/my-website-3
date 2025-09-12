import React, { useState } from 'react'

export default function UploadCSV({ onUpload }) {
  const [file, setFile] = useState(null)
  const [mapping, setMapping] = useState({
    date_col:'date', store_col:'store_id', sku_col:'',
    target_col:'qty', stock_col:'',
    age_col:'', gender_col:'', family_col:'', sole_col:''
  })

  const submit = (e) => {
    e.preventDefault()
    if (!file) return alert('בחר/י קובץ CSV')
    onUpload(file, mapping)
  }

  const Row = ({label, field, placeholder}) => (
    <label>{label}
      <input value={mapping[field]||''} placeholder={placeholder||field}
             onChange={e=>setMapping({...mapping, [field]: e.target.value})} />
    </label>
  )

  return (
    <form className="card" onSubmit={submit}>
      <h3>העלאת נתונים</h3>
      <p className="muted">קובץ CSV (מומלץ UTF-8). ניתן למפות שמות עמודות בעברית.</p>
      <div className="grid grid2">
        <label>קובץ: <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0]||null)} /></label>
        <div></div>
        <Row label="עמודת תאריך" field="date_col" placeholder="date / תאריך" />
        <Row label="עמודת סניף" field="store_col" placeholder="store_id / חנות" />
        <Row label="עמודת דגם/מק״ט" field="sku_col" placeholder="sku / מק״ט (רשות)" />
        <Row label="עמודת כמות" field="target_col" placeholder="qty / כמות" />
        <Row label="עמודת מלאי נוכחי" field="stock_col" placeholder="stock / מלאי" />
        <Row label="עמודת גיל" field="age_col" placeholder="age / גיל (רשות)" />
        <Row label="עמודת מגדר" field="gender_col" placeholder="gender / מגדר (רשות)" />
        <Row label="עמודת משפחה" field="family_col" placeholder="family / משפחה (רשות)" />
        <Row label="עמודת סוליה" field="sole_col" placeholder="sole / סוליה (רשות)" />
      </div>
      <div style={{marginTop:12}} className="row">
        <button type="submit">העלה</button>
        <button type="button" className="ghost" onClick={()=>setMapping({
          date_col:'date', store_col:'store_id', sku_col:'',
          target_col:'qty', stock_col:'',
          age_col:'', gender_col:'', family_col:'', sole_col:''
        })}>איפוס</button>
      </div>
    </form>
  )
}
