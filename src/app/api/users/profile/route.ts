import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para atualizar perfil
const updateProfileSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// GET - Obter perfil do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        points: true,
        level: true,
        active: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            surgeries: true,
            achievements: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar estatísticas adicionais
    const [
      surgeriesByStatus,
      recentSurgeries,
      recentAchievements,
      unreadNotifications,
    ] = await Promise.all([
      // Cirurgias por status
      prisma.surgery.groupBy({
        by: ['status'],
        where: { userId: user.id },
        _count: { status: true },
      }),

      // Últimas 5 cirurgias
      prisma.surgery.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          hospitalName: true,
          surgeryDate: true,
          status: true,
          createdAt: true,
        },
      }),

      // Últimas 5 conquistas
      prisma.achievement.findMany({
        where: { userId: user.id },
        orderBy: { earnedAt: 'desc' },
        take: 5,
        include: {
          badge: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
              rarity: true,
            },
          },
        },
      }),

      // Notificações não lidas
      prisma.notification.count({
        where: {
          userId: user.id,
          read: false,
        },
      }),
    ]);

    // Formatar estatísticas
    const stats = {
      totalSurgeries: user._count.surgeries,
      totalAchievements: user._count.achievements,
      totalNotifications: user._count.notifications,
      unreadNotifications,
      surgeriesByStatus: {
        SUCESSO:
          surgeriesByStatus.find((s) => s.status === 'SUCESSO')?._count
            .status || 0,
        PROBLEMA:
          surgeriesByStatus.find((s) => s.status === 'PROBLEMA')?._count
            .status || 0,
        COMPLICACAO:
          surgeriesByStatus.find((s) => s.status === 'COMPLICACAO')?._count
            .status || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats,
        recentSurgeries,
        recentAchievements,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar perfil do usuário
export async function PUT(request: NextRequest) {
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
    const validationResult = updateProfileSchema.safeParse(body);
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

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        points: true,
        level: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
