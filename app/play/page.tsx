'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trophy, Settings, Play, Info } from 'lucide-react';

function PlayPageContent() {
    const [difficulty, setDifficulty] = useState('medium');
    const [gameUrl, setGameUrl] = useState('/game/index.html');
    const [showInstructions, setShowInstructions] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get difficulty from URL params
        const urlDifficulty = searchParams.get('difficulty');
        if (urlDifficulty && ['easy', 'medium', 'hard'].includes(urlDifficulty)) {
            setDifficulty(urlDifficulty);
        }
    }, [searchParams]);

    useEffect(() => {
        // Update game URL when difficulty changes
        setGameUrl(`/game/index.html?difficulty=${difficulty}`);
    }, [difficulty]);

    const difficultyInfo = {
        easy: { drops: 6, description: 'Popular places only', color: 'text-green-400' },
        medium: { drops: 8, description: 'Mix of popular and hidden gems', color: 'text-yellow-400' },
        hard: { drops: 12, description: 'All places including rare finds', color: 'text-red-400' },
    };

    return (
        <div className="min-h-screen bg-[#0C0F1D] flex flex-col items-center justify-center p-4">
            <div className="max-w-7xl w-full">
                <div className="text-center mb-6">
                    <h1 className="text-white font-mondwest text-4xl mb-2 flex items-center justify-center gap-3">
                        <Play className="text-[#97F0E5]" />
                        Culture RPG
                    </h1>
                    <p className="text-[#F7F7F7]/70">
                        Explore and collect culture drops from around the world!
                    </p>
                </div>

                {/* Difficulty Selection */}
                <div className="flex justify-center gap-4 mb-6">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            className={`px-6 py-3 rounded-md font-neuebit transition-all ${difficulty === diff
                                ? 'bg-[#97F0E5] text-[#0C0F1D]'
                                : 'bg-[#97F0E5]/20 text-[#F7F7F7] hover:bg-[#97F0E5]/40'
                                }`}
                        >
                            <div className="text-center">
                                <div className="font-bold">{diff.toUpperCase()}</div>
                                <div className="text-xs opacity-75">
                                    {difficultyInfo[diff].drops} drops
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Difficulty Info */}
                <div className="text-center mb-6">
                    <p className={`text-sm ${difficultyInfo[difficulty as keyof typeof difficultyInfo].color}`}>
                        {difficultyInfo[difficulty as keyof typeof difficultyInfo].description}
                    </p>
                </div>

                {/* Game Container */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <iframe
                            src={gameUrl}
                            className="border-4 border-[#97F0E5] rounded-lg"
                            width="1280"
                            height="720"
                            title="Culture RPG Game"
                        />

                        {/* Game Overlay Info */}
                        <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Settings size={16} />
                                <span>Controls</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div>🎮 Arrow Keys: Move</div>
                                <div>💬 SPACE: Dialogue</div>
                                <div>🔄 R: Restart (when complete)</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions and Links */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#C684F6]/20 hover:bg-[#C684F6]/40 text-[#F7F7F7] rounded-md font-neuebit transition-all"
                    >
                        <Info size={16} />
                        <span>Instructions</span>
                    </button>

                    <a
                        href="/leaderboard"
                        className="flex items-center gap-2 px-4 py-2 bg-[#C684F6]/20 hover:bg-[#C684F6]/40 text-[#F7F7F7] rounded-md font-neuebit transition-all"
                    >
                        <Trophy size={16} />
                        <span>Leaderboard</span>
                    </a>
                </div>

                {/* Instructions Panel */}
                {showInstructions && (
                    <div className="max-w-4xl mx-auto mb-6 p-6 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg">
                        <h3 className="text-white font-mondwest text-xl mb-4">How to Play</h3>
                        <div className="grid md:grid-cols-2 gap-6 text-[#F7F7F7]/80">
                            <div>
                                <h4 className="text-[#97F0E5] font-neuebit mb-2">Objective</h4>
                                <p>Find and collect all culture drop boxes scattered around the world. Each box contains information about a real place from our database!</p>
                            </div>
                            <div>
                                <h4 className="text-[#97F0E5] font-neuebit mb-2">Rarity System</h4>
                                <div className="space-y-1 text-sm">
                                    <div>🔴 Red = Super Rare (SR) - High hype places</div>
                                    <div>🔵 Teal = Rare (R) - Popular destinations</div>
                                    <div>🔵 Blue = Uncommon (U) - Hidden gems</div>
                                    <div>🟡 Orange = Common (C) - Well-known spots</div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[#97F0E5] font-neuebit mb-2">Scoring</h4>
                                <p>Points are based on rarity and popularity. Faster completion gives bonus points. Your progress is automatically saved!</p>
                            </div>
                            <div>
                                <h4 className="text-[#97F0E5] font-neuebit mb-2">Features</h4>
                                <ul className="text-sm space-y-1">
                                    <li>• Real culture drops from our database</li>
                                    <li>• Dynamic positioning each game</li>
                                    <li>• Progress persistence</li>
                                    <li>• Local leaderboard</li>
                                    <li>• Multiple difficulty levels</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="text-center text-[#F7F7F7]/50 text-sm">
                    <p>🎯 Goal: Collect all {difficultyInfo[difficulty as keyof typeof difficultyInfo].drops} culture drop boxes</p>
                    <p>⏱️ Try to beat your best time!</p>
                    <p>🏆 Check the leaderboard for high scores</p>
                </div>
            </div>
        </div>
    );
}

export default function PlayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0C0F1D] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        }>
            <PlayPageContent />
        </Suspense>
    );
}
