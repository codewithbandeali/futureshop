'use client'
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"
import { formatDate } from "@/lib/format"

const statusStyles = {
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    approved: 'bg-green-100 text-green-700',
}

const StoreInfo = ({ store }) => {
    return (
        <div className="flex-1 text-sm">
            <div className="flex items-center gap-4">
                <Image width={100} height={100} src={store.logo} alt={store.name} className="size-16 object-cover rounded-full ring-1 ring-slate-200" />
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-800">{store.name}</h3>
                        <span className="text-slate-400">@{store.username}</span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusStyles[store.status] || 'bg-slate-100 text-slate-600'}`}>
                            {store.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Applied {formatDate(store.createdAt)}</p>
                </div>
            </div>

            <p className="text-slate-600 my-4 max-w-2xl leading-6">{store.description}</p>

            <div className="space-y-1.5 text-slate-500">
                <p className="flex items-center gap-2"><MapPin size={15} className="text-slate-400 shrink-0" /> {store.address}</p>
                <p className="flex items-center gap-2"><Phone size={15} className="text-slate-400 shrink-0" /> {store.contact}</p>
                <p className="flex items-center gap-2"><Mail size={15} className="text-slate-400 shrink-0" /> {store.email}</p>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <Image width={36} height={36} src={store.user.image} alt={store.user.name} className="size-9 rounded-full object-cover" />
                <div>
                    <p className="text-slate-700 font-medium">{store.user.name}</p>
                    <p className="text-slate-400 text-xs">{store.user.email}</p>
                </div>
            </div>
        </div>
    )
}

export default StoreInfo
