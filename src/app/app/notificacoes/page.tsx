import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Bell, Trophy, Award, Target, AlertCircle } from 'lucide-react';

// Tipo temporário até implementar a tabela de notificações
type Notification = {
  id: string;
  type: 'BADGE' | 'MISSION' | 'LEVEL_UP' | 'ALERT' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
};

export default async function NotificacoesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Buscar conquistas recentes do usuário (simulando notificações)
  const recentAchievements = await prisma.achievement.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
    take: 10,
  });

  // Criar notificações simuladas baseadas em conquistas
  const notifications: Notification[] = recentAchievements.map((achievement) => ({
    id: achievement.id,
    type: 'BADGE',
    title: 'Nova Conquista Desbloqueada!',
    message: `Você ganhou o badge "${achievement.badge.name}"`,
    read: false,
    createdAt: achievement.earnedAt,
    link: '/app/conquistas',
  }));

  // Adicionar notificações de sistema (exemplos)
  const systemNotifications: Notification[] = [
    {
      id: 'system-1',
      type: 'MISSION',
      title: 'Novas Missões Disponíveis',
      message: 'Confira as missões desta semana e ganhe pontos extras!',
      read: false,
      createdAt: new Date(),
      link: '/app/missoes',
    },
    {
      id: 'system-2',
      type: 'SYSTEM',
      title: 'Bem-vindo ao Instrumenta-Sin!',
      message: 'Registre sua primeira cirurgia e comece a ganhar pontos.',
      read: false,
      createdAt: new Date(Date.now() - 86400000), // 1 dia atrás
      link: '/app/cirurgia/nova',
    },
  ];

  const allNotifications = [...systemNotifications, ...notifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BADGE':
        return <Award className="w-6 h-6 text-yellow-600" />;
      case 'MISSION':
        return <Target className="w-6 h-6 text-blue-600" />;
      case 'LEVEL_UP':
        return <Trophy className="w-6 h-6 text-purple-600" />;
      case 'ALERT':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'SYSTEM':
        return <Bell className="w-6 h-6 text-gray-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BADGE':
        return 'bg-yellow-50 border-yellow-200';
      case 'MISSION':
        return 'bg-blue-50 border-blue-200';
      case 'LEVEL_UP':
        return 'bg-purple-50 border-purple-200';
      case 'ALERT':
        return 'bg-red-50 border-red-200';
      case 'SYSTEM':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      });
    } else if (days > 0) {
      return `${days}d atrás`;
    } else if (hours > 0) {
      return `${hours}h atrás`;
    } else if (minutes > 0) {
      return `${minutes}min atrás`;
    } else {
      return 'agora';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-gradient-sintegra text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Notificações</h1>
              {unreadCount > 0 && (
                <p className="text-primary-100 text-sm">
                  {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <div className="bg-white text-primary-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {allNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-gray-600">
              Você está em dia! Quando houver novidades, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link || '/app'}
                className={`block bg-white rounded-xl shadow-md p-4 border-l-4 ${getNotificationColor(
                  notification.type
                )} ${
                  !notification.read ? 'border-l-4' : 'border-l-2 opacity-75'
                } hover:shadow-lg transition`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3
                        className={`font-bold text-gray-800 ${
                          !notification.read ? 'text-gray-900' : ''
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Configurações de Notificação */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Preferências de Notificação
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Conquistas</div>
                <div className="text-xs text-gray-600">
                  Notificar quando ganhar badges
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Missões</div>
                <div className="text-xs text-gray-600">
                  Notificar sobre novas missões
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Ranking</div>
                <div className="text-xs text-gray-600">
                  Mudanças na sua posição
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Sistema</div>
                <div className="text-xs text-gray-600">
                  Atualizações e avisos importantes
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Botão de Limpar Todas */}
        {allNotifications.length > 0 && (
          <button className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
            Marcar todas como lidas
          </button>
        )}
      </div>
    </div>
  );
}
