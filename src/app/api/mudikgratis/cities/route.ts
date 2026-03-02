import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const DUMMY_CITIES = [
  { id: '1', name: 'Jakarta', province: 'DKI Jakarta', description: 'Pusat', isActive: true },
  { id: '2', name: 'Bandung', province: 'Jawa Barat', description: 'Kota Kembang', isActive: true },
  { id: '3', name: 'Semarang', province: 'Jawa Tengah', description: 'Kota Lumpia', isActive: true },
  { id: '4', name: 'Yogyakarta', province: 'D.I. Yogyakarta', description: 'Kota Pelajar', isActive: true },
  { id: '5', name: 'Surabaya', province: 'Jawa Timur', description: 'Kota Pahlawan', isActive: true },
];

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/mudikgratis/cities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to fetch cities' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching cities:', error);
    // Return dummy data if backend is not available
    return NextResponse.json({ data: DUMMY_CITIES });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/mudikgratis/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to create city' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
