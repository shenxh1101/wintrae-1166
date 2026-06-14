import { useMemo } from 'react';
import { Bell, Search } from 'lucide-react';
import { useFollowupStore } from '@/store/useFollowupStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { getToday } from '@/utils/date';

export function Header() {
  const followups = useFollowupStore((state) => state.followups);
  const schedules = useScheduleStore((state) => state.schedules);
  const getOverdueFollowups = useFollowupStore((state) => state.getOverdueFollowups);
  const getTodayFollowups = useFollowupStore((state) => state.getTodayFollowups);
  const getSchedulesByDate = useScheduleStore((state) => state.getSchedulesByDate);

  const today = useMemo(() => getToday(), []);
  const overdueCount = useMemo(() => getOverdueFollowups().length, [followups, getOverdueFollowups]);
  const todaySchedules = useMemo(() => getSchedulesByDate(today).length, [schedules, getSchedulesByDate, today]);
  const todayFollowups = useMemo(() => getTodayFollowups().length, [followups, getTodayFollowups]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索学员、课程..."
            className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            逾期回访：{overdueCount} 条
          </div>
        )}
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm">
          今日预约：{todaySchedules} 节
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm">
          今日回访：{todayFollowups} 条
        </div>

        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {(overdueCount + todayFollowups) > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {overdueCount + todayFollowups}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
