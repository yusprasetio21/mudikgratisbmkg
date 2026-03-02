'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Star, Filter } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';

interface ProgramData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  imagePath: string | null;
  content: string | null;
  startDate: string | null;
  endDate: string | null;
  registrationLink: string | null;
  status: string;
}

export default function ProgramPage() {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Semua' },
    { value: 'kesejahteraan', label: 'Kesejahteraan' },
    { value: 'pelatihan', label: 'Pelatihan' },
    { value: 'mudik', label: 'Mudik' },
    { value: 'lainnya', label: 'Lainnya' },
  ];

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/program?status=published');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = selectedCategory === 'all'
    ? programs
    : programs.filter(p => p.category === selectedCategory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-600">Buka</Badge>;
      case 'closed':
        return <Badge variant="secondary">Tutup</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Program KORPRI BMKG</h1>
            <p className="text-lg text-blue-100 max-w-2xl">
              Program unggulan untuk kesejahteraan dan pengembangan anggota
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
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Belum ada program yang ditampilkan.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {/* Image */}
                  {item.imageUrl || item.imagePath ? (
                    <div className="aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.imageUrl || item.imagePath || ''}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <Star className="h-16 w-16 text-blue-300" />
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                      {getStatusBadge(item.status)}
                    </div>
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow flex flex-col justify-end">
                    {/* Dates */}
                    {item.startDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(item.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}`}
                        </span>
                      </div>
                    )}

                    <Link href={`/program/${item.slug}`}>
                      <Button className="w-full" disabled={item.status === 'closed'}>
                        Lihat Detail
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
