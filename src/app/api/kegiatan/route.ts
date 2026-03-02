import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/kegiatan
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const kegiatan = await db.kegiatan.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(kegiatan);
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kegiatan' },
      { status: 500 }
    );
  }
}

// POST /api/kegiatan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const kegiatan = await db.kegiatan.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category || 'olahraga',
        date: body.date ? new Date(body.date) : null,
        location: body.location,
        images: body.images ? JSON.stringify(body.images) : null,
        videoUrl: body.videoUrl,
        status: body.status || 'draft',
        order: body.order || 0,
      },
    });

    return NextResponse.json(kegiatan, { status: 201 });
  } catch (error) {
    console.error('Error creating kegiatan:', error);
    return NextResponse.json(
      { error: 'Failed to create kegiatan' },
      { status: 500 }
    );
  }
}
