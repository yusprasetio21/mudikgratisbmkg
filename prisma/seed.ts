import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.slider.deleteMany();
  await prisma.kegiatan.deleteMany();
  await prisma.peraturan.deleteMany();
  await prisma.program.deleteMany();

  // Create Sliders
  console.log('📊 Creating sliders...');
  const sliders = [
    {
      category: 'info',
      title: 'BMKG 2026',
      highlight: 'Mudik Gratis',
      description: 'Program mudik gratis untuk keluarga besar BMKG. Fasilitas lengkap: bus premium, konsumsi, takjil, dan asuransi perjalanan. Rute Jakarta, Semarang, Yogyakarta, Surabaya. Kuota terbatas!',
      buttonLabel: 'Info Lebih Lanjut',
      buttonUrl: '/mudikgratis',
      cardTitle: 'Mudik Gratis BMKG 2026',
      cardDesc: 'Pendaftaran dibuka 1 Desember 2025. 20 armada bus eksekutif, tersedia makanan, minuman, dan paket lebaran.',
      cardTag: '🚌 Mudik Gratis',
      cardLink: '/mudikgratis',
      imageUrl: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=600',
      imageOverlay: '#0b3b5c, #1e5a7a',
      label: 'PROGRAM PRIORITAS 2026',
      labelIcon: '⚡',
      order: 1,
      status: 'published',
    },
    {
      category: 'kegiatan',
      title: 'Hari KORPRI ke-53',
      highlight: 'Peringatan Spesial',
      description: 'Rangkaian kegiatan spesial memperingati Hari KORPRI dengan seminar, lomba, dan hiburan untuk semua anggota.',
      buttonLabel: 'Lihat Jadwal',
      buttonUrl: '/kegiatan',
      cardTitle: 'Hari KORPRI ke-53',
      cardDesc: '29 November 2024 - Ayo merayakan Hari KORPRI bersama keluarga besar BMKG dengan berbagai kegiatan menarik.',
      cardTag: '🎉 Acara Spesial',
      cardLink: '/kegiatan',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      imageOverlay: '#1e40af, #3b82f6',
      label: 'ACARA BESAR',
      labelIcon: '🎊',
      order: 2,
      status: 'published',
    },
  ];

  for (const slider of sliders) {
    await prisma.slider.create({ data: slider });
  }
  console.log(`✅ Created ${sliders.length} sliders`);

  // Create Kegiatan
  console.log('🎯 Creating kegiatan...');
  const kegiatanList = [
    {
      title: 'Pelatihan Leadership ASN',
      description: 'Program pengembangan kepemimpinan untuk ASN tingkat pertama dan menengah dengan narasumber ahli. Meningkatkan kemampuan manajerial dan kepemimpinan organisasi.',
      category: 'pelatihan',
      date: new Date('2025-03-15'),
      location: 'Aula Serbaguna BMKG Pusat',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
      ]),
      videoUrl: '',
      status: 'published',
      order: 1,
    },
    {
      title: 'Turnamen Bulutangis KORPRI',
      description: 'Kompetisi bulutangis antar unit kerja untuk mempererat silaturahmi dan sportivitas. Terbuka untuk semua anggota KORPRI BMKG.',
      category: 'perlombaan',
      date: new Date('2025-04-20'),
      location: 'GOR BMKG Pusat',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600',
      ]),
      videoUrl: '',
      status: 'published',
      order: 2,
    },
    {
      title: 'Seminar Kesehatan & Keselamatan Kerja',
      description: 'Workshop tentang keselamatan dan kesehatan kerja untuk pegawai. Dapatkan tips praktis untuk menjaga kesehatan di tempat kerja.',
      category: 'olahraga',
      date: new Date('2025-05-10'),
      location: 'Ruang Rapat Utama',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
      ]),
      videoUrl: '',
      status: 'published',
      order: 3,
    },
    {
      title: 'Bakti Sosial PMI',
      description: 'Kegiatan donor darah dan sosialisasi kesehatan bersama PMI untuk masyarakat sekitar kantor BMKG.',
      category: 'baksos',
      date: new Date('2025-06-01'),
      location: 'Halaman Depan Kantor BMKG',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600',
      ]),
      videoUrl: '',
      status: 'published',
      order: 4,
    },
  ];

  for (const kegiatan of kegiatanList) {
    await prisma.kegiatan.create({ data: kegiatan });
  }
  console.log(`✅ Created ${kegiatanList.length} kegiatan`);

  // Create Peraturan
  console.log('📋 Creating peraturan...');
  const peraturanList = [
    {
      title: 'Peraturan Pemakaian Seragam Dinas 2025',
      description: 'Peraturan terbaru mengenai ketentuan penggunaan seragam dinas KORPRI BMKG tahun 2025. Berisi aturan warna, model, dan hari penggunaan.',
      category: 'kepala',
      pdfPath: '/uploads/peraturan/seragam-2025.pdf',
      pdfUrl: 'https://example.com/seragam-2025.pdf',
      publishDate: new Date('2025-01-15'),
      status: 'published',
      order: 1,
    },
    {
      title: 'Himbauan Disiplin Kerja ASN',
      description: 'Himbauan tentang pentingnya disiplin kerja, ketepatan waktu, dan profesionalisme dalam menjalankan tugas sebagai ASN.',
      category: 'himbauan',
      pdfPath: '/uploads/peraturan/disiplin-kerja.pdf',
      pdfUrl: 'https://example.com/disiplin-kerja.pdf',
      publishDate: new Date('2025-02-01'),
      status: 'published',
      order: 2,
    },
    {
      title: 'Panduan Pelaksanaan Cuti Pegawai',
      description: 'Panduan lengkap mengenai jenis cuti, prosedur pengajuan, dan ketentuan pelaksanaan cuti bagi pegawai BMKG.',
      category: 'peraturan',
      pdfPath: '/uploads/peraturan/panduan-cuti.pdf',
      pdfUrl: 'https://example.com/panduan-cuti.pdf',
      publishDate: new Date('2025-02-15'),
      status: 'published',
      order: 3,
    },
  ];

  for (const peraturan of peraturanList) {
    await prisma.peraturan.create({ data: peraturan });
  }
  console.log(`✅ Created ${peraturanList.length} peraturan`);

  // Create Programs
  console.log('🌟 Creating programs...');
  const programList = [
    {
      slug: 'bantuan-kesejahteraan-anggota',
      title: 'Bantuan Kesejahteraan Anggota',
      description: 'Program bantuan dan fasilitas untuk meningkatkan kesejahteraan anggota KORPRI BMKG yang membutuhkan. Termasuk bantuan kesehatan, pendidikan, dan lainnya.',
      category: 'kesejahteraan',
      imageUrl: 'https://images.unsplash.com/photo-1532619333905-0b8462a384ec?w=600',
      content: 'Program bantuan kesejahteraan ini bertujuan untuk membantu anggota KORPRI BMKG yang mengalami kesulitan. Bantuan mencakup berbagai aspek seperti kesehatan, pendidikan anak, dan kebutuhan dasar lainnya.',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      registrationLink: '/program/bantuan-kesejahteraan',
      status: 'published',
      order: 1,
    },
    {
      slug: 'program-pelatihan-kompetensi',
      title: 'Program Pelatihan Kompetensi',
      description: 'Program pelatihan dan pengembangan kompetensi berkala untuk meningkatkan keterampilan dan pengetahuan anggota KORPRI BMKG.',
      category: 'pelatihan',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
      content: 'Program pelatihan kompetensi menyediakan berbagai kursus dan workshop berkala untuk meningkatkan kemampuan profesional anggota. Materi mencakup teknis meteorologi, manajemen, kepemimpinan, dan lainnya.',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-12-31'),
      registrationLink: '/program/pelatihan',
      status: 'published',
      order: 2,
    },
    {
      slug: 'mudik-gratis-2025',
      title: 'Mudik Gratis 2025',
      description: 'Program mudik gratis untuk keluarga besar BMKG. Fasilitas lengkap dengan bus eksekutif, makanan, dan asuransi perjalanan.',
      category: 'mudik',
      imageUrl: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=600',
      content: 'Program mudik gratis BMKG 2025 menyediakan 20 armada bus eksekutif untuk rute Jakarta, Semarang, Yogyakarta, dan Surabaya. Setiap peserta mendapatkan fasilitas makan, minuman, takjil, asuransi perjalanan, dan paket lebaran.',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-10'),
      registrationLink: '/mudikgratis',
      status: 'published',
      order: 3,
    },
  ];

  for (const program of programList) {
    await prisma.program.create({ data: program });
  }
  console.log(`✅ Created ${programList.length} programs`);

  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - Sliders: ${sliders.length}`);
  console.log(`  - Kegiatan: ${kegiatanList.length}`);
  console.log(`  - Peraturan: ${peraturanList.length}`);
  console.log(`  - Programs: ${programList.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
