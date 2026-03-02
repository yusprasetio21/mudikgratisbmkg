'use client';

import { useEffect, useState } from 'react';

export default function Features() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/program?status=published');
        if (response.ok) {
          const data = await response.json();
          setPrograms(data.slice(0, 3)); // Show only first 3 programs
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  if (loading) {
    return (
      <section className="features bg-slate-50 py-7.5 px-5">
        <div className="container mx-auto">
          <div className="features-header mb-10 text-center">
            <h2 className="mb-3 text-3xl font-extrabold text-slate-800">
              Kegiatan KORPRI BMKG
            </h2>
            <p className="mx-auto max-w-[600px] text-base text-gray-500">
              Program dan kegiatan terkini untuk anggota KORPRI BMKG
            </p>
          </div>

          <div className="features-grid mt-7.5 grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="feature-card flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-9 transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_35px_rgba(0,0,0,0.06)]"
              >
                <div className="feature-icon mb-5.5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-xl text-blue-400 animate-pulse">
                  ⏳
                </div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="features bg-slate-50 py-7.5 px-5">
      <div className="container mx-auto">
        <div className="features-header mb-10 text-center">
          <h2 className="mb-3 text-3xl font-extrabold text-slate-800">
            Kegiatan KORPRI BMKG
          </h2>
          <p className="mx-auto max-w-[600px] text-base text-gray-500">
            Program dan kegiatan terkini untuk anggota KORPRI BMKG
          </p>
        </div>

        <div className="features-grid mt-7.5 grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          {programs.map((program) => {
            const getIcon = (category: string) => {
              const icons: Record<string, string> = {
                kesejahteraan: '📚',
                pelatihan: '🎓',
                mudik: '🚌',
              };
              return icons[category] || '⭐';
            };

            const getLinkLabel = (category: string) => {
              const labels: Record<string, string> = {
                kesejahteraan: 'Lihat Detail',
                pelatihan: 'Ikut Pelatihan',
                mudik: 'Daftar Sekarang',
              };
              return labels[category] || 'Selengkapnya';
            };

            return (
              <div
                key={program.id}
                className="feature-card flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-9 transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_35px_rgba(0,0,0,0.06)]"
              >
                <div className="feature-icon mb-5.5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-xl text-blue-400">
                  {getIcon(program.category)}
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800 line-clamp-2">
                  {program.title}
                </h3>
                <p className="mb-5.5 flex-grow text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {program.description}
                </p>
                {program.registrationLink ? (
                  <a
                    href={program.registrationLink}
                    className="feature-link mt-auto inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition-all hover:gap-3"
                  >
                    {getLinkLabel(program.category)} <span>→</span>
                  </a>
                ) : (
                  <div className="feature-link mt-auto text-sm text-gray-400">
                    Segera Dibuka
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
