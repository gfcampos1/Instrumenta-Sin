'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

type DeviceCategory =
  | 'ORTOPEDIA'
  | 'CARDIOLOGIA'
  | 'NEUROLOGIA'
  | 'GASTROENTEROLOGIA'
  | 'UROLOGIA'
  | 'OUTROS';

interface Product {
  id: string;
  barcode: string;
  name: string;
  category: DeviceCategory;
  manufacturer: string;
  model: string;
  lotNumber?: string;
  expirationDate?: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

interface ProductFormData {
  barcode: string;
  name: string;
  category: DeviceCategory;
  manufacturer: string;
  model: string;
  lotNumber?: string;
  expirationDate?: string;
  description?: string;
}

const CATEGORIES: { value: DeviceCategory; label: string }[] = [
  { value: 'ORTOPEDIA', label: 'Ortopedia' },
  { value: 'CARDIOLOGIA', label: 'Cardiologia' },
  { value: 'NEUROLOGIA', label: 'Neurologia' },
  { value: 'GASTROENTEROLOGIA', label: 'Gastroenterologia' },
  { value: 'UROLOGIA', label: 'Urologia' },
  { value: 'OUTROS', label: 'Outros' },
];

export default function ProdutosPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [formData, setFormData] = useState<ProductFormData>({
    barcode: '',
    name: '',
    category: 'ORTOPEDIA',
    manufacturer: '',
    model: '',
    lotNumber: '',
    expirationDate: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Verificar permissão
  useEffect(() => {
    if (session && session.user.role === 'INSTRUMENTADOR') {
      router.push('/app');
    }
  }, [session, router]);

  // Carregar produtos
  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter]);

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          barcode: '',
          name: '',
          category: 'ORTOPEDIA',
          manufacturer: '',
          model: '',
          lotNumber: '',
          expirationDate: '',
          description: '',
        });
        loadProducts();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao cadastrar produto');
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente desativar este produto?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };

  const getCategoryColor = (category: DeviceCategory) => {
    const colors: Record<DeviceCategory, string> = {
      ORTOPEDIA: 'bg-blue-100 text-blue-800',
      CARDIOLOGIA: 'bg-red-100 text-red-800',
      NEUROLOGIA: 'bg-purple-100 text-purple-800',
      GASTROENTEROLOGIA: 'bg-green-100 text-green-800',
      UROLOGIA: 'bg-yellow-100 text-yellow-800',
      OUTROS: 'bg-gray-100 text-gray-800',
    };
    return colors[category];
  };

  if (session?.user.role === 'INSTRUMENTADOR') {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-gray-600">Gerenciar dispositivos médicos</p>
        </div>
        {session?.user.role === 'ADMIN' && (
          <Button onClick={() => setShowModal(true)}>+ Novo Produto</Button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar por nome, código de barras, fabricante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ALL">Todas as categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum produto encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fabricante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código de Barras
                  </th>
                  {session?.user.role === 'ADMIN' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(
                          product.category
                        )}`}
                      >
                        {
                          CATEGORIES.find((c) => c.value === product.category)
                            ?.label
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.manufacturer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {product.barcode}
                    </td>
                    {session?.user.role === 'ADMIN' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Desativar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Produto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Código de Barras"
            value={formData.barcode}
            onChange={(e) =>
              setFormData({ ...formData, barcode: e.target.value })
            }
            required
          />

          <Input
            label="Nome do Produto"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as DeviceCategory,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Fabricante"
            value={formData.manufacturer}
            onChange={(e) =>
              setFormData({ ...formData, manufacturer: e.target.value })
            }
            required
          />

          <Input
            label="Modelo"
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
            required
          />

          <Input
            label="Número do Lote (opcional)"
            value={formData.lotNumber}
            onChange={(e) =>
              setFormData({ ...formData, lotNumber: e.target.value })
            }
          />

          <Input
            label="Data de Validade (opcional)"
            type="date"
            value={formData.expirationDate}
            onChange={(e) =>
              setFormData({ ...formData, expirationDate: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
