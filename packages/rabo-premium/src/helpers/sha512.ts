import { BinaryLike, BinaryToTextEncoding, createHash } from 'node:crypto'

/**
 * Returns a HASH using the sha512 algorithm.
 */
export default function sha512(data: BinaryLike, encoding: BinaryToTextEncoding) {
  return createHash('sha512').update(data).digest(encoding)
}
