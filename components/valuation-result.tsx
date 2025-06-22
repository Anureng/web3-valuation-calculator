"use client"

import { BarChart, Download, Info, TrendingUp, AlertTriangle, MapPin, Users, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ValuationResultProps {
  valuation: number
  breakdown: Record<string, number>
  summary: string
  aiInsights?: {
    competitors?: string
    risks?: string
    roadmap?: string
  }
  isCalculating?: boolean
}

export function ValuationResult({ valuation, breakdown, summary, aiInsights, isCalculating = false }: ValuationResultProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`
    } else {
      return `$${value.toFixed(2)}`
    }
  }

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const parseJsonFromText = (text: string) => {
    // Extract JSON blocks from text
    const jsonMatches = text.match(/```\s*{[\s\S]*?}\s*```/g)
    if (jsonMatches) {
      try {
        const jsonStr = jsonMatches[0].replace(/```/g, '').trim()
        return JSON.parse(jsonStr)
      } catch (e) {
        return null
      }
    }
    return null
  }

  const cleanText = (text: string) => {
    if (!text) return text
    
    // Remove JSON blocks
    let cleaned = text.replace(/```\s*{[\s\S]*?}\s*```/g, '')
    
    // Remove duplicate sections (like repeated "AI Competitor Analysis")
    const sections = ['AI Competitor Analysis', 'Risk Assessment', 'Roadmap Validation']
    sections.forEach(section => {
      const regex = new RegExp(`${section}[\\s\\S]*?(?=${sections.join('|')}|$)`, 'g')
      const matches = cleaned.match(regex)
      if (matches && matches.length > 1) {
        // Keep only the first occurrence
        cleaned = cleaned.replace(regex, matches[0])
      }
    })
    
    return cleaned.trim()
  }

  const formatText = (text: string) => {
    if (!text) return null
    
    const cleanedText = cleanText(text)
    const paragraphs = cleanedText.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map((paragraph, index) => {
      // Skip JSON blocks
      if (paragraph.includes('```') || paragraph.includes('{')) {
        return null
      }
      
      // Check if it's a list item
      if (paragraph.includes('\n') && /^[\s]*[•\-\*]/.test(paragraph)) {
        const items = paragraph.split('\n').filter(item => item.trim() && /^[\s]*[•\-\*]/.test(item))
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="leading-relaxed">
                {item.replace(/^[\s]*[•\-\*]+[\s]*/, '')}
              </li>
            ))}
          </ul>
        )
      }
      
      // Check for key points with bullet format
      if (paragraph.includes('•')) {
        const items = paragraph.split('•').filter(item => item.trim())
        return (
          <div key={index} className="mb-4">
            {items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-start mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">{item.trim()}</p>
              </div>
            ))}
          </div>
        )
      }
      
      return (
        <p key={index} className="mb-4 last:mb-0 text-muted-foreground leading-relaxed">
          {paragraph}
        </p>
      )
    }).filter(Boolean)
  }

  const formatCompetitorAnalysis = (text: string) => {
    const jsonData = parseJsonFromText(text)
    const cleanedText = cleanText(text)
    
    if (jsonData) {
      return (
        <div className="space-y-4">
          {jsonData.competitors && jsonData.competitors.length > 0 ? (
            <div>
              <h5 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Identified Competitors:</h5>
              <div className="grid gap-2">
                {jsonData.competitors.map((competitor: string, index: number) => (
                  <Badge key={index} variant="outline" className="justify-start">
                    {competitor}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">No direct competitors identified at this stage</p>
            </div>
          )}
          
          {jsonData.summaryParagraph && (
            <div>
              <h5 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Analysis Summary:</h5>
              <p className="text-muted-foreground leading-relaxed">{jsonData.summaryParagraph}</p>
            </div>
          )}
          
          {formatText(cleanedText)}
        </div>
      )
    }
    
    return formatText(text)
  }

  const formatRiskAnalysis = (text: string) => {
    const jsonData = parseJsonFromText(text)
    const cleanedText = cleanText(text)
    
    if (jsonData) {
      return (
        <div className="space-y-4">
          {jsonData.riskScore && (
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/50 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <span className="font-semibold text-amber-700 dark:text-amber-300">Risk Score:</span>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {jsonData.riskScore}/100
                </div>
                <Badge variant={jsonData.riskScore > 70 ? "destructive" : jsonData.riskScore > 40 ? "secondary" : "default"}>
                  {jsonData.riskScore > 70 ? "High Risk" : jsonData.riskScore > 40 ? "Medium Risk" : "Low Risk"}
                </Badge>
              </div>
            </div>
          )}
          
          {jsonData.redFlags && jsonData.redFlags.length > 0 && (
            <div>
              <h5 className="font-semibold mb-3 text-amber-700 dark:text-amber-300 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Red Flags Identified:
              </h5>
              <div className="grid gap-2">
                {jsonData.redFlags.map((flag: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-300">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {jsonData.explanation && (
            <div>
              <h5 className="font-semibold mb-2 text-amber-700 dark:text-amber-300">Detailed Analysis:</h5>
              <p className="text-muted-foreground leading-relaxed bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                {jsonData.explanation}
              </p>
            </div>
          )}
          
          {formatText(cleanedText)}
        </div>
      )
    }
    
    return formatText(text)
  }

  const formatRoadmapAnalysis = (text: string) => {
    const jsonData = parseJsonFromText(text)
    const cleanedText = cleanText(text)
    
    if (jsonData) {
      return (
        <div className="space-y-4">
          {jsonData.invalidTimeline && jsonData.invalidTimeline.length > 0 && (
            <div>
              <h5 className="font-semibold mb-2 text-red-700 dark:text-red-300 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Timeline Issues:
              </h5>
              <div className="space-y-2">
                {jsonData.invalidTimeline.map((issue: string, index: number) => (
                  <div key={index} className="p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
                    <span className="text-sm text-red-700 dark:text-red-300">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {jsonData.missingDependencies && jsonData.missingDependencies.length > 0 && (
            <div>
              <h5 className="font-semibold mb-2 text-orange-700 dark:text-orange-300 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Missing Dependencies:
              </h5>
              <div className="space-y-2">
                {jsonData.missingDependencies.map((dep: string, index: number) => (
                  <div key={index} className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-200 dark:border-orange-800">
                    <span className="text-sm text-orange-700 dark:text-orange-300">{dep}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {jsonData.suggestions && jsonData.suggestions.length > 0 && (
            <div>
              <h5 className="font-semibold mb-2 text-purple-700 dark:text-purple-300 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Suggestions:
              </h5>
              <div className="space-y-2">
                {jsonData.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-800">
                    <span className="text-sm text-purple-700 dark:text-purple-300">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {formatText(cleanedText)}
        </div>
      )
    }
    
    return formatText(text)
  }

  const total = breakdown ? Object.values(breakdown).reduce((sum, value) => sum + value, 0) : 0
  const percentages = breakdown ? Object.entries(breakdown).map(([key, value]) => ({
    name: formatLabel(key),
    originalKey: key,
    value,
    percentage: (value / total) * 100,
  })).sort((a, b) => b.value - a.value) : []

  const handleDownload = () => {
    const valuationData = {
      estimatedValuation: valuation,
      breakdown,
      calculatedAt: new Date().toISOString(),
      summary,
      aiInsights
    }

    const dataStr = JSON.stringify(valuationData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", "web3-valuation-estimate.json")
    linkElement.click()
  }

  if (isCalculating) {
    return (
      <div className="space-y-6">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 bg-emerald-600 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Calculating Your Valuation</h3>
                <p className="text-muted-foreground">Analyzing market data and generating insights...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium mb-4">Processing Valuation Components</h4>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Valuation Display */}
      <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/50 dark:to-blue-950/50 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
              Estimated Valuation
            </Badge>
            <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(valuation)}
            </div>
            <p className="text-muted-foreground">
              Based on current market conditions and your project metrics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Valuation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-emerald-600" />
            Valuation Breakdown
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    This breakdown shows the contribution of each factor to your overall valuation estimate
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {percentages.map((item, index) => (
              <div key={item.originalKey} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(item.value)}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Valuation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
            Valuation Analysis
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">AI-generated analysis based on your inputs and current market conditions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {summary ? (
              <div className="space-y-2">
                {formatText(summary)}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                  <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                  <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Cards */}
      {aiInsights?.competitors && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
              <Users className="h-5 w-5 mr-2" />
              AI Competitor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              {formatCompetitorAnalysis(aiInsights.competitors)}
            </div>
          </CardContent>
        </Card>
      )}

      {aiInsights?.risks && (
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
              {formatRiskAnalysis(aiInsights.risks)}
            </div>
          </CardContent>
        </Card>
      )}

      {aiInsights?.roadmap && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
              <MapPin className="h-5 w-5 mr-2" />
              Roadmap Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
              {formatRoadmapAnalysis(aiInsights.roadmap)}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Download Button */}
      <div className="flex justify-center">
        <Button onClick={handleDownload} size="lg" className="gap-2">
          <Download className="h-4 w-4" />
          Download Detailed Report
        </Button>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-sm">Important Disclaimer</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This valuation is an estimate based on industry benchmarks, current market conditions, 
              and the information provided. Actual valuations may vary significantly based on investor 
              sentiment, market timing, competitive landscape, and other factors. This tool is for 
              informational purposes only and should not be considered as financial advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}