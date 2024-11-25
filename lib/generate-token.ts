'use server'

import jwt from 'jsonwebtoken'

export async function generateToken(userId?: string) {
  const token = jwt.sign({ userId }, process.env.NEXT_PUBLIC_JWT_SECRET!)
  return token
}
