import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AlertasClient from './AlertasClient';

export default async function AlertasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/app');
  }

  // Buscar cirurgias com problemas
  const [
    problemSurgeries,
    complicationSurgeries,
    recentProblems,
    deviceIssues,
  ] = await Promise.all([
    // Cirurgias com problema
    prisma.surgery.findMany({
      where: { status: 'PROBLEMA' },
      include: {
        device: { select: { name: true, barcode: true, category: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),

    // Cirurgias com complicação
    prisma.surgery.findMany({
      where: { status: 'COMPLICACAO' },
      include: {
        device: { select: { name: true, barcode: true, category: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),

    // Problemas recentes (últimas 24h)
    prisma.surgery.count({
      where: {
        status: { in: ['PROBLEMA', 'COMPLICACAO'] },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Dispositivos com mais problemas
    prisma.$queryRaw<
      Array<{
        device_id: string;
        device_name: string;
        category: string;
        problem_count: bigint;
      }>
    >`
      SELECT
        d.id as device_id,
        d.name as device_name,
        d.category,
        COUNT(s.id) as problem_count
      FROM devices d
      INNER JOIN surgeries s ON s.device_id = d.id
      WHERE s.status IN ('PROBLEMA', 'COMPLICACAO')
      GROUP BY d.id, d.name, d.category
      HAVING COUNT(s.id) >= 2
      ORDER BY problem_count DESC
      LIMIT 10
    `,
  ]);

  const alerts = {
    problems: problemSurgeries,
    complications: complicationSurgeries,
    recentCount: recentProblems,
    deviceIssues: deviceIssues.map((item) => ({
      deviceId: item.device_id,
      deviceName: item.device_name,
      category: item.category || 'N/A',
      problemCount: Number(item.problem_count),
    })),
  };

  return <AlertasClient alerts={alerts} />;
}
