import React, { useMemo } from 'react';
import { getWeekDays, formatDate, getToday, isToday, getShortWeekdayName } from '@/utils/date';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useStudentStore } from '@/store/useStudentStore';
import { SCHEDULE_STATUS, INTENTION_LEVELS } from '@/types';
import { cn } from '@/utils/cn';

interface WeekViewProps {
  currentDate: Date;
  onDateClick: (date: string) => void;
}

const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export function WeekView({ currentDate, onDateClick }: WeekViewProps) {
  const days = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const getSchedulesByDate = useScheduleStore((state) => state.getSchedulesByDate);
  const getStudentById = useStudentStore((state) => state.getStudentById);
  const getTeacherById = useScheduleStore((state) => state.getTeacherById);
  const getCourseById = useScheduleStore((state) => state.getCourseById);
  const today = getToday();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-px bg-gray-200 mb-px">
          <div className="bg-gray-50 py-3 text-center text-sm font-medium text-gray-500">
            时间
          </div>
          {days.map((date) => {
            const dateStr = formatDate(date);
            const isTodayDate = isToday(date);
            return (
              <div
                key={dateStr}
                onClick={() => onDateClick(dateStr)}
                className={cn(
                  'bg-gray-50 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors',
                  isTodayDate && 'bg-blue-50'
                )}
              >
                <div className={cn(
                  'text-sm font-medium',
                  isTodayDate && 'text-blue-600'
                )}>
                  {formatDate(date, 'MM月dd日')}
                </div>
                <div className="text-xs text-gray-500">
                  {getShortWeekdayName(date)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-8 gap-px bg-gray-200">
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div
                className="bg-white py-4 px-2 text-center text-sm text-gray-500"
              >
                {time}
              </div>
              {days.map((date) => {
                const dateStr = formatDate(date);
                const schedules = getSchedulesByDate(dateStr).filter(
                  (s) => s.startTime >= time && s.startTime < `${parseInt(time) + 1}:00`
                );

                return (
                  <div
                    key={`${dateStr}-${time}`}
                    className="bg-white p-1 min-h-[60px]"
                  >
                    {schedules.map((schedule) => {
                      const student = getStudentById(schedule.studentId);
                      const teacher = getTeacherById(schedule.teacherId);
                      const course = getCourseById(schedule.courseId);
                      const intentionLevel = student?.intentionLevel || 'none';

                      return (
                        <div
                          key={schedule.id}
                          className={cn(
                            'text-xs p-2 rounded mb-1',
                            SCHEDULE_STATUS[schedule.status].color
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <span className={cn('w-1.5 h-1.5 rounded-full', INTENTION_LEVELS[intentionLevel].color)} />
                            <span className="font-medium">{schedule.startTime}-{schedule.endTime}</span>
                          </div>
                          <div className="font-medium">{student?.name}</div>
                          <div className="text-gray-500 truncate">{course?.name}</div>
                          <div className="text-gray-500 text-[10px]">{teacher?.name}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
