import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z
    .enum([
      'ORTOPEDIA',
      'CARDIOLOGIA',
      'NEUROLOGIA',
      'GASTROENTEROLOGIA',
      'UROLOGIA',
      'OUTROS',
    ])
    .optional(),
  manufacturer: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  lotNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
});

// GET - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const product = await prisma.device.findUnique({
      where: { id: params.id },
      include: {
        surgeries: {
          take: 10,
          orderBy: { surgeryDate: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            surgeries: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar produto
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas ADMIN pode atualizar produtos
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = productUpdateSchema.parse(body);

    const product = await prisma.device.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        expirationDate: validatedData.expirationDate
          ? new Date(validatedData.expirationDate)
          : undefined,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar produto (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas ADMIN pode deletar produtos
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Soft delete - apenas desativa o produto
    const product = await prisma.device.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar produto' },
      { status: 500 }
    );
  }
}
