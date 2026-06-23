const STORAGE_KEY = 'hiring_agent_gemini_key'
const VALID_FLAG_KEY = 'hiring_agent_gemini_key_valid'

export function getStoredApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function isApiKeyValidated() {
  try {
    return localStorage.getItem(VALID_FLAG_KEY) === 'true' && !!getStoredApiKey()
  } catch {
    return false
  }
}

export function saveApiKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key)
    localStorage.setItem(VALID_FLAG_KEY, 'true')
  } catch {
    // localStorage unavailable — ignore
  }
}

export function clearApiKeyValidation() {
  try {
    localStorage.removeItem(VALID_FLAG_KEY)
  } catch {
    // ignore
  }
}

export function clearApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(VALID_FLAG_KEY)
  } catch {
    // ignore
  }
}

export function maskApiKey(key) {
  if (!key || key.length < 8) return '••••••••'
  return `${key.slice(0, 4)}••••${key.slice(-4)}`
}
