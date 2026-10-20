type StorageValue = string | number | boolean | null | Record<string, unknown> | unknown[]

type StorageHandler = {
  clear: () => void
  get: <T>(key: string, fallbackValue?: T) => T | null
  remove: (key: string) => void
  set: (key: string, value: StorageValue) => void
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function createStorageHandler(storageType: 'localStorage' | 'sessionStorage'): StorageHandler {
  const getStorage = (): Storage | null => {
    if (!isBrowser()) {
      return null
    }

    return window[storageType]
  }

  return {
    clear() {
      getStorage()?.clear()
    },

    get<T>(key: string, fallbackValue?: T): T | null {
      const rawValue = getStorage()?.getItem(key)

      if (rawValue == null) {
        return fallbackValue ?? null
      }

      try {
        return JSON.parse(rawValue) as T
      } catch {
        return rawValue as T
      }
    },

    remove(key: string) {
      getStorage()?.removeItem(key)
    },

    set(key: string, value: StorageValue) {
      getStorage()?.setItem(key, JSON.stringify(value))
    }
  }
}

export const localStorageUtil = createStorageHandler('localStorage')
export const sessionStorageUtil = createStorageHandler('sessionStorage')
