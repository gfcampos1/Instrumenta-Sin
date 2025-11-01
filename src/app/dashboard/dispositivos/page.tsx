import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DispositivosClient from './DispositivosClient';

export default async function DispositivosPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const devices = await prisma.device.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          surgeries: true
        }
      }
    }
  });

  return <DispositivosClient devices={devices} />;
}
