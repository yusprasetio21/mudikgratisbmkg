'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, FileText, Star, Bus, ArrowLeft } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'slider' | 'kegiatan' | 'peraturan' | 'program' | 'mudikgratis';
  title: string;
  description: string;
  category?: string;
  status?: string;
  link: string;
  date?: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    try {
      // Search Sliders
      const slidersRes = await fetch('/api/sliders?status=published');
      if (slidersRes.ok) {
        const sliders = await slidersRes.json();
        sliders.forEach((slide: any) => {
          if (
            slide.title?.toLowerCase().includes(lowerQuery) ||
            slide.description?.toLowerCase().includes(lowerQuery) ||
            slide.highlight?.toLowerCase().includes(lowerQuery) ||
            slide.cardTitle?.toLowerCase().includes(lowerQuery)
          ) {
            searchResults.push({
              id: slide.id,
              type: 'slider',
              title: `${slide.highlight} ${slide.title}`,
              description: slide.description || slide.cardDesc || '',
              category: slide.category || 'Info',
              status: slide.status,
              link: '/',
              date: slide.updated_at || slide.created_at,
            });
          }
        });
      }

      // Search Kegiatan
      const kegiatanRes = await fetch('/api/kegiatan?status=published');
      if (kegiatanRes.ok) {
        const kegiatan = await kegiatanRes.json();
        kegiatan.forEach((item: any) => {
          if (
            item.title?.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery)
          ) {
            searchResults.push({
              id: item.id,
              type: 'kegiatan',
              title: item.title,
              description: item.description,
              category: item.category,
              status: item.status,
              link: '/kegiatan',
              date: item.event_date || item.date || item.created_at,
            });
          }
        });
      }

      // Search Peraturan
      const peraturanRes = await fetch('/api/peraturan?status=published');
      if (peraturanRes.ok) {
        const peraturan = await peraturanRes.json();
        peraturan.forEach((item: any) => {
          if (
            item.title?.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery)
          ) {
            searchResults.push({
              id: item.id,
              type: 'peraturan',
              title: item.title,
              description: item.description,
              category: item.category,
              status: item.status,
              link: '/peraturan',
              date: item.publish_date || item.created_at,
            });
          }
        });
      }

      // Search Program
      const programRes = await fetch('/api/program?status=published');
      if (programRes.ok) {
        const programs = await programRes.json();
        programs.forEach((item: any) => {
          if (
            item.title?.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery)
          ) {
            searchResults.push({
              id: item.id,
              type: 'program',
              title: item.title,
              description: item.description,
              category: item.category,
              status: item.status,
              link: '/program',
              date: item.start_date || item.created_at,
            });
          }
        });
      }

      // Check for Mudik Gratis related keywords
      const mudikKeywords = ['mudik', 'gratis', 'bus', 'daftar', 'pendaftaran', 'homecoming'];
      if (mudikKeywords.some(keyword => lowerQuery.includes(keyword))) {
        searchResults.push({
          id: 'mudikgratis-home',
          type: 'mudikgratis',
          title: 'Program Mudik Gratis BMKG',
          description: 'Program mudik gratis untuk keluarga besar BMKG. Daftar sekarang untuk mendapatkan fasilitas perjalanan gratis.',
          link: '/mudikgratis',
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'slider':
        return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Star className="w-5 h-5 text-blue-600" /></div>;
      case 'kegiatan':
        return <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-purple-600" /></div>;
      case 'peraturan':
        return <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-orange-600" /></div>;
      case 'program':
        return <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Star className="w-5 h-5 text-yellow-600" /></div>;
      case 'mudikgratis':
        return <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><Bus className="w-5 h-5 text-emerald-600" /></div>;
      default:
        return <Search className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      slider: 'bg-blue-100 text-blue-700',
      kegiatan: 'bg-purple-100 text-purple-700',
      peraturan: 'bg-orange-100 text-orange-700',
      program: 'bg-yellow-100 text-yellow-700',
      mudikgratis: 'bg-emerald-100 text-emerald-700',
    };
    const labels: Record<string, string> = {
      slider: 'Info',
      kegiatan: 'Kegiatan',
      peraturan: 'Peraturan',
      program: 'Program',
      mudikgratis: 'Mudik Gratis',
    };
    return (
      <Badge className={styles[type] || 'bg-gray-100 text-gray-700'}>
        {labels[type] || type}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hasil Pencarian
          </h1>
          {query && (
            <p className="text-gray-600">
              Menampilkan hasil untuk: <span className="font-semibold text-blue-600">"{query}"</span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Mencari...</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          /* Results */
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Ditemukan {results.length} hasil
            </p>
            {results.map((result) => (
              <Link key={result.id} href={result.link}>
                <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-400 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {getTypeIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {result.title}
                          </h3>
                          {getTypeBadge(result.type)}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {result.category && (
                            <span>• {result.category}</span>
                          )}
                          {result.date && (
                            <span>• {new Date(result.date).toLocaleDateString('id-ID')}</span>
                          )}
                          {result.status && (
                            <Badge variant="outline" className="text-xs">
                              {result.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : query ? (
          /* No Results */
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tidak ada hasil ditemukan
              </h3>
              <p className="text-gray-600 mb-6">
                Kami tidak dapat menemukan konten dengan kata kunci "{query}"
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Coba cari dengan:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Mudik Gratis', 'Kegiatan', 'Peraturan', 'Program'].map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/search?q=${encodeURIComponent(suggestion)}`}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Initial State - Show Search Suggestions */
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cari Konten
              </h3>
              <p className="text-gray-600 mb-6">
                Masukkan kata kunci untuk mencari konten di website KORPRI BMKG
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Pencarian populer:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Mudik Gratis', 'Hari KORPRI', 'Seragam', 'Bantuan', 'Pelatihan'].map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/search?q=${encodeURIComponent(suggestion)}`}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
