import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const deviceSchema = z.object({
  barcode: z.string().min(1, 'Código de barras é obrigatório'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  category: z.enum([
    'ORTOPEDIA',
    'CARDIOLOGIA',
    'NEUROLOGIA',
    'GASTROENTEROLOGIA',
    'UROLOGIA',
    'OUTROS',
  ]),
  manufacturer: z.string().min(2, 'Fabricante é obrigatório'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  lotNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  description: z.string().optional(),
});

// GET - Listar dispositivos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { active: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.device.count({ where }),
    ]);

    return NextResponse.json({
      devices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar dispositivos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar dispositivos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo dispositivo
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas Admin pode criar dispositivos
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = deviceSchema.parse(body);

    // Verificar se barcode já existe
    const existingDevice = await prisma.device.findUnique({
      where: { barcode: validatedData.barcode },
    });

    if (existingDevice) {
      return NextResponse.json(
        { error: 'Código de barras já cadastrado' },
        { status: 400 }
      );
    }

    const device = await prisma.device.create({
      data: {
        ...validatedData,
        expirationDate: validatedData.expirationDate
          ? new Date(validatedData.expirationDate)
          : null,
        active: true,
      },
    });

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'device',
        entityId: device.id,
        changes: { new: device },
      },
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erro ao criar dispositivo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar dispositivo' },
      { status: 500 }
    );
  }
}
