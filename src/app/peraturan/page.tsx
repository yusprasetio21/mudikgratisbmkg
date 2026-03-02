'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Download, ExternalLink, Filter, X } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface PeraturanData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  pdfPath: string;
  pdfUrl: string | null;
  publishDate: string | null;
}

export default function PeraturanPage() {
  const [peraturan, setPeraturan] = useState<PeraturanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeraturan, setSelectedPeraturan] = useState<PeraturanData | null>(null);

  const categories = [
    { value: 'all', label: 'Semua' },
    { value: 'kepala', label: 'Kepala' },
    { value: 'himbauan', label: 'Himbauan' },
    { value: 'peraturan', label: 'Peraturan' },
  ];

  useEffect(() => {
    fetchPeraturan();
  }, []);

  const fetchPeraturan = async () => {
    try {
      const response = await fetch('/api/peraturan?status=published');
      if (response.ok) {
        const data = await response.json();
        setPeraturan(data);
      }
    } catch (error) {
      console.error('Error fetching peraturan:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPeraturan = selectedCategory === 'all'
    ? peraturan
    : peraturan.filter(p => p.category === selectedCategory);

  const handleViewPDF = (item: PeraturanData) => {
    setSelectedPeraturan(item);
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Peraturan & Himbauan</h1>
            <p className="text-lg text-blue-100 max-w-2xl">
              Dokumen resmi, peraturan, dan himbauan untuk anggota KORPRI BMKG
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

          {/* List */}
          {filteredPeraturan.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Belum ada peraturan yang ditampilkan.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPeraturan.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FileText className="h-3 w-3" />
                        PDF
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    {item.description && (
                      <CardDescription className="line-clamp-3">
                        {item.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent>
                    {item.publishDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.publishDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewPDF(item)}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Lihat PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = item.pdfPath || item.pdfUrl || '';
                          link.download = `${item.title}.pdf`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* PDF Viewer Modal */}
      {selectedPeraturan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex-1 min-w-0 mr-4">
                <Badge variant="outline" className="mb-2 capitalize">
                  {selectedPeraturan.category}
                </Badge>
                <h2 className="text-xl font-bold truncate">{selectedPeraturan.title}</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPeraturan(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <iframe
                src={selectedPeraturan.pdfPath || selectedPeraturan.pdfUrl || ''}
                className="w-full h-full rounded-lg border"
                title={selectedPeraturan.title}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedPeraturan.pdfPath || selectedPeraturan.pdfUrl || '';
                  link.download = `${selectedPeraturan.title}.pdf`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={() => setSelectedPeraturan(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
