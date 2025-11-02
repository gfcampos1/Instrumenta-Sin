import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import BottomNav from '@/components/mobile/BottomNav';
import { Trophy, Target, Calendar, Award } from 'lucide-react';

export default async function MissoesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Buscar missões ativas e dados do usuário
  const [activeMissions, user, userMissionProgress] = await Promise.all([
    prisma.mission.findMany({
      where: {
        active: true,
        OR: [
          { endDate: { gte: new Date() } },
          { endDate: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    // Buscar progresso do usuário em missões
    prisma.surgery.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Última semana
        },
      },
    }),
  ]);

  const dailyMissions = [
    {
      id: 'daily-1',
      title: 'Primeira do Dia',
      description: 'Registre sua primeira cirurgia hoje',
      pointsReward: 20,
      progress: 0,
      goal: 1,
      category: 'DIARIA',
      icon: '🌅',
    },
    {
      id: 'daily-2',
      title: 'Tríplice',
      description: 'Registre 3 cirurgias hoje',
      pointsReward: 50,
      progress: 0,
      goal: 3,
      category: 'DIARIA',
      icon: '🎯',
    },
    {
      id: 'daily-3',
      title: 'Fotógrafo',
      description: 'Adicione fotos em 2 cirurgias hoje',
      pointsReward: 30,
      progress: 0,
      goal: 2,
      category: 'DIARIA',
      icon: '📸',
    },
  ];

  const weeklyMissions = [
    {
      id: 'weekly-1',
      title: 'Sequência Perfeita',
      description: 'Registre cirurgias por 7 dias consecutivos',
      pointsReward: 200,
      progress: userMissionProgress,
      goal: 7,
      category: 'SEMANAL',
      icon: '🔥',
    },
    {
      id: 'weekly-2',
      title: 'Produtivo',
      description: 'Registre 15 cirurgias esta semana',
      pointsReward: 150,
      progress: userMissionProgress,
      goal: 15,
      category: 'SEMANAL',
      icon: '⚡',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DIARIA':
        return 'bg-blue-100 text-blue-800';
      case 'SEMANAL':
        return 'bg-purple-100 text-purple-800';
      case 'MENSAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'ESPECIAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-sintegra text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Missões</h1>
          </div>
          <p className="text-primary-100 text-sm">
            Complete missões e ganhe pontos extras!
          </p>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        {/* Estatísticas de Missões */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-600" />
            Seu Progresso
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {user?.points || 0}
              </div>
              <div className="text-sm text-gray-600">Pontos Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {userMissionProgress}
              </div>
              <div className="text-sm text-gray-600">Esta Semana</div>
            </div>
          </div>
        </div>

        {/* Missões Diárias */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Missões Diárias</h2>
            <span className="ml-auto text-xs text-gray-500">
              Renovam às 00:00
            </span>
          </div>
          <div className="space-y-3">
            {dailyMissions.map((mission) => {
              const progressPercentage = Math.min(
                (mission.progress / mission.goal) * 100,
                100
              );
              const isCompleted = mission.progress >= mission.goal;

              return (
                <div
                  key={mission.id}
                  className={`bg-white rounded-xl shadow-md p-4 ${
                    isCompleted ? 'border-2 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{mission.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {mission.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {mission.description}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${getCategoryColor(
                            mission.category
                          )}`}
                        >
                          {mission.category}
                        </span>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>
                            Progresso: {mission.progress}/{mission.goal}
                          </span>
                          <span className="font-semibold text-primary-600">
                            +{mission.pointsReward} pts
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isCompleted ? 'bg-green-500' : 'bg-primary-600'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {isCompleted && (
                        <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          ✓ Missão Completa!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missões Semanais */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">Missões Semanais</h2>
            <span className="ml-auto text-xs text-gray-500">
              Renovam Segunda
            </span>
          </div>
          <div className="space-y-3">
            {weeklyMissions.map((mission) => {
              const progressPercentage = Math.min(
                (mission.progress / mission.goal) * 100,
                100
              );
              const isCompleted = mission.progress >= mission.goal;

              return (
                <div
                  key={mission.id}
                  className={`bg-white rounded-xl shadow-md p-4 ${
                    isCompleted ? 'border-2 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{mission.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {mission.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {mission.description}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${getCategoryColor(
                            mission.category
                          )}`}
                        >
                          {mission.category}
                        </span>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>
                            Progresso: {mission.progress}/{mission.goal}
                          </span>
                          <span className="font-semibold text-primary-600">
                            +{mission.pointsReward} pts
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isCompleted ? 'bg-green-500' : 'bg-purple-600'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {isCompleted && (
                        <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          ✓ Missão Completa!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missões Especiais da DB */}
        {activeMissions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Missões Especiais
              </h2>
            </div>
            <div className="space-y-3">
              {activeMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-md p-4 border-2 border-red-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🎁</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {mission.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {mission.description}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-red-100 text-red-800">
                          ESPECIAL
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-semibold text-primary-600">
                          +{mission.pointsReward} pontos
                        </span>
                        {mission.endDate && (
                          <span className="text-xs text-gray-500">
                            Até{' '}
                            {new Date(mission.endDate).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dica */}
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-bold text-primary-800 mb-1">Dica</h3>
              <p className="text-sm text-primary-700">
                Complete missões diárias todos os dias para maximizar seus
                pontos e subir no ranking mais rápido!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
