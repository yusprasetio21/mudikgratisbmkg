import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

// PATCH /api/sliders/[id]/status - Proxy to Golang API
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const response = await api.patch(`/sliders/${params.id}/status`, body);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to update slider status' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating slider status:', error);
    return NextResponse.json(
      { error: 'Failed to update slider status' },
      { status: 500 }
    );
  }
}
