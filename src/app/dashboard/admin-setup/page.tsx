'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Database, RefreshCw, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

interface HealthStatus {
  success: boolean;
  database?: {
    connected: boolean;
    tables: number;
    tableNames: string[];
  };
  stats?: {
    users: number;
    surgeries: number;
    devices: number;
  };
  error?: string;
}

interface MigrationStatus {
  success: boolean;
  status?: string;
  message?: string;
  output?: string;
  migrations?: string[];
  error?: string;
}

export default function AdminSetupPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Health Check
  const checkHealth = async () => {
    setLoading('health');
    try {
      const res = await fetch('/api/admin/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (error: any) {
      setHealthStatus({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(null);
    }
  };

  // Check Migration Status
  const checkMigrationStatus = async () => {
    setLoading('migration-status');
    try {
      const res = await fetch('/api/admin/migrate');
      const data = await res.json();
      setMigrationStatus(data);
    } catch (error: any) {
      setMigrationStatus({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(null);
    }
  };

  // Run Migration
  const runMigration = async () => {
    const confirmed = confirm(
      '⚠️ ATENÇÃO!\n\n' +
      'Esta ação irá aplicar o schema do Prisma ao banco de dados.\n' +
      'Usando "db push --skip-generate --accept-data-loss".\n\n' +
      'Isso pode modificar a estrutura das tabelas.\n\n' +
      'Deseja continuar?'
    );

    if (!confirmed) return;

    setLoading('migration');
    try {
      const res = await fetch('/api/admin/migrate', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        alert(
          '✅ Migration executada com sucesso!\n\n' +
          (data.migrations?.join('\n') || 'Schema sincronizado')
        );
        await checkMigrationStatus();
      } else {
        alert(`❌ Erro na migration:\n\n${data.error || 'Erro desconhecido'}`);
      }

      setMigrationStatus(data);
    } catch (error: any) {
      alert(`❌ Erro ao executar migration:\n\n${error.message}`);
      setMigrationStatus({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(null);
    }
  };

  // Run Seed
  const runSeed = async () => {
    const confirmed = confirm(
      '🌱 Executar Seed do Banco\n\n' +
      'Esta ação irá:\n' +
      '• Criar usuário admin (admin@sintegra.com)\n' +
      '• Criar usuários de teste\n' +
      '• Criar devices de exemplo\n' +
      '• Criar badges e missões\n' +
      '• Criar configurações do sistema\n\n' +
      'Se os dados já existirem, eles não serão duplicados.\n\n' +
      'Deseja continuar?'
    );

    if (!confirmed) return;

    setLoading('seed');
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        alert(
          '✅ Seed executado com sucesso!\n\n' +
          'Credenciais criadas:\n' +
          '• Admin: admin@sintegra.com / admin123\n' +
          '• User: joao@sintegra.com / user123\n' +
          '• User: maria@sintegra.com / user123'
        );
        await checkHealth();
      } else {
        alert(`❌ Erro no seed:\n\n${data.error || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      alert(`❌ Erro ao executar seed:\n\n${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Admin Setup
        </h1>
        <p className="text-secondary-600">
          Gerenciamento de banco de dados e migrations
        </p>
      </div>

      {/* Section 1: Health Check */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
              <Database className="text-primary-600" size={24} />
              1. Health Check
            </h2>
            <p className="text-sm text-secondary-600 mt-1">
              Verificar conexão e estado do banco de dados
            </p>
          </div>
          <Button
            onClick={checkHealth}
            isLoading={loading === 'health'}
            leftIcon={<RefreshCw size={16} />}
            size="sm"
          >
            Verificar
          </Button>
        </div>

        {healthStatus && (
          <div className={`mt-4 p-4 rounded-lg ${healthStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-3">
              {healthStatus.success ? (
                <CheckCircle2 className="text-status-green flex-shrink-0" size={20} />
              ) : (
                <XCircle className="text-status-red flex-shrink-0" size={20} />
              )}
              <div className="flex-1">
                {healthStatus.success ? (
                  <>
                    <p className="font-semibold text-green-800 mb-2">
                      ✅ Banco de dados conectado
                    </p>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Tabelas: {healthStatus.database?.tables}</p>
                      <p>• Usuários: {healthStatus.stats?.users}</p>
                      <p>• Cirurgias: {healthStatus.stats?.surgeries}</p>
                      <p>• Dispositivos: {healthStatus.stats?.devices}</p>
                    </div>
                    {healthStatus.database?.tableNames && healthStatus.database.tableNames.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-sm text-green-800 cursor-pointer hover:underline">
                          Ver todas as tabelas ({healthStatus.database.tableNames.length})
                        </summary>
                        <div className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded max-h-40 overflow-y-auto">
                          {healthStatus.database.tableNames.map((name) => (
                            <div key={name}>• {name}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </>
                ) : (
                  <p className="text-red-800">
                    ❌ Erro: {healthStatus.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Migration Status */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
              <AlertCircle className="text-blue-600" size={24} />
              2. Status das Migrations
            </h2>
            <p className="text-sm text-secondary-600 mt-1">
              Verificar estado das migrations do Prisma
            </p>
          </div>
          <Button
            onClick={checkMigrationStatus}
            isLoading={loading === 'migration-status'}
            leftIcon={<RefreshCw size={16} />}
            size="sm"
            variant="secondary"
          >
            Verificar
          </Button>
        </div>

        {migrationStatus && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-sm text-blue-900">
              <pre className="whitespace-pre-wrap bg-blue-100 p-3 rounded text-xs overflow-x-auto">
                {migrationStatus.status || migrationStatus.message || 'Nenhuma informação disponível'}
              </pre>
            </div>
          </div>
        )}
      </Card>

      {/* Section 3: Run Migration */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
              <Play className="text-purple-600" size={24} />
              3. Aplicar Schema (db push)
            </h2>
            <p className="text-sm text-secondary-600 mt-1">
              Sincronizar schema do Prisma com o banco de dados
            </p>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Atenção:</strong> Esta operação usa <code className="bg-yellow-100 px-1 rounded">prisma db push</code> que pode alterar a estrutura das tabelas.
                Certifique-se de ter backup antes de executar em produção.
              </p>
            </div>
          </div>
          <Button
            onClick={runMigration}
            isLoading={loading === 'migration'}
            leftIcon={<Play size={16} />}
            size="sm"
            variant="primary"
          >
            Aplicar Schema
          </Button>
        </div>

        {migrationStatus && migrationStatus.output && (
          <details className="mt-4">
            <summary className="text-sm text-secondary-700 cursor-pointer hover:underline">
              Ver output completo
            </summary>
            <pre className="mt-2 text-xs bg-secondary-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {migrationStatus.output}
            </pre>
          </details>
        )}
      </Card>

      {/* Section 4: Seed Database */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              4. Popular Banco (Seed)
            </h2>
            <p className="text-sm text-secondary-600 mt-1">
              Criar dados iniciais: usuários, devices, badges, missões
            </p>
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
              <p className="font-semibold mb-1">Dados que serão criados:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Usuário admin: admin@sintegra.com / admin123</li>
                <li>2 usuários de teste (João e Maria)</li>
                <li>Devices médicos de exemplo</li>
                <li>5 badges de progresso</li>
                <li>Missões iniciais</li>
                <li>Configurações do sistema</li>
              </ul>
            </div>
          </div>
          <Button
            onClick={runSeed}
            isLoading={loading === 'seed'}
            leftIcon={<span>🌱</span>}
            size="sm"
            variant="primary"
          >
            Executar Seed
          </Button>
        </div>
      </Card>
    </div>
  );
}
