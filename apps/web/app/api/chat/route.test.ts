import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock OpenAI with proper class constructor
const mockCreate = vi.fn().mockResolvedValue({
  choices: [{ message: { content: 'こんにちは！今日も元気だよ！' } }],
});

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

describe('/api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'こんにちは！今日も元気だよ！' } }],
    });
  });

  it('should return AI response for valid message', async () => {
    const { POST } = await import('./route');
    
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'こんにちは' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.text).toBeDefined();
  });

  it('should return 400 for missing message', async () => {
    const { POST } = await import('./route');
    
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Message is required');
  });

  it('should include conversation history in request', async () => {
    const { POST } = await import('./route');
    
    const history = [
      { role: 'user' as const, content: '最初のメッセージ' },
      { role: 'assistant' as const, content: '返事だよ' },
    ];

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '2回目のメッセージ', history }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(200);
  });
});
