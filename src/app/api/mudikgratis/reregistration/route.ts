import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Require authentication for sensitive operations
    requireAuth(request as any);

    const { searchQuery } = await request.json();

    if (!searchQuery || !searchQuery.trim()) {
      return NextResponse.json(
        { error: 'Harap masukkan NIP, Nama, atau Nomor Pendaftaran' },
        { status: 400 }
      );
    }

    // TODO: Connect to Golang backend or database
    // For now, simulate success
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate checking participant
    // In production, you would:
    // 1. Search for participant by NIP, name, or registration number
    // 2. Check if already re-registered
    // 3. Create re-registration record
    // 4. Update participant status

    return NextResponse.json({
      success: true,
      message: 'Berhasil mendaftar ulang',
      data: {
        id: 'RR-' + Date.now(),
        participantId: 'P-001',
        searchQuery,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Error processing reregistration:', error);
    
    if (error.message === 'Unauthorized - Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses daftar ulang' },
      { status: 500 }
    );
  }
}
