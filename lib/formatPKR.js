/**
 * Format amounts as Pakistani Rupees with locale grouping (commas).
 * @param {number|string|null|undefined} amount
 * @param {{ omitWhenZero?: boolean }} [opts] - if omitWhenZero and amount is 0, return em dash
 * @returns {string}
 */
export function formatPKR(amount, opts = {}) {
  const { omitWhenZero = false } = opts
  if (amount == null || amount === '') return '—'
  const n = typeof amount === 'number' ? amount : Number.parseFloat(String(amount).trim())
  if (Number.isNaN(n)) return '—'
  if (omitWhenZero && n === 0) return '—'
  const formatted = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n)
  return `Rs. ${formatted}`
}
