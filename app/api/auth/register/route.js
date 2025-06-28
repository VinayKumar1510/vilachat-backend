import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectToDB } from '@/lib/mongo'
import User from '@/models/User'

export async function POST(req) {
  try {
    await connectToDB()

    const { email, password, username } = await req.json()

    // ✅ Basic field validation
    if (!email || !password || !username) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    // ✅ Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email or Username already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
    })

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const res = NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    })

    res.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return res
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
