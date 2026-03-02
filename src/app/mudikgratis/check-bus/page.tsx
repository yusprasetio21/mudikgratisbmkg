'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, ArrowLeft, Bus, MapPin, Calendar, Users, Armchair } from 'lucide-react';

export default function CheckBusPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Silakan masukkan NIP, Nama, atau Nomor Pendaftaran');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await fetch('/api/mudikgratis/check-bus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery }),
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResult(data.data);
      } else {
        setError(data.error || 'Data tidak ditemukan');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        {/* Header */}
        <Link href="/mudikgratis" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Halaman Utama
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cek Bus</h1>
          <p className="text-gray-500">Lihat alokasi bus dan jadwal keberangkatan Anda</p>
        </div>

        {/* Search Card */}
        <Card className="border border-gray-200 bg-gradient-to-br from-indigo-50/50 to-indigo-100/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Cari Alokasi Bus
            </CardTitle>
            <CardDescription>
              Masukkan data pendaftaran untuk melihat informasi bus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="searchQuery" className="text-base font-medium text-gray-900 mb-2 block">
                  NIP / Nama / Nomor Pendaftaran
                </Label>
                <Input
                  id="searchQuery"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Masukkan NIP, Nama, atau Nomor Pendaftaran"
                  className="h-12 text-base"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 text-base"
              >
                {loading ? 'Mencari...' : 'Cek Sekarang'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Card */}
        {searchResult && (
          <Card className="border border-gray-200 bg-gradient-to-br from-indigo-50/50 to-indigo-100/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Informasi Alokasi Bus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Bus className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">No. Bus</p>
                      <p className="font-semibold text-gray-900">{searchResult.busNumber || 'B-001'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kota Tujuan</p>
                      <p className="font-semibold text-gray-900">{searchResult.destination || 'Semarang'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal</p>
                      <p className="font-semibold text-gray-900">{searchResult.date || '15 Mei 2025'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Armchair className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nomor Kursi</p>
                      <p className="font-semibold text-gray-900">{searchResult.seatNumber || 'A-1, A-2'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Total Peserta</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {searchResult.totalParticipants || 3} Orang
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchResult.participants || 'Ahmad Fauzi + 2 Keluarga'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-1">Status:</p>
                <p className="text-sm text-blue-700">
                  {searchResult.status === 'approved' 
                    ? '✓ Telah diverifikasi dan mendapat alokasi bus'
                    : '⏳ Menunggu verifikasi admin'}
                </p>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Download Tiket / Bukti
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
