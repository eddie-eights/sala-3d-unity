import { NextRequest } from 'next/server';
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
- 相手のことは「${username}」と呼んでください（「あなた」は使わない）
- 1〜2文で簡潔に返答してください`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Split text into sentences (Japanese-aware)
function splitIntoSentences(text: string): string[] {
  // Split by Japanese sentence endings: 。！？ or newlines
  const sentences = text.split(/(?<=[。！？\n])/g)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return sentences;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], username = 'きみ' } = await request.json() as {
      message: string;
      history?: ChatMessage[];
      username?: string;
    };

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build message array with system prompt, history, and new message
    const messages: ChatMessage[] = [
      { role: 'system', content: createSystemPrompt(username) },
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    // Use streaming API
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 150,
      stream: true,
    });

    // Create a TransformStream to process OpenAI stream -> sentence stream
    const encoder = new TextEncoder();
    let buffer: string = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            buffer += content;

            // Check for complete sentences
            const sentences = splitIntoSentences(buffer);

            // If we have more than one sentence, emit all complete ones
            if (sentences.length > 1) {
              for (let i = 0; i < sentences.length - 1; i++) {
                const sentenceData = JSON.stringify({
                  type: 'sentence',
                  text: sentences[i]
                }) + '\n';
                controller.enqueue(encoder.encode(sentenceData));
              }
              // Keep the last incomplete sentence in buffer
              buffer = sentences[sentences.length - 1] ?? '';
            }
          }

          // Emit remaining buffer as final sentence
          if (buffer.trim()) {
            const sentenceData = JSON.stringify({
              type: 'sentence',
              text: buffer.trim()
            }) + '\n';
            controller.enqueue(encoder.encode(sentenceData));
          }

          // Send done signal
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
