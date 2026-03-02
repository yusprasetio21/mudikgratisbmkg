import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

// GET /api/peraturan/[id] - Proxy to Golang API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.get(`/peraturan/${params.id}`);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch peraturan' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching peraturan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peraturan' },
      { status: 500 }
    );
  }
}

// PUT /api/peraturan/[id] - Proxy to Golang API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const response = await api.put(`/peraturan/${params.id}`, body);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to update peraturan' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating peraturan:', error);
    return NextResponse.json(
      { error: 'Failed to update peraturan' },
      { status: 500 }
    );
  }
}

// DELETE /api/peraturan/[id] - Proxy to Golang API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.delete(`/peraturan/${params.id}`);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to delete peraturan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting peraturan:', error);
    return NextResponse.json(
      { error: 'Failed to delete peraturan' },
      { status: 500 }
    );
  }
}
