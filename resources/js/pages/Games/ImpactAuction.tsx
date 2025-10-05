import App from "@/layouts/App";
import { useLobby } from "@/hooks/useLobby";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  auth: Auth;
}

export default function ImpactAuction({ auth }: Props) {
  const lobbyHook = useLobby(auth.user?.id);
  const { onWhisper, sendWhisper, offWhisper, currentChannel } = lobbyHook;

  const [receivedBananas, setReceivedBananas] = useState<string[]>([]);
  const whisperSetupRef = useRef(false);
  const authUserIdRef = useRef(auth.user?.id);
  const channelReadyRef = useRef(false);

  useEffect(() => {
    authUserIdRef.current = auth.user?.id;
  }, [auth.user?.id]);

  useEffect(() => {
    const isReady = currentChannel?.isReady || false;

    // Channel just became ready
    if (isReady && !channelReadyRef.current) {
      channelReadyRef.current = true;

      // Setup listener only if not already setup
      if (!whisperSetupRef.current) {
        whisperSetupRef.current = true;

        onWhisper("client-banana", (data: any) => {
          if (data.message) {
            setReceivedBananas((prev) => [...prev, data.message]);
          }
        });
      }
    }

    // Channel disconnected
    if (!isReady && channelReadyRef.current) {
      channelReadyRef.current = false;
      whisperSetupRef.current = false;
      offWhisper("client-banana");
    }
  }, [currentChannel?.isReady]);

  const sendBanana = () => {
    if (!currentChannel?.isReady) {
      console.warn("Channel not ready");
      return;
    }

    sendWhisper("client-banana", {
      message: "🍌",
      userId: auth.user?.id,
    });
  };

  return (
    <App title="ImpactAuction" auth={auth}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Banana Whisper System</h1>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Status: {currentChannel?.isReady ? "Connected" : "Connecting..."}
          </p>
          <Button onClick={sendBanana} disabled={!currentChannel?.isReady}>
            Send Banana 🍌
          </Button>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Received Bananas:</h2>
          <p className="text-4xl">
            {receivedBananas.length > 0
              ? receivedBananas.join(" ")
              : "No bananas yet..."}
          </p>
        </div>
      </div>
    </App>
  );
}
