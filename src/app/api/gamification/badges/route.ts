import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Listar badges do usuário (conquistadas + disponíveis)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar todas as badges ativas
    const allBadges = await prisma.badge.findMany({
      where: { active: true },
      orderBy: [{ rarity: 'desc' }, { order: 'asc' }],
    });

    // Buscar badges conquistadas pelo usuário
    const userAchievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      include: {
        badge: true,
      },
    });

    // Criar mapa de badges conquistadas
    const earnedBadgesMap = new Map(
      userAchievements.map((achievement) => [
        achievement.badgeId,
        achievement.earnedAt,
      ])
    );

    // Buscar pontos atuais do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    // Combinar dados
    const badges = allBadges.map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      pointsRequired: badge.pointsRequired,
      category: badge.category,
      rarity: badge.rarity,
      earned: earnedBadgesMap.has(badge.id),
      earnedAt: earnedBadgesMap.get(badge.id) || null,
      canEarn: (user?.points || 0) >= badge.pointsRequired,
    }));

    // Estatísticas
    const stats = {
      totalBadges: allBadges.length,
      earnedBadges: userAchievements.length,
      remainingBadges: allBadges.length - userAchievements.length,
      completionPercentage: Math.round(
        (userAchievements.length / allBadges.length) * 100
      ),
      byRarity: {
        COMUM: {
          total: allBadges.filter((b) => b.rarity === 'COMUM').length,
          earned: userAchievements.filter(
            (a) => a.badge.rarity === 'COMUM'
          ).length,
        },
        RARO: {
          total: allBadges.filter((b) => b.rarity === 'RARO').length,
          earned: userAchievements.filter((a) => a.badge.rarity === 'RARO')
            .length,
        },
        EPICO: {
          total: allBadges.filter((b) => b.rarity === 'EPICO').length,
          earned: userAchievements.filter((a) => a.badge.rarity === 'EPICO')
            .length,
        },
        LENDARIO: {
          total: allBadges.filter((b) => b.rarity === 'LENDARIO').length,
          earned: userAchievements.filter(
            (a) => a.badge.rarity === 'LENDARIO'
          ).length,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: badges,
      stats,
    });
  } catch (error: any) {
    console.error('Erro ao listar badges:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar badges' },
      { status: 500 }
    );
  }
}
