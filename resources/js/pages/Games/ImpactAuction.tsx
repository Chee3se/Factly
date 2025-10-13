import React, { useState, useEffect, useCallback, useRef } from "react";
import App from "@/layouts/App";
import { useLobby } from "@/hooks/useLobby";
import { toast } from "sonner";
import {
  AuctionGameState,
  PlayerAuctionState,
  AuctionItem,
  ItemWinner,
  PlayerBid,
} from "@/types/impactauction";
import { LoadingScreen } from "@/components/Games/ImpactAuction/LoadingScreen";
import { BiddingScreen } from "@/components/Games/ImpactAuction/BiddingScreen";
import { RevealScreen } from "@/components/Games/ImpactAuction/RevealScreen";
import { ResultsScreen } from "@/components/Games/ImpactAuction/ResultsScreen";

interface Props {
  auth: Auth;
  game: Game;
  items: any[];
}

const STARTING_BUDGET = 1000;
const BIDDING_TIME = 45; // seconds per item
const GAME_START_DELAY = 3000;
const REVEAL_TIME = 5000; // Time to show who won each item

const transformDatabaseItems = (items: any[]): AuctionItem[] => {
  return items.map((item, index) => ({
    id: item.id || index + 1,
    name: item.name,
    description: item.description,
    category: item.category,
    image: item.image,
    positive_impact: item.positive_impact,
    negative_impact: item.negative_impact,
    net_impact: item.net_impact,
    impact_description: item.impact_description,
    impact_details: item.impact_details,
  }));
};

export default function ImpactAuction({ auth, game, items }: Props) {
  const lobbyHook = useLobby(auth.user?.id);
  const {
    currentLobby,
    onlineUsers,
    messages,
    loading,
    leaveLobby,
    sendMessage,
    toggleReady,
    startGame,
    onWhisper,
    sendWhisper,
    offWhisper,
    currentChannel,
  } = lobbyHook;

  const [databaseItems] = useState<AuctionItem[]>(() =>
    transformDatabaseItems(items),
  );

  const [gameState, setGameState] = useState<AuctionGameState>({
    currentItemIndex: 0,
    timeLeft: BIDDING_TIME,
    phase: "waiting",
    playerStates: {},
    items: databaseItems,
    currentItem: null,
    itemWinners: [],
    currentBids: [],
    isGameOwner: false,
    biddingStartTime: Date.now(),
  });

  const whisperListenersRef = useRef<Set<string>>(new Set());
  const gameInitializedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);
  const authUserIdRef = useRef(auth.user?.id);
  const currentLobbyRef = useRef(currentLobby);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    authUserIdRef.current = auth.user?.id;
  }, [auth.user?.id]);

  useEffect(() => {
    currentLobbyRef.current = currentLobby;
  }, [currentLobby]);

  const cleanupWhisperListeners = useCallback(() => {
    whisperListenersRef.current.forEach((event) => {
      offWhisper(event);
    });
    whisperListenersRef.current.clear();
  }, [offWhisper]);

  const determineItemWinner = useCallback(
    (bids: PlayerBid[], itemId: number): ItemWinner => {
      if (bids.length === 0) {
        return {
          itemId,
          winnerId: 0,
          winnerName: "Nobody",
          winningBid: 0,
          allBids: [],
        };
      }

      const sortedBids = [...bids].sort((a, b) => b.bidAmount - a.bidAmount);
      const highestBid = sortedBids[0];

      return {
        itemId,
        winnerId: highestBid.userId,
        winnerName: highestBid.userName,
        winningBid: highestBid.bidAmount,
        allBids: sortedBids,
      };
    },
    [],
  );

  const endBidding = useCallback(() => {
    const currentState = gameStateRef.current;

    if (!currentState.currentItem || !currentState.isGameOwner) return;

    const winner = determineItemWinner(
      currentState.currentBids,
      currentState.currentItem.id,
    );

    // Update player budgets
    const updatedStates = { ...currentState.playerStates };
    if (winner.winnerId && winner.winningBid > 0) {
      if (updatedStates[winner.winnerId]) {
        updatedStates[winner.winnerId] = {
          ...updatedStates[winner.winnerId],
          budget: updatedStates[winner.winnerId].budget - winner.winningBid,
          itemsWon: [...updatedStates[winner.winnerId].itemsWon, winner],
        };
      }
    }

    setGameState((prev) => ({
      ...prev,
      phase: "reveal",
      playerStates: updatedStates,
      itemWinners: [...prev.itemWinners, winner],
    }));

    // Broadcast the winner
    sendWhisper("client-item-won", {
      winner,
      playerStates: updatedStates,
      initiatorId: authUserIdRef.current,
    });

    // Move to next item or results after reveal time
    setTimeout(() => {
      if (currentState.currentItemIndex < currentState.items.length - 1) {
        moveToNextItem();
      } else {
        endGame();
      }
    }, REVEAL_TIME);
  }, [sendWhisper, determineItemWinner]);

  const moveToNextItem = useCallback(() => {
    setGameState((prev) => {
      const nextIndex = prev.currentItemIndex + 1;
      const nextItem = prev.items[nextIndex];

      if (!nextItem) return prev;

      const resetPlayerStates = { ...prev.playerStates };
      Object.keys(resetPlayerStates).forEach((userId) => {
        resetPlayerStates[parseInt(userId)] = {
          ...resetPlayerStates[parseInt(userId)],
          hasPlacedBid: false,
          currentBid: null,
        };
      });

      if (prev.isGameOwner) {
        sendWhisper("client-next-item", {
          itemIndex: nextIndex,
          item: nextItem,
          playerStates: resetPlayerStates,
          initiatorId: authUserIdRef.current,
        });
      }

      return {
        ...prev,
        currentItemIndex: nextIndex,
        currentItem: nextItem,
        phase: "bidding",
        timeLeft: BIDDING_TIME,
        currentBids: [],
        playerStates: resetPlayerStates,
        biddingStartTime: Date.now(),
      };
    });
  }, [sendWhisper]);

  const endGame = useCallback(() => {
    setGameState((prev) => {
      if (prev.isGameOwner) {
        sendWhisper("client-game-ended", {
          initiatorId: authUserIdRef.current,
        });
      }

      return { ...prev, phase: "results" };
    });

    toast.success(
      "Auction complete! See how your portfolio impacted the world!",
    );
  }, [sendWhisper]);

  const setupWhisperListeners = useCallback(() => {
    if (!currentChannel || !currentChannel.isReady) return;

    const events = [
      "client-game-start",
      "client-place-bid",
      "client-bidding-ended",
      "client-item-won",
      "client-next-item",
      "client-game-ended",
      "client-timer-sync",
      "client-request-sync",
      "client-sync-response",
    ];

    events.forEach((event) => {
      if (!whisperListenersRef.current.has(event)) {
        whisperListenersRef.current.add(event);

        switch (event) {
          case "client-game-start":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;

              if (!e.items || !Array.isArray(e.items) || e.items.length === 0) {
                console.error("Invalid game start data received");
                return;
              }

              const firstItem = e.items[0];

              setGameState((prev) => ({
                ...prev,
                items: e.items,
                phase: "bidding",
                currentItem: firstItem,
                currentItemIndex: 0,
                biddingStartTime: Date.now(),
                timeLeft: BIDDING_TIME,
              }));

              toast.success("Auction started! Place your bids wisely!");
            });
            break;

          case "client-place-bid":
            onWhisper(event, (e: any) => {
              if (e.userId === authUserIdRef.current) return;

              setGameState((prev) => ({
                ...prev,
                currentBids: [
                  ...prev.currentBids.filter((b) => b.userId !== e.userId),
                  {
                    userId: e.userId,
                    userName: e.userName,
                    bidAmount: e.bidAmount,
                    timestamp: e.timestamp,
                  },
                ],
                playerStates: {
                  ...prev.playerStates,
                  [e.userId]: {
                    ...prev.playerStates[e.userId],
                    hasPlacedBid: true,
                    currentBid: e.bidAmount,
                  },
                },
              }));
            });
            break;

          case "client-timer-sync":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;

              setGameState((prev) => {
                if (!prev.isGameOwner && prev.phase === "bidding") {
                  return { ...prev, timeLeft: Math.max(0, e.timeLeft) };
                }
                return prev;
              });
            });
            break;

          case "client-item-won":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;

              if (!e.winner || !e.playerStates) {
                console.error("Invalid item won data received");
                return;
              }

              setGameState((prev) => ({
                ...prev,
                phase: "reveal",
                itemWinners: [...prev.itemWinners, e.winner],
                playerStates: e.playerStates,
              }));
            });
            break;

          case "client-next-item":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;

              if (!e.item || typeof e.itemIndex !== "number") {
                console.error("Invalid next item data received");
                return;
              }

              setGameState((prev) => ({
                ...prev,
                currentItemIndex: e.itemIndex,
                currentItem: e.item,
                phase: "bidding",
                timeLeft: BIDDING_TIME,
                currentBids: [],
                playerStates: e.playerStates || prev.playerStates,
                biddingStartTime: Date.now(),
              }));

              toast.info(`Item ${e.itemIndex + 1}: ${e.item.name}`);
            });
            break;

          case "client-game-ended":
            onWhisper(event, (e: any) => {
              setGameState((prev) => ({ ...prev, phase: "results" }));
              toast.success(
                "Auction complete! See how your portfolio impacted the world!",
              );
            });
            break;

          case "client-bidding-ended":
            onWhisper(event, (e: any) => {
              if (e.initiatorId === authUserIdRef.current) return;
              // Bidding ended will be handled by item-won event
            });
            break;

          case "client-request-sync":
            onWhisper(event, (e: any) => {
              if (e.requesterId === authUserIdRef.current) return;

              const currentState = gameStateRef.current;
              if (
                currentState.isGameOwner &&
                currentState.phase !== "waiting"
              ) {
                sendWhisper("client-sync-response", {
                  items: currentState.items,
                  currentItemIndex: currentState.currentItemIndex,
                  currentItem: currentState.currentItem,
                  phase: currentState.phase,
                  timeLeft: currentState.timeLeft,
                  playerStates: currentState.playerStates,
                  itemWinners: currentState.itemWinners,
                  currentBids: currentState.currentBids,
                  requesterId: e.requesterId,
                  initiatorId: authUserIdRef.current,
                });
              }
            });
            break;

          case "client-sync-response":
            onWhisper(event, (e: any) => {
              if (e.requesterId !== authUserIdRef.current) return;

              if (!e.items || !e.currentItem) {
                console.error("Invalid sync response received");
                return;
              }

              setGameState((prev) => ({
                ...prev,
                items: e.items,
                currentItemIndex: e.currentItemIndex,
                currentItem: e.currentItem,
                phase: e.phase,
                timeLeft: Math.max(0, e.timeLeft),
                playerStates: e.playerStates || prev.playerStates,
                itemWinners: e.itemWinners || prev.itemWinners,
                currentBids: e.currentBids || prev.currentBids,
              }));

              if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = null;
              }
            });
            break;
        }
      }
    });
  }, [currentChannel, onWhisper, sendWhisper]);

  const startAuctionGame = useCallback(() => {
    if (gameInitializedRef.current || databaseItems.length === 0) return;
    gameInitializedRef.current = true;

    const shuffledItems = [...databaseItems].sort(() => Math.random() - 0.5);
    const gameItems = shuffledItems.slice(0, Math.min(8, shuffledItems.length));
    const firstItem = gameItems[0];

    setGameState((prev) => ({
      ...prev,
      items: gameItems,
      phase: "bidding",
      currentItem: firstItem,
      currentItemIndex: 0,
      biddingStartTime: Date.now(),
      timeLeft: BIDDING_TIME,
    }));

    setTimeout(() => {
      sendWhisper("client-game-start", {
        items: gameItems,
        initiatorId: authUserIdRef.current,
        timestamp: Date.now(),
      });
    }, 200);

    toast.success(
      "Auction started! You have " +
        STARTING_BUDGET +
        " impact points to spend!",
    );
  }, [sendWhisper, databaseItems]);

  const placeBid = useCallback(
    (bidAmount: number) => {
      setGameState((prev) => {
        if (prev.phase !== "bidding" || prev.hasPlacedBid) return prev;

        const userId = authUserIdRef.current;
        const user = auth.user;

        if (!userId || !user) return prev;

        const playerState = prev.playerStates[userId];
        if (!playerState || bidAmount > playerState.budget) {
          toast.error("Insufficient budget!");
          return prev;
        }

        const bid: PlayerBid = {
          userId,
          userName: user.name,
          bidAmount,
          timestamp: Date.now(),
        };

        sendWhisper("client-place-bid", bid);

        return {
          ...prev,
          currentBids: [
            ...prev.currentBids.filter((b) => b.userId !== userId),
            bid,
          ],
          playerStates: {
            ...prev.playerStates,
            [userId]: {
              ...playerState,
              hasPlacedBid: true,
              currentBid: bidAmount,
            },
          },
        };
      });

      toast.success("Bid placed!");
    },
    [sendWhisper, auth.user],
  );

  const handleLeaveLobby = useCallback(async () => {
    cleanupWhisperListeners();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    await leaveLobby();
    window.location.href = "/lobbies";
  }, [cleanupWhisperListeners, leaveLobby]);

  // Initialize player states when lobby changes
  useEffect(() => {
    if (currentLobby?.players && auth.user?.id) {
      const initialStates: { [userId: number]: PlayerAuctionState } = {};
      currentLobby.players.forEach((player) => {
        initialStates[player.id] = {
          userId: player.id,
          budget: STARTING_BUDGET,
          itemsWon: [],
          totalImpact: 0,
          isReady: player.pivot?.ready || false,
          hasPlacedBid: false,
          currentBid: null,
        };
      });

      const isOwner =
        currentLobby.owner_id === auth.user.id ||
        currentLobby.host?.id === auth.user.id;

      setGameState((prev) => ({
        ...prev,
        playerStates: initialStates,
        isGameOwner: isOwner,
        phase: prev.phase === "waiting" ? "waiting" : prev.phase,
      }));

      gameInitializedRef.current = false;
    }
  }, [
    currentLobby?.players,
    currentLobby?.owner_id,
    currentLobby?.host?.id,
    auth.user?.id,
  ]);

  // Setup whisper listeners
  useEffect(() => {
    if (currentChannel && currentChannel.isReady) {
      setupWhisperListeners();
    }

    return () => {
      cleanupWhisperListeners();
    };
  }, [currentChannel?.isReady, setupWhisperListeners]);

  // Auto-start game for owner
  useEffect(() => {
    if (
      currentLobby &&
      gameState.phase === "waiting" &&
      currentChannel?.isReady &&
      gameState.isGameOwner &&
      !gameInitializedRef.current &&
      databaseItems.length > 0
    ) {
      timerRef.current = setTimeout(() => {
        startAuctionGame();
      }, GAME_START_DELAY);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [
    currentLobby,
    gameState.phase,
    currentChannel?.isReady,
    gameState.isGameOwner,
    startAuctionGame,
    databaseItems.length,
  ]);

  // Request sync for non-owners
  useEffect(() => {
    if (
      !gameState.isGameOwner &&
      gameState.phase === "waiting" &&
      currentChannel?.isReady &&
      !syncTimeoutRef.current
    ) {
      syncTimeoutRef.current = setTimeout(() => {
        sendWhisper("client-request-sync", {
          requesterId: authUserIdRef.current,
        });
      }, GAME_START_DELAY + 1000);

      return () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = null;
        }
      };
    }
  }, [
    gameState.phase,
    gameState.isGameOwner,
    currentChannel?.isReady,
    sendWhisper,
  ]);

  // Timer management for game owner
  useEffect(() => {
    if (
      gameState.phase === "bidding" &&
      gameState.timeLeft > 0 &&
      gameState.isGameOwner
    ) {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          const newTimeLeft = prev.timeLeft - 1;

          // Sync every 5 seconds or in last 5 seconds
          if (newTimeLeft % 5 === 0 || newTimeLeft <= 5) {
            sendWhisper("client-timer-sync", {
              timeLeft: newTimeLeft,
              initiatorId: authUserIdRef.current,
            });
          }

          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);

      return () => clearTimeout(timer);
    } else if (
      gameState.timeLeft === 0 &&
      gameState.phase === "bidding" &&
      gameState.isGameOwner
    ) {
      endBidding();
    }
  }, [
    gameState.timeLeft,
    gameState.phase,
    gameState.isGameOwner,
    sendWhisper,
    endBidding,
  ]);

  // Timer for non-owners (passive countdown)
  useEffect(() => {
    if (
      gameState.phase === "bidding" &&
      !gameState.isGameOwner &&
      gameState.timeLeft > 0
    ) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
        }));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState.timeLeft, gameState.phase, gameState.isGameOwner]);

  if (databaseItems.length === 0) {
    return (
      <LoadingScreen auth={auth}>
        <div className="text-center text-red-500">
          <p>No auction items available. Please contact an administrator.</p>
        </div>
      </LoadingScreen>
    );
  }

  if (loading || !currentLobby) {
    return <LoadingScreen auth={auth} />;
  }

  if (gameState.phase === "waiting") {
    return <LoadingScreen auth={auth} />;
  }

  let content;

  if (gameState.phase === "results") {
    content = (
      <ResultsScreen
        gameState={gameState}
        onLeaveLobby={handleLeaveLobby}
        currentLobby={currentLobby}
        players={currentLobby?.players || []}
        lobbyHook={lobbyHook}
        auth={auth}
      />
    );
  } else if (gameState.phase === "reveal" && gameState.itemWinners.length > 0) {
    const lastWinner = gameState.itemWinners[gameState.itemWinners.length - 1];
    const item = gameState.items.find((i) => i.id === lastWinner.itemId);
    content = item ? (
      <RevealScreen
        item={item}
        winner={lastWinner}
        gameState={gameState}
        isGameOwner={gameState.isGameOwner}
        players={currentLobby?.players || []}
        currentLobby={currentLobby}
        lobbyHook={lobbyHook}
      />
    ) : (
      <LoadingScreen auth={auth} />
    );
  } else if (
    gameState.phase === "bidding" &&
    gameState.currentItem &&
    auth.user?.id
  ) {
    const playerState = gameState.playerStates[auth.user.id];
    const playersWhoPlacedBids = Object.values(gameState.playerStates)
      .filter((p) => p.hasPlacedBid)
      .map((p) => p.userId);
    content = playerState ? (
      <BiddingScreen
        currentItem={gameState.currentItem}
        playerState={playerState}
        gameState={gameState}
        onPlaceBid={placeBid}
        timeLeft={gameState.timeLeft}
        playersWhoPlacedBids={playersWhoPlacedBids}
        onlineUsers={onlineUsers}
      />
    ) : (
      <LoadingScreen auth={auth} />
    );
  } else {
    content = <LoadingScreen auth={auth} />;
  }

  return (
    <App title="Impact Auction" auth={auth}>
      {content}
    </App>
  );
}
