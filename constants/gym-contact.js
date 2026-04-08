/** Default owners shown on printed payment receipts. */
export const DEFAULT_GYM_OWNERS = [
  { name: 'Muhammad Javaid', phone: '03008821313' },
  { name: 'Muhammad Tuqeer', phone: '03079430052' },
]

/**
 * Optional override: comma-separated entries, each "Name|phone".
 * Example: NEXT_PUBLIC_GYM_OWNERS="Ada Lo|03001234567,Bob|03007654321"
 * @returns {{ name: string, phone: string }[]}
 */
export function getGymOwners() {
  const raw =
    typeof process.env.NEXT_PUBLIC_GYM_OWNERS === 'string'
      ? process.env.NEXT_PUBLIC_GYM_OWNERS.trim()
      : ''
  if (!raw) return DEFAULT_GYM_OWNERS

  const parsed = []
  for (const part of raw.split(',')) {
    const segment = part.trim()
    if (!segment) continue
    const pipe = segment.indexOf('|')
    if (pipe === -1) continue
    const name = segment.slice(0, pipe).trim()
    const phone = segment.slice(pipe + 1).trim().replace(/\s+/g, '')
    if (name && phone) parsed.push({ name, phone })
  }
  return parsed.length ? parsed : DEFAULT_GYM_OWNERS
}
