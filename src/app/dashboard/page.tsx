import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

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
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        device: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-4xl">👥</div>
            <div className="text-3xl font-bold text-primary-600">
              {activeUsers}
            </div>
          </div>
          <div className="text-gray-600">Usuários Ativos</div>
          <div className="text-xs text-gray-400 mt-1">
            {totalUsers} total
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-4xl">🏥</div>
            <div className="text-3xl font-bold text-status-green">
              {totalSurgeries}
            </div>
          </div>
          <div className="text-gray-600">Cirurgias Registradas</div>
          <div className="text-xs text-gray-400 mt-1">
            {todaySurgeries} hoje
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-4xl">📦</div>
            <div className="text-3xl font-bold text-primary-800">
              {totalDevices}
            </div>
          </div>
          <div className="text-gray-600">Dispositivos Ativos</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-4xl">📊</div>
            <div className="text-3xl font-bold text-status-yellow">
              {((todaySurgeries / totalSurgeries) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-gray-600">Taxa Hoje</div>
        </div>
      </div>

      {/* Recent Surgeries */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Cirurgias Recentes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Instrumentador
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Dispositivo
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Hospital
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSurgeries.map((surgery) => (
                <tr key={surgery.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{surgery.user.name}</td>
                  <td className="py-3 px-4">{surgery.device.name}</td>
                  <td className="py-3 px-4">{surgery.hospitalName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        surgery.status === 'SUCESSO'
                          ? 'bg-green-100 text-green-800'
                          : surgery.status === 'PROBLEMA'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {surgery.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(surgery.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
