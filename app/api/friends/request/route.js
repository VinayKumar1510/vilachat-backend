import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongo'
import FriendRequest from '@/models/FriendRequest'
import User from '@/models/User'
import { verifyToken } from '@/utils/auth'
import { cookies } from 'next/headers'

export async function POST(req) {
  try {
    const cookieStore = await cookies() // ✅ await is required
    const token = cookieStore.get('token')?.value
    const user = token ? await verifyToken(token) : null

    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { receiverUsername } = await req.json()

    await connectToDB()

    const receiver = await User.findOne({ username: receiverUsername })

    if (!receiver) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Avoid duplicate or self-request
    if (receiver._id.toString() === user.id) {
      return NextResponse.json({ message: 'You cannot send request to yourself' }, { status: 400 })
    }

    const alreadyRequested = await FriendRequest.findOne({
      sender: user.id,
      receiver: receiver._id,
    })

    if (alreadyRequested) {
      return NextResponse.json({ message: 'Request already sent' }, { status: 400 })
    }

    const newRequest = new FriendRequest({
      sender: user.id,
      receiver: receiver._id,
      status: 'pending',
    })

    await newRequest.save()

    return NextResponse.json({ message: 'Friend request sent successfully' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
