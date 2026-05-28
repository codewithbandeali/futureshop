'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const dayKeyUTC = (date) => date.toISOString().slice(0, 10)
const formatChartLabel = (dateKey) => new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
}).format(new Date(`${dateKey}T00:00:00.000Z`))

/**
 * Admin dashboard orders-over-time chart. Buckets orders into the last
 * `days` daily slots and renders a smooth area chart in brand colors.
 *
 * Empty/missing data is fine — the chart still draws a flat baseline so
 * the dashboard layout doesn't shift while the API call is in flight.
 */
export default function OrdersAreaChart({ allOrders = [], days = 30 }) {
    // Build a contiguous day-by-day bucket of the last `days` so the X axis
    // shows every day even if a day has zero orders. Without this, sparse
    // data looks visually misleading (one tall spike with no context).
    const bucket = new Map()
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        bucket.set(dayKeyUTC(d), 0)
    }
    for (const order of allOrders) {
        const ts = order.createdAt || order.created_at
        if (!ts) continue
        const key = dayKeyUTC(new Date(ts))
        if (bucket.has(key)) bucket.set(key, bucket.get(key) + 1)
    }
    const chartData = Array.from(bucket.entries()).map(([date, orders]) => ({
        date,
        label: formatChartLabel(date),
        orders,
    }))

    return (
        <div className="w-full h-[260px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: 'var(--color-text-3)', fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: 'var(--color-border)' }}
                        interval="preserveStartEnd"
                        minTickGap={20}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fill: 'var(--color-text-3)', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 8,
                            border: '1px solid var(--color-border)',
                            fontSize: 12,
                            background: 'white',
                        }}
                        labelStyle={{ fontWeight: 600 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="var(--color-brand)"
                        strokeWidth={2}
                        fill="url(#ordersFill)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
