'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import Slider, { SliderData } from '@/components/slider';
import Features from '@/components/features';
import Activities from '@/components/activities';
import Footer from '@/components/footer';

export default function HomePage() {
  const [sliders, setSliders] = useState<SliderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch('/api/sliders?status=published');
        if (response.ok) {
          const data = await response.json();
          setSliders(data);
        }
      } catch (error) {
        console.error('Error fetching sliders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // Fallback data if no sliders exist
  const displaySliders =
    sliders.length > 0
      ? sliders
      : [
          {
            id: 'default-1',
            title: 'BMKG 2026',
            highlight: 'Mudik Gratis',
            description:
              'Program mudik gratis untuk keluarga besar BMKG. Fasilitas lengkap: bus premium, konsumsi, takjil, dan asuransi perjalanan. Rute Jakarta, Semarang, Yogyakarta, Surabaya. Kuota terbatas!',
            buttonLabel: 'Info Lebih Lanjut',
            buttonUrl: '/mudikgratis',
            cardTitle: 'Mudik Gratis BMKG 2026',
            cardDesc:
              'Pendaftaran dibuka 1 Desember 2025. 20 armada bus eksekutif, tersedia makanan, minuman, dan paket lebaran.',
            cardTag: '🚌 Mudik Gratis',
            cardLink: '/mudikgratis',
            imageUrl: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=600',
            imageOverlay: '#0b3b5c, #1e5a7a',
            label: 'PROGRAM PRIORITAS 2026',
            labelIcon: '⚡',
          },
        ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center min-h-[550px]">
            <p>Loading...</p>
          </div>
        ) : (
          <Slider slides={displaySliders} />
        )}
        <Features />
        <Activities />
      </main>
      <Footer />
    </div>
  );
}
