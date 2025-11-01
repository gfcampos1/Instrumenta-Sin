import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  barcode: z.string().min(1, 'Código de barras é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.enum([
    'ORTOPEDIA',
    'CARDIOLOGIA',
    'NEUROLOGIA',
    'GASTROENTEROLOGIA',
    'UROLOGIA',
    'OUTROS',
  ]),
  manufacturer: z.string().min(1, 'Fabricante é obrigatório'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  lotNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  description: z.string().optional(),
});

// GET - Listar produtos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas ADMIN e SUPERVISOR podem listar produtos
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      active: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.device.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar produtos' },
      { status: 500 }
    );
  }
}

// POST - Criar produto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas ADMIN pode criar produtos
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Verificar se o código de barras já existe
    const existingProduct = await prisma.device.findUnique({
      where: { barcode: validatedData.barcode },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Código de barras já cadastrado' },
        { status: 400 }
      );
    }

    const product = await prisma.device.create({
      data: {
        barcode: validatedData.barcode,
        name: validatedData.name,
        category: validatedData.category,
        manufacturer: validatedData.manufacturer,
        model: validatedData.model,
        lotNumber: validatedData.lotNumber,
        expirationDate: validatedData.expirationDate
          ? new Date(validatedData.expirationDate)
          : undefined,
        description: validatedData.description,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
}
