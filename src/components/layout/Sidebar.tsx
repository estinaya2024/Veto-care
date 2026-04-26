import { 
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Users,
  Calendar,
  Settings,
  LayoutDashboard,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import logo from '../../assets/images/logo-icon-only.png';
import { useI18n } from '../../context/I18nContext';

interface SidebarProps {
  role: 'owner' | 'vet' | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

interface SidebarContentProps {
  isCollapsed: boolean;
  role: string | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  filteredItems: any[];
  onLogout: () => void;
  setIsMobileOpen: (open: boolean) => void;
  logoutLabel: string;
}

const SidebarContent = ({ 
  isCollapsed, 
  activeTab, 
  setActiveTab, 
  filteredItems, 
  onLogout, 
  setIsMobileOpen,
  logoutLabel
}: SidebarContentProps) => (
  <div className="flex flex-col h-full py-8">
    {/* Logo Section */}
    <div className={cn(
      "flex items-center gap-3 px-6 mb-12 transition-all duration-300",
      isCollapsed ? "justify-center" : ""
    )}>
      <img src={logo} alt="Logo" className="w-10 h-10 min-w-[40px] drop-shadow-lg" />
      {!isCollapsed && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-black text-2xl tracking-tighter text-veto-black"
        >
          Veto-Care
        </motion.span>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-4 space-y-2">
      {filteredItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            setIsMobileOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative",
            activeTab === item.id 
              ? "bg-black text-white shadow-sm" 
              : "text-gray-500 hover:bg-gray-50 hover:text-black"
          )}
        >
          <item.icon size={20} className={cn(
            "transition-transform",
            activeTab === item.id ? "scale-105" : "group-hover:scale-105"
          )} />
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-sm tracking-tight whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {activeTab === item.id && isCollapsed && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full mr-2" />
          )}
        </button>
      ))}
    </nav>

    {/* Footer / Logout */}
    <div className="px-4 mt-auto">
      <div className="h-[1px] bg-gray-100 mb-6 mx-2" />
      <button
        onClick={onLogout}
        className={cn(
          "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold group",
          isCollapsed && "justify-center"
        )}
      >
        <LogOut size={20} className="group-hover:scale-105 transition-transform" />
        {!isCollapsed && <span className="text-sm">{logoutLabel}</span>}
      </button>
    </div>
  </div>
);

export function Sidebar({ role, onLogout, activeTab, setActiveTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { t } = useI18n();

  const menuItems = [
    { id: 'dashboard', labelKey: 'sidebar.dashboard', icon: LayoutDashboard, roles: ['owner', 'vet'] },
    { id: 'owner',     labelKey: 'sidebar.owners',       icon: Users,          roles: ['owner', 'vet'] },
    { id: 'vet',       labelKey: 'sidebar.vets',          icon: Stethoscope,    roles: ['vet'] },
    { id: 'appointments', labelKey: 'sidebar.appointments', icon: Calendar,    roles: ['vet'] },
    { id: 'settings', labelKey: 'sidebar.settings',      icon: Settings,       roles: ['owner', 'vet'] },
  ];

  const filteredItems = menuItems
    .filter(item => item.roles.includes(role || ''))
    .map(item => ({ ...item, label: t(item.labelKey) }));

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-5 bg-white border-b border-gray-100 sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tighter">VetoCare</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2.5 bg-gray-100 rounded-xl"
        >
         <Menu size={20} className="text-black" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block h-screen sticky top-0 bg-white border-r border-black/5 transition-all duration-300 z-[100]",
        isCollapsed ? "w-24" : "w-72"
      )}>
        <SidebarContent 
          isCollapsed={isCollapsed}
          role={role}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredItems={filteredItems}
          onLogout={onLogout}
          setIsMobileOpen={setIsMobileOpen}
          logoutLabel={t('sidebar.logout')}
        />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black/5 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50 hidden md:flex"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[201] md:hidden shadow-2xl"
            >
              <SidebarContent 
                isCollapsed={false}
                role={role}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filteredItems={filteredItems}
                onLogout={onLogout}
                setIsMobileOpen={setIsMobileOpen}
                logoutLabel={t('sidebar.logout')}
              />
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors font-bold"
              >
                <X size={20} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
