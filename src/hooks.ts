import { useEffect, useRef, useState } from 'react'

/** Adds an `in` class the first time the element scrolls into view.
 *  Bulletproof: fires on any intersection, checks immediately on mount,
 *  and has a safety fallback so content can never stay invisible. */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reveal = () => node.classList.add('in')

    // Already within (or above) the viewport on mount → reveal now.
    const inView = () => {
      const r = node.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      return r.top < vh * 0.92 && r.bottom > 0
    }
    if (typeof IntersectionObserver === 'undefined') {
      reveal()
      return
    }
    if (inView()) reveal()

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal()
          io.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(node)

    // Safety net: never let content stay hidden if the observer misfires.
    const fallback = window.setTimeout(reveal, 2600)

    return () => {
      io.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])
  return ref
}

/** Count up to a target when `active` becomes true. */
export function useCountUp(target: number, active: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(target * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [target, active, durationMs])
  return value
}
