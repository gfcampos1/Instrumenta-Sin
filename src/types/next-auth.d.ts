import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    points: number;
    level: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatarUrl?: string | null;
      points: number;
      level: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    points: number;
    level: number;
  }
}
