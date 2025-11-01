import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Buscar dispositivo por código de barras
export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const device = await prisma.device.findUnique({
      where: { barcode: params.barcode },
      include: {
        _count: {
          select: { surgeries: true },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Dispositivo não encontrado' },
        { status: 404 }
      );
    }

    if (!device.active) {
      return NextResponse.json(
        { error: 'Dispositivo inativo' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: device });
  } catch (error) {
    console.error('Erro ao buscar dispositivo por barcode:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dispositivo' },
      { status: 500 }
    );
  }
}
