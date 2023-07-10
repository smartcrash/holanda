/**
 * Returns the base64 representation of the given string.
 */
export default function toBase64(str: string) {
  return Buffer.from(str).toString('base64')
}
