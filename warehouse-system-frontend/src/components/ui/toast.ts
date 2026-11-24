import { useState, useCallback } from 'react'

export interface DraftState<T> {
  data: T
  lastSaved: number
}

export function useFormDraft<T>(
  key: string,
  initialData: T,
): [T, (data: T) => void, () => void] {
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`draft:${key}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.data || initialData
      }
    } catch {
      // Ignore parse errors
    }
    return initialData
  })

  const saveDraft = useCallback((data: T) => {
    setData(data)
    try {
      localStorage.setItem(
        `draft:${key}`,
        JSON.stringify({ data, lastSaved: Date.now() }),
      )
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  }, [])

  const clearDraft = useCallback(() => {
    setData(initialData)
    try {
      localStorage.removeItem(`draft:${key}`)
    } catch {
      // Ignore
    }
  }, [initialData])

  return [data, saveDraft, clearDraft]
}

export { ToastProvider, useToast } from './Toast.tsx'