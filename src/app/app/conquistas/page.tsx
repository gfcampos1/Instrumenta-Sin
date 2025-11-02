import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import BottomNav from '@/components/mobile/BottomNav';
import { Award, Lock, Check } from 'lucide-react';

export default async function ConquistasPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Buscar badges e conquistas do usuário
  const [allBadges, userAchievements, user] = await Promise.all([
    prisma.badge.findMany({
      orderBy: [{ rarity: 'desc' }, { pointsRequired: 'asc' }],
    }),
    prisma.achievement.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    }),
  ]);

  const earnedBadgeIds = new Set(
    userAchievements.map((a) => a.badge.id)
  );

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LENDARIO':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'EPICO':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'RARO':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'COMUM':
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'LENDARIO':
        return '💎';
      case 'EPICO':
        return '🥇';
      case 'RARO':
        return '🥈';
      case 'COMUM':
        return '🥉';
      default:
        return '🏅';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'LENDARIO':
        return 'Lendário';
      case 'EPICO':
        return 'Épico';
      case 'RARO':
        return 'Raro';
      case 'COMUM':
        return 'Comum';
      default:
        return rarity;
    }
  };

  const categorizedBadges = {
    LENDARIO: allBadges.filter((b) => b.rarity === 'LENDARIO'),
    EPICO: allBadges.filter((b) => b.rarity === 'EPICO'),
    RARO: allBadges.filter((b) => b.rarity === 'RARO'),
    COMUM: allBadges.filter((b) => b.rarity === 'COMUM'),
  };

  const totalBadges = allBadges.length;
  const earnedBadges = userAchievements.length;
  const completionPercentage = Math.round(
    (earnedBadges / totalBadges) * 100
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-sintegra text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Conquistas</h1>
          </div>
          <p className="text-primary-100 text-sm">
            Desbloqueie badges e mostre suas conquistas!
          </p>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        {/* Estatísticas Gerais */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Seu Progresso</h2>
            <span className="text-2xl font-bold text-primary-600">
              {earnedBadges}/{totalBadges}
            </span>
          </div>

          {/* Barra de Progresso Geral */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Completude</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-sintegra transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Grid de Estatísticas por Raridade */}
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(categorizedBadges).map(([rarity, badges]) => {
              const earned = badges.filter((b) =>
                earnedBadgeIds.has(b.id)
              ).length;
              return (
                <div key={rarity} className="text-center">
                  <div className="text-xl mb-1">{getRarityIcon(rarity)}</div>
                  <div className="text-sm font-bold text-gray-800">
                    {earned}/{badges.length}
                  </div>
                  <div className="text-xs text-gray-600">
                    {getRarityLabel(rarity)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Últimas Conquistas */}
        {userAchievements.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Últimas Desbloqueadas
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {userAchievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white rounded-xl shadow-md p-4 border-2 border-green-200"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-xl ${getRarityColor(
                        achievement.badge.rarity
                      )} flex items-center justify-center text-3xl shadow-lg`}
                    >
                      {getRarityIcon(achievement.badge.rarity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-800">
                          {achievement.badge.name}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-green-100 text-green-800">
                          ✓ Conquistado
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {achievement.badge.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                        <span className="font-semibold text-primary-600">
                          +{achievement.badge.pointsRequired} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges por Raridade */}
        {Object.entries(categorizedBadges).map(([rarity, badges]) => {
          if (badges.length === 0) return null;

          return (
            <div key={rarity}>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">{getRarityIcon(rarity)}</div>
                <h2 className="text-lg font-bold text-gray-800">
                  {getRarityLabel(rarity)}
                </h2>
                <span className="ml-auto text-xs text-gray-500">
                  {badges.filter((b) => earnedBadgeIds.has(b.id)).length}/
                  {badges.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {badges.map((badge) => {
                  const isEarned = earnedBadgeIds.has(badge.id);
                  const achievement = userAchievements.find(
                    (a) => a.badge.id === badge.id
                  );

                  return (
                    <div
                      key={badge.id}
                      className={`bg-white rounded-xl shadow-md p-4 ${
                        isEarned
                          ? 'border-2 border-green-200'
                          : 'opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-16 h-16 rounded-xl ${
                            isEarned
                              ? getRarityColor(badge.rarity)
                              : 'bg-gray-300'
                          } flex items-center justify-center text-3xl shadow-lg relative`}
                        >
                          {isEarned ? (
                            getRarityIcon(badge.rarity)
                          ) : (
                            <Lock className="w-8 h-8 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-bold text-gray-800">
                              {badge.name}
                            </h3>
                            {isEarned ? (
                              <span className="text-xs px-2 py-1 rounded-full font-semibold bg-green-100 text-green-800">
                                ✓ Conquistado
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full font-semibold bg-gray-100 text-gray-600">
                                🔒 Bloqueado
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {badge.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {isEarned && achievement ? (
                              <span className="text-xs text-gray-500">
                                Conquistado em{' '}
                                {new Date(
                                  achievement.earnedAt
                                ).toLocaleDateString('pt-BR')}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                {user && badge.pointsRequired > user.points
                                  ? `Faltam ${
                                      badge.pointsRequired - user.points
                                    } pontos`
                                  : 'Continue jogando para desbloquear'}
                              </span>
                            )}
                            <span className="text-xs font-semibold text-primary-600">
                              +{badge.pointsRequired} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Call to Action */}
        {earnedBadges < totalBadges && (
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
            <div className="flex gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-bold text-primary-800 mb-1">
                  Continue Jogando!
                </h3>
                <p className="text-sm text-primary-700">
                  Você ainda tem {totalBadges - earnedBadges} badges para
                  desbloquear. Complete missões e registre cirurgias para
                  ganhar mais conquistas!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
