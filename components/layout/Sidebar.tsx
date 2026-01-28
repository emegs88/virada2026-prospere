'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  CreditCard, 
  DollarSign, 
  Target, 
  Calendar, 
  CheckCircle2,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/debts', label: 'Dívidas & Credores', icon: CreditCard },
  { href: '/expenses', label: 'Despesas Fixas', icon: DollarSign },
  { href: '/sales', label: 'Metas de Vendas', icon: Target },
  { href: '/payment-plan', label: 'Plano de Pagamento', icon: Calendar },
  { href: '/decision', label: 'Destino x Decisão', icon: CheckCircle2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-prospere-red" />
          <span className="text-xl font-bold">Painel 2026</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-prospere-black text-prospere-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">Prospere</div>
          <div>Destino x Decisão</div>
        </div>
      </div>
    </div>
  )
}
