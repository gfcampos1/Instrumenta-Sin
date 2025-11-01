'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Trophy, Medal, Target, ArrowLeft, Loader2, Crown, Award } from 'lucide-react';
import Link from 'next/link';
import BadgeCard from '@/components/ui/BadgeCard';
import MissionCard from '@/components/ui/MissionCard';
import EmptyState from '@/components/ui/EmptyState';

type Tab = 'ranking' | 'badges' | 'missions';

export default function RankingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('ranking');
  const [loading, setLoading] = useState(true);

  // Ranking data
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<any>(null);

  // Badges data
  const [badges, setBadges] = useState<any[]>([]);
  const [badgeStats, setBadgeStats] = useState<any>(null);

  // Missions data
  const [missions, setMissions] = useState<any[]>([]);
  const [missionStats, setMissionStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ranking') {
        const res = await fetch('/api/gamification/leaderboard');
        const result = await res.json();
        if (res.ok) {
          setLeaderboard(result.data);
          setCurrentUserRank(result.currentUser);
        }
      } else if (activeTab === 'badges') {
        const res = await fetch('/api/gamification/badges');
        const result = await res.json();
        if (res.ok) {
          setBadges(result.data);
          setBadgeStats(result.stats);
        }
      } else if (activeTab === 'missions') {
        const res = await fetch('/api/gamification/missions');
        const result = await res.json();
        if (res.ok) {
          setMissions(result.data);
          setMissionStats(result.stats);
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'ranking' as Tab, label: 'Ranking', icon: Trophy },
    { key: 'badges' as Tab, label: 'Badges', icon: Medal },
    { key: 'missions' as Tab, label: 'Missões', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-sintegra shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/app" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="text-white" size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Gamificação</h1>
              <p className="text-primary-100 text-sm">Conquistas e Competições</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-all
                    ${
                      activeTab === tab.key
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-secondary-600 hover:text-secondary-900'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-secondary-600">Carregando...</p>
          </div>
        ) : (
          <>
            {/* Ranking Tab */}
            {activeTab === 'ranking' && (
              <div className="space-y-6">
                {/* Current user rank card */}
                {currentUserRank && (
                  <div className="bg-gradient-sintegra text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary-100 text-sm mb-1">Sua Posição</p>
                        <p className="text-4xl font-bold">#{currentUserRank.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-100 text-sm mb-1">Pontos</p>
                        <p className="text-3xl font-bold">{currentUserRank.points}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leaderboard */}
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                        ${
                          user.id === session?.user?.id
                            ? 'bg-primary-50 border-primary-500'
                            : 'bg-white border-secondary-200 hover:border-primary-300'
                        }
                        ${index < 3 ? 'shadow-md' : ''}
                      `}
                    >
                      {/* Position */}
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-sintegra text-white font-bold text-lg">
                        {index < 3 ? (
                          <Crown
                            className={
                              index === 0
                                ? 'text-yellow-400'
                                : index === 1
                                ? 'text-gray-300'
                                : 'text-orange-400'
                            }
                            size={24}
                          />
                        ) : (
                          user.position
                        )}
                      </div>

                      {/* User info */}
                      <div className="flex-1">
                        <p className="font-bold text-secondary-900">{user.name}</p>
                        <p className="text-xs text-secondary-600">
                          Nível {user.level} • {user.totalSurgeries} cirurgias •{' '}
                          {user.totalAchievements} badges
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">{user.points}</p>
                        <p className="text-xs text-secondary-600">pontos</p>
                      </div>
                    </div>
                  ))}
                </div>

                {leaderboard.length === 0 && (
                  <EmptyState
                    icon={<Trophy size={48} />}
                    title="Nenhum usuário no ranking"
                    description="Seja o primeiro a pontuar!"
                  />
                )}
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div className="space-y-6">
                {/* Stats */}
                {badgeStats && (
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-secondary-900 mb-4">Progresso</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">
                          {badgeStats.earnedBadges}
                        </p>
                        <p className="text-sm text-secondary-600">Conquistadas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-secondary-400">
                          {badgeStats.remainingBadges}
                        </p>
                        <p className="text-sm text-secondary-600">Bloqueadas</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-secondary-200 rounded-full h-3">
                        <div
                          className="bg-gradient-sintegra h-full rounded-full transition-all"
                          style={{ width: `${badgeStats.completionPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-secondary-600 text-center mt-2">
                        {badgeStats.completionPercentage}% completo
                      </p>
                    </div>
                  </div>
                )}

                {/* Badges grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <BadgeCard key={badge.id} {...badge} />
                  ))}
                </div>

                {badges.length === 0 && (
                  <EmptyState
                    icon={<Medal size={48} />}
                    title="Nenhuma badge disponível"
                    description="Aguarde novas badges serem criadas!"
                  />
                )}
              </div>
            )}

            {/* Missions Tab */}
            {activeTab === 'missions' && (
              <div className="space-y-6">
                {/* Stats */}
                {missionStats && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-md text-center">
                      <p className="text-2xl font-bold text-status-green">
                        {missionStats.completed}
                      </p>
                      <p className="text-xs text-secondary-600">Completas</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md text-center">
                      <p className="text-2xl font-bold text-primary-600">
                        {missionStats.inProgress}
                      </p>
                      <p className="text-xs text-secondary-600">Em Progresso</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md text-center">
                      <p className="text-2xl font-bold text-secondary-400">
                        {missionStats.notStarted}
                      </p>
                      <p className="text-xs text-secondary-600">Não Iniciadas</p>
                    </div>
                  </div>
                )}

                {/* Missions list */}
                <div className="space-y-4">
                  {missions.map((mission) => (
                    <MissionCard key={mission.id} {...mission} />
                  ))}
                </div>

                {missions.length === 0 && (
                  <EmptyState
                    icon={<Target size={48} />}
                    title="Nenhuma missão ativa"
                    description="Aguarde novas missões serem criadas!"
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
