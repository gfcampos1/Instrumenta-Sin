import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-sintegra">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Logo da Sintegra */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <Image
                src="/logo/sintegra-logo.png"
                alt="Sintegra Logo"
                width={200}
                height={80}
                priority
                className="w-auto h-auto"
              />
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center text-white mb-16">
            <h1 className="text-5xl font-bold mb-6">
              Instrumenta-Sin
            </h1>
            <p className="text-2xl mb-4 text-primary-100">
              Monitoramento de Dispositivos Médicos em Campo
            </p>
            <p className="text-lg text-primary-50 max-w-2xl mx-auto">
              Sistema de gamificação para instrumentadores registrarem cirurgias,
              coletarem dados e ganharem recompensas em tempo real.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login"
              className="bg-white text-primary-800 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              🔐 Fazer Login
            </Link>
            <Link
              href="/cadastro"
              className="bg-primary-800 text-white px-8 py-4 rounded-xl font-bold text-lg border-2 border-white hover:bg-primary-900 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              ✨ Criar Conta
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/95 backdrop-blur rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-bold text-xl mb-2 text-gray-800">
                GPS Automático
              </h3>
              <p className="text-gray-600">
                Localização automática de todas as cirurgias realizadas
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="font-bold text-xl mb-2 text-gray-800">
                Scanner de Código
              </h3>
              <p className="text-gray-600">
                Identifique dispositivos rapidamente com a câmera
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-bold text-xl mb-2 text-gray-800">
                Gamificação
              </h3>
              <p className="text-gray-600">
                Ganhe pontos, badges e suba no ranking
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/30">
            <div className="grid grid-cols-3 gap-8 text-center text-white">
              <div>
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-sm text-primary-100">Cirurgias Registradas</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-sm text-primary-100">Instrumentadores Ativos</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-sm text-primary-100">Dispositivos Rastreados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-white/80 pb-8">
        <p className="text-sm">
          © {new Date().getFullYear()} Sintegra. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}
