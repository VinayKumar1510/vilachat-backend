import { cookies } from 'next/headers'
import { verifyToken } from '@/utils/auth'
import { connectToDB } from '@/lib/mongo'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectToDB()

    const cookieStore = await cookies() 
    const token = cookieStore.get('token')?.value
    const userData = token ? await verifyToken(token) : null

    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findById(userData.id).select('username email')
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
