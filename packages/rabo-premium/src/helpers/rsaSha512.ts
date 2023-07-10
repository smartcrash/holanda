import {
  BinaryLike,
  BinaryToTextEncoding,
  KeyLike,
  SignKeyObjectInput,
  SignPrivateKeyInput,
  createSign,
} from 'node:crypto'

/**
 * Create signature using RSA-SHA512 algorithm.
 */
export default function rsaSha512(
  data: BinaryLike,
  privateKey: KeyLike | SignKeyObjectInput | SignPrivateKeyInput,
  outputFormat: BinaryToTextEncoding,
) {
  return createSign('RSA-SHA512').update(data).sign(privateKey, outputFormat)
}
