'use client';
import { useState, useEffect } from 'react';
import { AnimationBackground } from "@/components/AnimationBackground";
import { DropCard } from '@/components/DropCard';
import { SearchBar } from '@/components/SearchBar';
import { Loader2 } from 'lucide-react';

interface CultureDrop {
  _id: string;
  title: string;
  caption: string;
  city: string;
  country: string;
  media: {
    blobId: string;
    url: string;
  };
  voteCount: number;
  uniqueCommenters: number;
  hypeScore: number;
  createdAt: string;
}

export default function Home() {
  const [drops, setDrops] = useState<CultureDrop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'new' | 'hype'>('new');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDrops = async () => {
      setIsLoading(true);
      try {
        let response;
        if (searchQuery.trim()) {
          response = await fetch(`/api/drops/search?q=${encodeURIComponent(searchQuery)}`);
        } else {
          response = await fetch(`/api/drops?sort=${sortBy}`);
        }
        const data = await response.json();
        if (data.ok) {
          setDrops(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch drops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrops();
  }, [sortBy, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
      <AnimationBackground />

      <main className="w-full max-w-7xl px-4 py-8 mt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mondwest text-4xl md:text-6xl mb-4 text-center">
            Discover Culture Drops
          </h1>
          <p className="text-center text-[#F7F7F7]/70 max-w-2xl mx-auto mb-6">
            Explore amazing places shared by the global community. Every image is permanently stored on Walrus blockchain, every vote is secured by Sui signatures, and every story connects us across the world and sells through NFTs.
          </p>

          {/* Search Bar */}
          <div className="flex justify-center mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by city, country, or title..."
            />
          </div>

          {/* Sort Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSortBy('new')}
              className={`px-6 py-2 rounded-md font-neuebit transition-all ${sortBy === 'new'
                ? 'bg-[#97F0E5] text-[#0C0F1D]'
                : 'bg-[#97F0E5]/20 text-[#F7F7F7] hover:bg-[#97F0E5]/40'
                }`}
            >
              NEWEST
            </button>
            <button
              onClick={() => setSortBy('hype')}
              className={`px-6 py-2 rounded-md font-neuebit transition-all ${sortBy === 'hype'
                ? 'bg-[#C684F6] text-[#0C0F1D]'
                : 'bg-[#C684F6]/20 text-[#F7F7F7] hover:bg-[#C684F6]/40'
                }`}
            >
              TOP HYPE
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
            <p className="text-[#F7F7F7]/70">Loading drops...</p>
          </div>
        ) : drops.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[#F7F7F7]/70 text-xl mb-4">No drops yet</p>
            <p className="text-[#F7F7F7]/50">Be the first to share a place and earn NFT rewards!</p>
          </div>
        ) : (
          /* Drops Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drops.map((drop) => (
              <DropCard
                key={drop._id}
                id={drop._id}
                title={drop.title}
                city={drop.city}
                country={drop.country}
                imageUrl={drop.media.url}
                createdAt={drop.createdAt}
                voteCount={drop.voteCount}
                uniqueCommenters={drop.uniqueCommenters}
                hypeScore={drop.hypeScore}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
