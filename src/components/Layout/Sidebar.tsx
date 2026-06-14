import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, ClipboardCheck, PhoneCall, BarChart3 } from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { path: '/calendar', label: '日历排课', icon: Calendar },
  { path: '/students', label: '学员档案', icon: Users },
  { path: '/reception', label: '签到接待', icon: ClipboardCheck },
  { path: '/followup', label: '回访记录', icon: PhoneCall },
  { path: '/dashboard', label: '统计看板', icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-[#1e3a5f] text-white flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="p-5 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-wide">培训机构管理系统</h1>
        <p className="text-xs text-white/60 mt-1">Training Management</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/calendar' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold">
            前
          </div>
          <div>
            <p className="text-sm font-medium">前台管理员</p>
            <p className="text-xs text-white/60">前台</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
