import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  // Buscar estatísticas gerais
  const [
    totalUsers,
    activeUsers,
    totalSurgeries,
    todaySurgeries,
    totalDevices,
    recentSurgeries,
    surgeriesByDay,
    surgeriesByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.surgery.count(),
    prisma.surgery.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.device.count({ where: { active: true } }),
    prisma.surgery.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        device: { select: { name: true, category: true } },
      },
    }),
    // Cirurgias por dia (últimos 7 dias)
    prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM surgeries
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    // Cirurgias por status
    prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*) as count
      FROM surgeries
      GROUP BY status
    `,
  ]);

  // Converter BigInt para Number e formatar dados para gráficos
  const chartDataByDay = surgeriesByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    cirurgias: Number(item.count),
  }));

  const chartDataByStatus = surgeriesByStatus.map((item) => ({
    status: item.status,
    count: Number(item.count),
  }));

  const stats = {
    totalUsers,
    activeUsers,
    totalSurgeries,
    todaySurgeries,
    totalDevices,
  };

  return (
    <DashboardClient
      stats={stats}
      recentSurgeries={recentSurgeries}
      chartDataByDay={chartDataByDay}
      chartDataByStatus={chartDataByStatus}
    />
  );
}
