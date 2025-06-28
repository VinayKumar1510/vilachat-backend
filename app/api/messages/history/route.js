import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongo';
import Message from '@/models/Message';

export async function POST(req) {
  await connectToDB();
  const { user1, user2 } = await req.json();

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
