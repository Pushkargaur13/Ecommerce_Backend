import { atom } from 'jotai';

export type User = { id: string; email: string; name?: string; roles?: string[] } | null;

export const accessTokenAtom = atom<string | null>(null);
export const userAtom = atom<User>(null);

export const isAuthenticatedAtom = atom((get) => Boolean(get(accessTokenAtom)));
