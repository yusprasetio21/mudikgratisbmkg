'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

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

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgram();
  }, [params.slug]);

  const fetchProgram = async () => {
    try {
      const response = await fetch('/api/program');
      if (response.ok) {
        const data = await response.json();
        const foundProgram = data.find((p: ProgramData) => p.slug === params.slug);
        setProgram(foundProgram || null);
      }
    } catch (error) {
      console.error('Error fetching program:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Program tidak ditemukan</h1>
            <Button onClick={() => router.push('/program')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar Program
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/program')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Program
          </Button>
        </div>

        {/* Hero Image */}
        {program.imageUrl || program.imagePath ? (
          <div className="aspect-[21/9] w-full overflow-hidden bg-slate-100">
            <img
              src={program.imageUrl || program.imagePath || ''}
              alt={program.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[21/9] w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <Star className="h-32 w-32 text-blue-300" />
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="capitalize">
                  {program.category}
                </Badge>
                {getStatusBadge(program.status)}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                {program.title}
              </h1>
              <p className="text-lg text-gray-600">
                {program.description}
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              {program.startDate && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-900" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Waktu Pelaksanaan</p>
                        <p className="font-semibold">
                          {new Date(program.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {program.endDate && ` - ${new Date(program.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {program.status && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Star className="h-6 w-6 text-green-900" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status Program</p>
                        <p className="font-semibold capitalize">
                          {program.status === 'published' ? 'Sedang Berlangsung' :
                           program.status === 'closed' ? 'Telah Ditutup' : program.status}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Content */}
            {program.content && (
              <Card className="mb-8">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Tentang Program</h2>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {program.content}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA Button */}
            {program.registrationLink && program.status === 'published' && (
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => window.open(program.registrationLink, '_blank')}
                  className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-lg px-8 py-6"
                >
                  Daftar Sekarang
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
