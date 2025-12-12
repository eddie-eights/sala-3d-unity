import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    }),
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue(new Headers()),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue({}),
}));

describe('/api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const { GET } = await import('./route');
      const request = new Request('http://localhost:3000/api/profile');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return user data if authenticated', async () => {
      const { auth } = await import('@/lib/auth');
      const { db } = await import('@/lib/db');
      
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      } as any);

      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        birthday: new Date('1990-01-01'),
      } as any);

      const { GET } = await import('./route');
      const request = new Request('http://localhost:3000/api/profile');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('user-123');
      expect(data.username).toBe('testuser');
    });

    it('should return 404 if user not found in database', async () => {
      const { auth } = await import('@/lib/auth');
      const { db } = await import('@/lib/db');
      
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      } as any);

      vi.mocked(db.query.users.findFirst).mockResolvedValue(null);

      const { GET } = await import('./route');
      const request = new Request('http://localhost:3000/api/profile');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('PUT', () => {
    it('should return 401 if not authenticated', async () => {
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const { PUT } = await import('./route');
      const request = new Request('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'newname' }),
      });
      
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should update profile successfully', async () => {
      const { auth } = await import('@/lib/auth');
      
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        session: { id: 'session-123' },
      } as any);

      const { PUT } = await import('./route');
      const request = new Request('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'newname',
          gender: 'male',
          birthday: '1990-01-01',
          hometown: 'Tokyo',
        }),
      });
      
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
