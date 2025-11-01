import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para criar cirurgia
const createSurgerySchema = z.object({
  deviceId: z.string().uuid(),
  surgeryDate: z.string().datetime(),
  surgeryType: z.string().min(3),
  hospitalName: z.string().min(3),
  hospitalCNPJ: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationAccuracy: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.enum(['SUCESSO', 'PROBLEMA', 'COMPLICACAO']),
  doctorName: z.string().optional(),
  doctorConduct: z.string().min(10),
  devicePerformance: z.string().min(10),
  problemsReported: z.string().optional(),
  notes: z.string().optional(),
  deviceRating: z.number().min(1).max(5).optional(),
  doctorRating: z.number().min(1).max(5).optional(),
  photos: z.array(z.string().url()).max(10).optional().or(z.array(z.string()).length(0)).default([]),
});

// GET - Listar cirurgias do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const deviceId = searchParams.get('deviceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtros
    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (deviceId) {
      where.deviceId = deviceId;
    }

    if (startDate || endDate) {
      where.surgeryDate = {};
      if (startDate) {
        where.surgeryDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.surgeryDate.lte = new Date(endDate);
      }
    }

    // Buscar cirurgias
    const [surgeries, total] = await Promise.all([
      prisma.surgery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
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
      }),
      prisma.surgery.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: surgeries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + surgeries.length < total,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar cirurgias:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar cirurgias' },
      { status: 500 }
    );
  }
}

// POST - Criar nova cirurgia
export async function POST(request: NextRequest) {
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
    const validationResult = createSurgerySchema.safeParse(body);
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

    const data = validationResult.data;

    // Verificar se dispositivo existe
    const device = await prisma.device.findUnique({
      where: { id: data.deviceId },
    });

    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Dispositivo não encontrado' },
        { status: 404 }
      );
    }

    // Criar cirurgia
    const surgery = await prisma.surgery.create({
      data: {
        userId: session.user.id,
        deviceId: data.deviceId,
        surgeryDate: new Date(data.surgeryDate),
        surgeryType: data.surgeryType,
        hospitalName: data.hospitalName,
        hospitalCNPJ: data.hospitalCNPJ,
        latitude: data.latitude,
        longitude: data.longitude,
        locationAccuracy: data.locationAccuracy,
        city: data.city,
        state: data.state,
        status: data.status,
        doctorName: data.doctorName,
        doctorConduct: data.doctorConduct,
        devicePerformance: data.devicePerformance,
        problemsReported: data.problemsReported,
        notes: data.notes,
        deviceRating: data.deviceRating,
        doctorRating: data.doctorRating,
        photos: data.photos,
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

    // Calcular pontos ganhos
    let points = 10; // Base: 10 pontos por cirurgia registrada

    if (data.photos.length >= 3) points += 5; // Bonus: 3+ fotos
    if (data.status === 'SUCESSO') points += 5; // Bonus: cirurgia bem-sucedida
    if (data.deviceRating && data.deviceRating >= 4) points += 3; // Bonus: avaliação positiva
    if (data.problemsReported && data.problemsReported.length > 50) points += 5; // Bonus: feedback detalhado
    if (data.doctorConduct.length > 100) points += 5; // Bonus: descrição detalhada
    if (data.devicePerformance.length > 100) points += 5; // Bonus: descrição detalhada

    // Adicionar pontos ao usuário
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        points: { increment: points },
      },
    });

    // Criar transação de pontos
    await prisma.pointTransaction.create({
      data: {
        userId: session.user.id,
        points,
        reason: 'SURGERY_REGISTERED',
        referenceType: 'Surgery',
        referenceId: surgery.id,
        description: `Registro de cirurgia em ${data.hospitalName}`,
      },
    });

    // Verificar se subiu de nível (cada 100 pontos = 1 nível)
    const newLevel = Math.floor(user.points / 100) + 1;
    if (newLevel > user.level) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { level: newLevel },
      });

      // Criar notificação de level up
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: 'Parabéns! Você subiu de nível!',
          message: `Você alcançou o nível ${newLevel}!`,
          type: 'LEVEL_UP',
          data: { newLevel, oldLevel: user.level },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: surgery,
      pointsEarned: points,
      newLevel: newLevel > user.level ? newLevel : undefined,
    });
  } catch (error: any) {
    console.error('Erro ao criar cirurgia:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar cirurgia' },
      { status: 500 }
    );
  }
}
