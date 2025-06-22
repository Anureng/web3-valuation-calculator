import { ValuationCalculator } from "@/components/valuation-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Web3 Valuation Calculator</h1>
            <p className="text-muted-foreground">
              Estimate the valuation of your web3 company based on key metrics and market factors
            </p>
          </div>
          <ValuationCalculator />
        </div>
      </div>
    </main>
  )
}

