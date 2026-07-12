import type { ReactNode } from 'react'
import { useReveal } from '../hooks'

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article' | 'header'
}) {
  const ref = useReveal()
  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}

export function SectionHead({
  index,
  kicker,
  title,
  sub,
}: {
  index: string
  kicker: string
  title: ReactNode
  sub?: string
}) {
  return (
    <div className="mb-12 flex flex-col gap-5 border-t border-line pt-6 md:flex-row md:items-start md:gap-10">
      <div className="flex shrink-0 items-center gap-3 md:w-40">
        <span className="mono text-sm text-accent tnum">{index}</span>
        <span className="kicker">{kicker}</span>
      </div>
      <div className="max-w-2xl">
        <h2 className="text-[1.7rem] font-bold leading-[1.1] tracking-tight sm:text-4xl">{title}</h2>
        {sub && <p className="mt-4 text-[15px] leading-relaxed text-muted">{sub}</p>}
      </div>
    </div>
  )
}

export function toneText(tone: 'ok' | 'warn' | 'bad') {
  return tone === 'ok' ? 'text-accent' : tone === 'warn' ? 'text-warn' : 'text-danger'
}
export function toneBg(tone: 'ok' | 'warn' | 'bad') {
  return tone === 'ok' ? 'bg-accent' : tone === 'warn' ? 'bg-warn' : 'bg-danger'
}
export function toneChip(tone: 'ok' | 'warn' | 'bad') {
  return tone === 'ok'
    ? 'border-accent/40 text-accent bg-accent/10'
    : tone === 'warn'
      ? 'border-warn/40 text-warn bg-warn/10'
      : 'border-danger/40 text-danger bg-danger/10'
}
