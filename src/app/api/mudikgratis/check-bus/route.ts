import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Require authentication for sensitive data
    requireAuth(request as any);

    const { searchQuery } = await request.json();

    if (!searchQuery || !searchQuery.trim()) {
      return NextResponse.json(
        { error: 'Harap masukkan NIP, Nama, atau Nomor Pendaftaran' },
        { status: 400 }
      );
    }

    // TODO: Connect to Golang backend or database
    // For now, simulate search result
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate searching bus allocation
    // In production, you would:
    // 1. Search for participant by NIP, name, or registration number
    // 2. Check if participant has been verified
    // 3. Return bus allocation details

    // Mock response
    return NextResponse.json({
      success: true,
      data: {
        participantId: 'P-001',
        participantName: 'Ahmad Fauzi',
        searchQuery,
        busNumber: 'B-001',
        destination: 'Semarang',
        date: '15 Mei 2025',
        time: '06:00 WIB',
        seatNumber: 'A-1, A-2',
        totalParticipants: 3,
        participants: 'Ahmad Fauzi + 2 Keluarga',
        status: 'approved',
        pickupPoint: 'Kantor BMKG Pusat',
      }
    });

  } catch (error: any) {
    console.error('Error checking bus allocation:', error);
    
    if (error.message === 'Unauthorized - Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mencari alokasi bus' },
      { status: 500 }
    );
  }
}
