// Game State Management for Culture RPG v1
class GameState {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.difficulty = 'medium';
        this.drops = [];
        this.collectedDrops = [];
        this.startTime = null;
        this.endTime = null;
        this.score = 0;
        this.gameComplete = false;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Initialize game with drops data
    init(drops, difficulty = 'medium') {
        this.drops = drops;
        this.difficulty = difficulty;
        this.collectedDrops = [];
        this.startTime = Date.now();
        this.endTime = null;
        this.score = 0;
        this.gameComplete = false;
        this.save();
    }

    // Collect a drop
    collectDrop(dropId) {
        if (this.collectedDrops.includes(dropId)) return false;

        const drop = this.drops.find(d => d.id === dropId);
        if (!drop) return false;

        this.collectedDrops.push(dropId);
        this.score += drop.points || 20;

        // Check if game is complete
        if (this.collectedDrops.length >= this.drops.length) {
            this.endTime = Date.now();
            this.gameComplete = true;
            this.saveToLeaderboard();
        }

        this.save();
        return true;
    }

    // Get progress percentage
    getProgress() {
        return Math.round((this.collectedDrops.length / this.drops.length) * 100);
    }

    // Get elapsed time in seconds
    getElapsedTime() {
        if (!this.startTime) return 0;
        const end = this.endTime || Date.now();
        return Math.floor((end - this.startTime) / 1000);
    }

    // Get formatted time string
    getFormattedTime() {
        const seconds = this.getElapsedTime();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Save current state to localStorage
    save() {
        const state = {
            sessionId: this.sessionId,
            difficulty: this.difficulty,
            drops: this.drops,
            collectedDrops: this.collectedDrops,
            startTime: this.startTime,
            endTime: this.endTime,
            score: this.score,
            gameComplete: this.gameComplete
        };

        localStorage.setItem('cultureRPG_state', JSON.stringify(state));
    }

    // Load state from localStorage
    load() {
        try {
            const saved = localStorage.getItem('cultureRPG_state');
            if (!saved) return false;

            const state = JSON.parse(saved);

            // Only load if session is recent (within 1 hour)
            const sessionAge = Date.now() - parseInt(state.sessionId.split('_')[1]);
            if (sessionAge > 3600000) {
                localStorage.removeItem('cultureRPG_state');
                return false;
            }

            this.sessionId = state.sessionId;
            this.difficulty = state.difficulty;
            this.drops = state.drops;
            this.collectedDrops = state.collectedDrops;
            this.startTime = state.startTime;
            this.endTime = state.endTime;
            this.score = state.score;
            this.gameComplete = state.gameComplete;

            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return false;
        }
    }

    // Save to leaderboard
    saveToLeaderboard() {
        if (!this.gameComplete) return;

        try {
            const leaderboard = this.getLeaderboard();
            const entry = {
                sessionId: this.sessionId,
                difficulty: this.difficulty,
                score: this.score,
                time: this.getElapsedTime(),
                drops: this.drops.length,
                collected: this.collectedDrops.length,
                date: new Date().toISOString(),
                dropsData: this.drops.map(d => ({
                    title: d.title,
                    city: d.city,
                    country: d.country,
                    rarity: d.rarity,
                    points: d.points
                }))
            };

            leaderboard.push(entry);

            // Sort by score (descending), then by time (ascending)
            leaderboard.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.time - b.time;
            });

            // Keep only top 50 entries
            const topEntries = leaderboard.slice(0, 50);

            localStorage.setItem('cultureRPG_leaderboard', JSON.stringify(topEntries));
        } catch (error) {
            console.error('Failed to save to leaderboard:', error);
        }
    }

    // Get leaderboard
    getLeaderboard() {
        try {
            const saved = localStorage.getItem('cultureRPG_leaderboard');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            return [];
        }
    }

    // Get leaderboard by difficulty
    getLeaderboardByDifficulty(difficulty) {
        const leaderboard = this.getLeaderboard();
        return leaderboard.filter(entry => entry.difficulty === difficulty);
    }

    // Reset current game
    reset() {
        this.collectedDrops = [];
        this.startTime = Date.now();
        this.endTime = null;
        this.score = 0;
        this.gameComplete = false;
        this.save();
    }

    // Clear all saved data
    clearAll() {
        localStorage.removeItem('cultureRPG_state');
        localStorage.removeItem('cultureRPG_leaderboard');
    }

    // Get rarity color
    getRarityColor(rarity) {
        const colors = {
            'C': '#FFC107',  // Orange - Common
            'U': '#2196F3',  // Blue - Uncommon
            'R': '#00BCD4',  // Teal - Rare
            'SR': '#F44336'  // Red - Super Rare
        };
        return colors[rarity] || colors['C'];
    }

    // Get rarity name
    getRarityName(rarity) {
        const names = {
            'C': 'Common',
            'U': 'Uncommon',
            'R': 'Rare',
            'SR': 'Super Rare'
        };
        return names[rarity] || 'Unknown';
    }
}

// Global game state instance
window.gameState = new GameState();
