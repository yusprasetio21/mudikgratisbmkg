'use client';

import { useEffect, useState } from 'react';

export default function Activities() {
  const [kegiatan, setKegiatan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const response = await fetch('/api/kegiatan?status=published');
        if (response.ok) {
          const data = await response.json();
          setKegiatan(data.slice(0, 3)); // Show only first 3 kegiatan
        }
      } catch (error) {
        console.error('Error fetching kegiatan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, []);

  const getTagColor = (category: string) => {
    const colors: Record<string, string> = {
      pelatihan: 'bg-blue-50 text-blue-900',
      perlombaan: 'bg-purple-50 text-purple-900',
      olahraga: 'bg-green-50 text-green-900',
      baksos: 'bg-orange-50 text-orange-900',
    };
    return colors[category] || 'bg-gray-50 text-gray-700';
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'TBD';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <section className="activities bg-white py-[60px] px-10">
        <div className="container mx-auto">
          <div className="activities-header mb-10">
            <h2 className="mb-3 text-3xl font-extrabold text-slate-800">
              Informasi Terkini
            </h2>
            <p className="max-w-[600px] text-base text-gray-500">
              Update terbaru seputar kegiatan dan program KORPRI BMKG
            </p>
          </div>

          <div className="activities-grid grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="activity-card flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-slate-50 transition-all duration-300 hover:-translate-y-1.25 hover:shadow-[0_18px_35px_rgba(0,0,0,0.05)]"
              >
                <div className="activity-image relative h-[180px] bg-gradient-to-br from-blue-400 to-blue-900 animate-pulse"></div>
                <div className="activity-content flex flex-grow flex-col p-6">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="activities bg-white py-[60px] px-10">
      <div className="container mx-auto">
        <div className="activities-header mb-10">
          <h2 className="mb-3 text-3xl font-extrabold text-slate-800">
            Informasi Terkini
          </h2>
          <p className="max-w-[600px] text-base text-gray-500">
            Update terbaru seputar kegiatan dan program KORPRI BMKG
          </p>
        </div>

        <div className="activities-grid grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {kegiatan.length > 0 ? (
            kegiatan.map((item) => (
              <div
                key={item.id}
                className="activity-card flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-slate-50 transition-all duration-300 hover:-translate-y-1.25 hover:shadow-[0_18px_35px_rgba(0,0,0,0.05)]"
              >
                <div className="activity-image relative h-[180px] bg-gradient-to-br from-blue-400 to-blue-900">
                  {item.images && JSON.parse(item.images).length > 0 && (
                    <img
                      src={JSON.parse(item.images)[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="activity-content flex flex-grow flex-col p-6">
                  <span className={`mb-3 inline-block self-start rounded-full ${getTagColor(item.category)} px-3.5 py-1 text-xs font-semibold backdrop-blur-[8px]`}>
                    {item.category || 'Kegiatan'}
                  </span>
                  <h3 className="mb-2.5 text-lg font-bold text-slate-800 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="mb-4.5 flex-grow text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                  <div className="activity-meta mt-auto flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(item.date)}</span>
                    {item.location && (
                      <span>• {item.location}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Belum ada kegiatan yang tersedia
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
