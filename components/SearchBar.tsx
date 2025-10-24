'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search...' }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSearch = (value: string) => {
        setQuery(value);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#97F0E5]"
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-md text-[#F7F7F7] placeholder:text-[#F7F7F7]/50 focus:outline-none focus:border-[#97F0E5] transition-colors"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#F7F7F7]/50 hover:text-[#F7F7F7] transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}

