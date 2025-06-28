import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongo'
import FriendRequest from '@/models/FriendRequest'
import { cookies } from 'next/headers'
import { verifyToken } from '@/utils/auth'

export async function GET() {
  try {
    const cookieStore = await cookies() // ✅ Await here!
    const token = cookieStore.get('token')?.value
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const accepted = await FriendRequest.find({
      status: 'accepted',
      $or: [{ sender: user.id }, { receiver: user.id }]
    }).populate(['sender', 'receiver'])

    const friends = accepted.map(req => {
      const friend = req.sender._id.toString() === user.id ? req.receiver : req.sender
      return {
        _id: friend._id,
        username: friend.username,
        email: friend.email
      }
    })

    return NextResponse.json(friends)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
