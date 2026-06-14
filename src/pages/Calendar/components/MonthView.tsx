import { useMemo } from 'react';
import { getMonthDays, getShortWeekdayName, formatDate, getToday, isTodayDateObj, parseISO } from '@/utils/date';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useStudentStore } from '@/store/useStudentStore';
import { SCHEDULE_STATUS, INTENTION_LEVELS } from '@/types';
import { cn } from '@/utils/cn';
interface MonthViewProps {
  currentDate: Date;
  onDateClick: (date: string) => void;
}

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export function MonthView({ currentDate, onDateClick }: MonthViewProps) {
  const days = useMemo(() => getMonthDays(currentDate), [currentDate]);
  const schedulesAll = useScheduleStore((state) => state.schedules);
  const getSchedulesByDate = useScheduleStore((state) => state.getSchedulesByDate);
  const getStudentById = useStudentStore((state) => state.getStudentById);
  const getTeacherById = useScheduleStore((state) => state.getTeacherById);
  const getCourseById = useScheduleStore((state) => state.getCourseById);
  const today = getToday();

  const currentMonth = currentDate.getMonth();

  const schedulesByDate = useMemo(() => {
    const map: Record<string, ReturnType<typeof getSchedulesByDate>> = {};
    for (const date of days) {
      const dateStr = formatDate(date);
      map[dateStr] = getSchedulesByDate(dateStr);
    }
    return map;
  }, [days, schedulesAll, getSchedulesByDate]);

  return (
    <div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 mb-px">
        {weekdays.map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((date) => {
          const dateStr = formatDate(date);
          const schedules = schedulesByDate[dateStr] || [];
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isToday = isTodayDateObj(date);

          return (
            <div
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={cn(
                'min-h-[120px] p-2 bg-white cursor-pointer transition-colors hover:bg-gray-50',
                !isCurrentMonth && 'bg-gray-50/50',
                isToday && 'bg-blue-50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isToday && 'w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center',
                    !isCurrentMonth && 'text-gray-400'
                  )}
                >
                  {date.getDate()}
                </span>
                {schedules.length > 0 && (
                  <span className="text-xs text-gray-500">{schedules.length}节</span>
                )}
              </div>
              <div className="space-y-1">
                {schedules.slice(0, 3).map((schedule) => {
                  const student = getStudentById(schedule.studentId);
                  const teacher = getTeacherById(schedule.teacherId);
                  const course = getCourseById(schedule.courseId);
                  const intentionLevel = student?.intentionLevel || 'none';
                  return (
                    <div
                      key={schedule.id}
                      className={cn(
                        'text-xs p-1.5 rounded truncate',
                        SCHEDULE_STATUS[schedule.status].color,
                        'border-l-2',
                        schedule.status === 'scheduled' ? 'border-l-blue-400' :
                        schedule.status === 'completed' ? 'border-l-emerald-400' : 'border-l-gray-400'
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <span className={cn('w-1.5 h-1.5 rounded-full', INTENTION_LEVELS[intentionLevel].color)} />
                        <span className="font-medium">{schedule.startTime}</span>
                        <span>{student?.name}</span>
                      </div>
                      <div className="text-gray-500 truncate">
                        {course?.name} · {teacher?.name}
                      </div>
                    </div>
                  );
                })}
                {schedules.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    还有 {schedules.length - 3} 节...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
