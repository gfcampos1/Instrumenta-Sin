'use client';

import React from 'react';
import { Users, Activity, Package, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalSurgeries: number;
  todaySurgeries: number;
  totalDevices: number;
}

interface Surgery {
  id: string;
  status: string;
  hospitalName: string;
  createdAt: Date;
  user: { name: string };
  device: { name: string; category: string };
}

interface ChartDataDay {
  date: string;
  cirurgias: number;
}

interface ChartDataStatus {
  status: string;
  count: number;
}

interface DashboardClientProps {
  stats: Stats;
  recentSurgeries: Surgery[];
  chartDataByDay: ChartDataDay[];
  chartDataByStatus: ChartDataStatus[];
}

const COLORS = {
  SUCESSO: '#52c41a',
  PROBLEMA: '#faad14',
  COMPLICACAO: '#ff4d4f'
};

export default function DashboardClient({
  stats,
  recentSurgeries,
  chartDataByDay,
  chartDataByStatus
}: DashboardClientProps) {
  const dailyRate = stats.totalSurgeries > 0
    ? ((stats.todaySurgeries / stats.totalSurgeries) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Dashboard
        </h1>
        <p className="text-secondary-600">
          Visão geral do sistema Instrumenta-Sin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuários Ativos */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Users className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-secondary-600 font-medium">Usuários Ativos</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  {stats.totalUsers} total
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Cirurgias */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="text-status-green" size={24} />
              </div>
              <div>
                <p className="text-sm text-secondary-600 font-medium">Cirurgias</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {stats.totalSurgeries}
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  {stats.todaySurgeries} hoje
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Dispositivos */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="text-primary-800" size={24} />
              </div>
              <div>
                <p className="text-sm text-secondary-600 font-medium">Dispositivos</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {stats.totalDevices}
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  ativos
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Taxa Diária */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <TrendingUp className="text-status-yellow" size={24} />
              </div>
              <div>
                <p className="text-sm text-secondary-600 font-medium">Taxa Hoje</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {dailyRate}%
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  do total
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cirurgias por Dia (Linha) */}
        <Card>
          <h3 className="text-lg font-bold text-secondary-900 mb-4">
            Cirurgias - Últimos 7 Dias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDataByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="date"
                stroke="#737373"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#737373"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cirurgias"
                stroke="#4DB5E8"
                strokeWidth={3}
                dot={{ fill: '#2B5C9E', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Cirurgias por Status (Pizza) */}
        <Card>
          <h3 className="text-lg font-bold text-secondary-900 mb-4">
            Distribuição por Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartDataByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {chartDataByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#A8A8A8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela de Cirurgias Recentes */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-6">
          Cirurgias Recentes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-secondary-200">
                <th className="text-left py-3 px-4 text-secondary-700 font-semibold text-sm">
                  Instrumentador
                </th>
                <th className="text-left py-3 px-4 text-secondary-700 font-semibold text-sm">
                  Dispositivo
                </th>
                <th className="text-left py-3 px-4 text-secondary-700 font-semibold text-sm">
                  Categoria
                </th>
                <th className="text-left py-3 px-4 text-secondary-700 font-semibold text-sm">
                  Hospital
                </th>
                <th className="text-left py-3 px-4 text-secondary-700 font-semibold text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-secondary-700 font-semibold text-sm">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSurgeries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-secondary-500">
                    Nenhuma cirurgia registrada ainda
                  </td>
                </tr>
              ) : (
                recentSurgeries.map((surgery) => (
                  <tr
                    key={surgery.id}
                    className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-secondary-900 font-medium">
                      {surgery.user.name}
                    </td>
                    <td className="py-3 px-4 text-secondary-700">
                      {surgery.device.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-md font-medium">
                        {surgery.device.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary-700">
                      {surgery.hospitalName}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={
                          surgery.status === 'SUCESSO' ? 'green' :
                          surgery.status === 'PROBLEMA' ? 'yellow' : 'red'
                        }
                        label={surgery.status}
                      />
                    </td>
                    <td className="py-3 px-4 text-secondary-600 text-sm">
                      {new Date(surgery.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
