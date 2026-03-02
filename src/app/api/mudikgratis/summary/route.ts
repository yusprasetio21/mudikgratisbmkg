import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/mudikgratis/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to fetch mudikgratis summary' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching mudikgratis summary:', error);
    // Return dummy data if backend is not available
    const dummyData = {
      data: {
        totalCities: 15,
        totalBuses: 15,
        totalParticipants: 15,
        totalASNs: 10,
        totalNonASNs: 5,
        totalAvailable: 570,
        totalBooked: 30,
      }
    };
    return NextResponse.json(dummyData);
  }
}
