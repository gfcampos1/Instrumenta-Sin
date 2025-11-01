import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MapaClient from './MapaClient';

export default async function MapaPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  // Buscar cirurgias com localização
  const surgeries = await prisma.surgery.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      device: { select: { name: true, category: true } }
    }
  });

  return <MapaClient surgeries={surgeries} />;
}
