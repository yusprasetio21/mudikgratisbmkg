'use client';

import { useState, useEffect } from 'react';
import Slider from '@/components/slider';
import type { SliderData } from '@/components/slider';

export default function MudikSlider() {
  const [slides, setSlides] = useState<SliderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/sliders');
      if (response.ok) {
        const data = await response.json();
        // Filter only published sliders with category 'info'
        const publishedSlides = (data || []).filter(
          (slide: any) => slide.status === 'published' && slide.category === 'info'
        );
        setSlides(publishedSlides);
      }
    } catch (error) {
      console.error('Error fetching sliders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p>Memuat informasi...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Belum ada informasi terkini</p>
      </div>
    );
  }

  return <Slider slides={slides} />;
}
