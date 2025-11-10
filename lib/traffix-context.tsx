"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Region = 'District of Columbia' | 'Virginia' | 'All'
type TimePeriod = 'MTD' | 'QTD' | 'YTD' | 'CUSTOM'

interface CustomDateRange {
  start: string
  end: string
}

interface TraffixContextType {
  region: Region
  setRegion: (region: Region) => void
  timePeriod: TimePeriod
  setTimePeriod: (period: TimePeriod) => void
  customDateRange: CustomDateRange
  setCustomDateRange: (range: CustomDateRange) => void
  refreshTrigger: number
  triggerRefresh: () => void
}

const TraffixContext = createContext<TraffixContextType | undefined>(undefined)

export function TraffixProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>('Virginia')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('CUSTOM')
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({ 
    start: '2025-10-27',  // Demo range: Oct 27 - Oct 31 (5 days)
    end: '2025-10-31' 
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <TraffixContext.Provider
      value={{
        region,
        setRegion,
        timePeriod,
        setTimePeriod,
        customDateRange,
        setCustomDateRange,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </TraffixContext.Provider>
  )
}

export function useTraffixContext() {
  const context = useContext(TraffixContext)
  if (context === undefined) {
    throw new Error('useTraffixContext must be used within a TraffixProvider')
  }
  return context
}

