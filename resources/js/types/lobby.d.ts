interface Game {
    id: number;
    name: string;
    slug: string;
    description?: string;
    min_players?: number;
    max_players?: number;
    created_at: string;
    updated_at: string;
}

interface LobbyPlayer {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
    pivot?: {
        ready?: boolean;
        joined_at?: string;
    };
}

interface Lobby {
    owner_id: number | undefined;
    id: number;
    lobby_code: string;
    started: boolean;
    players: LobbyPlayer[];
    game?: {
        id: number;
        slug: string;
        name: string;
    };
    host?: {
        id: number;
        name: string;
    };
}

interface Message {
    id: string | number;
    message: string;
    user_id: number;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    created_at: string;
}
