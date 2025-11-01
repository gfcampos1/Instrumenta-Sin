import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Verificar e conceder badges/missões automaticamente
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const newAchievements: any[] = [];
    const completedMissions: any[] = [];

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        achievements: { select: { badgeId: true } },
        surgeries: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // IDs de badges já conquistadas
    const earnedBadgeIds = new Set(user.achievements.map((a) => a.badgeId));

    // Buscar badges disponíveis que o usuário ainda não tem
    const availableBadges = await prisma.badge.findMany({
      where: {
        active: true,
        id: { notIn: Array.from(earnedBadgeIds) },
      },
    });

    // Verificar cada badge
    for (const badge of availableBadges) {
      let earned = false;

      // Verificar critério de pontos
      if (user.points >= badge.pointsRequired) {
        // Verificar critérios adicionais por categoria
        switch (badge.category) {
          case 'surgeries':
            earned = user.surgeries.length >= badge.pointsRequired / 10;
            break;

          case 'photos':
            const totalPhotos = user.surgeries.reduce(
              (sum, s) => sum + s.photos.length,
              0
            );
            earned = totalPhotos >= badge.pointsRequired / 5;
            break;

          case 'consecutive_days':
            // TODO: Implementar verificação de dias consecutivos
            break;

          default:
            // Badge baseada apenas em pontos
            earned = true;
        }
      }

      if (earned) {
        // Conceder badge
        const achievement = await prisma.achievement.create({
          data: {
            userId: user.id,
            badgeId: badge.id,
          },
          include: {
            badge: true,
          },
        });

        newAchievements.push(achievement);

        // Criar notificação
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Nova Conquista Desbloqueada!',
            message: `Você ganhou a badge "${badge.name}"`,
            type: 'ACHIEVEMENT',
            data: { badgeId: badge.id, badgeName: badge.name },
          },
        });
      }
    }

    // Verificar missões ativas
    const now = new Date();
    const activeMissions = await prisma.mission.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    for (const mission of activeMissions) {
      // Buscar progresso atual
      const progress = await prisma.missionProgress.findUnique({
        where: {
          userId_missionId: {
            userId: user.id,
            missionId: mission.id,
          },
        },
      });

      // Se já completou, pular
      if (progress?.completed) continue;

      let currentCount = 0;

      // Calcular progresso baseado no tipo de missão
      switch (mission.missionType) {
        case 'REGISTER_SURGERIES':
          currentCount = user.surgeries.length;
          break;

        case 'UPLOAD_PHOTOS':
          currentCount = user.surgeries.reduce(
            (sum, s) => sum + s.photos.length,
            0
          );
          break;

        case 'REPORT_PROBLEMS':
          currentCount = user.surgeries.filter(
            (s) =>
              s.problemsReported &&
              s.problemsReported.length > 0 &&
              s.status !== 'SUCESSO'
          ).length;
          break;

        case 'SPECIFIC_CATEGORY':
          if (mission.category) {
            currentCount = user.surgeries.filter(
              (s) => s.device && s.device === mission.category
            ).length;
          }
          break;

        case 'CONSECUTIVE_DAYS':
          // TODO: Implementar lógica de dias consecutivos
          break;
      }

      // Verificar se completou a missão
      const completed = currentCount >= mission.targetCount;

      if (progress) {
        // Atualizar progresso existente
        await prisma.missionProgress.update({
          where: { id: progress.id },
          data: {
            currentCount,
            completed,
            completedAt: completed ? new Date() : null,
          },
        });
      } else {
        // Criar novo progresso
        await prisma.missionProgress.create({
          data: {
            userId: user.id,
            missionId: mission.id,
            currentCount,
            completed,
            completedAt: completed ? new Date() : null,
          },
        });
      }

      // Se completou agora, dar recompensa
      if (completed && !progress?.completed) {
        // Adicionar pontos da missão
        await prisma.user.update({
          where: { id: user.id },
          data: {
            points: { increment: mission.pointsReward },
          },
        });

        // Criar transação
        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            points: mission.pointsReward,
            reason: 'MISSION_COMPLETED',
            referenceType: 'Mission',
            referenceId: mission.id,
            description: `Missão completada: ${mission.title}`,
          },
        });

        // Criar notificação
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Missão Completada!',
            message: `Você completou "${mission.title}" e ganhou ${mission.pointsReward} pontos!`,
            type: 'MISSION_COMPLETE',
            data: {
              missionId: mission.id,
              missionTitle: mission.title,
              pointsReward: mission.pointsReward,
            },
          },
        });

        completedMissions.push({
          ...mission,
          pointsReward: mission.pointsReward,
        });
      }
    }

    return NextResponse.json({
      success: true,
      newAchievements,
      completedMissions,
      totalPointsEarned: completedMissions.reduce(
        (sum, m) => sum + m.pointsReward,
        0
      ),
    });
  } catch (error: any) {
    console.error('Erro ao verificar conquistas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar conquistas' },
      { status: 500 }
    );
  }
}
