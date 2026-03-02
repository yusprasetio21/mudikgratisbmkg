import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/peraturan
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

    const peraturan = await db.peraturan.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(peraturan);
  } catch (error) {
    console.error('Error fetching peraturan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peraturan' },
      { status: 500 }
    );
  }
}

// POST /api/peraturan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const peraturan = await db.peraturan.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category || 'kepala',
        pdfPath: body.pdfPath,
        pdfUrl: body.pdfUrl,
        publishDate: body.publishDate ? new Date(body.publishDate) : null,
        status: body.status || 'draft',
        order: body.order || 0,
      },
    });

    return NextResponse.json(peraturan, { status: 201 });
  } catch (error) {
    console.error('Error creating peraturan:', error);
    return NextResponse.json(
      { error: 'Failed to create peraturan' },
      { status: 500 }
    );
  }
}
