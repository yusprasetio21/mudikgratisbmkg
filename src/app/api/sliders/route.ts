import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/sliders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const sliders = await db.slider.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sliders' },
      { status: 500 }
    );
  }
}

// POST /api/sliders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const slider = await db.slider.create({
      data: {
        category: body.category || 'info',
        title: body.title,
        highlight: body.highlight,
        description: body.description,
        buttonLabel: body.buttonLabel,
        buttonUrl: body.buttonUrl,
        cardTitle: body.cardTitle,
        cardDesc: body.cardDesc,
        cardTag: body.cardTag,
        cardLink: body.cardLink,
        imageUrl: body.imageUrl,
        imagePath: body.imagePath,
        imageOverlay: body.imageOverlay,
        label: body.label,
        labelIcon: body.labelIcon,
        order: body.order || 0,
        status: body.status || 'draft',
      },
    });

    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Error creating slider:', error);
    return NextResponse.json(
      { error: 'Failed to create slider' },
      { status: 500 }
    );
  }
}
