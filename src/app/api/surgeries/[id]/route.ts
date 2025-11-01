import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para atualizar cirurgia
const updateSurgerySchema = z.object({
  surgeryDate: z.string().datetime().optional(),
  surgeryType: z.string().min(3).optional(),
  hospitalName: z.string().min(3).optional(),
  hospitalCNPJ: z.string().optional(),
  status: z.enum(['SUCESSO', 'PROBLEMA', 'COMPLICACAO']).optional(),
  doctorName: z.string().optional(),
  doctorConduct: z.string().min(10).optional(),
  devicePerformance: z.string().min(10).optional(),
  problemsReported: z.string().optional(),
  notes: z.string().optional(),
  deviceRating: z.number().min(1).max(5).optional(),
  doctorRating: z.number().min(1).max(5).optional(),
  photos: z.array(z.string().url()).min(1).max(10).optional(),
});

// GET - Obter cirurgia específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const surgery = await prisma.surgery.findUnique({
      where: { id: params.id },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            category: true,
            barcode: true,
            manufacturer: true,
            model: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!surgery) {
      return NextResponse.json(
        { success: false, error: 'Cirurgia não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissão (apenas próprio usuário ou admin)
    if (
      surgery.userId !== session.user.id &&
      session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERVISOR'
    ) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: surgery,
    });
  } catch (error: any) {
    console.error('Erro ao buscar cirurgia:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar cirurgia' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar cirurgia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validationResult = updateSurgerySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Verificar se cirurgia existe
    const existingSurgery = await prisma.surgery.findUnique({
      where: { id: params.id },
    });

    if (!existingSurgery) {
      return NextResponse.json(
        { success: false, error: 'Cirurgia não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (existingSurgery.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão' },
        { status: 403 }
      );
    }

    const data = validationResult.data;

    // Atualizar cirurgia
    const updatedSurgery = await prisma.surgery.update({
      where: { id: params.id },
      data: {
        ...(data.surgeryDate && { surgeryDate: new Date(data.surgeryDate) }),
        ...(data.surgeryType && { surgeryType: data.surgeryType }),
        ...(data.hospitalName && { hospitalName: data.hospitalName }),
        ...(data.hospitalCNPJ !== undefined && { hospitalCNPJ: data.hospitalCNPJ }),
        ...(data.status && { status: data.status }),
        ...(data.doctorName !== undefined && { doctorName: data.doctorName }),
        ...(data.doctorConduct && { doctorConduct: data.doctorConduct }),
        ...(data.devicePerformance && { devicePerformance: data.devicePerformance }),
        ...(data.problemsReported !== undefined && { problemsReported: data.problemsReported }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.deviceRating !== undefined && { deviceRating: data.deviceRating }),
        ...(data.doctorRating !== undefined && { doctorRating: data.doctorRating }),
        ...(data.photos && { photos: data.photos }),
      },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            category: true,
            barcode: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSurgery,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar cirurgia:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar cirurgia' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar cirurgia (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Apenas ADMIN pode deletar
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Sem permissão' },
        { status: 403 }
      );
    }

    // Verificar se cirurgia existe
    const surgery = await prisma.surgery.findUnique({
      where: { id: params.id },
    });

    if (!surgery) {
      return NextResponse.json(
        { success: false, error: 'Cirurgia não encontrada' },
        { status: 404 }
      );
    }

    // Deletar cirurgia
    await prisma.surgery.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Cirurgia deletada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar cirurgia:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar cirurgia' },
      { status: 500 }
    );
  }
}
