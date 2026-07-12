import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#demo', label: 'Demo' },
  { href: '#how', label: 'How it works' },
  { href: '#stack', label: 'Stack' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? 'border-line bg-bg/80 backdrop-blur-md' : 'border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a
          href="#top"
          className="ring-focus flex items-center gap-2.5 rounded-md text-[15px] font-semibold tracking-tight"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="pulse absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          FinalWhistle
        </a>

        <div className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="ring-focus rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors duration-150 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#demo"
          className="ring-focus group flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-[#04120a] transition-transform duration-150 hover:-translate-y-px"
        >
          Watch it settle
          <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
        </a>
      </nav>
    </header>
  )
}
