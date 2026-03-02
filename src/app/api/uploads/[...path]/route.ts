import { NextRequest, NextResponse } from 'next/server';

// Proxy to serve uploads from Golang API
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const filePath = params.path.join('/');

  try {
    // Remove /api/v1 from the base URL to access uploads directly
    const golangBaseUrl = apiBaseUrl.replace('/api/v1', '');
    const response = await fetch(`${golangBaseUrl}/uploads/${filePath}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Get content type and cache headers
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const cacheControl = response.headers.get('cache-control') || 'public, max-age=31536000';

    // Get file data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
