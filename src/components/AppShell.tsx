import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, Pill, Stethoscope, User as UserIcon, Bell, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import ProfileSwitcher from './ProfileSwitcher';

const nav = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/records', icon: FileText, label: 'Records' },
  { to: '/app/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/app/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/app/profile', icon: UserIcon, label: 'Profile' },
];

const AppShell = ({ children }: { children: ReactNode }) => {
  const { unreadCount } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-border bg-card z-30">
        <div className="px-6 py-6 border-b border-border">
          <NavLink to="/app" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-lg leading-none tracking-tight">Vault Health</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">Encrypted · Verified</div>
            </div>
          </NavLink>
        </div>

        <div className="px-4 py-4 border-b border-border">
          <ProfileSwitcher />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
              {item.label}
            </NavLink>
          ))}

          <NavLink
            to="/app/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                isActive ? 'bg-primary-light text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={2.2} />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-auto bg-primary text-primary-foreground h-5 min-w-5 px-1.5 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </NavLink>
        </nav>

        <div className="p-4 border-t border-border">
          <NavLink to="/app/emergency">
            <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive font-semibold">
              <AlertCircle className="w-4 h-4 mr-2" />
              Emergency Access
            </Button>
          </NavLink>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <NavLink to="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold tracking-tight">Vault Health</span>
          </NavLink>
          <div className="flex items-center gap-1">
            <NavLink to="/app/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </NavLink>
          </div>
        </div>
        <div className="px-4 pb-3">
          <ProfileSwitcher />
        </div>
      </header>

      {/* Main */}
      <main className="lg:pl-64 pb-24 lg:pb-8">
        <div key={location.pathname} className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border">
        <div className="grid grid-cols-5 h-16">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-smooth ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-smooth ${isActive ? 'bg-primary-light' : ''}`}>
                    <item.icon className="w-[18px] h-[18px]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;