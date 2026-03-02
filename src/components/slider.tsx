'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface SliderData {
  id: string;
  title: string;
  highlight: string;
  description: string;
  buttonLabel: string;
  buttonUrl?: string;
  cardTitle: string;
  cardDesc: string;
  cardTag: string;
  cardLink?: string;
  imageUrl?: string;
  imageOverlay?: string;
  label?: string;
  labelIcon?: string;
}

interface SliderProps {
  slides: SliderData[];
}

export default function Slider({ slides }: SliderProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalSlides = slides.length;
  const AUTO_INTERVAL = 5000;

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    if (index === currentSlide) return;
    if (index < 0 || index >= totalSlides) return;

    setIsTransitioning(true);
    setCurrentSlide(index);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 850);
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % totalSlides;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prev);
  };

  useEffect(() => {
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      if (!isTransitioning) {
        const next = (currentSlide + 1) % totalSlides;
        setCurrentSlide(next);
      }
    }, AUTO_INTERVAL);

    return () => clearInterval(interval);
  }, [currentSlide, isTransitioning, totalSlides]);

  const handleButtonClick = (url?: string) => {
    if (url && url !== '#') {
      // Check if it's an internal link (starts with /)
      if (url.startsWith('/')) {
        router.push(url);
      } else {
        // External link - open in new tab
        window.open(url, '_blank');
      }
    } else {
      alert('Info lebih lanjut akan segera tersedia.');
    }
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="banner-modern bg-gradient-to-br from-blue-50 to-slate-100 pb-2.5 pt-5">
      <div className="container mx-auto px-2.5">
        <div className="banner-slider-container relative min-h-[550px] overflow-hidden rounded-3xl">
          <div className="banner-slides relative min-h-[550px]">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              const isPrev = index < currentSlide;
              const isNext = index > currentSlide;

              return (
                <div
                  key={slide.id}
                  className={`banner-slide absolute inset-0 flex items-center justify-between gap-10 p-8 transition-all duration-900 ease-[cubic-bezier(0.165,0.84,0.44,1)] bg-white/20 backdrop-blur-sm rounded-3xl ${
                    isActive
                      ? 'translate-x-0 opacity-100 visible z-10'
                      : isPrev
                        ? '-translate-x-full opacity-0 invisible'
                        : 'translate-x-full opacity-0 invisible'
                  }`}
                >
                  {/* Left Content */}
                  <div className="banner-left flex max-w-[550px] flex-1 flex-col justify-center">
                    {slide.label && (
                      <span className="mb-5 inline-block w-fit rounded-full bg-blue-900/10 px-5.5 py-2 text-sm font-bold tracking-wide text-blue-900 backdrop-blur-[8px] ring-1 ring-blue-400/30">
                        {slide.labelIcon && <span className="mr-2">{slide.labelIcon}</span>}
                        {slide.label}
                      </span>
                    )}
                    <h1 className="mb-5 text-5xl font-extrabold leading-tight text-slate-800">
                      <span className="bg-gradient-to-br from-blue-900 to-blue-600 bg-clip-text text-transparent">
                        {slide.highlight}
                      </span>
                      <br />
                      {slide.title}
                    </h1>
                    <p className="mb-7.5 max-w-[90%] text-lg text-slate-700/95 leading-relaxed">
                      {slide.description}
                    </p>
                    <button
                      onClick={() => handleButtonClick(slide.buttonUrl)}
                      className="btn-elegant inline-flex w-fit items-center gap-3 rounded-full bg-gradient-to-br from-blue-900 to-blue-800 px-8.5 py-3.5 font-semibold text-white shadow-[0_15px_25px_-8px_rgba(44,82,130,0.25)] transition-all duration-300 hover:from-blue-950 hover:to-blue-900 hover:shadow-[0_20px_30px_-8px_rgba(44,82,130,0.4)] hover:-translate-y-0.75 hover:ring-1 hover:ring-white/20"
                    >
                      <span>{slide.buttonLabel}</span>
                      <i className="fas fa-arrow-right transition-transform duration-200 group-hover:translate-x-1.5" />
                    </button>
                  </div>

                  {/* Right Content - Card */}
                  <div className="banner-right flex max-w-[550px] flex-1 items-stretch">
                    <div className="slider-card-container flex w-full flex-col rounded-[32px] bg-white/80 p-4 backdrop-blur-[20px] shadow-[0_25px_40px_-15px_rgba(0,50,100,0.18)] ring-1 ring-white/80">
                      <div className="slider-card flex h-full flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_12px_25px_rgba(0,0,0,0.03)]">
                        <div className="image-wrapper relative h-[150px] w-full overflow-hidden">
                          <div
                            className="slider-image absolute inset-0 transition-transform duration-500 ease-out hover:scale-103"
                            style={{
                              backgroundImage: slide.imageOverlay
                                ? `linear-gradient(145deg, ${slide.imageOverlay}, #1e5a7a), url(${slide.imageUrl})`
                                : `linear-gradient(145deg, #0b3b5c, #1e5a7a), url(${slide.imageUrl})`,
                              backgroundBlendMode: 'overlay, normal',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                          <div className="image-overlay absolute inset-0 z-2 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                          <span className="slide-tag absolute bottom-5 left-5 z-3 inline-block rounded-full bg-white/95 px-5.5 py-2.5 text-sm font-bold text-slate-800 backdrop-blur-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-white/90">
                            {slide.cardTag}
                          </span>
                        </div>
                        <div className="slider-content flex flex-1 flex-col bg-white p-7">
                          <h3 className="slider-title mb-3.5 text-2xl font-extrabold leading-tight text-slate-800">
                            {slide.cardTitle}
                          </h3>
                          <p className="slider-desc mb-5.5 flex-1 text-base text-gray-600 leading-relaxed">
                            {slide.cardDesc}
                          </p>
                          <div className="slider-meta mt-1.5 flex items-center justify-between">
                            <button
                              onClick={() => handleButtonClick(slide.cardLink)}
                              className="slider-link inline-flex items-center gap-2 border-b-2 border-transparent pb-1 text-base font-bold text-blue-900 transition-all hover:border-blue-900 hover:gap-3"
                            >
                              Info & Pendaftaran <i className="fas fa-arrow-right" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="banner-navigation relative z-30 mt-2.5 mb-1.5 flex items-center justify-end gap-4 pr-4">
          <div className="dots mr-2 flex items-center gap-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  index === currentSlide
                    ? 'w-9 rounded-[20px] bg-gradient-to-r from-blue-900 to-blue-400 shadow-[0_0_12px_rgba(44,82,130,0.25)]'
                    : 'w-2.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={prevSlide}
            disabled={isTransitioning || totalSlides <= 1}
            className="nav-btn flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.06)] ring-1 ring-blue-900/10 text-blue-900 transition-all duration-250 hover:bg-blue-900 hover:text-white hover:ring-blue-900 hover:shadow-[0_12px_22px_rgba(44,82,130,0.15)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-chevron-left text-lg" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning || totalSlides <= 1}
            className="nav-btn flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.06)] ring-1 ring-blue-900/10 text-blue-900 transition-all duration-250 hover:bg-blue-900 hover:text-white hover:ring-blue-900 hover:shadow-[0_12px_22px_rgba(44,82,130,0.15)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-chevron-right text-lg" />
          </button>
        </div>
      </div>
    </section>
  );
}
