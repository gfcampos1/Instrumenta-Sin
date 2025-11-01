import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirecionar se não estiver logado
  if (!session) {
    redirect('/login');
  }

  // Apenas Admin e Supervisor podem acessar
  if (session.user.role === 'INSTRUMENTADOR') {
    redirect('/app');
  }

  return (
    <div className="flex h-screen bg-secondary-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
