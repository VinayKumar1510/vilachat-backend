import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongo';
import Message from '@/models/Message';

export async function POST(req) {
  await connectToDB();
  const { sender, receiver, text } = await req.json();

  try {
    const newMessage = await Message.create({ sender, receiver, text });
    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
