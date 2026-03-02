import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

// POST /api/upload - Proxy to Golang API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'image';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const response = await api.uploadFile(file, type as 'image' | 'pdf' | 'video');

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to upload file' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
