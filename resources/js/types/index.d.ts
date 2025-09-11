import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    created_at: string;
    updated_at: string;
    email_verified_at?: string;
}

export interface Game {
    id: number;
    name: string;
    slug: string;
    description: string;
    thumbnail: string;
    min_players: number;
    max_players: number;
}

export interface HigherOrLowerItem {
    id: number;
    name: string;
    image_url: string;
    value: number;
    description: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
};

export interface AuthData {
    user: User;
}
