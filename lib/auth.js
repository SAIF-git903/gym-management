import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { User } from '@/lib/models/User'

export function generateToken(userId) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not defined')
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

/**
 * @returns {Promise<{ user: import('mongoose').Document } | { response: Response }>}
 */
export async function requireOwner(request) {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    return {
      response: NextResponse.json({ message: 'Not authorized, no token' }, { status: 401 }),
    }
  }
  const token = header.split(' ')[1]
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      return {
        response: NextResponse.json({ message: 'Server misconfiguration' }, { status: 500 }),
      }
    }
    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return { response: NextResponse.json({ message: 'User not found' }, { status: 401 }) }
    }
    if (user.role !== 'admin') {
      return {
        response: NextResponse.json({ message: 'Owner access required' }, { status: 403 }),
      }
    }
    return { user }
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return {
        response: NextResponse.json({ message: 'Not authorized, invalid token' }, { status: 401 }),
      }
    }
    throw err
  }
}
