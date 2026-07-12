import Nav from './components/Nav'
import Hero from './components/Hero'
import Ticker from './components/Ticker'
import Problem from './components/Problem'
import Demo from './components/Demo'
import HowItWorks from './components/HowItWorks'
import Stack from './components/Stack'
import Closer, { Footer } from './components/Closer'

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Problem />
        <Demo />
        <HowItWorks />
        <Stack />
        <Closer />
      </main>
      <Footer />
    </div>
  )
}
