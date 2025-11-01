'use client';

import React, { useState } from 'react';
import { Search, UserPlus, Edit, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  active: boolean;
  points: number;
  level: number;
  createdAt: Date;
  _count: {
    surgeries: number;
    achievements: number;
  };
}

interface UsuariosClientProps {
  users: User[];
}

export default function UsuariosClient({ users }: UsuariosClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);

  React.useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') return <StatusBadge status="red" label="Admin" />;
    if (role === 'SUPERVISOR') return <StatusBadge status="yellow" label="Supervisor" />;
    return <StatusBadge status="gray" label="Instrumentador" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Usuários</h1>
          <p className="text-secondary-600 mt-1">Gerenciar usuários do sistema</p>
        </div>
        <Button leftIcon={<UserPlus size={18} />}>
          Novo Usuário
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={18} />}
        />
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Nome</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Email</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Role</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Cirurgias</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Pontos</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Status</th>
                <th className="text-right py-4 px-6 text-secondary-700 font-semibold text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Nenhum usuário encontrado"
                      description="Tente ajustar os filtros de busca"
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-secondary-900">{user.name}</td>
                    <td className="py-4 px-6 text-secondary-700">{user.email}</td>
                    <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-6 text-secondary-700">{user._count.surgeries}</td>
                    <td className="py-4 px-6">
                      <span className="text-primary-600 font-semibold">{user.points}</span>
                      <span className="text-xs text-secondary-500 ml-2">Nível {user.level}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge
                        status={user.active ? 'green' : 'gray'}
                        label={user.active ? 'Ativo' : 'Inativo'}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" leftIcon={<Edit size={14} />}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" leftIcon={<Trash2 size={14} />}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-secondary-900">{users.length}</p>
          <p className="text-sm text-secondary-600">Total de Usuários</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-status-green">
            {users.filter(u => u.active).length}
          </p>
          <p className="text-sm text-secondary-600">Ativos</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
          <p className="text-sm text-secondary-600">Admins</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-secondary-700">
            {users.reduce((acc, u) => acc + u._count.surgeries, 0)}
          </p>
          <p className="text-sm text-secondary-600">Cirurgias Total</p>
        </Card>
      </div>
    </div>
  );
}
