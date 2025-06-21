import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRole, Permission } from '@prisma/client'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  permissions: Permission[]
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'demo-secret-key', { expiresIn: '7d' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as JWTPayload
  } catch {
    return null
  }
}

export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission)
}

export const isAdmin = (role: UserRole): boolean => {
  return role === UserRole.ADMIN
}
