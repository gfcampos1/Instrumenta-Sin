'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  XCircle,
  AlertCircle,
  Package,
  User,
  MapPin,
  Calendar,
  Filter,
  CheckCircle,
  X,
} from 'lucide-react';

type Surgery = {
  id: string;
  status: string;
  surgeryDate: Date;
  hospitalName: string | null;
  problemsReported: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  device: {
    name: string;
    barcode: string;
    category: string | null;
  };
  user: {
    name: string;
    email: string;
  };
};

type DeviceIssue = {
  deviceId: string;
  deviceName: string;
  category: string;
  problemCount: number;
};

type AlertsData = {
  problems: Surgery[];
  complications: Surgery[];
  recentCount: number;
  deviceIssues: DeviceIssue[];
};

export default function AlertasClient({ alerts }: { alerts: AlertsData }) {
  const [filter, setFilter] = useState<'all' | 'problem' | 'complication'>('all');
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const allAlerts = [...alerts.problems, ...alerts.complications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredAlerts = allAlerts.filter((alert) => {
    if (resolved.has(alert.id)) return false;
    if (filter === 'all') return true;
    if (filter === 'problem') return alert.status === 'PROBLEMA';
    if (filter === 'complication') return alert.status === 'COMPLICACAO';
    return true;
  });

  const handleResolve = (id: string) => {
    setResolved((prev) => new Set([...prev, id]));
  };

  const getSeverityColor = (status: string) => {
    if (status === 'COMPLICACAO') {
      return 'bg-red-50 border-red-300';
    }
    return 'bg-yellow-50 border-yellow-300';
  };

  const getSeverityIcon = (status: string) => {
    if (status === 'COMPLICACAO') {
      return <XCircle className="w-6 h-6 text-red-600" />;
    }
    return <AlertCircle className="w-6 h-6 text-yellow-600" />;
  };

  const getSeverityLabel = (status: string) => {
    if (status === 'COMPLICACAO') return 'Complicação';
    return 'Problema';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            Alertas e Problemas
          </h1>
          <p className="text-gray-600 mt-1">
            Monitoramento de problemas e complicações reportadas
          </p>
        </div>
        {alerts.recentCount > 0 && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
            {alerts.recentCount} novos nas últimas 24h
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {allAlerts.length - resolved.size}
          </div>
          <div className="text-sm text-gray-600">Alertas Ativos</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {alerts.problems.filter((p) => !resolved.has(p.id)).length}
          </div>
          <div className="text-sm text-gray-600">Problemas</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {alerts.complications.filter((c) => !resolved.has(c.id)).length}
          </div>
          <div className="text-sm text-gray-600">Complicações</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {resolved.size}
          </div>
          <div className="text-sm text-gray-600">Resolvidos</div>
        </div>
      </div>

      {/* Dispositivos com Problemas Recorrentes */}
      {alerts.deviceIssues.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            ⚠️ Dispositivos com Problemas Recorrentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.deviceIssues.map((device) => (
              <div
                key={device.deviceId}
                className="bg-white rounded-lg p-4 border-l-4 border-red-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{device.deviceName}</h3>
                    <p className="text-sm text-gray-600">{device.category}</p>
                  </div>
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                    {device.problemCount} problemas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({allAlerts.length - resolved.size})
            </button>
            <button
              onClick={() => setFilter('problem')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'problem'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Problemas ({alerts.problems.filter((p) => !resolved.has(p.id)).length})
            </button>
            <button
              onClick={() => setFilter('complication')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'complication'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Complicações (
              {alerts.complications.filter((c) => !resolved.has(c.id)).length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Nenhum alerta ativo!
          </h3>
          <p className="text-gray-600">
            {resolved.size > 0
              ? 'Todos os alertas foram resolvidos.'
              : 'Não há problemas reportados no momento.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${getSeverityColor(
                alert.status
              )}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getSeverityIcon(alert.status)}</div>

                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            alert.status === 'COMPLICACAO'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {getSeverityLabel(alert.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {alert.device.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition font-semibold text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar como Resolvido
                    </button>
                  </div>

                  {/* Informações */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-gray-500 text-xs">Instrumentador</div>
                        <div className="font-semibold text-gray-800">
                          {alert.user.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-gray-500 text-xs">Hospital</div>
                        <div className="font-semibold text-gray-800">
                          {alert.hospitalName || 'Não informado'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-gray-500 text-xs">Data</div>
                        <div className="font-semibold text-gray-800">
                          {new Date(alert.surgeryDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dispositivo */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600">
                        Informações do Dispositivo
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Categoria:</span>{' '}
                        <span className="font-semibold">
                          {alert.device.category || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Código:</span>{' '}
                        <span className="font-mono text-sm">
                          {alert.device.barcode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Problema Reportado */}
                  {alert.problemsReported && (
                    <div
                      className={`rounded-lg p-4 ${
                        alert.status === 'COMPLICACAO'
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        ⚠️ Descrição do Problema
                      </div>
                      <p className="text-sm text-gray-800">
                        {alert.problemsReported}
                      </p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/dashboard/cirurgias/${alert.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                    >
                      Ver Detalhes Completos →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
