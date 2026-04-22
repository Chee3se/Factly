import { createContext, useContext } from "react";
import { useFriends } from "@/hooks/useFriends";

type FriendsHook = ReturnType<typeof useFriends>;

export const FriendsContext = createContext<FriendsHook | null>(null);

export function useFriendsContext(): FriendsHook | null {
  return useContext(FriendsContext);
}
