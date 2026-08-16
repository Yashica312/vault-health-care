import { useApp } from '@/contexts/AppContext';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const ProfileSwitcher = () => {
  const { profiles, activeProfile, setActiveProfileId } = useApp();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary transition-smooth">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: activeProfile.avatarColor }}
          >
            {initials(activeProfile.name)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-sm truncate">{activeProfile.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize">
              {activeProfile.relation === 'self' ? 'You' : activeProfile.relation} · {activeProfile.bloodGroup}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">Switch profile</DropdownMenuLabel>
        {profiles.map(p => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => setActiveProfileId(p.id)}
            className="gap-2.5 py-2.5 cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: p.avatarColor }}
            >
              {initials(p.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{p.name}</div>
              <div className="text-[11px] text-muted-foreground capitalize">{p.relation === 'self' ? 'You' : p.relation}</div>
            </div>
            {p.id === activeProfile.id && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/app/profile')} className="gap-2.5 py-2.5 text-primary cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-sm">Add family member</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileSwitcher;