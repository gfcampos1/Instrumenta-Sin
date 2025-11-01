import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Listar missões ativas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Buscar missões ativas (dentro do período e ativas)
    const activeMissions = await prisma.mission.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' },
    });

    // Buscar progresso do usuário nas missões
    const userProgress = await prisma.missionProgress.findMany({
      where: {
        userId: session.user.id,
        missionId: { in: activeMissions.map((m) => m.id) },
      },
    });

    // Criar mapa de progresso
    const progressMap = new Map(
      userProgress.map((progress) => [progress.missionId, progress])
    );

    // Combinar dados
    const missions = activeMissions.map((mission) => {
      const progress = progressMap.get(mission.id);
      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        pointsReward: mission.pointsReward,
        targetCount: mission.targetCount,
        missionType: mission.missionType,
        category: mission.category,
        startDate: mission.startDate,
        endDate: mission.endDate,
        currentCount: progress?.currentCount || 0,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt || null,
        progressPercentage: Math.min(
          Math.round(
            ((progress?.currentCount || 0) / mission.targetCount) * 100
          ),
          100
        ),
      };
    });

    // Estatísticas
    const stats = {
      totalActive: activeMissions.length,
      completed: missions.filter((m) => m.completed).length,
      inProgress: missions.filter((m) => !m.completed && m.currentCount > 0)
        .length,
      notStarted: missions.filter((m) => m.currentCount === 0).length,
    };

    return NextResponse.json({
      success: true,
      data: missions,
      stats,
    });
  } catch (error: any) {
    console.error('Erro ao listar missões:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar missões' },
      { status: 500 }
    );
  }
}
