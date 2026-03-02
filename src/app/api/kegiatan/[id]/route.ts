import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

// GET /api/kegiatan/[id] - Proxy to Golang API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.get(`/kegiatan/${params.id}`);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch kegiatan' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kegiatan' },
      { status: 500 }
    );
  }
}

// PUT /api/kegiatan/[id] - Proxy to Golang API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const response = await api.put(`/kegiatan/${params.id}`, body);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to update kegiatan' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating kegiatan:', error);
    return NextResponse.json(
      { error: 'Failed to update kegiatan' },
      { status: 500 }
    );
  }
}

// DELETE /api/kegiatan/[id] - Proxy to Golang API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.delete(`/kegiatan/${params.id}`);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to delete kegiatan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kegiatan:', error);
    return NextResponse.json(
      { error: 'Failed to delete kegiatan' },
      { status: 500 }
    );
  }
}
