'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
} from 'lucide-react';

type RelatoriosData = {
  totalSurgeries: number;
  surgeriesByStatus: Array<{ status: string; count: number }>;
  surgeriesByMonth: Array<{ month: string; count: number }>;
  topInstrumentadores: Array<{
    id: string;
    name: string;
    surgeriesCount: number;
    points: number;
  }>;
  deviceUsage: Array<{
    id: string;
    name: string;
    category: string;
    count: number;
  }>;
  problemReports: number;
  avgSurgeriesPerDay: number;
};

const COLORS = {
  SUCESSO: '#10B981',
  PROBLEMA: '#F59E0B',
  COMPLICACAO: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  SUCESSO: 'Sucesso',
  PROBLEMA: 'Problema',
  COMPLICACAO: 'Complicação',
};

export default function RelatoriosClient({ data }: { data: RelatoriosData }) {
  const [dateRange, setDateRange] = useState('30');

  const handleExportPDF = () => {
    alert('Exportação de PDF será implementada em breve!');
  };

  const handleExportCSV = () => {
    alert('Exportação de CSV será implementada em breve!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-600" />
            Relatórios e Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada de cirurgias e performance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
              <option value="all">Todo período</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {data.totalSurgeries}
          </div>
          <div className="text-sm text-gray-600">Total de Cirurgias</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {data.avgSurgeriesPerDay}
          </div>
          <div className="text-sm text-gray-600">Média por Dia (30d)</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {data.topInstrumentadores.length}
          </div>
          <div className="text-sm text-gray-600">Instrumentadores Ativos</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {data.problemReports}
          </div>
          <div className="text-sm text-gray-600">Problemas Reportados</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Cirurgias por Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Cirurgias por Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.surgeriesByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${STATUS_LABELS[entry.status]}: ${entry.count}`}
              >
                {data.surgeriesByStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status as keyof typeof COLORS] || '#94A3B8'}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cirurgias por Mês */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Evolução Mensal
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.surgeriesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563EB"
                strokeWidth={2}
                name="Cirurgias"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Instrumentadores */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Top Instrumentadores
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Posição
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Nome
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                  Cirurgias
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                  Pontos
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topInstrumentadores.map((user, index) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-xl">🥇</span>}
                      {index === 1 && <span className="text-xl">🥈</span>}
                      {index === 2 && <span className="text-xl">🥉</span>}
                      {index > 2 && (
                        <span className="font-semibold text-gray-600">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800">{user.name}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-primary-600">
                      {user.surgeriesCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-yellow-600">
                      {user.points} pts
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-sintegra h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (user.surgeriesCount /
                              data.topInstrumentadores[0].surgeriesCount) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispositivos Mais Usados */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-600" />
          Dispositivos Mais Utilizados
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.deviceUsage} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={200}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#2563EB" name="Utilizações" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
