import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

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

const storage = typeof window !== 'undefined' ? createWebStorage('session') : createNoopStorage()

export default storage
