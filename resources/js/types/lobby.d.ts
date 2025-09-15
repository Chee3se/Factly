interface Message {
    id: number;
    message: string;
    user_id: number;
    user: { id: number; name: string; avatar?: string };
    created_at: string;
}

interface Game {
    id: number;
    name: string;
    slug: string;
}

interface Player {
    id: number;
    name: string;
    avatar?: string;
    pivot?: {
        ready: boolean;
        joined_at: string;
    };
}
