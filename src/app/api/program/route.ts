import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/program
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

    const programs = await db.program.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST /api/program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const program = await db.program.create({
      data: {
        slug: body.slug,
        title: body.title,
        description: body.description,
        category: body.category || 'kesejahteraan',
        imageUrl: body.imageUrl,
        imagePath: body.imagePath,
        content: body.content,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        registrationLink: body.registrationLink,
        status: body.status || 'draft',
        order: body.order || 0,
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
