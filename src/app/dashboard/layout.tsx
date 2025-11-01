import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-sintegra text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Torre de Controle</h1>
          <p className="text-primary-100 text-sm">Instrumenta-Sin</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/dashboard/mapa"
            className="block px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            🗺️ Mapa
          </Link>
          <Link
            href="/dashboard/usuarios"
            className="block px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            👥 Usuários
          </Link>
          <Link
            href="/dashboard/dispositivos"
            className="block px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            📦 Dispositivos
          </Link>
          <Link
            href="/dashboard/relatorios"
            className="block px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            📈 Relatórios
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="text-sm font-semibold">{session.user.name}</div>
            <div className="text-xs text-primary-100">{session.user.email}</div>
          </div>
          <Link
            href="/api/auth/signout"
            className="block text-center bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
