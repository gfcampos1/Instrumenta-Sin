'use client';

import React, { useState } from 'react';
import { Search, UserPlus, Edit, Trash2, Mail, Lock, Phone, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';

const USER_ROLES = ['INSTRUMENTADOR', 'SUPERVISOR', 'ADMIN'] as const;

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email invalido'),
  phone: z.string().optional(),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: 'Selecione um perfil valido' }),
  }),
  active: z.boolean().default(true),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userList, setUserList] = useState(users);

  React.useEffect(() => {
    setUserList(users);
  }, [users]);

  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) {
      return userList;
    }

    const term = searchTerm.toLowerCase();
    return userList.filter(
      (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
  }, [searchTerm, userList]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'INSTRUMENTADOR',
      active: true,
      password: '',
    },
  });

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') return <StatusBadge status="red" label="Admin" />;
    if (role === 'SUPERVISOR') return <StatusBadge status="yellow" label="Supervisor" />;
    return <StatusBadge status="gray" label="Instrumentador" />;
  };

  const openCreateModal = () => setIsCreateModalOpen(true);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    reset();
  };

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Erro ao criar usuario');
      }

      const newUser: User = {
        ...data.data,
        _count: data.data._count ?? { surgeries: 0, achievements: 0 },
      };

      setUserList((prev) => [newUser, ...prev]);
      toast.success('Usuario criado com sucesso!');
      closeCreateModal();
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar usuario');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Usuarios</h1>
          <p className="text-secondary-600 mt-1">Gerencie os usuarios do sistema</p>
        </div>
        <Button leftIcon={<UserPlus size={18} />} onClick={openCreateModal}>
          Novo Usuario
        </Button>
      </div>

      <Card>
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          leftIcon={<Search size={18} />}
        />
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Nome</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Email</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Perfil</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Cirurgias</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Pontos</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Status</th>
                <th className="text-right py-4 px-6 text-secondary-700 font-semibold text-sm">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Nenhum usuario encontrado"
                      description="Tente ajustar os filtros de busca"
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-secondary-900">{user.name}</td>
                    <td className="py-4 px-6 text-secondary-700">{user.email}</td>
                    <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-6 text-secondary-700">{user._count.surgeries}</td>
                    <td className="py-4 px-6">
                      <span className="text-primary-600 font-semibold">{user.points}</span>
                      <span className="text-xs text-secondary-500 ml-2">Nivel {user.level}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-secondary-900">{userList.length}</p>
          <p className="text-sm text-secondary-600">Total de Usuarios</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-status-green">
            {userList.filter((user) => user.active).length}
          </p>
          <p className="text-sm text-secondary-600">Ativos</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            {userList.filter((user) => user.role === 'ADMIN').length}
          </p>
          <p className="text-sm text-secondary-600">Admins</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-secondary-700">
            {userList.reduce((acc, user) => acc + user._count.surgeries, 0)}
          </p>
          <p className="text-sm text-secondary-600">Cirurgias Total</p>
        </Card>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Novo usuario"
        description="Preencha os dados para cadastrar um novo usuario."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              placeholder="Nome completo"
              required
              leftIcon={<UserPlus size={18} />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              type="email"
              label="Email"
              placeholder="nome@empresa.com"
              required
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              leftIcon={<Phone size={18} />}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Perfil
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                  size={18}
                />
                <select
                  className="w-full rounded-lg border bg-white pl-10 pr-4 py-2.5 text-secondary-900 border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...register('role')}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role === 'INSTRUMENTADOR'
                        ? 'Instrumentador'
                        : role === 'SUPERVISOR'
                        ? 'Supervisor'
                        : 'Admin'}
                    </option>
                  ))}
                </select>
              </div>
              {errors.role?.message && (
                <p className="mt-1.5 text-sm text-status-red">{errors.role.message}</p>
              )}
            </div>
            <Input
              type="password"
              label="Senha"
              placeholder="Senha temporaria"
              required
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="user-active"
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                {...register('active')}
              />
              <label htmlFor="user-active" className="text-sm text-secondary-700">
                Usuario ativo
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeCreateModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Criar usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
