import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json() as { text: string };

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Female voice, good for Japanese
      input: text,
      speed: 1.0,
      response_format: 'pcm', // Raw PCM audio for Unity
    });

    // Get audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();

    // Return as audio/pcm (raw 24kHz 16-bit mono PCM)
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/pcm',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('TTS API error:', error);
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
