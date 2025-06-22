"use client"

import { useState } from "react"
import { DollarSign, LineChart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ValuationResult } from "@/components/valuation-result"

export function ValuationCalculator() {
  const [formData, setFormData] = useState({
    companyStage: "",
    industryVertical: "",
    mrr: 0,
    userCount: 0,
    retentionRate: 30,
    growthRate: 10,
    teamSize: 0,
    previousRaised: 0,
    tokenLaunch: "no",
    productStage: "",
    miscellaneousDetails: "",
  })
  const [aiInsights, setAiInsights] = useState<{
  competitors?: string
  risks?: string
  roadmap?: string
}>({})


  const [valuation, setValuation] = useState<number | null>(null)
  const [valuationBreakdown, setValuationBreakdown] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState("company")
  const [valuationSummary, setValuationSummary] = useState<string>("")

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }
const runAIEnhancements = async (calculatedValuation: number) => {
  try {
    const competitorRes = await fetch("/api/ai-competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: formData.miscellaneousDetails || "Unnamed Project",
        vertical: formData.industryVertical,
        keyFeatures: [
          formData.tokenLaunch === "yes" ? "Token launched" : "No token",
          `Growth rate ${formData.growthRate}%`,
          `${formData.userCount} users`,
        ],
      }),
    })
    const competitorData = await competitorRes.json()

    const riskRes = await fetch("/api/ai-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        valuation: calculatedValuation,
      }),
    })
    const riskData = await riskRes.json()

    const roadmapRes = await fetch("/api/ai-roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roadmapMilestones: [
          { name: "MVP Launch", date: "2025-07", description: "Testnet launch" },
          { name: "Token Launch", date: "2025-08", description: "TGE on L2" },
          { name: "Audits", date: "2025-09", description: "Security audits" },
        ],
      }),
    })
    const roadmapData = await roadmapRes.json()

    setAiInsights({
      competitors: competitorData.result,
      risks: riskData.result,
      roadmap: roadmapData.result,
    })

    const aiSummary = `\n\n🔍 AI COMPETITOR ANALYSIS:\n${competitorData.result}\n\n⚠️ RISK PREDICTION:\n${riskData.result}\n\n📍 ROADMAP CHECK:\n${roadmapData.result}`

    setValuationSummary((prev) => prev + aiSummary)
  } catch (err) {
    console.error("AI Enhancements Error:", err)
    setValuationSummary((prev) => prev + "\n\n⚠️ AI enhancements failed to load.")
  }
}


  const calculateValuation = () => {
    // Base valuation based on company stage
    let baseValuation = 0
    switch (formData.companyStage) {
      case "idea":
        baseValuation = 500000
        break
      case "pre-seed":
        baseValuation = 2000000
        break
      case "seed":
        baseValuation = 5000000
        break
      case "series-a":
        baseValuation = 15000000
        break
      case "series-b":
        baseValuation = 50000000
        break
      case "series-c-plus":
        baseValuation = 100000000
        break
      default:
        baseValuation = 1000000
    }

    // Industry vertical multiplier
    let verticalMultiplier = 1
    switch (formData.industryVertical) {
      case "defi":
        verticalMultiplier = 1.5
        break
      case "nft":
        verticalMultiplier = 1.2
        break
      case "gaming":
        verticalMultiplier = 1.4
        break
      case "dao":
        verticalMultiplier = 1.3
        break
      case "infrastructure":
        verticalMultiplier = 1.6
        break
      case "edufi":
        verticalMultiplier = 1.3
        break
      case "socialfi":
        verticalMultiplier = 1.25
        break
      case "rwa":
        verticalMultiplier = 1.45
        break
      case "ai":
        verticalMultiplier = 1.7
        break
      case "privacy":
        verticalMultiplier = 1.35
        break
      case "climate":
        verticalMultiplier = 1.4
        break
      default:
        verticalMultiplier = 1
    }

    // Revenue component (MRR * annual multiple)
    const annualRevenue = formData.mrr * 12
    const revenueMultiple = formData.companyStage === "series-b" || formData.companyStage === "series-c-plus" ? 10 : 15
    const revenueComponent = annualRevenue * revenueMultiple

    // User metrics component
    const userComponent = formData.userCount * (formData.retentionRate / 100) * 100

    // Growth component
    const growthComponent = baseValuation * (formData.growthRate / 100)

    // Team component
    const teamComponent = formData.teamSize * 250000

    // Previous funding component
    const fundingComponent = formData.previousRaised * 1.5

    // Token launch bonus
    const tokenBonus = formData.tokenLaunch === "yes" ? baseValuation * 0.2 : 0

    // Product stage component
    let productMultiplier = 1
    switch (formData.productStage) {
      case "mvp":
        productMultiplier = 1.1
        break
      case "beta":
        productMultiplier = 1.3
        break
      case "launched":
        productMultiplier = 1.5
        break
      case "scaling":
        productMultiplier = 1.8
        break
      default:
        productMultiplier = 1
    }

    // Calculate final valuation
    const calculatedValuation =
      (baseValuation * verticalMultiplier +
        revenueComponent +
        userComponent +
        growthComponent +
        teamComponent +
        fundingComponent +
        tokenBonus) *
      productMultiplier

    // Set breakdown for visualization
    const breakdown = {
      "Base Valuation": baseValuation * verticalMultiplier,
      Revenue: revenueComponent,
      "User Metrics": userComponent,
      "Growth Potential": growthComponent,
      "Team Value": teamComponent,
      "Previous Funding": fundingComponent,
      "Token Bonus": tokenBonus,
    }

  setValuationBreakdown(breakdown)
    setValuation(Math.round(calculatedValuation))
    setValuationSummary("Generating AI-powered valuation analysis...")

    runAIEnhancements(calculatedValuation)

    // Simulate AI analysis (in a real implementation, this would be an API call)
    setTimeout(() => {
      const summary = generateValuationSummary(formData, calculatedValuation)
      setValuationSummary(summary)
    }, 1500)
  }

  

  const generateValuationSummary = (data: typeof formData, finalValuation: number) => {
    // This would be replaced with an actual AI API call in production
    const stage = data.companyStage.charAt(0).toUpperCase() + data.companyStage.slice(1).replace(/-/g, " ")
    const vertical = data.industryVertical.charAt(0).toUpperCase() + data.industryVertical.slice(1)
    const formattedValuation = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(finalValuation)

    return `Based on the provided information, your ${stage} stage ${vertical} project is valued at approximately ${formattedValuation}. 

Key factors influencing this valuation:
• ${data.mrr > 0 ? `Monthly revenue of $${data.mrr.toLocaleString()} demonstrates commercial viability` : "Pre-revenue status is typical for early-stage web3 projects"}
• ${data.userCount > 1000 ? `Strong user base of ${data.userCount.toLocaleString()} monthly active users` : data.userCount > 0 ? `Early traction with ${data.userCount} users shows product-market fit potential` : "User acquisition will be a key focus area"}
• ${data.retentionRate > 50 ? "Excellent user retention indicates strong product-market fit" : data.retentionRate > 30 ? "Average user retention suggests product improvements may increase valuation" : "User retention needs improvement to maximize valuation"}
• ${data.growthRate > 20 ? `Impressive ${data.growthRate}% monthly growth rate is attracting premium valuation` : `${data.growthRate}% growth rate is factored into projections`}
${data.miscellaneousDetails ? `\nAdditional context considered: ${data.miscellaneousDetails}` : ""}

This valuation represents a snapshot based on current market conditions and the information provided. Actual investor valuations may vary based on due diligence, market timing, and strategic value.`
  }

  const nextTab = () => {
    if (activeTab === "company") setActiveTab("metrics")
    else if (activeTab === "metrics") setActiveTab("team")
    else if (activeTab === "team") {
      calculateValuation()
      setActiveTab("results")
    }
  }

  const prevTab = () => {
    if (activeTab === "metrics") setActiveTab("company")
    else if (activeTab === "team") setActiveTab("metrics")
    else if (activeTab === "results") setActiveTab("team")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Valuation Calculator</CardTitle>
        <CardDescription>Enter your company details to calculate an estimated valuation</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="team">Team & Funding</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyStage">Company Stage</Label>
                <Select
                  value={formData.companyStage}
                  onValueChange={(value) => handleInputChange("companyStage", value)}
                >
                  <SelectTrigger id="companyStage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">Idea/Concept</SelectItem>
                    <SelectItem value="pre-seed">Pre-seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B</SelectItem>
                    <SelectItem value="series-c-plus">Series C+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="industryVertical">Industry Vertical</Label>
                <Select
                  value={formData.industryVertical}
                  onValueChange={(value) => handleInputChange("industryVertical", value)}
                >
                  <SelectTrigger id="industryVertical">
                    <SelectValue placeholder="Select vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defi">DeFi</SelectItem>
                    <SelectItem value="nft">NFT/Digital Assets</SelectItem>
                    <SelectItem value="gaming">Gaming/Metaverse</SelectItem>
                    <SelectItem value="dao">DAO/Governance</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure/Layer 1-2</SelectItem>
                    <SelectItem value="edufi">Edu-Fi</SelectItem>
                    <SelectItem value="socialfi">Social-Fi</SelectItem>
                    <SelectItem value="rwa">Real World Assets</SelectItem>
                    <SelectItem value="ai">AI/ML on Chain</SelectItem>
                    <SelectItem value="privacy">Privacy & Identity</SelectItem>
                    <SelectItem value="climate">Climate/Sustainability</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="productStage">Product Stage</Label>
                <Select
                  value={formData.productStage}
                  onValueChange={(value) => handleInputChange("productStage", value)}
                >
                  <SelectTrigger id="productStage">
                    <SelectValue placeholder="Select product stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept/Whitepaper</SelectItem>
                    <SelectItem value="mvp">MVP</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="launched">Launched</SelectItem>
                    <SelectItem value="scaling">Scaling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tokenLaunch">Token Launch</Label>
                <RadioGroup
                  value={formData.tokenLaunch}
                  onValueChange={(value) => handleInputChange("tokenLaunch", value)}
                  className="flex space-x-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="token-yes" />
                    <Label htmlFor="token-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="token-no" />
                    <Label htmlFor="token-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mrr">Monthly Recurring Revenue (USD)</Label>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mrr"
                      type="number"
                      placeholder="0"
                      value={formData.mrr || ""}
                      onChange={(e) => handleInputChange("mrr", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userCount">Monthly Active Users</Label>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="userCount"
                      type="number"
                      placeholder="0"
                      value={formData.userCount || ""}
                      onChange={(e) => handleInputChange("userCount", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="retentionRate">User Retention Rate (%)</Label>
                  <span className="text-sm text-muted-foreground">{formData.retentionRate}%</span>
                </div>
                <Slider
                  id="retentionRate"
                  min={1}
                  max={100}
                  step={1}
                  value={[formData.retentionRate]}
                  onValueChange={(value) => handleInputChange("retentionRate", value[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="growthRate">Monthly Growth Rate (%)</Label>
                  <span className="text-sm text-muted-foreground">{formData.growthRate}%</span>
                </div>
                <Slider
                  id="growthRate"
                  min={0}
                  max={100}
                  step={1}
                  value={[formData.growthRate]}
                  onValueChange={(value) => handleInputChange("growthRate", value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    placeholder="0"
                    value={formData.teamSize || ""}
                    onChange={(e) => handleInputChange("teamSize", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousRaised">Previously Raised (USD)</Label>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="previousRaised"
                      type="number"
                      placeholder="0"
                      value={formData.previousRaised || ""}
                      onChange={(e) => handleInputChange("previousRaised", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <Label htmlFor="miscellaneousDetails">Additional Context (Optional)</Label>
                <textarea
                  id="miscellaneousDetails"
                  className="w-full min-h-[100px] p-2 border rounded-md resize-y bg-background"
                  placeholder="Add any additional details that might impact valuation (partnerships, patents, unique technology, etc.)"
                  value={formData.miscellaneousDetails}
                  onChange={(e) => handleInputChange("miscellaneousDetails", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

<TabsContent value="results" className="pt-4">
  {valuation ? (
    <ValuationResult
      valuation={valuation}
      breakdown={valuationBreakdown}
      summary={valuationSummary}
      aiInsights={aiInsights} // ✅ new prop
    />
  ) : (
    <div className="flex flex-col items-center justify-center py-10">
      <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium">Complete all fields to see results</h3>
      <p className="text-muted-foreground text-center mt-2">
        Fill in the company details, metrics, and team information to calculate your valuation
      </p>
    </div>
  )}
</TabsContent>

        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevTab} disabled={activeTab === "company"}>
          Previous
        </Button>
        <Button onClick={nextTab} disabled={activeTab === "results"}>
          {activeTab === "team" ? "Calculate Valuation" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  )
}

