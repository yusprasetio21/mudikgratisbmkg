'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, ArrowLeft, CheckCircle, Clock, X } from 'lucide-react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ReregistrationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setErrorMessage('Silakan masukkan NIP, Nama, atau Nomor Pendaftaran');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/mudikgratis/reregistration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Gagal mendaftar ulang. Silakan coba lagi.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setStatus('idle');
    setErrorMessage('');
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
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Daftar Ulang</h1>
          <p className="text-gray-500">Konfirmasi kehadiran Anda untuk keberangkatan mudik</p>
        </div>

        {/* Form Card */}
        <Card className="border border-gray-200 bg-gradient-to-br from-blue-50/50 to-blue-100/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {status === 'success' ? 'Berhasil Mendaftar Ulang' : 'Formulir Daftar Ulang'}
            </CardTitle>
            <CardDescription>
              {status === 'success' 
                ? 'Data Anda telah dikirim dan menunggu verifikasi admin'
                : 'Masukkan NIP, Nama, atau Nomor Pendaftaran Anda'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'idle' && (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <p className="text-sm text-gray-500 mt-2">
                    Masukkan salah satu data pendaftaran Anda untuk mengonfirmasi kehadiran
                  </p>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base"
                >
                  {status === 'submitting' ? 'Memproses...' : 'Daftar Ulang Sekarang'}
                </Button>
              </form>
            )}

            {status === 'submitting' && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Sedang memproses permintaan Anda...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Daftar Ulang Berhasil!
                </h3>
                <p className="text-gray-600 mb-6">
                  Terima kasih telah mengkonfirmasi kehadiran. Admin akan memverifikasi data Anda segera.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900 font-medium mb-1">Langkah Selanjutnya:</p>
                  <p className="text-sm text-blue-700">
                    1. Tunggu verifikasi dari admin<br />
                    2. Lengkapi pembayaran DP<br />
                    3. Cek jadwal keberangkatan
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Daftar Ulang Lain
                  </Button>
                  <Link href="/mudikgratis/check-bus" className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Cek Bus
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Gagal Mendaftar Ulang
                </h3>
                <p className="text-gray-600 mb-6">
                  {errorMessage}
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Coba Lagi
                  </Button>
                  <Link href="/mudikgratis" className="flex-1">
                    <Button className="w-full">
                      Kembali
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border border-gray-200 bg-gray-50 mt-6">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Informasi Penting:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Pastikan data yang Anda masukkan sesuai dengan data pendaftaran awal
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Daftar ulang wajib dilakukan untuk memastikan keberangkatan
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Setelah verifikasi, Anda akan diinformasikan mengenai jadwal dan pembayaran DP
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
