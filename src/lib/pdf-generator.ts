import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, PageSizes } from 'jspdf-autotable';

interface ReportData {
  totalParticipants: number;
  totalASNs: number;
  totalNonASNs: number;
  totalCities: number;
  totalBuses: number;
  totalAvailable: number;
  totalBooked: number;
  cities: {
    name: string;
    totalParticipants: number;
    totalASNs: number;
    totalNonASNs: number;
    participants: {
      name: string;
      participantType: string;
      familyMembers: number;
      totalPeople: number;
    }[];
  }[];
}

export async function generateSponsorReport(data: ReportData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ========== HALAMAN 1: GRAFIK ==========
  doc.setFontSize(18, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PROPOSAL PROGRAM MUDIK GRATIS KORPRI BMKG 2025', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Laporan Proposal Pendanaan', pageWidth / 2, 30, { align: 'center' });
  
  const currentDate = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Tanggal: ${currentDate}`, pageWidth / 2, 38, { align: 'center' });

  // Garis pemisah
  doc.setLineWidth(0.5);
  doc.line(20, 45, pageWidth - 20, 45);

  // Ringkasan Statistik
  doc.setFontSize(14, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('RINGKASAN STATISTIK', 20, 55);

  // Statistik Cards
  const startY = 65;
  const cardWidth = (pageWidth - 40) / 4;
  const cardHeight = 50;

  // Total Peserta
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(20, startY, cardWidth, cardHeight, 3);
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(20, startY, cardWidth, cardHeight, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10, 'normal');
  doc.text('Total Peserta', 20 + cardWidth / 2, startY + 12, { align: 'center' });
  doc.setFontSize(20, 'bold');
  doc.text(`${data.totalParticipants}`, 20 + cardWidth / 2, startY + 28, { align: 'center' });

  // Total Kota
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(20 + cardWidth + 5, startY, cardWidth, cardHeight, 3);
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(20 + cardWidth + 5, startY, cardWidth, cardHeight, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10, 'normal');
  doc.text('Kota Tujuan', 20 + cardWidth + 5 + cardWidth / 2, startY + 12, { align: 'center' });
  doc.setFontSize(20, 'bold');
  doc.text(`${data.totalCities}`, 20 + cardWidth + 5 + cardWidth / 2, startY + 28, { align: 'center' });

  // Total Bus
  doc.setFillColor(124, 58, 237);
  doc.roundedRect(20 + (cardWidth + 5) * 2, startY, cardWidth, cardHeight, 3);
  doc.setFillColor(124, 58, 237);
  doc.roundedRect(20 + (cardWidth + 5) * 2, startY, cardWidth, cardHeight, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10, 'normal');
  doc.text('Armada Bus', 20 + (cardWidth + 5) * 2 + cardWidth / 2, startY + 12, { align: 'center' });
  doc.setFontSize(20, 'bold');
  doc.setText(data.totalBuses.toString(), 20 + (cardWidth + 5) * 2 + cardWidth / 2, startY + 28, { align: 'center' });

  // Kursi Tersedia
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(20 + (cardWidth + 5) * 3, startY, cardWidth, cardHeight, 3);
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(20 + (cardWidth + 5) * 3, startY, cardWidth, cardHeight, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10, 'normal');
  doc.text('Kursi Tersedia', 20 + (cardWidth + 5) * 3 + cardWidth / 2, startY + 12, { align: 'center' });
  doc.setFontSize(20, 'bold');
  doc.setText(data.totalAvailable.toString(), 20 + (cardWidth + 5) * 3 + cardWidth / 2, startY + 28, { align: 'center' });

  // Pie Chart: ASN vs Non-ASN
  doc.setFontSize(14, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('DISTRIBUSI PESERTA (ASN vs Non-ASN)', 20, 130);

  const pieChartX = pageWidth / 2;
  const pieChartY = 200;
  const pieChartRadius = 50;

  const asnPercentage = data.totalParticipants > 0 ? (data.totalASNs / data.totalParticipants) * 100 : 0;
  const nonAsnPercentage = data.totalParticipants > 0 ? (data.totalNonASNs / data.totalParticipants) * 100 : 0;

  // Draw Pie Chart
  const startAngle = 0;
  const asnAngle = (asnPercentage / 100) * 2 * Math.PI;
  const nonAsnAngle = (nonAsnPercentage / 100) * 2 * Math.PI;

  // ASN Slice (Blue)
  doc.setFillColor(59, 130, 246);
  doc.circle(pieChartX, pieChartY, pieChartRadius, startAngle, startAngle + asnAngle, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10, 'normal');
  const asnMidAngle = startAngle + asnAngle / 2;
  doc.text(
    `ASN (${asnPercentage.toFixed(1)}%)`,
    pieChartX + Math.cos(asnMidAngle) * (pieChartRadius + 30),
    pieChartY + Math.sin(asnMidAngle) * (pieChartRadius + 30),
    { align: 'center' }
  );

  // Non-ASN Slice (Green)
  const nonAsnStartAngle = startAngle + asnAngle;
  doc.setFillColor(16, 185, 129);
  doc.circle(pieChartX, pieChartY, pieChartRadius, nonAsnStartAngle, nonAsnStartAngle + nonAsnAngle, 'F');
  doc.setTextColor(0, 0, 0);
  const nonAsnMidAngle = nonAsnStartAngle + nonAsnAngle / 2;
  doc.text(
    `Non-ASN (${nonAsnPercentage.toFixed(1)}%)`,
    pieChartX + Math.cos(nonAsnMidAngle) * (pieChartRadius + 30),
    pieChartY + Math.sin(nonAsnMidAngle) * (pieChartRadius + 30),
    { align: 'center' }
  );

  // Legend
  doc.setFontSize(10, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(59, 130, 246);
  doc.rect(pageWidth - 140, 180, 10, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9, 'normal');
  doc.text('ASN', pageWidth - 140, 183, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(16, 185, 129);
  doc.rect(pageWidth - 80, 180, 10, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9, 'normal');
  doc.text('Non-ASN', pageWidth - 80, 183, { align: 'center' });

  // Bar Chart: Peserta per Kota
  doc.setFontSize(14, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('JUMLAH PESERTA PER KOTA TUJUAN', 20, 270);

  const chartStartY = 300;
  const chartHeight = 60;
  const chartLeft = 40;
  const chartWidth = pageWidth - 80;
  const barHeight = 30;
  const maxParticipants = Math.max(...data.cities.map(c => c.totalParticipants), 10);

  data.cities.forEach((city, index) => {
    const y = chartStartY + index * (barHeight + 10);
    const barWidth = (city.totalParticipants / maxParticipants) * (chartWidth - 100);
    const x = chartLeft + 70;

    // City name
    doc.setFontSize(9, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(city.name, chartLeft, y + barHeight / 2, { align: 'right' });

    // Bar
    const gradientColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'];
    doc.setFillColor(gradientColors[index % gradientColors.length]);
    doc.roundedRect(x, y, barWidth, barHeight, 2);
    doc.setFillColor(gradientColors[index % gradientColors.length]);
    doc.roundedRect(x, y, barWidth, barHeight, 2, 'F');

    // Count
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9, 'normal');
    doc.text(`${city.totalParticipants} peserta`, x + barWidth + 5, y + barHeight / 2, { align: 'left' });

    // ASN/Non-ASN breakdown
    if (city.totalParticipants > 0) {
      const cityAsnPct = (city.totalASNs / city.totalParticipants) * 100;
      doc.setFontSize(8, 'normal');
      doc.setTextColor(59, 130, 246);
      doc.text(`ASN: ${city.totalASNs} (${cityAsnPct.toFixed(1)}%)`, x + barWidth + 5, y + barHeight / 2 - 6, { align: 'left' });
      doc.setTextColor(16, 150, 100);
      doc.text(`Non-ASN: ${city.totalNonASNs} (${(100 - cityAsnPct).toFixed(1)}%)`, x + barWidth + 5, y + barHeight / 2 + 6, { align: 'left' });
    }
  });

  // ========== HALAMAN 2+: LIST PESERTA PER KOTA ==========
  data.cities.forEach((city, cityIndex) => {
    // Check if we need a new page
    if (cityIndex > 0) {
      doc.addPage();
    }

    // Page Header
    doc.setFontSize(16, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`DETAIL PESERTA: ${city.name.toUpperCase()}`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(11, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Peserta: ${city.totalParticipants} | ASN: ${city.totalASNs} | Non-ASN: ${city.totalNonASNs}`, pageWidth / 2, 28, { align: 'center' });

    // Garis pemisah
    doc.setLineWidth(0.5);
    doc.line(20, 35, pageWidth - 20, 35);

    // Table header
    const tableData = city.participants.map((p, idx) => [
      idx + 1,
      p.name,
      p.participantType,
      p.familyMembers,
      p.totalPeople,
    ]);

    const tableColumnStyles = {
      0: { cellWidth: 25, cellStyle: { halign: 'center' }, fontStyle: 'bold' },
      1: { cellWidth: 'auto', cellStyle: { fontStyle: 'bold' } },
      2: { cellWidth: 30, cellStyle: { halign: 'center' } },
      3: { cellWidth: 25, cellStyle: { halign: 'center' } },
      4: { cellWidth: 25, cellStyle: { halign: 'center' } },
    };

    autoTable(doc, {
      head: [['No', 'Nama Peserta', 'Tipe', 'Jml Keluarga', 'Total']],
      body: tableData,
      startY: 45,
      styles: {
        headStyles: { fillColor: [59, 130, 246] },
        headCellStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold' },
        cellStyles: {
          fontSize: 9,
          cellPadding: 2,
          valign: 'middle',
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        alternateRowStyles: { fillColor: [240, 247, 255], },
      },
      columnStyles: tableColumnStyles,
      margin: { top: 0, left: 20, right: 20, bottom: 20 },
      didDrawPage: (data) => {
        // Page footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Halaman ${data.pageNumber} dari ${data.pagesCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      },
    });
  });

  // Footer di halaman terakhir
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(9, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Halaman ' + pageCount, pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.setFontSize(8, 'italic');
  doc.text('© 2025 KORPRI BMKG - Program Mudik Gratis', pageWidth / 2, pageHeight - 8, { align: 'center' });

  return doc.output('blob');
}
