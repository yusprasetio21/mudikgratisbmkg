'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Bus, Briefcase, HeartHandshake, RefreshCw, Search, MapPin, Armchair, ArrowRight, Calendar, ShieldCheck, TrendingUp, ChevronRight, Sparkles, FileText, Bus as BusIcon } from 'lucide-react';

export default function MudikGratisPage() {
  const [summary, setSummary] = useState<any>({
    totalCities: 15,
    totalBuses: 15,
    totalParticipants: 15,
    totalAvailable: 570,
  });
  const [settings, setSettings] = useState({
    eventTitle: 'MUDIK GRATIS KORPRI BMKG 2026',
    eventActive: true,
    showReregBanner: true,
    showBusCheckBanner: true,
  });
  const [loading, setLoading] = useState(false);

  // Auto-refresh settings every 5 seconds
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRes = await fetch('/api/mudikgratis/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData.data || settings);
        }
      } catch (e) {
        console.log('Using fallback settings');
      }
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        try {
          const summaryRes = await fetch('/api/mudikgratis/summary');
          if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            setSummary(summaryData.data || summary);
          }
        } catch (e) {
          console.log('Using fallback summary data');
        }

        try {
          const settingsRes = await fetch('/api/mudikgratis/settings');
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            setSettings(settingsData.data || settings);
          }
        } catch (e) {
          console.log('Using fallback settings');
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full relative z-10">
        {/* Elegant Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full border border-gray-200/50 shadow-sm mb-8 hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">KORPRI BMKG</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
            {settings.eventTitle}
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Program mudik gratis eksklusif untuk ASN dan Non-ASN dengan kenyamanan maksimal
          </p>

          {/* Quick Stats */}
        </div>


        {/* Registration Card with Glass Effect */}
        {settings.eventActive && (
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/70 rounded-3xl shadow-lg shadow-gray-200/50 mb-8 overflow-hidden hover:shadow-xl hover:shadow-gray-300/60 transition-all duration-500 hover:scale-[1.01]">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-violet-50/50 to-indigo-50/50 border-b border-gray-200/70">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/20 hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Pendaftaran Peserta</CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Silakan pilih kategori pendaftaran sesuai status kepegawaian Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <GlassRegisterOption
                  title="ASN"
                  subtitle="Aparatur Sipil Negara"
                  icon={<Briefcase className="w-6 h-6" />}
                  href="/mudikgratis/register/asn"
                  gradient="from-indigo-600 to-violet-600"
                  bgGradient="from-indigo-50 to-violet-50"
                />
                <GlassRegisterOption
                  title="Non-ASN"
                  subtitle="Honorer & Kontrak"
                  icon={<HeartHandshake className="w-6 h-6" />}
                  href="/mudikgratis/register/non-asn"
                  gradient="from-teal-600 to-cyan-600"
                  bgGradient="from-teal-50 to-cyan-50"
                />
              </div>
            </CardContent>
          </div>
        )}

        {/* Wide Action Banners - Same size as Registration Card */}
        {settings.showReregBanner && (
          <ActionBannerCard
            icon={<RefreshCw className="w-7 h-7" />}
            title="Daftar Ulang"
            description="Konfirmasi kehadiran Anda untuk keberangkatan mudik"
            buttonText="Mulai Daftar Ulang"
            href="/mudikgratis/confirmation"
            className="mb-4"
            gradient="from-violet-600 to-indigo-600"
            bgGradient="from-violet-50 to-indigo-50"
            iconBg={<FileText className="w-48 h-48" />}
            sideGradient="from-violet-600 to-indigo-600"
            iconColor="violet-200"
          />
        )}

        {settings.showBusCheckBanner && (
          <ActionBannerCard
            icon={<Search className="w-7 h-7" />}
            title="Cek Bus"
            description="Lihat alokasi bus dan jadwal keberangkatan"
            buttonText="Cek Sekarang"
            href="/mudikgratis/check-bus"
            gradient="from-emerald-600 to-teal-600"
            bgGradient="from-emerald-50 to-teal-50"
            iconBg={<BusIcon className="w-48 h-48" />}
            sideGradient="from-emerald-600 to-teal-600"
            iconColor="emerald-200"
          />
        )}

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 pt-8">
          <GlassFeatureCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Terpercaya"
            description="Program resmi KORPRI BMKG dengan keamanan dan kenyamanan terjamin"
            gradient="from-indigo-600 to-violet-600"
            bgGradient="from-indigo-50/60 to-violet-50/60"
          />
          <GlassFeatureCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Mudah & Cepat"
            description="Proses pendaftaran dan verifikasi yang sederhana dan efisien"
            gradient="from-teal-600 to-cyan-600"
            bgGradient="from-teal-50/60 to-cyan-50/60"
          />
          <GlassFeatureCard
            icon={<Bus className="w-5 h-5" />}
            title="Armada Nyaman"
            description="Bus modern dengan fasilitas lengkap untuk perjalanan nyaman"
            gradient="from-violet-600 to-purple-600"
            bgGradient="from-violet-50/60 to-purple-50/60"
          />
        </div>
      </div>
    </div>
  );
}

// Glass Stat Card Component
function GlassStatCard({ icon, value, label, gradient }: {
  icon: React.ReactNode,
  value: number,
  label: string,
  gradient: string
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/70 shadow-lg shadow-gray-200/40 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300"></div>
      <div className="relative p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <span className="text-white text-sm md:text-base">{icon}</span>
          </div>
        </div>
        <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1 tracking-tight">
          {value}
        </div>
        <p className="text-xs md:text-sm font-semibold text-slate-600">
          {label}
        </p>
      </div>
    </div>
  );
}

// Glass Register Option Component
function GlassRegisterOption({ title, subtitle, icon, href, gradient, bgGradient }: {
  title: string,
  subtitle: string,
  icon: React.ReactNode,
  href: string,
  gradient: string,
  bgGradient: string
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-full p-4 md:p-6 rounded-2xl bg-gradient-to-br bg-white/70 backdrop-blur-md border border-gray-200/70 hover:shadow-xl hover:shadow-gray-300/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50 rounded-2xl`}></div>

        {/* Decorative gradient overlay */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 group-hover:opacity-10 transition-all duration-500`}></div>

        <div className="relative z-10">
          <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
              <span className="text-white text-sm md:text-base">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{title}</h3>
              <p className="text-xs md:text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>
          <Button
            className={`w-full bg-gradient-to-r ${gradient} hover:shadow-lg hover:shadow-current/30 text-white font-semibold py-2.5 md:py-3 rounded-xl border border-white/50 transition-all duration-300`}
          >
            Daftar Sekarang
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

// Action Banner Card - Same structure as Registration Card
function ActionBannerCard({ icon, title, description, buttonText, href, className, gradient, bgGradient, iconBg, sideGradient, iconColor }: {
  icon: React.ReactNode,
  title: string,
  description: string,
  buttonText: string,
  href: string,
  className?: string,
  gradient: string,
  bgGradient: string,
  iconBg: React.ReactNode,
  sideGradient: string,
  iconColor: string
}) {
  return (
    <Link href={href} className={`group block ${className || ''}`}>
      <div className={`bg-white/80 backdrop-blur-xl border border-gray-200/70 rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-gray-300/60 transition-all duration-500 hover:scale-[1.01]`}>
        <CardHeader className={`relative pb-4 md:pb-6 text-center bg-gradient-to-br ${bgGradient} border-b border-gray-200/70 overflow-hidden`}>
          {/* Transparent logo background - hidden on mobile */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden md:block">
            <div className={iconColor === 'violet-200' ? 'text-violet-200' : 'text-emerald-200'}>
              {iconBg}
            </div>
          </div>

          {/* Decorative gradient side */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${sideGradient} rounded-l-2xl`}></div>

          <div className="relative z-10">
            <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${gradient} rounded-2xl mb-3 md:mb-4 shadow-lg shadow-current/20 hover:scale-110 transition-transform duration-300`}>
              <span className="text-white text-sm md:text-base">{icon}</span>
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
              {title}
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-slate-600">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Button
            className={`w-full bg-gradient-to-r ${gradient} hover:shadow-lg hover:shadow-current/30 text-white font-semibold py-3 rounded-xl border-2 border-white/50 transition-all duration-300`}
          >
            {buttonText}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </div>
    </Link>
  );
}

// Wide Action Banner Component
function WideActionBanner({ icon, title, description, buttonText, href, className, gradient, bgGradient, iconBg, sideGradient, iconColor }: {
  icon: React.ReactNode,
  title: string,
  description: string,
  buttonText: string,
  href: string,
  className?: string,
  gradient: string,
  bgGradient: string,
  iconBg: React.ReactNode,
  sideGradient: string,
  iconColor: string
}) {
  return (
    <Link href={href} className={`group block w-full ${className || ''}`}>
      <div className={`relative bg-gradient-to-br ${bgGradient} backdrop-blur-xl rounded-2xl border border-gray-200/70 hover:shadow-2xl hover:shadow-gray-300/60 hover:scale-[1.01] transition-all duration-300 overflow-hidden`}>
        {/* Transparent logo background - larger */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
          <div className={`text-${iconColor}`}>
            {iconBg}
          </div>
        </div>

        {/* Decorative gradient side */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${sideGradient} rounded-l-2xl`}></div>

        <CardContent className="p-10 pl-12 relative z-10">
          <div className="flex items-center gap-8">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-xl shadow-current/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
              <span className="text-white">{icon}</span>
            </div>
            <div className="flex-1 min-w-0 pr-48">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>
            <Button
              className={`shrink-0 bg-gradient-to-r ${gradient} hover:shadow-xl hover:shadow-current/40 text-white font-bold px-10 py-4 rounded-xl border-2 border-white/50 text-lg transition-all duration-300`}
            >
              {buttonText}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Link>
  );
}

// Glass Feature Card Component
function GlassFeatureCard({ icon, title, description, gradient, bgGradient }: {
  icon: React.ReactNode,
  title: string,
  description: string,
  gradient: string,
  bgGradient: string
}) {
  return (
    <div className="relative bg-gradient-to-br bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/70 p-4 md:p-6 text-center hover:shadow-xl hover:shadow-gray-300/50 hover:scale-[1.02] transition-all duration-300 group">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50 rounded-2xl`}></div>

      <div className="relative z-10">
        <div className={`w-12 h-12 md:w-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <span className="text-white text-sm md:text-base">{icon}</span>
        </div>
        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
