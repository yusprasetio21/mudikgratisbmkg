import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get settings from database
    let settings = await db.mudikgratisSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    // If no settings in database, return default
    if (!settings) {
      settings = {
        id: 'default',
        eventTitle: 'MUDIK GRATIS KORPRI BMKG 2025',
        eventActive: true,
        showReregBanner: true,
        showBusCheckBanner: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({
      data: {
        eventTitle: settings.eventTitle,
        eventActive: settings.eventActive,
        showReregBanner: settings.showReregBanner,
        showBusCheckBanner: settings.showBusCheckBanner,
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings on error
    return NextResponse.json({
      data: {
        eventTitle: 'MUDIK GRATIS KORPRI BMKG 2025',
        eventActive: true,
        showReregBanner: true,
        showBusCheckBanner: true,
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get or create settings
    let settings = await db.mudikgratisSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    if (settings) {
      // Update existing settings
      settings = await db.mudikgratisSettings.update({
        where: { id: settings.id },
        data: {
          eventTitle: body.eventTitle || settings.eventTitle,
          eventActive: body.eventActive !== undefined ? body.eventActive : settings.eventActive,
          showReregBanner: body.showReregBanner !== undefined ? body.showReregBanner : settings.showReregBanner,
          showBusCheckBanner: body.showBusCheckBanner !== undefined ? body.showBusCheckBanner : settings.showBusCheckBanner,
          updatedAt: new Date(),
        }
      });
    } else {
      // Create new settings
      settings = await db.mudikgratisSettings.create({
        data: {
          eventTitle: body.eventTitle || 'MUDIK GRATIS KORPRI BMKG 2025',
          eventActive: body.eventActive !== undefined ? body.eventActive : true,
          showReregBanner: body.showReregBanner !== undefined ? body.showReregBanner : true,
          showBusCheckBanner: body.showBusCheckBanner !== undefined ? body.showBusCheckBanner : true,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan',
      data: {
        eventTitle: settings.eventTitle,
        eventActive: settings.eventActive,
        showReregBanner: settings.showReregBanner,
        showBusCheckBanner: settings.showBusCheckBanner,
      }
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan' },
      { status: 500 }
    );
  }
}
