import {
  BinaryLike,
  BinaryToTextEncoding,
  KeyLike,
  SignKeyObjectInput,
  SignPrivateKeyInput,
  createSign,
} from 'node:crypto'

/**
 * Create signature using RSA-SHA256 algorithm.
 */
export default function rsaSha256(
  data: BinaryLike,
  privateKey: KeyLike | SignKeyObjectInput | SignPrivateKeyInput,
  outputFormat: BinaryToTextEncoding,
) {
  return createSign('RSA-SHA256').update(data).sign(privateKey, outputFormat)
}
