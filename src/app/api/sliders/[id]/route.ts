import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

// GET /api/sliders/[id] - Proxy to Golang API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.get(`/sliders/${params.id}`);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch slider' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching slider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slider' },
      { status: 500 }
    );
  }
}

// PUT /api/sliders/[id] - Proxy to Golang API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const response = await api.put(`/sliders/${params.id}`, body);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to update slider' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating slider:', error);
    return NextResponse.json(
      { error: 'Failed to update slider' },
      { status: 500 }
    );
  }
}

// DELETE /api/sliders/[id] - Proxy to Golang API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.delete(`/sliders/${params.id}`);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to delete slider' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slider:', error);
    return NextResponse.json(
      { error: 'Failed to delete slider' },
      { status: 500 }
    );
  }
}
