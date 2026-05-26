'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function OrdersAreaChart({ allOrders }) {

    // Group orders by date
    const ordersPerDay = allOrders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0] // format: YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {})

    // Convert to a sorted array for Recharts
    const chartData = Object.entries(ordersPerDay)
        .map(([date, count]) => ({ date, orders: count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))

    return (
        <div className="w-full h-[300px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Area type="monotone" dataKey="orders" stroke="#16a34a" strokeWidth={2.5} fill="url(#ordersFill)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
