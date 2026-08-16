import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Pill, Stethoscope, Calendar, Shield } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const iconMap = { reminder: Pill, prescription: Stethoscope, checkup: Calendar, security: Shield };
const colorMap = {
  reminder: 'hsl(221 83% 53%)',
  prescription: 'hsl(173 80% 36%)',
  checkup: 'hsl(38 92% 50%)',
  security: 'hsl(142 71% 45%)',
};

const Notifications = () => {
  const { notifications, markAllRead, unreadCount } = useApp();

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-3xl mx-auto space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <div className="font-semibold">All caught up</div>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = iconMap[n.type];
            const color = colorMap[n.type];
            return (
              <Card key={n.id} className={`p-4 border-border shadow-soft flex items-start gap-3 ${!n.read ? 'bg-primary-light/30' : ''}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm">{n.title}</div>
                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                  <div className="text-[11px] text-muted-foreground mt-1.5">{n.time}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;