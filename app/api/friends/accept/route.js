import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongo'
import FriendRequest from '@/models/FriendRequest'
import { verifyToken } from '@/utils/auth'

export async function POST(req) {
  try {
    const { requestId } = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const user = token ? await verifyToken(token) : null
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    await connectToDB()

    await FriendRequest.findOneAndUpdate(
      { _id: requestId, receiver: user.id },
      { status: 'accepted' }
    )

    return NextResponse.json({ message: 'Friend request accepted!' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
