import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Se já estiver logado, redirecionar para dashboard
  if (session) {
    if (session.user.role === 'ADMIN' || session.user.role === 'SUPERVISOR') {
      redirect('/dashboard');
    } else {
      redirect('/app');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-sintegra flex items-center justify-center p-4">
      {children}
    </div>
  );
}
