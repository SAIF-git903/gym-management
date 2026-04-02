const PLANS = ['monthly', 'quarterly', 'half-yearly', 'yearly']
const PAYMENT = ['paid', 'unpaid']
const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function parseMembershipFee(raw) {
  if (raw == null || raw === '') return 0
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw).trim())
  if (Number.isNaN(n) || n < 0) return null
  return Math.round(n * 100) / 100
}

function isIsoDateString(s) {
  if (typeof s !== 'string' || !s.trim()) return false
  const d = new Date(s)
  return !Number.isNaN(d.getTime())
}

function emailOk(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

function normalizeEmail(raw) {
  if (raw == null) return ''
  const t = String(raw).trim().toLowerCase()
  return t
}

/**
 * @returns {{ errors: { msg: string, path: string }[], body?: object }}
 */
export function validateMemberCreate(body) {
  const errors = []
  if (!body?.name?.trim()) errors.push({ msg: 'Name is required', path: 'name' })
  if (!body?.phone?.trim()) errors.push({ msg: 'Phone is required', path: 'phone' })
  const email = normalizeEmail(body?.email)
  if (email && !emailOk(email)) errors.push({ msg: 'Valid email required', path: 'email' })
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

  const fee = parseMembershipFee(body?.membershipFee)
  if (fee === null) {
    errors.push({ msg: 'Membership fee must be a non-negative number', path: 'membershipFee' })
  }

  let bloodGroup = ''
  if (body?.bloodGroup != null && String(body.bloodGroup).trim() !== '') {
    const bg = String(body.bloodGroup).trim()
    if (!BLOOD_GROUPS.includes(bg)) {
      errors.push({ msg: 'Invalid blood group', path: 'bloodGroup' })
    } else bloodGroup = bg
  }

  if (errors.length) return { errors }

  return {
    errors: [],
    body: {
      name: body.name.trim(),
      phone: body.phone.trim(),
      email,
      address: typeof body.address === 'string' ? body.address.trim() : '',
      notes: typeof body.notes === 'string' ? body.notes.trim() : '',
      membershipFee: fee,
      bloodGroup,
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
    const em = normalizeEmail(body.email)
    if (em && !emailOk(em)) errors.push({ msg: 'Valid email required', path: 'email' })
    else patch.email = em
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
  if (body.membershipFee !== undefined) {
    const fee = parseMembershipFee(body.membershipFee)
    if (fee === null) {
      errors.push({ msg: 'Membership fee must be a non-negative number', path: 'membershipFee' })
    } else patch.membershipFee = fee
  }
  if (body.bloodGroup !== undefined) {
    const raw = body.bloodGroup
    if (raw === null || String(raw).trim() === '') {
      patch.bloodGroup = ''
    } else {
      const bg = String(raw).trim()
      if (!BLOOD_GROUPS.includes(bg)) {
        errors.push({ msg: 'Invalid blood group', path: 'bloodGroup' })
      } else patch.bloodGroup = bg
    }
  }
  if (errors.length) return { errors }
  return { errors: [], patch }
}

export function isValidMongoId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}
