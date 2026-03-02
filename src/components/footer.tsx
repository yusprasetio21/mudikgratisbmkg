'use client';

export default function Footer() {
  return (
    <footer className="footer bg-slate-900 py-[50px] px-10 text-white">
      <div className="container mx-auto">
        <div className="footer-content mb-7.5 flex flex-wrap items-start justify-between gap-10">
          {/* Logo & Description */}
          <div className="footer-info">
            <div className="logo-container mb-3.75 flex items-center">
              <div className="logo-bmkg flex items-center justify-center">
                <img
                  src="/logoBMKG-putih.png"
                  alt="BMKG"
                  className="h-11 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<div class="bg-blue-500 text-white px-3 py-2 rounded-lg font-bold">BMKG</div>';
                    }
                  }}
                />
              </div>
              <span className="footer-logo-text ml-2.5 text-xl font-extrabold text-white">
                KORPRI BMKG
              </span>
            </div>
            <p className="footer-description max-w-[300px] text-sm text-slate-300 leading-relaxed">
              Wadah bagi Pegawai Negeri Sipil di lingkungan BMKG untuk meningkatkan
              solidaritas, kompetensi, dan kesejahteraan.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links flex flex-col gap-3">
            <h4 className="mb-2.5 text-base font-semibold text-white">Quick Links</h4>
            <a href="/" className="text-sm text-slate-300 transition-colors hover:text-blue-400">Beranda</a>
            <a href="/mudikgratis" className="text-sm text-emerald-300 transition-colors hover:text-emerald-400 font-medium">Mudik Gratis</a>
            <a href="/kegiatan" className="text-sm text-slate-300 transition-colors hover:text-blue-400">Kegiatan</a>
            <a href="/peraturan" className="text-sm text-slate-300 transition-colors hover:text-blue-400">Peraturan</a>
            <a href="/program" className="text-sm text-slate-300 transition-colors hover:text-blue-400">Program</a>
            <a
              href="/admin"
              className="text-sm text-slate-300 transition-colors hover:text-blue-400 font-medium"
            >
              Admin Panel
            </a>
          </div>

          {/* Contact */}
          <div className="footer-contact flex flex-col gap-3">
            <h4 className="mb-2.5 text-base font-semibold text-white">Kontak</h4>
            <div className="contact-item flex items-center gap-2.5 text-sm text-slate-300">
              <span>📍</span>
              <span>Jl. Angkasa I No.2, Jakarta</span>
            </div>
            <div className="contact-item flex items-center gap-2.5 text-sm text-slate-300">
              <span>📞</span>
              <span>(021) 4246321</span>
            </div>
            <div className="contact-item flex items-center gap-2.5 text-sm text-slate-300">
              <span>✉️</span>
              <span>korpri@bmkg.go.id</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom border-t border-slate-700 pt-6 text-center text-xs text-slate-400">
          <p>© 2024 KORPRI BMKG. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
