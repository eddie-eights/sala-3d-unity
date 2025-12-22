import { NextRequest, NextResponse } from 'next/server';

// TTS Server URL (FastAPI with VOICEVOX)
const TTS_SERVER_URL = process.env.TTS_SERVER_URL || 'http://localhost:8000';

// v1 TTS Request/Response types
interface TtsRequest {
  text: string;
  speaker_id?: number;
  style?: {
    speed?: number;
    pitch?: number;
    intonation?: number;
    volume?: number;
  };
  timing?: {
    format?: string;
    include_phonemes?: boolean;
  };
  client?: {
    sample_rate?: number;
  };
}

interface VisemeEvent {
  t: number;
  v: string;
  w: number;
}

interface PhonemeEvent {
  t0: number;
  t1: number;
  p: string;
}

interface TtsResponseV1 {
  version: string;
  request_id: string;
  audio: {
    format: string;
    sample_rate: number;
    channels: number;
    duration_sec: number;
    base64?: string;
    url?: string;
  };
  timing: {
    timebase: string;
    visemes: VisemeEvent[];
    phonemes?: PhonemeEvent[];
  };
  meta: {
    engine: string;
    speaker_id: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TtsRequest;

    if (!body.text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Call TTS server v1 API
    const ttsResponse = await fetch(`${TTS_SERVER_URL}/v1/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: body.text,
        speaker_id: body.speaker_id ?? 1,
        style: body.style,
        timing: body.timing ?? { format: 'viseme', include_phonemes: true },
        client: body.client,
      }),
    });

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      console.error('TTS Server error:', error);
      return NextResponse.json(
        { error: `TTS Server error: ${error}` },
        { status: ttsResponse.status }
      );
    }

    const data: TtsResponseV1 = await ttsResponse.json();

    // Return TtsResponseV1 directly
    return NextResponse.json(data);

  } catch (error) {
    console.error('TTS API error:', error);

    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
