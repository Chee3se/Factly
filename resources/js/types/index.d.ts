import { Config } from "ziggy-js";
import { Type } from "@/types/enums";

export interface Decoration {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  type: Type;
  created_at: string;
  updated_at: string;
  email_verified_at?: string;
  friend_request_id?: number; // Add this
  decoration?: Decoration;
}

interface Suggestion {
  id: number;
  title: string;
  description: string;
  status: "pending" | "reviewing" | "approved" | "rejected" | "implemented";
  created_at: string;
  admin_notes?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
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
  flash: {
    success?: string;
    error?: string;
  };
  ziggy: Config & { location: string };
};

export interface AuthData {
  user: User;
}
