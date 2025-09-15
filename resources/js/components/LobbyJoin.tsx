import { useState } from "react";
import { useLobby } from "@/hooks/useLobby";
import { toast } from "sonner";

export default function LobbyJoin({
                                      games,
                                      lobbyHook
                                  }: {
    games: Game[];
    lobbyHook: ReturnType<typeof useLobby>;
}) {
    const { createLobby, joinLobby, findLobbyByCode, loading } = lobbyHook;

    // Create lobby state
    const [selectedGameId, setSelectedGameId] = useState<number>(games[0]?.id || 1);
    const [createPassword, setCreatePassword] = useState("");

    // Join lobby state
    const [joinCode, setJoinCode] = useState("");
    const [joinPassword, setJoinPassword] = useState("");
    const [showJoinPassword, setShowJoinPassword] = useState(false);
    const [foundLobby, setFoundLobby] = useState<any>(null);

    // UI state
    const [activeTab, setActiveTab] = useState<'create' | 'join'>('join');

    const handleCreateLobby = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createLobby(selectedGameId, createPassword || undefined);
            // Reset form
            setCreatePassword("");
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    const handleFindLobby = async () => {
        if (!joinCode.trim() || joinCode.length !== 8) {
            toast.error("Please enter a valid 8-character lobby code");
            return;
        }

        try {
            const lobby = await findLobbyByCode(joinCode.toUpperCase());
            setFoundLobby(lobby);
            setShowJoinPassword(!!lobby.password);
        } catch (error: any) {
            setFoundLobby(null);
            setShowJoinPassword(false);
            toast.error(error.message || "Lobby not found");
        }
    };

    const handleJoinLobby = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!foundLobby) {
            await handleFindLobby();
            return;
        }

        try {
            await joinLobby(joinCode.toUpperCase(), joinPassword || undefined);
            // Reset form
            setJoinCode("");
            setJoinPassword("");
            setFoundLobby(null);
            setShowJoinPassword(false);
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    const handleJoinCodeChange = (value: string) => {
        // Auto-uppercase and limit to 8 characters
        const cleanCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        setJoinCode(cleanCode);

        // Reset found lobby when code changes
        if (foundLobby && cleanCode !== foundLobby.lobby_code) {
            setFoundLobby(null);
            setShowJoinPassword(false);
            setJoinPassword("");
        }
    };

    return (
        <div className="lobby-join max-w-md mx-auto">
            {/* Tab switcher */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('join')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'join'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Join Lobby
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'create'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Create Lobby
                </button>
            </div>

            {activeTab === 'join' ? (
                <div className="join-tab">
                    <h2 className="text-xl font-bold mb-4">Join a Lobby</h2>

                    <form onSubmit={handleJoinLobby} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lobby Code
                            </label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => handleJoinCodeChange(e.target.value)}
                                placeholder="Enter 8-character code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
                                maxLength={8}
                                style={{ textTransform: 'uppercase' }}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {joinCode.length}/8 characters
                            </div>
                        </div>

                        {/* Show lobby info when found */}
                        {foundLobby && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-medium text-green-900">Lobby Found!</span>
                                </div>
                                <div className="text-sm text-green-800 space-y-1">
                                    <div>Game: <span className="font-medium">{foundLobby.game?.name}</span></div>
                                    <div>Host: <span className="font-medium">{foundLobby.host?.name}</span></div>
                                    <div>Players: <span className="font-medium">{foundLobby.players?.length || 0}</span></div>
                                </div>
                            </div>
                        )}

                        {/* Password field (shown when lobby requires password) */}
                        {showJoinPassword && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lobby Password
                                </label>
                                <input
                                    type="password"
                                    value={joinPassword}
                                    onChange={(e) => setJoinPassword(e.target.value)}
                                    placeholder="Enter lobby password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || joinCode.length !== 8}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {loading ? "Processing..." : foundLobby ? "Join Lobby" : "Find Lobby"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="create-tab">
                    <h2 className="text-xl font-bold mb-4">Create a Lobby</h2>

                    <form onSubmit={handleCreateLobby} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Game
                            </label>
                            <select
                                value={selectedGameId}
                                onChange={(e) => setSelectedGameId(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {games.map((game) => (
                                    <option key={game.id} value={game.id}>
                                        {game.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password (Optional)
                            </label>
                            <input
                                type="password"
                                value={createPassword}
                                onChange={(e) => setCreatePassword(e.target.value)}
                                placeholder="Leave empty for public lobby"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                minLength={4}
                                maxLength={20}
                            />
                            {createPassword && (
                                <div className="text-xs text-gray-500 mt-1">
                                    Password length: {createPassword.length}/20
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            {loading ? "Creating..." : "Create Lobby"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
