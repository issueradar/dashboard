// eslint-disable-next-line
import NextAuth from 'next-auth';
import type { Level } from '.prisma/client';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    /**
     * The user's email address
     */
    email?: string | null;

    /**
     * The user's unique id number
     */
    id: string;

    /**
     * The users preferred avatar.
     * Usually provided by the user's OAuth provider of choice
     */
    image?: string | null;

    /**
     * The user's full name
     */
    name?: string | null;

    /**
     * The user's custom & public username viewable to others
     */
    username?: string | null;

    /**
     * The user's level of using
     */
    levels?: Level[];
  }
}
