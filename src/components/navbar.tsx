'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  return (
    <header className="navbar">
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between py-4">
          {/* Logo Container */}
          <div className="flex items-center gap-4">
            <div className="logo-bmkg flex items-center justify-center">
              <img
                src="/logoBMKG.png"
                alt="BMKG"
                className="h-11 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<div class="bg-blue-500 text-white px-3 py-2 rounded-lg font-bold">BMKG</div>';
                  }
                }}
              />
            </div>
            <div className="logo-korpri flex items-center justify-center">
              <img
                src="/korpri.png"
                alt="KORPRI"
                className="h-11 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<div class="bg-blue-800 text-white px-3 py-2 rounded-lg font-bold">KORPRI</div>';
                  }
                }}
              />
            </div>
            <span className="ml-1 border-l-2 border-blue-400 pl-4 text-xl font-bold text-blue-900">
              KORPRI BMKG
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            <a
              href="/"
              className="relative text-sm font-medium text-gray-600 transition-colors hover:text-blue-900"
            >
              Home
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-900 to-blue-400 transition-all duration-300 hover:w-full" />
            </a>
            <a
              href="/mudikgratis"
              className="relative text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-900"
            >
              Mudik Gratis
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-gradient-to-r from-emerald-900 to-emerald-400 transition-all duration-300 hover:w-full" />
            </a>
            <a
              href="/kegiatan"
              className="relative text-sm font-medium text-gray-600 transition-colors hover:text-blue-900"
            >
              Kegiatan
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-900 to-blue-400 transition-all duration-300 hover:w-full" />
            </a>
            <a
              href="/peraturan"
              className="relative text-sm font-medium text-gray-600 transition-colors hover:text-blue-900"
            >
              Peraturan
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-900 to-blue-400 transition-all duration-300 hover:w-full" />
            </a>
            <a
              href="/program"
              className="relative text-sm font-medium text-gray-600 transition-colors hover:text-blue-900"
            >
              Program
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-900 to-blue-400 transition-all duration-300 hover:w-full" />
            </a>
            <a
              href="/login"
              className="relative text-sm font-medium text-blue-600 transition-colors hover:text-blue-900"
            >
              Admin
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-900 to-blue-400 transition-all duration-300 hover:w-full" />
            </a>
          </nav>

          {/* Search */}
          <div className="search relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              className="w-45 rounded-full border border-gray-200 bg-slate-50 py-2.5 pl-10 pr-5 text-sm outline-none transition-all duration-300 focus:w-55 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.1)]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
