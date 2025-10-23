
'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

interface OrdersStatusChartProps {
  data: Array<{ status: string; count: number; color: string }>
}

export function OrdersStatusChart({ data }: OrdersStatusChartProps) {
  // Transformar datos para que funcionen con el gráfico
  const chartData = data.map(item => ({
    name: item.status,
    value: item.count,
    color: item.color
  }))

  // Si no hay datos, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400 text-sm">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #475569',
            borderRadius: '12px',
            color: '#fff'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
