import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  search?: {
    param: string
    debounceMs?: number
    placeholder?: string
  }
  selects?: Record<string, {
    param: string
    options: FilterOption[]
    placeholder?: string
  }>
  dateRange?: {
    startParam: string
    endParam: string
    placeholder?: string
  }
}

/**
 * Hook that manages filter state for data-list pages.
 * Supports debounced search, dropdown selects, and date ranges.
 * Optionally syncs with URL query parameters.
 */
export function useFilters(config: FilterConfig) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<Record<string, string>>({})
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize filters from URL on mount
  useEffect(() => {
    const initial: Record<string, string> = {}
    if (config.search) {
      const v = searchParams.get(config.search.param)
      if (v) initial[config.search.param] = v
    }
    if (config.selects) {
      Object.entries(config.selects).forEach(([key, def]) => {
        const v = searchParams.get(def.param)
        if (v) initial[key] = v
      })
    }
    if (config.dateRange) {
      const s = searchParams.get(config.dateRange.startParam)
      const e = searchParams.get(config.dateRange.endParam)
      if (s) initial[config.dateRange.startParam] = s
      if (e) initial[config.dateRange.endParam] = e
    }
    setFilters(initial)
  }, [])

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (value === '') {
        delete next[key]
      }
      return next
    })
  }, [])

  const setSearch = useCallback(
    (value: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      const ms = config.search?.debounceMs ?? 400
      debounceTimer.current = setTimeout(() => {
        setFilter(config.search!.param, value.trim())
        debounceTimer.current = null
      }, ms)
    },
    [config.search, setFilter],
  )

  const reset = useCallback(() => {
    setFilters({})
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const activeFilters = Object.keys(filters).length

  const isFilterActive = useCallback((key: string) => {
    return !!filters[key]
  }, [filters])

  const toQueryParams = useCallback((): URLSearchParams => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    return params
  }, [filters])

  return {
    filters,
    setFilter,
    setSearch,
    reset,
    activeFilters,
    isFilterActive,
    toQueryParams,
  }
}
