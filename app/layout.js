'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import "./globals.css";

const Layout = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const router = useRouter();

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
        document.body.classList.toggle('bg-gray-900', !isDarkMode);
        document.body.classList.toggle('bg-gray-100', isDarkMode);
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <header className="p-4 bg-blue-500 flex justify-between items-center">
                <div className="flex items-center">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} className="mr-2" /> {/* Using Next.js Image component */}
                    <h1 className="text-xl">My App</h1>
                </div>
                <nav className="flex space-x-4">
                    <Link href="/" className="text-white hover:underline">Home</Link>
                    <Link href="/about" className="text-white hover:underline">About</Link>
                    <Link href="/contact" className="text-white hover:underline">Contact</Link>
                </nav>
                <button onClick={toggleDarkMode} className="bg-white text-blue-500 p-2 rounded">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </header>
            <main className="flex-1 p-4">
                {children}
            </main>
            <footer className="p-4 bg-blue-500 text-white text-center">
                © {new Date().getFullYear()} My App. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;
