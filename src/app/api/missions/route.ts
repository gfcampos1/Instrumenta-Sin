import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/missions
 * Retorna as missões ativas e o progresso do usuário
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar missões ativas da base de dados
    const dbMissions = await prisma.mission.findMany({
      where: {
        active: true,
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Buscar progresso do usuário
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [
      todaySurgeries,
      todaySurgeriesWithPhotos,
      weekSurgeries,
    ] = await Promise.all([
      // Cirurgias de hoje
      prisma.surgery.count({
        where: {
          userId,
          createdAt: { gte: today },
        },
      }),

      // Cirurgias com fotos hoje
      prisma.surgery.count({
        where: {
          userId,
          createdAt: { gte: today },
          photos: { isEmpty: false },
        },
      }),

      // Cirurgias da semana
      prisma.surgery.count({
        where: {
          userId,
          createdAt: { gte: weekAgo },
        },
      }),
    ]);

    // Missões diárias (hardcoded - podem ser movidas para DB depois)
    const dailyMissions = [
      {
        id: 'daily-first',
        title: 'Primeira do Dia',
        description: 'Registre sua primeira cirurgia hoje',
        type: 'DIARIA',
        pointsReward: 20,
        progress: Math.min(todaySurgeries, 1),
        goal: 1,
        completed: todaySurgeries >= 1,
      },
      {
        id: 'daily-triple',
        title: 'Tríplice',
        description: 'Registre 3 cirurgias hoje',
        type: 'DIARIA',
        pointsReward: 50,
        progress: Math.min(todaySurgeries, 3),
        goal: 3,
        completed: todaySurgeries >= 3,
      },
      {
        id: 'daily-photographer',
        title: 'Fotógrafo',
        description: 'Adicione fotos em 2 cirurgias hoje',
        type: 'DIARIA',
        pointsReward: 30,
        progress: Math.min(todaySurgeriesWithPhotos, 2),
        goal: 2,
        completed: todaySurgeriesWithPhotos >= 2,
      },
    ];

    // Missões semanais
    const weeklyMissions = [
      {
        id: 'weekly-productive',
        title: 'Produtivo',
        description: 'Registre 15 cirurgias esta semana',
        type: 'SEMANAL',
        pointsReward: 150,
        progress: Math.min(weekSurgeries, 15),
        goal: 15,
        completed: weekSurgeries >= 15,
      },
      {
        id: 'weekly-streak',
        title: 'Sequência Perfeita',
        description: 'Registre cirurgias por 7 dias consecutivos',
        type: 'SEMANAL',
        pointsReward: 200,
        progress: 0, // TODO: Implementar lógica de streak
        goal: 7,
        completed: false,
      },
    ];

    // Combinar todas as missões
    const allMissions = [
      ...dailyMissions,
      ...weeklyMissions,
      ...dbMissions.map((mission) => ({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        type: 'ESPECIAL',
        pointsReward: mission.pointsReward,
        progress: 0, // TODO: Implementar tracking de progresso
        goal: 1,
        completed: false,
        endDate: mission.endDate,
      })),
    ];

    return NextResponse.json({
      missions: allMissions,
      stats: {
        todaySurgeries,
        todaySurgeriesWithPhotos,
        weekSurgeries,
      },
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/missions
 * Cria uma nova missão (Admin apenas)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, pointsReward, startDate, endDate, active } = body;

    if (!title || !description || !pointsReward) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const mission = await prisma.mission.create({
      data: {
        title,
        description,
        pointsReward,
        startDate: startDate ? new Date(startDate) : new Date(),
        // Prisma field expects string | Date; use undefined to omit the field when no endDate
        endDate: endDate ? new Date(endDate) : undefined,
        active: active ?? true,
      },
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error('Error creating mission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
