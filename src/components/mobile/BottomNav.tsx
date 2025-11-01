'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, History, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/app',
      icon: Home,
      label: 'Início',
      active: pathname === '/app',
    },
    {
      href: '/app/cirurgia/nova',
      icon: Plus,
      label: 'Nova',
      active: pathname === '/app/cirurgia/nova',
    },
    {
      href: '/app/historico',
      icon: History,
      label: 'Histórico',
      active: pathname === '/app/historico',
    },
    {
      href: '/app/perfil',
      icon: User,
      label: 'Perfil',
      active: pathname === '/app/perfil',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center transition-colors ${
                item.active
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" strokeWidth={item.active ? 2.5 : 2} />
              <span className={`text-xs font-medium ${item.active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
