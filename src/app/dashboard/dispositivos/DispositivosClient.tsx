'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Package, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

interface Device {
  id: string;
  barcode: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  lotNumber: string | null;
  expirationDate: Date | null;
  active: boolean;
  createdAt: Date;
  _count: {
    surgeries: number;
  };
}

interface DispositivosClientProps {
  devices: Device[];
}

const CATEGORIES = [
  'Todos',
  'ORTOPEDIA',
  'CARDIOLOGIA',
  'NEUROLOGIA',
  'GASTROENTEROLOGIA',
  'UROLOGIA',
  'OUTROS'
];

const CATEGORY_COLORS: Record<string, string> = {
  ORTOPEDIA: 'bg-blue-100 text-blue-700',
  CARDIOLOGIA: 'bg-red-100 text-red-700',
  NEUROLOGIA: 'bg-purple-100 text-purple-700',
  GASTROENTEROLOGIA: 'bg-green-100 text-green-700',
  UROLOGIA: 'bg-yellow-100 text-yellow-700',
  OUTROS: 'bg-gray-100 text-gray-700'
};

export default function DispositivosClient({ devices }: DispositivosClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filteredDevices, setFilteredDevices] = useState(devices);

  React.useEffect(() => {
    let filtered = devices;

    // Filtrar por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(device => device.category === selectedCategory);
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDevices(filtered);
  }, [searchTerm, selectedCategory, devices]);

  const devicesByCategory = CATEGORIES.slice(1).map(category => ({
    category,
    count: devices.filter(d => d.category === category).length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dispositivos</h1>
          <p className="text-secondary-600 mt-1">Gerenciar dispositivos médicos</p>
        </div>
        <Button leftIcon={<Plus size={18} />}>
          Novo Dispositivo
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <Input
            placeholder="Buscar por nome, código ou fabricante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-secondary-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 border-0 focus:ring-0 text-secondary-900 bg-transparent cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      {/* Stats by Category */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {devicesByCategory.map(({ category, count }) => (
          <Card
            key={category}
            className="text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCategory(category)}
          >
            <div className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold mb-2 ${CATEGORY_COLORS[category]}`}>
              {category}
            </div>
            <p className="text-2xl font-bold text-secondary-900">{count}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Código</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Nome</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Categoria</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Fabricante</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Modelo</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Usos</th>
                <th className="text-left py-4 px-6 text-secondary-700 font-semibold text-sm">Status</th>
                <th className="text-right py-4 px-6 text-secondary-700 font-semibold text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<Package size={48} />}
                      title="Nenhum dispositivo encontrado"
                      description="Tente ajustar os filtros ou adicione um novo dispositivo"
                    />
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr
                    key={device.id}
                    className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm bg-secondary-100 px-2 py-1 rounded text-secondary-700">
                        {device.barcode}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-secondary-900">
                      {device.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${CATEGORY_COLORS[device.category]}`}>
                        {device.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-secondary-700">
                      {device.manufacturer}
                    </td>
                    <td className="py-4 px-6 text-secondary-700">
                      {device.model}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-primary-600 font-semibold">
                        {device._count.surgeries}
                      </span>
                      <span className="text-xs text-secondary-500 ml-1">cirurgias</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge
                        status={device.active ? 'green' : 'gray'}
                        label={device.active ? 'Ativo' : 'Inativo'}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-secondary-900">{devices.length}</p>
          <p className="text-sm text-secondary-600">Total de Dispositivos</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-status-green">
            {devices.filter(d => d.active).length}
          </p>
          <p className="text-sm text-secondary-600">Ativos</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-secondary-700">
            {devices.filter(d => !d.active).length}
          </p>
          <p className="text-sm text-secondary-600">Inativos</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            {devices.reduce((acc, d) => acc + d._count.surgeries, 0)}
          </p>
          <p className="text-sm text-secondary-600">Usos Totais</p>
        </Card>
      </div>
    </div>
  );
}
