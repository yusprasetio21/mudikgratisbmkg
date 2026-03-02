'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Slider, { SliderData } from '@/components/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUpload from '@/components/file-upload';
import {
  Plus, Edit, Trash2, Eye, Save, ArrowLeft,
  FolderOpen, FileText, Calendar, Star, Bus
} from 'lucide-react';

interface SliderFormData {
  id?: string;
  category: string;
  title: string;
  highlight: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  cardTitle: string;
  cardDesc: string;
  cardTag: string;
  cardLink: string;
  imageUrl: string;
  imagePath: string;
  imageOverlay: string;
  label: string;
  labelIcon: string;
  order: number;
  status: 'draft' | 'published';
}

interface KegiatanFormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  images: string[];
  videoUrl: string;
  order: number;
  status: 'draft' | 'published';
}

interface PeraturanFormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  pdfPath: string;
  pdfUrl: string;
  publishDate: string;
  order: number;
  status: 'draft' | 'published';
}

interface ProgramFormData {
  id?: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  imagePath: string;
  content: string;
  startDate: string;
  endDate: string;
  registrationLink: string;
  order: number;
  status: 'draft' | 'published' | 'closed';
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('slider');

  // Slider state
  const [sliders, setSliders] = useState<SliderFormData[]>([]);
  const [showSliderForm, setShowSliderForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderFormData | null>(null);
  const [previewSlider, setPreviewSlider] = useState<SliderData | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Kegiatan state
  const [kegiatan, setKegiatan] = useState<any[]>([]);
  const [showKegiatanForm, setShowKegiatanForm] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState<any>(null);

  // Peraturan state
  const [peraturan, setPeraturan] = useState<PeraturanFormData[]>([]);
  const [showPeraturanForm, setShowPeraturanForm] = useState(false);
  const [editingPeraturan, setEditingPeraturan] = useState<PeraturanFormData | null>(null);

  // Program state
  const [programs, setPrograms] = useState<ProgramFormData[]>([]);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramFormData | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [sliderFormData, setSliderFormData] = useState<SliderFormData>({
    category: 'info',
    title: '',
    highlight: '',
    description: '',
    buttonLabel: '',
    buttonUrl: '',
    cardTitle: '',
    cardDesc: '',
    cardTag: '',
    cardLink: '',
    imageUrl: '',
    imagePath: '',
    imageOverlay: '',
    label: '',
    labelIcon: '',
    order: 0,
    status: 'draft',
  });

  const [kegiatanFormData, setKegiatanFormData] = useState<any>({
    title: '',
    description: '',
    category: 'olahraga',
    date: '',
    location: '',
    images: [],
    videoUrl: '',
    order: 0,
    status: 'draft',
  });

  const [peraturanFormData, setPeraturanFormData] = useState<PeraturanFormData>({
    title: '',
    description: '',
    category: 'kepala',
    pdfPath: '',
    pdfUrl: '',
    publishDate: '',
    order: 0,
    status: 'draft',
  });

  const [programFormData, setProgramFormData] = useState<ProgramFormData>({
    slug: '',
    title: '',
    description: '',
    category: 'kesejahteraan',
    imageUrl: '',
    imagePath: '',
    content: '',
    startDate: '',
    endDate: '',
    registrationLink: '',
    order: 0,
    status: 'draft',
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [slidersRes, kegiatanRes, peraturanRes, programsRes] = await Promise.all([
        fetch('/api/sliders'),
        fetch('/api/kegiatan'),
        fetch('/api/peraturan'),
        fetch('/api/program'),
      ]);

      if (slidersRes.ok) setSliders(await slidersRes.json());

      if (kegiatanRes.ok) {
        const kegiatanData = await kegiatanRes.json();
        // Parse images JSON string
        const parsedKegiatan = kegiatanData.map((item: any) => ({
          ...item,
          images: item.images ? JSON.parse(item.images) : [],
          date: item.event_date || item.date,
          order: item.display_order || item.order,
        }));
        setKegiatan(parsedKegiatan);
      }

      if (peraturanRes.ok) {
        const peraturanData = await peraturanRes.json();
        const parsedPeraturan = peraturanData.map((item: any) => ({
          ...item,
          publishDate: item.publish_date,
          order: item.display_order || item.order,
        }));
        setPeraturan(parsedPeraturan);
      }

      if (programsRes.ok) {
        const programData = await programsRes.json();
        const parsedPrograms = programData.map((item: any) => ({
          ...item,
          startDate: item.start_date,
          endDate: item.end_date,
          imagePath: item.image_path,
          imageUrl: item.image_url,
          order: item.display_order || item.order,
        }));
        setPrograms(parsedPrograms);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Slider handlers
  const handleSliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSlider ? `/api/sliders/${editingSlider.id}` : '/api/sliders';
      const method = editingSlider ? 'PUT' : 'POST';

      // Map form data to Golang API format
      const payload = {
        category: sliderFormData.category || 'info',
        title: sliderFormData.title,
        highlight: sliderFormData.highlight,
        description: sliderFormData.description,
        buttonLabel: sliderFormData.buttonLabel,
        buttonUrl: sliderFormData.buttonUrl,
        cardTitle: sliderFormData.cardTitle,
        cardDesc: sliderFormData.cardDesc,
        cardTag: sliderFormData.cardTag,
        cardLink: sliderFormData.cardLink,
        imageUrl: sliderFormData.imageUrl || sliderFormData.imagePath,
        imagePath: sliderFormData.imagePath,
        imageOverlay: sliderFormData.imageOverlay,
        label: sliderFormData.label,
        labelIcon: sliderFormData.labelIcon,
        order: sliderFormData.order || 0,
        status: sliderFormData.status || 'draft',
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save slider');

      showMessage('success', editingSlider ? 'Slider berhasil diperbarui' : 'Slider berhasil dibuat');
      resetSliderForm();
      fetchData();
    } catch (error) {
      console.error('Error saving slider:', error);
      showMessage('error', `Gagal menyimpan slider: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSliderDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus slider ini?')) return;

    try {
      const response = await fetch(`/api/sliders/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete slider');

      showMessage('success', 'Slider berhasil dihapus');
      fetchData();
    } catch (error) {
      showMessage('error', 'Gagal menghapus slider');
    }
  };

  const resetSliderForm = () => {
    setSliderFormData({
      category: 'info',
      title: '',
      highlight: '',
      description: '',
      buttonLabel: '',
      buttonUrl: '',
      cardTitle: '',
      cardDesc: '',
      cardTag: '',
      cardLink: '',
      imageUrl: '',
      imagePath: '',
      imageOverlay: '',
      label: '',
      labelIcon: '',
      order: 0,
      status: 'draft',
    });
    setEditingSlider(null);
    setShowSliderForm(false);
  };

  // Kegiatan handlers
  const handleKegiatanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingKegiatan ? `/api/kegiatan/${editingKegiatan.id}` : '/api/kegiatan';
      const method = editingKegiatan ? 'PUT' : 'POST';

      // Map form data to Golang API format
      const payload = {
        title: kegiatanFormData.title,
        description: kegiatanFormData.description,
        category: kegiatanFormData.category || 'olahraga',
        date: kegiatanFormData.date || '',
        location: kegiatanFormData.location || '',
        images: JSON.stringify(kegiatanFormData.images || []), // Convert array to JSON string
        videoUrl: kegiatanFormData.videoUrl || '',
        order: kegiatanFormData.order || 0,
        status: kegiatanFormData.status || 'draft',
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save kegiatan');
      }

      showMessage('success', editingKegiatan ? 'Kegiatan berhasil diperbarui' : 'Kegiatan berhasil dibuat');
      resetKegiatanForm();
      fetchData();
    } catch (error) {
      console.error('Error saving kegiatan:', error);
      console.error('Error details:', error);
      showMessage('error', `Gagal menyimpan kegiatan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleKegiatanDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return;

    try {
      const response = await fetch(`/api/kegiatan/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete kegiatan');

      showMessage('success', 'Kegiatan berhasil dihapus');
      fetchData();
    } catch (error) {
      showMessage('error', 'Gagal menghapus kegiatan');
    }
  };

  const resetKegiatanForm = () => {
    setKegiatanFormData({
      title: '',
      description: '',
      category: 'olahraga',
      date: '',
      location: '',
      images: [],
      videoUrl: '',
      order: 0,
      status: 'draft',
    });
    setEditingKegiatan(null);
    setShowKegiatanForm(false);
  };

  // Peraturan handlers
  const handlePeraturanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPeraturan ? `/api/peraturan/${editingPeraturan.id}` : '/api/peraturan';
      const method = editingPeraturan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(peraturanFormData),
      });

      if (!response.ok) throw new Error('Failed to save peraturan');

      showMessage('success', editingPeraturan ? 'Peraturan berhasil diperbarui' : 'Peraturan berhasil dibuat');
      resetPeraturanForm();
      fetchData();
    } catch (error) {
      console.error('Error saving peraturan:', error);
      showMessage('error', 'Gagal menyimpan peraturan');
    }
  };

  const handlePeraturanDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus peraturan ini?')) return;

    try {
      const response = await fetch(`/api/peraturan/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete peraturan');

      showMessage('success', 'Peraturan berhasil dihapus');
      fetchData();
    } catch (error) {
      showMessage('error', 'Gagal menghapus peraturan');
    }
  };

  const resetPeraturanForm = () => {
    setPeraturanFormData({
      title: '',
      description: '',
      category: 'kepala',
      pdfPath: '',
      pdfUrl: '',
      publishDate: '',
      order: 0,
      status: 'draft',
    });
    setEditingPeraturan(null);
    setShowPeraturanForm(false);
  };

  // Program handlers
  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProgram ? `/api/program/${editingProgram.id}` : '/api/program';
      const method = editingProgram ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programFormData),
      });

      if (!response.ok) throw new Error('Failed to save program');

      showMessage('success', editingProgram ? 'Program berhasil diperbarui' : 'Program berhasil dibuat');
      resetProgramForm();
      fetchData();
    } catch (error) {
      console.error('Error saving program:', error);
      showMessage('error', 'Gagal menyimpan program');
    }
  };

  const handleProgramDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus program ini?')) return;

    try {
      const response = await fetch(`/api/program/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete program');

      showMessage('success', 'Program berhasil dihapus');
      fetchData();
    } catch (error) {
      showMessage('error', 'Gagal menghapus program');
    }
  };

  const resetProgramForm = () => {
    setProgramFormData({
      slug: '',
      title: '',
      description: '',
      category: 'kesejahteraan',
      imageUrl: '',
      imagePath: '',
      content: '',
      startDate: '',
      endDate: '',
      registrationLink: '',
      order: 0,
      status: 'draft',
    });
    setEditingProgram(null);
    setShowProgramForm(false);
  };

  // Preview handlers
  const handlePreviewSlider = (slider: SliderFormData) => {
    setPreviewSlider({
      id: slider.id || 'preview',
      title: slider.title,
      highlight: slider.highlight,
      description: slider.description,
      buttonLabel: slider.buttonLabel,
      buttonUrl: slider.buttonUrl,
      cardTitle: slider.cardTitle,
      cardDesc: slider.cardDesc,
      cardTag: slider.cardTag,
      cardLink: slider.cardLink,
      imageUrl: slider.imageUrl || slider.imagePath,
      imageOverlay: slider.imageOverlay,
      label: slider.label,
      labelIcon: slider.labelIcon,
    });
    setPreviewMode(true);
  };

  if (previewMode && previewSlider) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800">Preview Slider</h1>
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Admin
            </Button>
          </div>
        </div>
        <main className="flex-grow">
          <Slider slides={[previewSlider]} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Admin Panel - KORPRI BMKG</h1>
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
            Lihat Website
          </a>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Quick Links to Other Admin Pages */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {/* Mudik Gratis Card */}
          <Link href="/admin/mudikgratis" className="group">
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-500 cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bus className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Mudik Gratis</h3>
                    <p className="text-xs text-gray-600 mt-1">Kelola kota & bus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Slider Card */}
          <div className="group cursor-pointer">
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-500 h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Eye className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant={sliders.length > 0 ? "default" : "secondary"} className="absolute -top-2 -right-2 bg-blue-100 text-blue-700 border-2 border-white">
                      {sliders.length}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Slider</h3>
                    <p className="text-xs text-gray-600 mt-1">Kelola slider utama</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setActiveTab('slider');
                      resetSliderForm();
                      setShowSliderForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kegiatan Card */}
          <div className="group cursor-pointer">
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-500 h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant={kegiatan.length > 0 ? "default" : "secondary"} className="absolute -top-2 -right-2 bg-purple-100 text-purple-700 border-2 border-white">
                      {kegiatan.length}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Kegiatan</h3>
                    <p className="text-xs text-gray-600 mt-1">Kelola kegiatan</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setActiveTab('kegiatan');
                      resetKegiatanForm();
                      setShowKegiatanForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Peraturan Card */}
          <div className="group cursor-pointer">
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-500 h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant={peraturan.length > 0 ? "default" : "secondary"} className="absolute -top-2 -right-2 bg-orange-100 text-orange-700 border-2 border-white">
                      {peraturan.length}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Peraturan</h3>
                    <p className="text-xs text-gray-600 mt-1">Kelola peraturan</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                      setActiveTab('peraturan');
                      resetPeraturanForm();
                      setShowPeraturanForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Program Card */}
          <div className="group cursor-pointer">
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-yellow-500 h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant={programs.length > 0 ? "default" : "secondary"} className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-700 border-2 border-white">
                      {programs.length}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Program</h3>
                    <p className="text-xs text-gray-600 mt-1">Kelola program</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={() => {
                      setActiveTab('program');
                      resetProgramForm();
                      setShowProgramForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview All Card */}
          <div className="group cursor-pointer">
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-gray-500 h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Preview All</h3>
                    <p className="text-xs text-gray-600 mt-1">Lihat semua konten</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setActiveTab('preview');
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Lihat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="slider">
              <Eye className="h-4 w-4 mr-2" />
              Slider
            </TabsTrigger>
            <TabsTrigger value="kegiatan">
              <Calendar className="h-4 w-4 mr-2" />
              Kegiatan
            </TabsTrigger>
            <TabsTrigger value="peraturan">
              <FileText className="h-4 w-4 mr-2" />
              Peraturan
            </TabsTrigger>
            <TabsTrigger value="program">
              <Star className="h-4 w-4 mr-2" />
              Program
            </TabsTrigger>
            <TabsTrigger value="preview">
              <FolderOpen className="h-4 w-4 mr-2" />
              Preview All
            </TabsTrigger>
          </TabsList>

          {/* Slider Tab */}
          <TabsContent value="slider" className="space-y-6">
            {!showSliderForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Kelola Slider</CardTitle>
                  <CardDescription>Kelola konten slider yang akan tampil di halaman utama</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button onClick={() => { resetSliderForm(); setShowSliderForm(true); }} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah Slider Baru
                    </Button>
                  </div>

                  {loading ? (
                    <p>Memuat data...</p>
                  ) : sliders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Belum ada slider.</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sliders.map((slider) => (
                            <TableRow key={slider.id}>
                              <TableCell>{slider.order}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{slider.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{slider.highlight} {slider.title}</div>
                                  <div className="text-sm text-gray-500">{slider.cardTitle}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={slider.status === 'published' ? 'default' : 'secondary'}>
                                  {slider.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handlePreviewSlider(slider)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => { setEditingSlider(slider); setSliderFormData(slider); setShowSliderForm(true); }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleSliderDelete(slider.id!)} className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingSlider ? 'Edit Slider' : 'Tambah Slider Baru'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSliderSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Kategori</Label>
                        <select
                          value={sliderFormData.category}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, category: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="info">Info</option>
                          <option value="kegiatan">Kegiatan</option>
                          <option value="program">Program</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={sliderFormData.order}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, order: parseInt(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                          value={sliderFormData.status}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, status: e.target.value as 'draft' | 'published' })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Label Icon (Emoji)</Label>
                        <Input
                          value={sliderFormData.labelIcon}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, labelIcon: e.target.value })}
                          placeholder="⚡"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Label (Badge)</Label>
                      <Input
                        value={sliderFormData.label}
                        onChange={(e) => setSliderFormData({ ...sliderFormData, label: e.target.value })}
                        placeholder="PROGRAM PRIORITAS 2026"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Highlight Text *</Label>
                      <Input
                        value={sliderFormData.highlight}
                        onChange={(e) => setSliderFormData({ ...sliderFormData, highlight: e.target.value })}
                        placeholder="Mudik Gratis"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Judul *</Label>
                      <Input
                        value={sliderFormData.title}
                        onChange={(e) => setSliderFormData({ ...sliderFormData, title: e.target.value })}
                        placeholder="BMKG 2026"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Deskripsi *</Label>
                      <Textarea
                        value={sliderFormData.description}
                        onChange={(e) => setSliderFormData({ ...sliderFormData, description: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Button Label *</Label>
                        <Input
                          value={sliderFormData.buttonLabel}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, buttonLabel: e.target.value })}
                          placeholder="Info Lebih Lanjut"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button URL</Label>
                        <Input
                          value={sliderFormData.buttonUrl}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, buttonUrl: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Gambar</Label>
                      <FileUpload
                        type="image"
                        onUpload={(url, path) => setSliderFormData({ ...sliderFormData, imageUrl: url, imagePath: path })}
                        currentFile={sliderFormData.imagePath || sliderFormData.imageUrl}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Image Overlay (CSS Gradient)</Label>
                      <Input
                        value={sliderFormData.imageOverlay}
                        onChange={(e) => setSliderFormData({ ...sliderFormData, imageOverlay: e.target.value })}
                        placeholder="#0b3b5c, #1e5a7a"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-4">Konten Card</h3>

                      <div className="space-y-2">
                        <Label>Card Tag *</Label>
                        <Input
                          value={sliderFormData.cardTag}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, cardTag: e.target.value })}
                          placeholder="🚌 Mudik Gratis"
                          required
                        />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>Card Title *</Label>
                        <Input
                          value={sliderFormData.cardTitle}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, cardTitle: e.target.value })}
                          placeholder="Mudik Gratis BMKG 2026"
                          required
                        />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>Card Description *</Label>
                        <Textarea
                          value={sliderFormData.cardDesc}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, cardDesc: e.target.value })}
                          rows={2}
                          required
                        />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>Card Link</Label>
                        <Input
                          value={sliderFormData.cardLink}
                          onChange={(e) => setSliderFormData({ ...sliderFormData, cardLink: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        {editingSlider ? 'Update' : 'Simpan'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetSliderForm}>
                        Batal
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handlePreviewSlider(sliderFormData)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Kegiatan Tab */}
          <TabsContent value="kegiatan" className="space-y-6">
            {!showKegiatanForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Kelola Kegiatan</CardTitle>
                  <CardDescription>Kelola kegiatan dengan galeri foto dan video</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button onClick={() => { resetKegiatanForm(); setShowKegiatanForm(true); }} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah Kegiatan Baru
                    </Button>
                  </div>

                  {loading ? (
                    <p>Memuat data...</p>
                  ) : kegiatan.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Belum ada kegiatan.</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {kegiatan.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.order}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-sm text-gray-500">
                                    {item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => {
                                    // Parse images if it's a JSON string
                                    const parsedItem = {
                                      ...item,
                                      images: item.images ? JSON.parse(item.images) : [],
                                      date: item.date || item.event_date,
                                    order: item.order || item.display_order,
                                    videoUrl: item.videoUrl,
                                    status: item.status,
                                    category: item.category,
                                    description: item.description,
                                    title: item.title,
                                    location: item.location,
                                      id: item.id,
                                    createdAt: item.createdAt,
                                      updatedAt: item.updatedAt,
                                    };
                                    setEditingKegiatan(parsedItem);
                                    setKegiatanFormData(parsedItem);
                                    setShowKegiatanForm(true);
                                  }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleKegiatanDelete(item.id!)} className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingKegiatan ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleKegiatanSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Kategori</Label>
                        <select
                          value={kegiatanFormData.category}
                          onChange={(e) => setKegiatanFormData({ ...kegiatanFormData, category: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="olahraga">Olahraga</option>
                          <option value="perlombaan">Perlombaan</option>
                          <option value="turnamen">Turnamen</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={kegiatanFormData.order}
                          onChange={(e) => setKegiatanFormData({ ...kegiatanFormData, order: parseInt(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                          value={kegiatanFormData.status}
                          onChange={(e) => setKegiatanFormData({ ...kegiatanFormData, status: e.target.value as 'draft' | 'published' })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal</Label>
                        <Input
                          type="date"
                          value={kegiatanFormData.date}
                          onChange={(e) => setKegiatanFormData({ ...kegiatanFormData, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Judul *</Label>
                      <Input
                        value={kegiatanFormData.title}
                        onChange={(e) => setKegiatanFormData({ ...kegiatanFormData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lokasi</Label>
                      <Input
                        value={kegiatanFormData.location}
                        onChange={(e) => setKegiatanFormData({ ...kegiatanFormData, location: e.target.value })}
                        placeholder="Lokasi kegiatan"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Deskripsi *</Label>
                      <Textarea
                        value={kegiatanFormData.description}
                        onChange={(e) => setKegiatanFormData({ ...kegiatanFormData, description: e.target.value })}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Gambar</Label>
                      <p className="text-sm text-gray-500 mb-2">Anda bisa upload multiple gambar</p>
                      {kegiatanFormData.images && kegiatanFormData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {kegiatanFormData.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
                              <img src={img} alt={`Image ${idx + 1}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <FileUpload
                        type="image"
                        onUpload={(url) => setKegiatanFormData({ ...kegiatanFormData, images: [...kegiatanFormData.images, url] })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input
                        value={kegiatanFormData.videoUrl}
                        onChange={(e) => setKegiatanFormData({ ...kegiatanFormData, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        {editingKegiatan ? 'Update' : 'Simpan'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetKegiatanForm}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Peraturan Tab */}
          <TabsContent value="peraturan" className="space-y-6">
            {!showPeraturanForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Kelola Peraturan</CardTitle>
                  <CardDescription>Kelola peraturan, himbauan, dan kepala dengan PDF</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button onClick={() => { resetPeraturanForm(); setShowPeraturanForm(true); }} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah Peraturan Baru
                    </Button>
                  </div>

                  {loading ? (
                    <p>Memuat data...</p>
                  ) : peraturan.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Belum ada peraturan.</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {peraturan.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.order}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{item.title}</div>
                                {item.publishDate && (
                                  <div className="text-sm text-gray-500">
                                    {new Date(item.publishDate).toLocaleDateString('id-ID')}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => { setEditingPeraturan(item); setPeraturanFormData(item); setShowPeraturanForm(true); }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handlePeraturanDelete(item.id!)} className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingPeraturan ? 'Edit Peraturan' : 'Tambah Peraturan Baru'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePeraturanSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Kategori</Label>
                        <select
                          value={peraturanFormData.category}
                          onChange={(e) => setPeraturanFormData({ ...peraturanFormData, category: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="kepala">Kepala</option>
                          <option value="himbauan">Himbauan</option>
                          <option value="peraturan">Peraturan</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={peraturanFormData.order}
                          onChange={(e) => setPeraturanFormData({ ...peraturanFormData, order: parseInt(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                          value={peraturanFormData.status}
                          onChange={(e) => setPeraturanFormData({ ...peraturanFormData, status: e.target.value as 'draft' | 'published' })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Publish</Label>
                        <Input
                          type="date"
                          value={peraturanFormData.publishDate}
                          onChange={(e) => setPeraturanFormData({ ...peraturanFormData, publishDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Judul *</Label>
                      <Input
                        value={peraturanFormData.title}
                        onChange={(e) => setPeraturanFormData({ ...peraturanFormData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Deskripsi</Label>
                      <Textarea
                        value={peraturanFormData.description || ''}
                        onChange={(e) => setPeraturanFormData({ ...peraturanFormData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload PDF *</Label>
                      <FileUpload
                        type="pdf"
                        onUpload={(url, path) => setPeraturanFormData({ ...peraturanFormData, pdfPath: url, pdfUrl: url })}
                        currentFile={peraturanFormData.pdfPath || peraturanFormData.pdfUrl}
                        maxSize={10}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        {editingPeraturan ? 'Update' : 'Simpan'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetPeraturanForm}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Program Tab */}
          <TabsContent value="program" className="space-y-6">
            {!showProgramForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Kelola Program</CardTitle>
                  <CardDescription>Kelola program seperti Mudik Gratis, Beasiswa, dll</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button onClick={() => { resetProgramForm(); setShowProgramForm(true); }} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah Program Baru
                    </Button>
                  </div>

                  {loading ? (
                    <p>Memuat data...</p>
                  ) : programs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Belum ada program.</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {programs.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.order}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.slug}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{item.title}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => { setEditingProgram(item); setProgramFormData(item); setShowProgramForm(true); }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleProgramDelete(item.id!)} className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingProgram ? 'Edit Program' : 'Tambah Program Baru'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProgramSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Slug * (URL)</Label>
                        <Input
                          value={programFormData.slug}
                          onChange={(e) => setProgramFormData({ ...programFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          placeholder="mudik-gratis"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={programFormData.order}
                          onChange={(e) => setProgramFormData({ ...programFormData, order: parseInt(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Kategori</Label>
                        <select
                          value={programFormData.category}
                          onChange={(e) => setProgramFormData({ ...programFormData, category: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="kesejahteraan">Kesejahteraan</option>
                          <option value="pelatihan">Pelatihan</option>
                          <option value="mudik">Mudik</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                          value={programFormData.status}
                          onChange={(e) => setProgramFormData({ ...programFormData, status: e.target.value as any })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Judul *</Label>
                      <Input
                        value={programFormData.title}
                        onChange={(e) => setProgramFormData({ ...programFormData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Deskripsi Singkat *</Label>
                      <Textarea
                        value={programFormData.description}
                        onChange={(e) => setProgramFormData({ ...programFormData, description: e.target.value })}
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Konten Lengkap</Label>
                      <Textarea
                        value={programFormData.content || ''}
                        onChange={(e) => setProgramFormData({ ...programFormData, content: e.target.value })}
                        rows={6}
                        placeholder="Deskripsi lengkap program..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Gambar</Label>
                      <FileUpload
                        type="image"
                        onUpload={(url, path) => setProgramFormData({ ...programFormData, imageUrl: url, imagePath: path })}
                        currentFile={programFormData.imagePath || programFormData.imageUrl}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tanggal Mulai</Label>
                        <Input
                          type="date"
                          value={programFormData.startDate}
                          onChange={(e) => setProgramFormData({ ...programFormData, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Selesai</Label>
                        <Input
                          type="date"
                          value={programFormData.endDate}
                          onChange={(e) => setProgramFormData({ ...programFormData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Link Pendaftaran</Label>
                      <Input
                        value={programFormData.registrationLink || ''}
                        onChange={(e) => setProgramFormData({ ...programFormData, registrationLink: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        {editingProgram ? 'Update' : 'Simpan'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetProgramForm}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Preview All Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview Semua Slider Published</CardTitle>
                <CardDescription>Lihat bagaimana slider akan tampil di halaman utama</CardDescription>
              </CardHeader>
              <CardContent>
                <Slider slides={sliders.filter(s => s.status === 'published').map(s => ({
                  id: s.id || '',
                  title: s.title,
                  highlight: s.highlight,
                  description: s.description,
                  buttonLabel: s.buttonLabel,
                  buttonUrl: s.buttonUrl,
                  cardTitle: s.cardTitle,
                  cardDesc: s.cardDesc,
                  cardTag: s.cardTag,
                  cardLink: s.cardLink,
                  imageUrl: s.imageUrl || s.imagePath,
                  imageOverlay: s.imageOverlay,
                  label: s.label,
                  labelIcon: s.labelIcon,
                }))} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
