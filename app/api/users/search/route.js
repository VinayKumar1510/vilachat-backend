import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/utils/auth'
import { connectToDB } from '@/lib/mongo'
import User from '@/models/User'

export async function GET(req) {
  try {
    const cookieStore = await cookies() // ✅ await here
    const token = cookieStore.get('token')?.value
    const user = token ? await verifyToken(token) : null

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')

    if (!query || query.trim() === '') {
      return NextResponse.json([], { status: 200 })
    }

    await connectToDB()

    const results = await User.find({
      username: { $regex: new RegExp(query, 'i') },
      _id: { $ne: user.id },
    }).select('_id username email')

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ message: 'Search failed', error: error.message }, { status: 500 })
  }
}
