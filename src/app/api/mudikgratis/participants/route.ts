import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function GET(request: NextRequest) {
  try {
    // Require authentication for sensitive data
    requireAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const busId = searchParams.get('busId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    let url = `${API_BASE_URL}/mudikgratis/participants`;
    const params = new URLSearchParams();
    if (busId) params.append('busId', busId);
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to fetch participants' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    
    if (error.message === 'Unauthorized - Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication for creating participant
    requireAuth(request);

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/mudikgratis/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to create participant' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating participant:', error);
    
    if (error.message === 'Unauthorized - Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
