export function generateAvatarSeed(previous) {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  const next = bytes[0] & 0x7fffffff
  return next === previous ? (next + 1) % 2147483648 : next
}
