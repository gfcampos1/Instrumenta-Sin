import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import RelatoriosClient from './RelatoriosClient';

export default async function RelatoriosPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/app');
  }

  // Buscar dados para relatórios
  const [
    totalSurgeries,
    surgeriesByStatus,
    surgeriesByMonth,
    topInstrumentadores,
    deviceUsage,
    problemReports,
    avgSurgeriesPerDay,
  ] = await Promise.all([
    // Total de cirurgias
    prisma.surgery.count(),

    // Cirurgias por status
    prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
      SELECT status, COUNT(*) as count
      FROM surgeries
      GROUP BY status
    `,

    // Cirurgias por mês (últimos 12 meses)
    prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM surgeries
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `,

    // Top instrumentadores
    prisma.$queryRaw<
      Array<{
        user_id: string;
        user_name: string;
        count: bigint;
        points: number;
      }>
    >`
      SELECT
        u.id as user_id,
        u.name as user_name,
        COUNT(s.id) as count,
        u.points
      FROM users u
      LEFT JOIN surgeries s ON s.user_id = u.id
      WHERE u.role = 'INSTRUMENTADOR'
      GROUP BY u.id, u.name, u.points
      ORDER BY count DESC
      LIMIT 10
    `,

    // Dispositivos mais usados
    prisma.$queryRaw<
      Array<{
        device_id: string;
        device_name: string;
        category: string;
        count: bigint;
      }>
    >`
      SELECT
        d.id as device_id,
        d.name as device_name,
        d.category,
        COUNT(s.id) as count
      FROM devices d
      LEFT JOIN surgeries s ON s.device_id = d.id
      GROUP BY d.id, d.name, d.category
      ORDER BY count DESC
      LIMIT 10
    `,

    // Relatórios de problemas
    prisma.surgery.count({
      where: {
        status: {
          in: ['PROBLEMA', 'COMPLICACAO'],
        },
      },
    }),

    // Média de cirurgias por dia (últimos 30 dias)
    prisma.$queryRaw<Array<{ avg: number }>>`
      SELECT ROUND(AVG(daily_count)::numeric, 2) as avg
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as daily_count
        FROM surgeries
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
      ) daily_stats
    `,
  ]);

  // Converter BigInt para Number
  const formattedData = {
    totalSurgeries,
    surgeriesByStatus: surgeriesByStatus.map((item) => ({
      status: item.status,
      count: Number(item.count),
    })),
    surgeriesByMonth: surgeriesByMonth.map((item) => ({
      month: item.month,
      count: Number(item.count),
    })),
    topInstrumentadores: topInstrumentadores.map((item) => ({
      id: item.user_id,
      name: item.user_name,
      surgeriesCount: Number(item.count),
      points: item.points,
    })),
    deviceUsage: deviceUsage.map((item) => ({
      id: item.device_id,
      name: item.device_name,
      category: item.category || 'N/A',
      count: Number(item.count),
    })),
    problemReports,
    avgSurgeriesPerDay: avgSurgeriesPerDay[0]?.avg || 0,
  };

  return <RelatoriosClient data={formattedData} />;
}
