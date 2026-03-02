import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

// GET /api/program/[id] - Proxy to Golang API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.get(`/programs/${params.id}`);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch program' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PUT /api/program/[id] - Proxy to Golang API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const response = await api.put(`/programs/${params.id}`, body);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to update program' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE /api/program/[id] - Proxy to Golang API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.delete(`/programs/${params.id}`);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to delete program' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
