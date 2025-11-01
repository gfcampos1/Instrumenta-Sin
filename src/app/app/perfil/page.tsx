'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  User,
  Mail,
  Phone,
  Camera,
  Edit2,
  Save,
  X,
  LogOut,
  Moon,
  Sun,
  ArrowLeft,
  Award,
  Activity,
  TrendingUp,
  Calendar,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import Image from 'next/image';

export default function PerfilPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const { theme, toggleTheme, mounted } = useTheme();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/profile');
      const result = await res.json();

      if (res.ok) {
        setProfile(result.data);
        setFormData({
          name: result.data.name || '',
          phone: result.data.phone || '',
          avatarUrl: result.data.avatarUrl || '',
        });
      } else {
        toast.error('Erro ao carregar perfil');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Perfil atualizado com sucesso!');
        setEditing(false);
        loadProfile();
        updateSession();
      } else {
        const result = await res.json();
        toast.error(result.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Deseja realmente sair?')) {
      await signOut({ callbackUrl: '/login' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-sintegra shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/app" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="text-white" size={24} />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
              <p className="text-primary-100 text-sm">Gerencie suas informações</p>
            </div>

            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                leftIcon={<Edit2 />}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30"
              >
                Editar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar and basic info */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-sintegra flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {formData.avatarUrl ? (
                  <Image src={formData.avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700">
                  <Camera size={16} />
                </button>
              )}
            </div>

            {/* User info */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <Input
                    label="Nome"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <Input
                    label="Telefone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-secondary-900">{profile.name}</h2>
                  <p className="text-secondary-600 flex items-center gap-2 mt-1">
                    <Mail size={16} />
                    {profile.email}
                  </p>
                  {profile.phone && (
                    <p className="text-secondary-600 flex items-center gap-2 mt-1">
                      <Phone size={16} />
                      {profile.phone}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                      Nível {profile.level}
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
                      {profile.points} pontos
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-secondary-200">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: profile.name || '',
                    phone: profile.phone || '',
                    avatarUrl: profile.avatarUrl || '',
                  });
                }}
                leftIcon={<X />}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={saving}
                leftIcon={<Save />}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <Activity className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-secondary-900">
              {profile.stats.totalSurgeries}
            </p>
            <p className="text-xs text-secondary-600">Cirurgias</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-secondary-900">
              {profile.stats.totalAchievements}
            </p>
            <p className="text-xs text-secondary-600">Badges</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <TrendingUp className="w-8 h-8 text-status-green mx-auto mb-2" />
            <p className="text-2xl font-bold text-secondary-900">
              {profile.stats.surgeriesByStatus.SUCESSO}
            </p>
            <p className="text-xs text-secondary-600">Sucessos</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <Calendar className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-secondary-900">
              {new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </p>
            <p className="text-xs text-secondary-600">Membro desde</p>
          </div>
        </div>

        {/* Recent activity */}
        {profile.recentSurgeries?.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-secondary-900 mb-4">Atividade Recente</h3>
            <div className="space-y-3">
              {profile.recentSurgeries.slice(0, 5).map((surgery: any) => (
                <div
                  key={surgery.id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary-900">{surgery.hospitalName}</p>
                    <p className="text-xs text-secondary-600">
                      {new Date(surgery.surgeryDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      surgery.status === 'SUCESSO'
                        ? 'bg-status-green text-white'
                        : surgery.status === 'PROBLEMA'
                        ? 'bg-status-yellow text-white'
                        : 'bg-status-red text-white'
                    }`}
                  >
                    {surgery.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent achievements */}
        {profile.recentAchievements?.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-secondary-900 mb-4">Conquistas Recentes</h3>
            <div className="grid grid-cols-5 gap-3">
              {profile.recentAchievements.slice(0, 5).map((achievement: any) => (
                <div key={achievement.id} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 mx-auto mb-2 flex items-center justify-center">
                    <Award className="text-white" size={24} />
                  </div>
                  <p className="text-xs text-secondary-600 truncate">
                    {achievement.badge.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h3 className="font-bold text-secondary-900 mb-4">Configurações</h3>

          {/* Dark mode toggle */}
          {mounted && (
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                <div>
                  <p className="font-medium text-secondary-900">Tema Escuro</p>
                  <p className="text-xs text-secondary-600">
                    {theme === 'dark' ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-primary-600' : 'bg-secondary-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Logout button */}
          <Button
            variant="danger"
            onClick={handleSignOut}
            leftIcon={<LogOut />}
            className="w-full"
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
