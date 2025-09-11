import { toast } from "sonner";

class LobbyManager {
    constructor() {
        this.currentLobby = null;
        this.channel = null;
        this.setupEventListeners();
    }

    joinLobbyChannel(lobbyId) {
        if (this.channel) {
            this.channel.unsubscribe();
        }

        this.channel = window.Echo.join(`lobby.${lobbyId}`)
            .here((users) => {
                console.log('Users currently in lobby:', users);
                this.updateOnlineUsers(users);
                toast.info(`${users.length} players currently in lobby`);
            })
            .joining((user) => {
                console.log('User joining:', user);
                toast.success(`${user.name} joined the lobby`, {
                    icon: '👋',
                    duration: 4000,
                });
                this.playJoinSound(); // Optional sound effect
            })
            .leaving((user) => {
                console.log('User leaving:', user);
                toast.warning(`${user.name} left the lobby`, {
                    icon: '👋',
                    duration: 4000,
                });
                this.playLeaveSound(); // Optional sound effect
            })
            .listen('PlayerJoinedLobby', (e) => {
                console.log('Player joined:', e);
                this.updateLobbyData(e.lobby);
                toast.success(e.message, {
                    icon: '🎮',
                    description: 'Lobby updated',
                });
            })
            .listen('PlayerLeftLobby', (e) => {
                console.log('Player left:', e);
                this.updateLobbyData(e.lobby);
                toast.warning(e.message, {
                    icon: '📤',
                    description: 'Lobby updated',
                });
            })
            .listen('PlayerReadyStatusChanged', (e) => {
                console.log('Ready status changed:', e);
                this.updateLobbyData(e.lobby);
                toast.info(e.message, {
                    icon: '✅',
                    description: 'Player status updated',
                });
            })
            .listen('LobbyStarted', (e) => {
                console.log('Lobby started:', e);
                toast.success('Game is starting! Get ready...', {
                    icon: '🚀',
                    duration: 3000,
                    description: 'Redirecting to game...',
                });
                setTimeout(() => {
                    this.redirectToGame(e.lobby);
                }, 3000);
            })
            .listen('LobbyDeleted', (e) => {
                console.log('Lobby deleted:', e);
                toast.error('Lobby has been deleted by the host', {
                    icon: '💥',
                    duration: 6000,
                    description: 'You will be returned to the main menu',
                    action: {
                        label: 'OK',
                        onClick: () => this.handleLobbyDeleted(),
                    },
                });
                this.handleLobbyDeleted();
            })
            .listen('LobbySettingsChanged', (e) => {
                console.log('Lobby settings changed:', e);
                toast.info('Lobby settings updated', {
                    icon: '⚙️',
                    description: e.message || 'Host modified lobby settings',
                });
                this.updateLobbyData(e.lobby);
            })
            .error((error) => {
                console.error('Channel error:', error);
                toast.error('Connection to lobby lost', {
                    icon: '📡',
                    description: 'Trying to reconnect...',
                    duration: 5000,
                    action: {
                        label: 'Retry',
                        onClick: () => this.rejoinLobbyChannel(lobbyId),
                    },
                });
                this.handleConnectionError(error);
            });
    }

    leaveLobbyChannel() {
        if (this.channel) {
            this.channel.unsubscribe();
            this.channel = null;
        }
    }

    async createLobby(gameId, password = null) {
        const loadingToast = toast.loading('Creating lobby...', {
            icon: '⏳',
            description: 'Setting up your game room',
        });

        try {
            const response = await window.axios.post('/api/lobbies', {
                game_id: gameId,
                password: password
            });

            this.currentLobby = response.data;
            this.joinLobbyChannel(this.currentLobby.id);
            this.renderLobby();

            toast.dismiss(loadingToast);
            toast.success('Lobby created successfully!', {
                icon: '🎉',
                description: `Share code: ${this.currentLobby.code}`,
                duration: 8000,
                action: {
                    label: 'Copy Code',
                    onClick: () => {
                        navigator.clipboard.writeText(this.currentLobby.code);
                        toast.success('Code copied to clipboard!', { duration: 2000 });
                    },
                },
            });

            return this.currentLobby;
        } catch (error) {
            console.error('Error creating lobby:', error);
            toast.dismiss(loadingToast);

            const errorMessage = error.response?.data?.message || 'Failed to create lobby';
            toast.error('Failed to create lobby', {
                icon: '❌',
                description: errorMessage,
                duration: 6000,
            });
            throw error;
        }
    }

    async joinLobby(lobbyCode, password = null) {
        if (!lobbyCode) {
            toast.warning('Please enter a lobby code', {
                icon: '⚠️',
                description: 'Lobby code is required to join',
            });
            return;
        }

        const loadingToast = toast.loading('Joining lobby...', {
            icon: '🔄',
            description: `Connecting to ${lobbyCode}`,
        });

        try {
            const response = await window.axios.post('/api/lobbies/join', {
                lobby_code: lobbyCode,
                password: password
            });

            this.currentLobby = response.data;
            this.joinLobbyChannel(this.currentLobby.id);
            this.renderLobby();

            toast.dismiss(loadingToast);
            toast.success('Successfully joined lobby!', {
                icon: '🎮',
                description: `Welcome to ${lobbyCode}`,
                duration: 5000,
            });

            return this.currentLobby;
        } catch (error) {
            console.error('Error joining lobby:', error);
            toast.dismiss(loadingToast);

            const status = error.response?.status;
            const errorMessage = error.response?.data?.message || 'Failed to join lobby';

            if (status === 404) {
                toast.error('Lobby not found', {
                    icon: '🔍',
                    description: 'Please check the code and try again',
                    action: {
                        label: 'Try Again',
                        onClick: () => document.getElementById('lobby-code-input')?.focus(),
                    },
                });
            } else if (status === 403) {
                toast.error('Cannot join lobby', {
                    icon: '🚫',
                    description: 'Lobby is full or password is incorrect',
                });
            } else if (status === 422) {
                toast.error('Invalid lobby code', {
                    icon: '❌',
                    description: 'Please enter a valid lobby code',
                });
            } else {
                toast.error('Failed to join lobby', {
                    icon: '❌',
                    description: errorMessage,
                });
            }
            throw error;
        }
    }

    async leaveLobby() {
        if (!this.currentLobby) return;

        try {
            const lobbyCode = this.currentLobby.code;
            await window.axios.post(`/api/lobbies/${this.currentLobby.id}/leave`);

            this.leaveLobbyChannel();
            this.currentLobby = null;
            this.clearLobbyUI();

            toast.info('Left lobby', {
                icon: '👋',
                description: `Disconnected from ${lobbyCode}`,
            });
        } catch (error) {
            console.error('Error leaving lobby:', error);
            toast.error('Error leaving lobby', {
                icon: '❌',
                description: 'Please try again',
            });
        }
    }

    async toggleReady() {
        if (!this.currentLobby) return;

        try {
            const response = await window.axios.post(`/api/lobbies/${this.currentLobby.id}/ready`);
            console.log('Ready status toggled:', response.data);

            // Show immediate feedback while waiting for broadcast
            const isReady = response.data.ready;
            toast.success(isReady ? 'You are now ready!' : 'Ready status removed', {
                icon: isReady ? '✅' : '⏸️',
                duration: 3000,
            });

        } catch (error) {
            console.error('Error toggling ready:', error);
            toast.error('Failed to update ready status', {
                icon: '❌',
                description: 'Please try again',
            });
        }
    }

    async startGame() {
        if (!this.currentLobby) return;

        const loadingToast = toast.loading('Starting game...', {
            icon: '🚀',
            description: 'Initializing game session',
        });

        try {
            const response = await window.axios.post(`/api/lobbies/${this.currentLobby.id}/start`);
            console.log('Game starting:', response.data);

            toast.dismiss(loadingToast);
            // Success will be handled by the LobbyStarted event

        } catch (error) {
            console.error('Error starting game:', error);
            toast.dismiss(loadingToast);

            const errorMessage = error.response?.data?.message || 'Error starting game';

            if (errorMessage.includes('ready')) {
                toast.warning('Cannot start game', {
                    icon: '⏳',
                    description: 'All players must be ready first',
                    action: {
                        label: 'Check Players',
                        onClick: () => this.highlightPlayerList(),
                    },
                });
            } else if (errorMessage.includes('minimum') || errorMessage.includes('players')) {
                toast.warning('Not enough players', {
                    icon: '👥',
                    description: 'Need more players to start the game',
                });
            } else if (errorMessage.includes('permission')) {
                toast.error('Permission denied', {
                    icon: '🔒',
                    description: 'Only the host can start the game',
                });
            } else {
                toast.error('Failed to start game', {
                    icon: '❌',
                    description: errorMessage,
                });
            }
        }
    }

    async kickPlayer(playerId) {
        if (!this.currentLobby) return;

        try {
            await window.axios.post(`/api/lobbies/${this.currentLobby.id}/kick`, {
                player_id: playerId
            });

            toast.success('Player kicked', {
                icon: '🚫',
                duration: 3000,
            });

        } catch (error) {
            console.error('Error kicking player:', error);
            toast.error('Failed to kick player', {
                icon: '❌',
                description: 'Only the host can kick players',
            });
        }
    }

    updateLobbyData(lobby) {
        this.currentLobby = lobby;
        this.renderLobby();
    }

    renderLobby() {
        // Update your UI here based on this.currentLobby data
        console.log('Rendering lobby:', this.currentLobby);
        // Implementation depends on your frontend framework/vanilla JS approach
    }

    updateOnlineUsers(users) {
        // Update online users indicator
        console.log('Online users:', users);
    }

    showNotification(message) {
        // Legacy method - now uses toast
        toast.info(message);
    }

    redirectToGame(lobby) {
        toast.success('Loading game...', {
            icon: '🎮',
            description: 'Taking you to the game',
            duration: 2000,
        });

        setTimeout(() => {
            window.location.href = `/game/${lobby.id}`;
        }, 2000);
    }

    clearLobbyUI() {
        console.log('Clearing lobby UI');
        // Clear lobby UI implementation
    }

    // Helper methods
    handleLobbyDeleted() {
        this.leaveLobbyChannel();
        this.currentLobby = null;
        this.clearLobbyUI();

        // Navigate back to main menu or lobby list
        setTimeout(() => {
            window.location.href = '/lobbies';
        }, 3000);
    }

    handleConnectionError(error) {
        // Attempt to reconnect after a delay
        setTimeout(() => {
            if (this.currentLobby) {
                this.rejoinLobbyChannel(this.currentLobby.id);
            }
        }, 3000);
    }

    rejoinLobbyChannel(lobbyId) {
        toast.loading('Reconnecting...', {
            icon: '🔄',
            duration: 2000,
        });

        setTimeout(() => {
            this.joinLobbyChannel(lobbyId);
        }, 1000);
    }

    highlightPlayerList() {
        // Scroll to or highlight the player list in UI
        const playerList = document.getElementById('players-list');
        if (playerList) {
            playerList.scrollIntoView({ behavior: 'smooth' });
            playerList.classList.add('highlight');
            setTimeout(() => playerList.classList.remove('highlight'), 2000);
        }
    }

    playSound(src) {
        try {
            const audio = new Audio(src);
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Could not play sound:', e));
        } catch (e) {
            // Sounds are optional, fail silently
        }
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Create lobby button
            document.getElementById('create-lobby-btn')?.addEventListener('click', () => {
                this.createLobby(1); // Replace with actual game ID
            });

            // Join lobby button
            document.getElementById('join-lobby-btn')?.addEventListener('click', () => {
                const code = document.getElementById('lobby-code-input')?.value?.trim();
                if (code) {
                    this.joinLobby(code);
                }
            });

            // Leave lobby button
            document.getElementById('leave-lobby-btn')?.addEventListener('click', () => {
                // Show confirmation toast
                toast('Leave lobby?', {
                    icon: '❓',
                    description: 'Are you sure you want to leave?',
                    action: {
                        label: 'Leave',
                        onClick: () => this.leaveLobby(),
                    },
                    cancel: {
                        label: 'Cancel',
                        onClick: () => {},
                    },
                });
            });

            // Ready toggle button
            document.getElementById('ready-btn')?.addEventListener('click', () => {
                this.toggleReady();
            });

            // Start game button
            document.getElementById('start-game-btn')?.addEventListener('click', () => {
                this.startGame();
            });

            // Enter key on lobby code input
            document.getElementById('lobby-code-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const code = e.target.value?.trim();
                    if (code) {
                        this.joinLobby(code);
                    }
                }
            });
        });
    }
}

export default LobbyManager;
