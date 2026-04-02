const PLANS = ['monthly', 'quarterly', 'half-yearly', 'yearly']
const PAYMENT = ['paid', 'unpaid']

function isIsoDateString(s) {
  if (typeof s !== 'string' || !s.trim()) return false
  const d = new Date(s)
  return !Number.isNaN(d.getTime())
}

function emailOk(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

/**
 * @returns {{ errors: { msg: string, path: string }[], body?: object }}
 */
export function validateMemberCreate(body) {
  const errors = []
  if (!body?.name?.trim()) errors.push({ msg: 'Name is required', path: 'name' })
  if (!body?.phone?.trim()) errors.push({ msg: 'Phone is required', path: 'phone' })
  if (!emailOk(body?.email || '')) errors.push({ msg: 'Valid email required', path: 'email' })
  if (body?.address != null && typeof body.address !== 'string')
    errors.push({ msg: 'Invalid address', path: 'address' })
  if (body?.notes != null) {
    if (typeof body.notes !== 'string' || body.notes.length > 5000) {
      errors.push({ msg: 'Notes max 5000 characters', path: 'notes' })
    }
  }
  if (!PLANS.includes(body?.plan)) errors.push({ msg: 'Invalid plan', path: 'plan' })
  if (!isIsoDateString(body?.startDate))
    errors.push({ msg: 'Valid startDate (ISO) required', path: 'startDate' })
  if (!isIsoDateString(body?.endDate))
    errors.push({ msg: 'Valid endDate (ISO) required', path: 'endDate' })
  if (body?.paymentStatus != null && !PAYMENT.includes(body.paymentStatus)) {
    errors.push({ msg: 'Invalid paymentStatus', path: 'paymentStatus' })
  }
  if (errors.length) return { errors }

  return {
    errors: [],
    body: {
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: String(body.email).trim().toLowerCase(),
      address: typeof body.address === 'string' ? body.address.trim() : '',
      notes: typeof body.notes === 'string' ? body.notes.trim() : '',
      plan: body.plan,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      paymentStatus: PAYMENT.includes(body.paymentStatus) ? body.paymentStatus : 'unpaid',
    },
  }
}

/**
 * @returns {{ errors: { msg: string, path: string }[], patch?: object }}
 */
export function validateMemberUpdate(body) {
  const errors = []
  const patch = {}
  if (body.name !== undefined) {
    if (!String(body.name).trim()) errors.push({ msg: 'Name cannot be empty', path: 'name' })
    else patch.name = String(body.name).trim()
  }
  if (body.phone !== undefined) {
    if (!String(body.phone).trim()) errors.push({ msg: 'Phone cannot be empty', path: 'phone' })
    else patch.phone = String(body.phone).trim()
  }
  if (body.email !== undefined) {
    if (!emailOk(body.email)) errors.push({ msg: 'Valid email required', path: 'email' })
    else patch.email = String(body.email).trim().toLowerCase()
  }
  if (body.address !== undefined) {
    if (typeof body.address !== 'string') errors.push({ msg: 'Invalid address', path: 'address' })
    else patch.address = body.address.trim()
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== 'string' || body.notes.length > 5000) {
      errors.push({ msg: 'Notes max 5000 characters', path: 'notes' })
    } else patch.notes = body.notes.trim()
  }
  if (body.plan !== undefined) {
    if (!PLANS.includes(body.plan)) errors.push({ msg: 'Invalid plan', path: 'plan' })
    else patch.plan = body.plan
  }
  if (body.startDate !== undefined) {
    if (!isIsoDateString(body.startDate))
      errors.push({ msg: 'Valid startDate (ISO) required', path: 'startDate' })
    else patch.startDate = new Date(body.startDate)
  }
  if (body.endDate !== undefined) {
    if (!isIsoDateString(body.endDate))
      errors.push({ msg: 'Valid endDate (ISO) required', path: 'endDate' })
    else patch.endDate = new Date(body.endDate)
  }
  if (body.paymentStatus !== undefined) {
    if (!PAYMENT.includes(body.paymentStatus))
      errors.push({ msg: 'Invalid paymentStatus', path: 'paymentStatus' })
    else patch.paymentStatus = body.paymentStatus
  }
  if (errors.length) return { errors }
  return { errors: [], patch }
}

export function isValidMongoId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}
