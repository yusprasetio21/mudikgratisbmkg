'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Image as ImageIcon, Video, Filter } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface KegiatanData {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  images: string[] | null;
  videoUrl: string | null;
}

export default function KegiatanPage() {
  const [kegiatan, setKegiatan] = useState<KegiatanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedKegiatan, setSelectedKegiatan] = useState<KegiatanData | null>(null);

  const categories = [
    { value: 'all', label: 'Semua' },
    { value: 'olahraga', label: 'Olahraga' },
    { value: 'perlombaan', label: 'Perlombaan' },
    { value: 'turnamen', label: 'Turnamen' },
    { value: 'lainnya', label: 'Lainnya' },
  ];

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const fetchKegiatan = async () => {
    try {
      const response = await fetch('/api/kegiatan?status=published');
      if (response.ok) {
        const data = await response.json();
        // Parse images for each item
        const parsedData = data.map((item: KegiatanData) => ({
          ...item,
          images: item.images ? JSON.parse(item.images as string) : [],
        }));
        setKegiatan(parsedData);
      }
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredKegiatan = selectedCategory === 'all'
    ? kegiatan
    : kegiatan.filter(k => k.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Kegiatan KORPRI BMKG</h1>
            <p className="text-lg text-blue-100 max-w-2xl">
              Dokumentasi kegiatan dan aktivitas anggota KORPRI BMKG
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Filter className="h-5 w-5 text-gray-600" />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={selectedCategory === cat.value ? 'bg-blue-900 hover:bg-blue-800' : ''}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filteredKegiatan.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Belum ada kegiatan yang ditampilkan.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredKegiatan.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedKegiatan(item)}
                >
                  {/* Image Preview */}
                  {item.images && item.images.length > 0 && (
                    <div className="aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                      {item.videoUrl && (
                        <Badge variant="secondary">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      {item.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(item.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.images && item.images.length > 0 && (
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          <span>{item.images.length} foto</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal Detail */}
      {selectedKegiatan && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedKegiatan(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="outline" className="mb-2 capitalize">
                    {selectedKegiatan.category}
                  </Badge>
                  <h2 className="text-2xl font-bold">{selectedKegiatan.title}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedKegiatan(null)}
                >
                  ✕
                </Button>
              </div>

              {/* Images Grid */}
              {selectedKegiatan.images && selectedKegiatan.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Galeri Foto</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedKegiatan.images.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={img}
                          alt={`${selectedKegiatan.title} ${idx + 1}`}
                          className="h-full w-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {selectedKegiatan.videoUrl && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Video</h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                    <video
                      src={selectedKegiatan.videoUrl}
                      controls
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="space-y-3 mb-6">
                {selectedKegiatan.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedKegiatan.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                )}
                {selectedKegiatan.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedKegiatan.location}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Deskripsi</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedKegiatan.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
