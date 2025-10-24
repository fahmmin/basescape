'use client';

import { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Star, RotateCcw } from 'lucide-react';

interface LeaderboardEntry {
    sessionId: string;
    difficulty: string;
    score: number;
    time: number;
    drops: number;
    collected: number;
    date: string;
    dropsData: Array<{
        title: string;
        city: string;
        country: string;
        rarity: string;
        points: number;
    }>;
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [showDetails, setShowDetails] = useState<string | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = () => {
        try {
            const saved = localStorage.getItem('cultureRPG_leaderboard');
            if (saved) {
                const data = JSON.parse(saved);
                setLeaderboard(data);
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    };

    const clearLeaderboard = () => {
        if (confirm('Are you sure you want to clear all leaderboard data?')) {
            localStorage.removeItem('cultureRPG_leaderboard');
            setLeaderboard([]);
        }
    };

    const getRarityColor = (rarity: string) => {
        const colors = {
            'C': 'text-yellow-500',  // Common
            'U': 'text-blue-500',    // Uncommon  
            'R': 'text-teal-500',    // Rare
            'SR': 'text-red-500'     // Super Rare
        };
        return colors[rarity as keyof typeof colors] || 'text-gray-500';
    };

    const getRarityName = (rarity: string) => {
        const names = {
            'C': 'Common',
            'U': 'Uncommon',
            'R': 'Rare',
            'SR': 'Super Rare'
        };
        return names[rarity as keyof typeof names] || 'Unknown';
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredLeaderboard = selectedDifficulty === 'all'
        ? leaderboard
        : leaderboard.filter(entry => entry.difficulty === selectedDifficulty);

    const difficulties = ['all', 'easy', 'medium', 'hard'];

    return (
        <div className="min-h-screen bg-[#0C0F1D] p-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-white font-mondwest text-4xl mb-2 flex items-center justify-center gap-3">
                        <Trophy className="text-[#97F0E5]" />
                        Leaderboard
                    </h1>
                    <p className="text-[#F7F7F7]/70">
                        Top scores from Culture RPG games
                    </p>
                </div>

                {/* Difficulty Filter */}
                <div className="flex justify-center gap-4 mb-8">
                    {difficulties.map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`px-6 py-3 rounded-md font-neuebit transition-all ${selectedDifficulty === diff
                                    ? 'bg-[#97F0E5] text-[#0C0F1D]'
                                    : 'bg-[#97F0E5]/20 text-[#F7F7F7] hover:bg-[#97F0E5]/40'
                                }`}
                        >
                            {diff === 'all' ? 'All' : diff.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Clear Button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={clearLeaderboard}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-md font-neuebit transition-all"
                    >
                        <RotateCcw size={16} />
                        Clear Leaderboard
                    </button>
                </div>

                {/* Leaderboard Table */}
                {filteredLeaderboard.length === 0 ? (
                    <div className="text-center py-12">
                        <Trophy className="mx-auto text-[#97F0E5]/50 mb-4" size={64} />
                        <h3 className="text-white font-mondwest text-xl mb-2">No Scores Yet</h3>
                        <p className="text-[#F7F7F7]/70">
                            Play some games to see your scores here!
                        </p>
                        <a
                            href="/play"
                            className="inline-block mt-4 px-6 py-3 bg-[#97F0E5] text-[#0C0F1D] rounded-md font-neuebit hover:bg-[#97F0E5]/80 transition-all"
                        >
                            Start Playing
                        </a>
                    </div>
                ) : (
                    <div className="bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#97F0E5]/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[#97F0E5] font-neuebit">Rank</th>
                                        <th className="px-6 py-4 text-left text-[#97F0E5] font-neuebit">Score</th>
                                        <th className="px-6 py-4 text-left text-[#97F0E5] font-neuebit">Time</th>
                                        <th className="px-6 py-4 text-left text-[#97F0E5] font-neuebit">Difficulty</th>
                                        <th className="px-6 py-4 text-left text-[#97F0E5] font-neuebit">Drops</th>
                                        <th className="px-6 py-4 text-left text-[#97F0E5] font-neuebit">Date</th>
                                        <th className="px-6 py-4 text-left text-[#97F0E5] font-neuebit">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeaderboard.map((entry, index) => (
                                        <tr key={entry.sessionId} className="border-t border-[#97F0E5]/20 hover:bg-[#97F0E5]/5">
                                            <td className="px-6 py-4 text-white font-neuebit">
                                                <div className="flex items-center gap-2">
                                                    {index < 3 && <Trophy className={`text-${index === 0 ? 'yellow' : index === 1 ? 'gray' : 'amber'}-500`} size={16} />}
                                                    #{index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white font-neuebit text-lg">{entry.score}</td>
                                            <td className="px-6 py-4 text-white">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} className="text-[#97F0E5]" />
                                                    {formatTime(entry.time)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-neuebit ${entry.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                                        entry.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {entry.difficulty.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white">
                                                <div className="flex items-center gap-1">
                                                    <Target size={14} className="text-[#97F0E5]" />
                                                    {entry.collected}/{entry.drops}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#F7F7F7]/70 text-sm">
                                                {formatDate(entry.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setShowDetails(showDetails === entry.sessionId ? null : entry.sessionId)}
                                                    className="px-3 py-1 bg-[#97F0E5]/20 hover:bg-[#97F0E5]/40 text-[#F7F7F7] rounded text-sm font-neuebit transition-all"
                                                >
                                                    {showDetails === entry.sessionId ? 'Hide' : 'Show'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Details Panel */}
                {showDetails && (
                    <div className="mt-8 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg p-6">
                        <h3 className="text-white font-mondwest text-xl mb-4 flex items-center gap-2">
                            <Star className="text-[#97F0E5]" />
                            Game Details
                        </h3>
                        {(() => {
                            const entry = leaderboard.find(e => e.sessionId === showDetails);
                            if (!entry) return null;

                            return (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-[#97F0E5] font-neuebit mb-2">Collected Drops</h4>
                                        <div className="space-y-2">
                                            {entry.dropsData.map((drop, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-[#97F0E5]/10 rounded">
                                                    <div>
                                                        <div className="text-white font-neuebit">{drop.title}</div>
                                                        <div className="text-[#F7F7F7]/70 text-sm">{drop.city}, {drop.country}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`font-neuebit ${getRarityColor(drop.rarity)}`}>
                                                            {getRarityName(drop.rarity)}
                                                        </div>
                                                        <div className="text-[#97F0E5] text-sm">+{drop.points} pts</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[#97F0E5] font-neuebit mb-2">Game Stats</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-[#F7F7F7]/70">Final Score:</span>
                                                <span className="text-white font-neuebit">{entry.score}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#F7F7F7]/70">Completion Time:</span>
                                                <span className="text-white">{formatTime(entry.time)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#F7F7F7]/70">Difficulty:</span>
                                                <span className="text-white">{entry.difficulty.toUpperCase()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#F7F7F7]/70">Drops Found:</span>
                                                <span className="text-white">{entry.collected}/{entry.drops}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#F7F7F7]/70">Date Played:</span>
                                                <span className="text-white text-sm">{formatDate(entry.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Back to Game */}
                <div className="text-center mt-8">
                    <a
                        href="/play"
                        className="inline-block px-6 py-3 bg-[#97F0E5] text-[#0C0F1D] rounded-md font-neuebit hover:bg-[#97F0E5]/80 transition-all"
                    >
                        Back to Game
                    </a>
                </div>
            </div>
        </div>
    );
}
