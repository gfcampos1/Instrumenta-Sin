import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MapaClient from './MapaClient';

export default async function MapaPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  // Buscar todas as cirurgias (latitude e longitude são obrigatórios no schema)
  const surgeries = await prisma.surgery.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      device: { select: { name: true, category: true } }
    }
  });

  return <MapaClient surgeries={surgeries} />;
}
