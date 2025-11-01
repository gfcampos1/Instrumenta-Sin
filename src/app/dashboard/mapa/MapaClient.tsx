'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Filter, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import 'leaflet/dist/leaflet.css';

interface Surgery {
  id: string;
  latitude: number;
  longitude: number;
  hospitalName: string;
  surgeryType: string;
  status: string;
  surgeryDate: Date;
  city: string | null;
  state: string | null;
  user: { name: string };
  device: { name: string; category: string };
}

interface MapaClientProps {
  surgeries: Surgery[];
}

// Fix para os ícones do Leaflet no Next.js
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícones customizados por status
const createCustomIcon = (status: string) => {
  const color = status === 'SUCESSO' ? 'green' : status === 'PROBLEMA' ? 'yellow' : 'red';
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export default function MapaClient({ surgeries }: MapaClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSurgeries = selectedStatus === 'Todos'
    ? surgeries
    : surgeries.filter(s => s.status === selectedStatus);

  // Centro do Brasil (aproximado)
  const defaultCenter: [number, number] = [-15.7801, -47.9292];
  const defaultZoom = 4;

  // Se houver cirurgias, centralizar no primeiro
  const center: [number, number] = surgeries.length > 0
    ? [surgeries[0].latitude, surgeries[0].longitude]
    : defaultCenter;

  const statusCounts = {
    total: surgeries.length,
    sucesso: surgeries.filter(s => s.status === 'SUCESSO').length,
    problema: surgeries.filter(s => s.status === 'PROBLEMA').length,
    complicacao: surgeries.filter(s => s.status === 'COMPLICACAO').length
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Mapa de Cirurgias</h1>
          <p className="text-secondary-600 mt-1">Carregando mapa...</p>
        </div>
        <Card className="h-96 flex items-center justify-center">
          <div className="text-center text-secondary-600">
            Carregando mapa...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Mapa de Cirurgias</h1>
        <p className="text-secondary-600 mt-1">
          Visualização geográfica das cirurgias registradas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedStatus('Todos')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {statusCounts.total}
              </p>
            </div>
            <MapPin className="text-secondary-400" size={32} />
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedStatus('SUCESSO')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 font-medium">Sucesso</p>
              <p className="text-3xl font-bold text-status-green mt-1">
                {statusCounts.sucesso}
              </p>
            </div>
            <div className="w-4 h-4 rounded-full bg-status-green"></div>
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedStatus('PROBLEMA')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 font-medium">Problema</p>
              <p className="text-3xl font-bold text-status-yellow mt-1">
                {statusCounts.problema}
              </p>
            </div>
            <div className="w-4 h-4 rounded-full bg-status-yellow"></div>
          </div>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedStatus('COMPLICACAO')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 font-medium">Complicação</p>
              <p className="text-3xl font-bold text-status-red mt-1">
                {statusCounts.complicacao}
              </p>
            </div>
            <div className="w-4 h-4 rounded-full bg-status-red"></div>
          </div>
        </Card>
      </div>

      {/* Filter Info */}
      {selectedStatus !== 'Todos' && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-primary-600" />
              <span className="text-sm text-secondary-700">
                Filtrando por: <strong>{selectedStatus}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedStatus('Todos')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpar filtro
            </button>
          </div>
        </Card>
      )}

      {/* Map */}
      <Card padding="none" className="overflow-hidden">
        {filteredSurgeries.length === 0 ? (
          <div className="h-96">
            <EmptyState
              icon={<MapPin size={48} />}
              title="Nenhuma cirurgia encontrada"
              description="Não há cirurgias registradas com coordenadas GPS"
            />
          </div>
        ) : (
          <div className="h-[600px] w-full">
            <MapContainer
              center={center}
              zoom={surgeries.length > 1 ? 5 : 12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredSurgeries.map((surgery) => (
                <Marker
                  key={surgery.id}
                  position={[surgery.latitude, surgery.longitude]}
                  icon={createCustomIcon(surgery.status)}
                >
                  <Popup>
                    <div className="p-2 min-w-[250px]">
                      <h3 className="font-bold text-secondary-900 mb-2">
                        {surgery.hospitalName}
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-secondary-600">Tipo:</span>{' '}
                          <span className="font-medium">{surgery.surgeryType}</span>
                        </div>

                        <div>
                          <span className="text-secondary-600">Dispositivo:</span>{' '}
                          <span className="font-medium">{surgery.device.name}</span>
                        </div>

                        <div>
                          <span className="text-secondary-600">Categoria:</span>{' '}
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            {surgery.device.category}
                          </span>
                        </div>

                        <div>
                          <span className="text-secondary-600">Instrumentador:</span>{' '}
                          <span className="font-medium">{surgery.user.name}</span>
                        </div>

                        <div>
                          <span className="text-secondary-600">Status:</span>{' '}
                          <StatusBadge
                            status={
                              surgery.status === 'SUCESSO' ? 'green' :
                              surgery.status === 'PROBLEMA' ? 'yellow' : 'red'
                            }
                            label={surgery.status}
                          />
                        </div>

                        {surgery.city && surgery.state && (
                          <div>
                            <span className="text-secondary-600">Local:</span>{' '}
                            <span className="font-medium">
                              {surgery.city}, {surgery.state}
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="text-secondary-600">Data:</span>{' '}
                          <span className="font-medium">
                            {new Date(surgery.surgeryDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </Card>

      {/* Legend */}
      <Card>
        <h3 className="text-sm font-semibold text-secondary-900 mb-3">Legenda</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-green"></div>
            <span className="text-sm text-secondary-700">Sucesso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-yellow"></div>
            <span className="text-sm text-secondary-700">Problema</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-red"></div>
            <span className="text-sm text-secondary-700">Complicação</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
