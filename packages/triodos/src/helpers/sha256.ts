import { BinaryLike, BinaryToTextEncoding, createHash } from 'node:crypto'

/**
 * Returns a HASH using the sha256 algorithm.
 */
export default function sha256(data: BinaryLike, encoding: BinaryToTextEncoding) {
  return createHash('sha256').update(data).digest(encoding)
}
