"use client"

import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTraffixContext } from "@/lib/traffix-context"

export function TimePeriodSelector() {
  const { timePeriod, setTimePeriod, customDateRange, setCustomDateRange, triggerRefresh } = useTraffixContext()

  const handlePeriodChange = (period: 'MTD' | 'QTD' | 'YTD') => {
    setTimePeriod(period)
    triggerRefresh()
  }

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...customDateRange, [field]: value }
    setCustomDateRange(newRange)
    if (newRange.start && newRange.end) {
      setTimePeriod('CUSTOM')
      triggerRefresh()
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
      <div className="flex items-center gap-2">
        {(["MTD", "QTD", "YTD"] as const).map((period) => (
          <Button
            key={period}
            variant={timePeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange(period)}
            className="h-9 px-4"
          >
            {period}
          </Button>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant={timePeriod === "CUSTOM" ? "default" : "outline"} size="sm" className="h-9 px-4">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-6" align="end">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Select Custom Date Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    min="2025-10-19"
                    max="2025-11-02"
                    className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                    min="2025-10-19"
                    max="2025-11-02"
                    className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                  />
                </div>
              </div>
              <div className="pt-2 text-xs text-muted-foreground/70 bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                Full data available: Oct 19 - Nov 2
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
