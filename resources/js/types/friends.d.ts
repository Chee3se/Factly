import {User} from "@/types/index";

interface FriendRequest {
    id: number;
    user_id: number;
    friend_id: number;
    accepted: boolean;
    user?: User;
    friendUser?: User;
    created_at: string;
    updated_at: string;
}

interface FriendsData {
    friends: User[];
    friend_requests: User[];
    sent_requests: User[];
}
