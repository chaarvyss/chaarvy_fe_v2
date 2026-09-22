import localforage from 'localforage'

try {
  localforage.config({
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    name: 'chaarvy_app',
    storeName: 'redux_persist_store'
  })
} catch (e) {
  console.warn('localforage config error:', e)
}

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null)
    },
    setItem(...args: any[]) {
      return Promise.resolve(args[1])
    },
    removeItem() {
      return Promise.resolve()
    }
  }
}

const createSafeStorage = () => {
  return {
    getItem(key: string) {
      return localforage.getItem(key).catch((err) => {
        console.warn('Storage getItem error:', err)
        return null
      })
    },
    setItem(key: string, value: any) {
      return localforage.setItem(key, value).catch((err) => {
        console.warn('Storage setItem error:', err)
        return value
      })
    },
    removeItem(key: string) {
      return localforage.removeItem(key).catch((err) => {
        console.warn('Storage removeItem error:', err)
      })
    }
  }
}

const storage = typeof window !== 'undefined' ? createSafeStorage() : createNoopStorage()

export default storage
