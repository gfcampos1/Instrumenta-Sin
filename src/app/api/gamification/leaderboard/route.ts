import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Ranking de pontos
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const period = searchParams.get('period') || 'all-time'; // all-time, monthly, weekly

    let whereClause: any = {
      active: true,
      role: { not: 'ADMIN' }, // Não incluir admins no ranking
    };

    // Se for período específico, buscar pontos de transações
    if (period !== 'all-time') {
      const now = new Date();
      let startDate: Date;

      if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'weekly') {
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate = new Date(0); // Desde sempre
      }

      // Buscar pontos do período via transações
      const usersWithPoints = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          level: true,
          pointTransactions: {
            where: {
              createdAt: { gte: startDate },
            },
            select: {
              points: true,
            },
          },
          _count: {
            select: {
              surgeries: true,
              achievements: true,
            },
          },
        },
        orderBy: { points: 'desc' },
      });

      // Calcular pontos do período
      const leaderboard = usersWithPoints
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          level: user.level,
          points: user.pointTransactions.reduce(
            (sum, t) => sum + t.points,
            0
          ),
          totalSurgeries: user._count.surgeries,
          totalAchievements: user._count.achievements,
        }))
        .sort((a, b) => b.points - a.points)
        .slice(0, limit)
        .map((user, index) => ({
          ...user,
          position: index + 1,
        }));

      // Encontrar posição do usuário atual
      const currentUserPosition = leaderboard.findIndex(
        (u) => u.id === session.user.id
      );

      return NextResponse.json({
        success: true,
        data: leaderboard,
        currentUser: {
          position:
            currentUserPosition >= 0 ? currentUserPosition + 1 : null,
          points: leaderboard[currentUserPosition]?.points || 0,
        },
        period,
      });
    }

    // Ranking all-time (usar pontos totais)
    const topUsers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        points: true,
        level: true,
        _count: {
          select: {
            surgeries: true,
            achievements: true,
          },
        },
      },
      orderBy: { points: 'desc' },
      take: limit,
    });

    const leaderboard = topUsers.map((user, index) => ({
      position: index + 1,
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      points: user.points,
      level: user.level,
      totalSurgeries: user._count.surgeries,
      totalAchievements: user._count.achievements,
    }));

    // Encontrar posição do usuário atual se não estiver no top
    const currentUserInTop = leaderboard.find(
      (u) => u.id === session.user.id
    );

    let currentUser;
    if (currentUserInTop) {
      currentUser = {
        position: currentUserInTop.position,
        points: currentUserInTop.points,
      };
    } else {
      // Buscar posição real do usuário
      const usersAbove = await prisma.user.count({
        where: {
          ...whereClause,
          points: {
            gt: (
              await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { points: true },
              })
            )?.points || 0,
          },
        },
      });

      const currentUserData = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { points: true },
      });

      currentUser = {
        position: usersAbove + 1,
        points: currentUserData?.points || 0,
      };
    }

    return NextResponse.json({
      success: true,
      data: leaderboard,
      currentUser,
      period: 'all-time',
    });
  } catch (error: any) {
    console.error('Erro ao buscar leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar leaderboard' },
      { status: 500 }
    );
  }
}
