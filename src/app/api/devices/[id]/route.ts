import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const deviceUpdateSchema = z.object({
  name: z.string().min(3).optional(),
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
  manufacturer: z.string().min(2).optional(),
  model: z.string().min(1).optional(),
  lotNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
});

// GET - Buscar dispositivo por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const device = await prisma.device.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(device);
  } catch (error) {
    console.error('Erro ao buscar dispositivo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dispositivo' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar dispositivo
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = deviceUpdateSchema.parse(body);

    const oldDevice = await prisma.device.findUnique({
      where: { id: params.id },
    });

    if (!oldDevice) {
      return NextResponse.json(
        { error: 'Dispositivo não encontrado' },
        { status: 404 }
      );
    }

    const device = await prisma.device.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        expirationDate: validatedData.expirationDate
          ? new Date(validatedData.expirationDate)
          : undefined,
      },
    });

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'device',
        entityId: device.id,
        changes: { old: oldDevice, new: device },
      },
    });

    return NextResponse.json(device);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar dispositivo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar dispositivo' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar dispositivo (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const device = await prisma.device.update({
      where: { id: params.id },
      data: { active: false },
    });

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entity: 'device',
        entityId: device.id,
      },
    });

    return NextResponse.json({ message: 'Dispositivo desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar dispositivo:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar dispositivo' },
      { status: 500 }
    );
  }
}
