import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export default async function AppPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  // Buscar estatísticas do usuário
  const [user, surgeriesCount, todaySurgeries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        achievements: {
          include: { badge: true },
          take: 3,
          orderBy: { earnedAt: 'desc' },
        },
      },
    }),
    prisma.surgery.count({
      where: { userId: session.user.id },
    }),
    prisma.surgery.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-sintegra text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Olá, {user?.name}! 👋</h1>
              <p className="text-primary-100 text-sm">
                Nível {user?.level} · {user?.points} pontos
              </p>
            </div>
            <Link
              href="/api/auth/signout"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-primary-600">
              {surgeriesCount}
            </div>
            <div className="text-gray-600 text-sm">Cirurgias Total</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-status-green">
              {todaySurgeries}
            </div>
            <div className="text-gray-600 text-sm">Hoje</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-primary-800">
              {user?.level}
            </div>
            <div className="text-gray-600 text-sm">Nível</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-secondary-600">
              {user?.achievements.length || 0}
            </div>
            <div className="text-gray-600 text-sm">Badges</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/app/cirurgia/nova"
              className="bg-gradient-sintegra text-white p-4 rounded-lg text-center font-semibold hover:shadow-lg transition"
            >
              📝 Nova Cirurgia
            </Link>
            <Link
              href="/app/scanner"
              className="bg-primary-100 text-primary-800 p-4 rounded-lg text-center font-semibold hover:bg-primary-200 transition"
            >
              📷 Scanner
            </Link>
            <Link
              href="/app/historico"
              className="bg-gray-100 text-gray-800 p-4 rounded-lg text-center font-semibold hover:bg-gray-200 transition"
            >
              📋 Histórico
            </Link>
            <Link
              href="/app/ranking"
              className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center font-semibold hover:bg-yellow-200 transition"
            >
              🏆 Ranking
            </Link>
          </div>
        </div>

        {/* Recent Badges */}
        {user?.achievements && user.achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Últimas Conquistas
            </h2>
            <div className="space-y-3">
              {user.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg"
                >
                  <div className="text-3xl">{achievement.badge.rarity === 'LENDARIO' ? '💎' : achievement.badge.rarity === 'EPICO' ? '🥇' : achievement.badge.rarity === 'RARO' ? '🥈' : '🥉'}</div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {achievement.badge.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {achievement.badge.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link href="/app" className="flex flex-col items-center text-primary-600">
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs font-medium">Início</span>
          </Link>
          <Link href="/app/cirurgia/nova" className="flex flex-col items-center text-gray-600 hover:text-primary-600">
            <span className="text-2xl mb-1">➕</span>
            <span className="text-xs font-medium">Nova</span>
          </Link>
          <Link href="/app/historico" className="flex flex-col items-center text-gray-600 hover:text-primary-600">
            <span className="text-2xl mb-1">📋</span>
            <span className="text-xs font-medium">Histórico</span>
          </Link>
          <Link href="/app/perfil" className="flex flex-col items-center text-gray-600 hover:text-primary-600">
            <span className="text-2xl mb-1">👤</span>
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
