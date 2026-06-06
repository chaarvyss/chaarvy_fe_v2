import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.NEXT_ENCRYPTOR_CODE || 'fallback_dev_key_12345'

export const encryptData = (data: any) => {
  try {
    const stringifiedData = JSON.stringify(data)
    const ciphertext = CryptoJS.AES.encrypt(stringifiedData, SECRET_KEY).toString()

    return ciphertext
  } catch (error) {
    console.error('Encryption failed:', error)

    return null
  }
}

export const decryptData = (ciphertext: string) => {
  try {
    if (!ciphertext) return null

    // Decrypt the string
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8)

    // Parse it back into a usable array/object
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Decryption failed. The data might be tampered with:', error)

    return null
  }
}
