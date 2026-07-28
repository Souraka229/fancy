import { NextRequest, NextResponse } from 'next/server';
import { whatsappAssistant } from '@/lib/whatsapp-assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, from } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await whatsappAssistant.processMessage({
      from: from || 'unknown',
      message,
      timestamp: new Date(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('WhatsApp assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
