'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BaseWalletConnect } from './BaseWalletConnect';
import { Home, PlusCircle, Map, Trophy, Globe, Menu, X, Users, MessageCircle, User, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export function Navigation() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Feed', icon: Home },
        { href: '/create', label: 'Create', icon: PlusCircle },
        { href: '/map', label: 'Map', icon: Map },
        { href: '/top', label: 'Top', icon: Trophy },
        { href: '/articles', label: 'Articles', icon: Globe },
        { href: '/leaderboard', label: 'Scores', icon: Trophy },
        { href: '/friends', label: 'Friends', icon: Users },
        { href: '/circles', label: 'Circles', icon: Users },
        { href: '/chat', label: 'Chat', icon: MessageCircle },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="relative z-20 w-full">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between w-full">
                <div className="flex items-center gap-6">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-md font-neuebit transition-colors',
                                pathname === href
                                    ? 'bg-[#97F0E5] text-[#0C0F1D]'
                                    : 'text-[#F7F7F7] hover:bg-[#97F0E5]/20 hover:text-[#97F0E5]'
                            )}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </div>
                <BaseWalletConnect />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center justify-between w-full">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-md hover:bg-[#97F0E5]/20 transition-colors"
                >
                    {mobileMenuOpen ? (
                        <X size={24} className="text-[#F7F7F7]" />
                    ) : (
                        <Menu size={24} className="text-[#F7F7F7]" />
                    )}
                </button>
                <BaseWalletConnect />
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#090e1d] border-2 border-[#97F0E5] rounded-lg p-4 flex flex-col gap-2">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-md font-neuebit transition-colors',
                                pathname === href
                                    ? 'bg-[#97F0E5] text-[#0C0F1D]'
                                    : 'text-[#F7F7F7] hover:bg-[#97F0E5]/20 hover:text-[#97F0E5]'
                            )}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}

