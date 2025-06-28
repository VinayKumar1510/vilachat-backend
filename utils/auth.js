import jwt from 'jsonwebtoken'
import { connectToDB } from '@/lib/mongo'
import User from '@/models/User'

const SECRET = process.env.JWT_SECRET

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET)
    
    await connectToDB()
    const user = await User.findById(decoded.id)

    if (!user) return null 

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    }
  } catch (err) {
    return null
  }
}
