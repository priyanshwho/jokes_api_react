import { useEffect, useState } from 'react'

type InitialValue<T> = T | (() => T)

function resolveInitialValue<T>(initialValue: InitialValue<T>): T {
  return typeof initialValue === 'function'
    ? (initialValue as () => T)()
    : initialValue
}

export function useLocalStorage<T>(key: string, initialValue: InitialValue<T>) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return resolveInitialValue(initialValue)
    }

    try {
      const item = window.localStorage.getItem(key)

      return item ? (JSON.parse(item) as T) : resolveInitialValue(initialValue)
    } catch {
      return resolveInitialValue(initialValue)
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // Ignore storage failures and keep the in-memory state.
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}
