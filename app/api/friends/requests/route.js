import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongo'
import FriendRequest from '@/models/FriendRequest'
import User from '@/models/User'
import { verifyToken } from '@/utils/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const user = token ? await verifyToken(token) : null
    if (!user) return NextResponse.json([], { status: 401 })

    await connectToDB()

    const requests = await FriendRequest.find({
      receiver: user.id,
      status: 'pending',
    }).populate('sender')

    return NextResponse.json(requests)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
