import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  User,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default async function CirurgiaDetalhesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Buscar detalhes da cirurgia
  const surgery = await prisma.surgery.findUnique({
    where: { id: params.id },
    include: {
      device: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!surgery) {
    notFound();
  }

  // Verificar se o usuário tem permissão para ver esta cirurgia
  const isOwner = surgery.userId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    redirect('/app');
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCESSO':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PROBLEMA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'COMPLICACAO':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCESSO':
        return <CheckCircle className="w-5 h-5" />;
      case 'PROBLEMA':
        return <AlertCircle className="w-5 h-5" />;
      case 'COMPLICACAO':
        return <XCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCESSO':
        return 'Sucesso';
      case 'PROBLEMA':
        return 'Problema Reportado';
      case 'COMPLICACAO':
        return 'Complicação';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-gradient-sintegra text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href={isAdmin ? '/dashboard' : '/app/historico'}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Detalhes da Cirurgia</h1>
              <p className="text-primary-100 text-sm">
                {new Date(surgery.surgeryDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-4">
        {/* Status Card */}
        <div
          className={`rounded-xl p-4 border-2 ${getStatusColor(
            surgery.status
          )}`}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(surgery.status)}
            <div>
              <div className="font-bold text-lg">
                {getStatusLabel(surgery.status)}
              </div>
              <div className="text-sm opacity-80">
                Status da Cirurgia
              </div>
            </div>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="bg-white rounded-xl shadow-md p-5 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">
            Informações Gerais
          </h2>

          {/* Hospital */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary-600 mt-1" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Hospital</div>
              <div className="font-semibold text-gray-800">
                {surgery.hospitalName || 'Não informado'}
              </div>
              {surgery.latitude && surgery.longitude && (
                <div className="text-xs text-gray-500 mt-1">
                  📍 Lat: {surgery.latitude.toFixed(6)}, Long:{' '}
                  {surgery.longitude.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* Data e Hora */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary-600 mt-1" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Data e Hora</div>
              <div className="font-semibold text-gray-800">
                {new Date(surgery.surgeryDate).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Tipo de Cirurgia */}
          {surgery.surgeryType && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary-600 mt-1" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  Tipo de Cirurgia
                </div>
                <div className="font-semibold text-gray-800">
                  {surgery.surgeryType}
                </div>
              </div>
            </div>
          )}

          {/* Instrumentador */}
          {isAdmin && (
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary-600 mt-1" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">
                  Instrumentador
                </div>
                <div className="font-semibold text-gray-800">
                  {surgery.user.name}
                </div>
                <div className="text-xs text-gray-500">{surgery.user.email}</div>
              </div>
            </div>
          )}
        </div>

        {/* Dispositivo Utilizado */}
        <div className="bg-white rounded-xl shadow-md p-5 space-y-3">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Dispositivo Utilizado
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Nome</div>
              <div className="font-semibold text-gray-800">
                {surgery.device.name}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Categoria</div>
              <div className="font-semibold text-gray-800">
                {surgery.device.category || 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Código de Barras</div>
              <div className="font-mono text-sm text-gray-800">
                {surgery.device.barcode}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Fabricante</div>
              <div className="font-semibold text-gray-800">
                {surgery.device.manufacturer || 'N/A'}
              </div>
            </div>

            {surgery.device.model && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Modelo</div>
                <div className="font-semibold text-gray-800">
                  {surgery.device.model}
                </div>
              </div>
            )}

            {surgery.device.lotNumber && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Lote</div>
                <div className="font-mono text-sm text-gray-800">
                  {surgery.device.lotNumber}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Avaliação e Feedback */}
        <div className="bg-white rounded-xl shadow-md p-5 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">
            Avaliação e Feedback
          </h2>

          {/* Conduta do Médico */}
          {surgery.doctorConduct && (
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">
                Como ocorreu a cirurgia / Conduta do Médico
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                {surgery.doctorConduct}
              </div>
            </div>
          )}

          {/* Performance do Dispositivo */}
          {surgery.devicePerformance && (
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">
                Desempenho do Dispositivo
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                {surgery.devicePerformance}
              </div>
            </div>
          )}

          {/* Problemas Reportados */}
          {surgery.problemsReported && (
            <div>
              <div className="text-xs text-red-600 mb-2 font-semibold">
                ⚠️ Problemas Reportados
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-gray-800">
                {surgery.problemsReported}
              </div>
            </div>
          )}

          {/* Notas Adicionais */}
          {surgery.notes && (
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold">
                Observações Adicionais
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                {surgery.notes}
              </div>
            </div>
          )}
        </div>

        {/* Fotos/Evidências */}
        {surgery.photos && surgery.photos.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-600" />
              Fotos de Evidência ({surgery.photos.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {surgery.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={photo}
                    alt={`Evidência ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadados */}
        <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-600">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">ID:</span> {surgery.id.slice(0, 8)}...
            </div>
            <div>
              <span className="font-semibold">Registrado em:</span>{' '}
              {new Date(surgery.createdAt).toLocaleString('pt-BR')}
            </div>
            {surgery.locationAccuracy && (
              <div>
                <span className="font-semibold">Precisão GPS:</span>{' '}
                {surgery.locationAccuracy.toFixed(0)}m
              </div>
            )}
            <div>
              <span className="font-semibold">Última atualização:</span>{' '}
              {new Date(surgery.updatedAt).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
