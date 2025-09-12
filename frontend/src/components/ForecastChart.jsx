import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ForecastChart({ data }) {
  if (!data?.length) return null
  return (
    <div className="card">
      <h3>גרף תחזית</h3>
      <div style={{height:360}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="yhat" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
