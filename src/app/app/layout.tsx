import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirecionar se não estiver logado
  if (!session) {
    redirect('/login');
  }

  // Admin/Supervisor vai para dashboard diferente
  if (session.user.role === 'ADMIN' || session.user.role === 'SUPERVISOR') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
