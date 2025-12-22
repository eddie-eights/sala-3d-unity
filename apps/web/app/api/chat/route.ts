import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Character persona system prompt (username will be injected)
const createSystemPrompt = (username: string) => `あなたは「サラ」という名前の18歳の女の子です。
明るく親しみやすい性格で、${username}と楽しく会話します。

重要なルール:
- 返答は必ず日本語で、100文字以内に収めてください
- 簡潔で自然な話し言葉を使ってください
- 敬語ではなく、タメ口で話してください
- 絵文字は使わないでください
- 相手のことは「${username}」と呼んでください（「あなた」は使わない）`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], username = 'きみ' } = await request.json() as {
      message: string;
      history?: ChatMessage[];
      username?: string;
    };

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build message array with system prompt, history, and new message
    const messages: ChatMessage[] = [
      { role: 'system', content: createSystemPrompt(username) },
      ...history.slice(-10), // Keep last 10 messages to save tokens for reasoning model
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 150, // No reasoning overhead, 150 is enough for short responses
    });

    console.log('OpenAI response:', JSON.stringify(completion, null, 2));

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('Response text:', responseText);

    return NextResponse.json({
      text: responseText,
      success: true,
    });

  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
