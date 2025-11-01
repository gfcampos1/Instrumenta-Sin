'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  Users,
  Package,
  Activity,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mapa', href: '/dashboard/mapa', icon: Map },
  { name: 'Usuários', href: '/dashboard/usuarios', icon: Users, adminOnly: true },
  { name: 'Dispositivos', href: '/dashboard/dispositivos', icon: Package, adminOnly: true },
  { name: 'Cirurgias', href: '/dashboard/cirurgias', icon: Activity },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: FileText, adminOnly: true },
  { name: 'Configurações', href: '/dashboard/admin-setup', icon: Settings, adminOnly: true }
];

const Sidebar: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR';

  // Filtrar itens baseado no role
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const sidebarWidth = isCollapsed ? 80 : 280;

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-gradient-sintegra text-white flex flex-col shadow-2xl"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 bg-white text-primary-600 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all hover:scale-110"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary-600 font-bold text-xl">
                S
              </div>
              <div>
                <h1 className="text-lg font-bold">Sintegra</h1>
                <p className="text-xs text-primary-100">Instrumenta-Sin</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary-600 font-bold text-xl">
                S
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isCollapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/20">
        {session?.user && (
          <div className={`mb-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <div
              className={`
                flex items-center gap-3
                ${isCollapsed ? '' : 'p-3 bg-white/10 rounded-lg'}
              `}
            >
              <div className="w-10 h-10 bg-gradient-sintegra-reverse rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="font-medium text-sm truncate">{session.user.name}</p>
                    <p className="text-xs text-primary-100 truncate">{session.user.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`
            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
            text-white hover:bg-red-500/20 transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium text-sm"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
