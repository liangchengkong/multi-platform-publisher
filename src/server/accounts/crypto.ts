const PREFIX = 'dev-base64:'

export function encryptToken(value: string | null | undefined) {
  if (!value) return null
  return `${PREFIX}${Buffer.from(value, 'utf8').toString('base64')}`
}

export function decryptToken(value: string | null | undefined) {
  if (!value) return null
  if (!value.startsWith(PREFIX)) return value
  return Buffer.from(value.slice(PREFIX.length), 'base64').toString('utf8')
}
