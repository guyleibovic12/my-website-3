import React from 'react'

export default function PlanTable({ rows }) {
  if (!rows?.length) return null
  return (
    <div className="card">
      <h3>תכנון עונה</h3>
      <table>
        <thead>
          <tr>
            <th>קבוצה</th>
            <th>מלאי נוכחי</th>
            <th>מכירות 90 ימים אחרונים</th>
            <th>תחזית 90 ימים הבאים</th>
            <th>המלצת הזמנה</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,idx)=>(
            <tr key={idx}>
              <td>{r.group}</td>
              <td>{r.stock_on_hand}</td>
              <td>{r.sales_last_90d}</td>
              <td>{r.forecast_next_90d}</td>
              <td><strong>{r.recommended_order}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
