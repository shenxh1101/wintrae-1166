import { useMemo } from 'react';
import { formatDate, getToday, isTodayDateObj } from '@/utils/date';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useStudentStore } from '@/store/useStudentStore';
import { SCHEDULE_STATUS, INTENTION_LEVELS } from '@/types';
import { cn } from '@/utils/cn';
import { Clock, User, BookOpen, MessageSquare } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  onDateClick: (date: string) => void;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export function DayView({ currentDate, onDateClick }: DayViewProps) {
  const dateStr = formatDate(currentDate);
  const schedulesAll = useScheduleStore((state) => state.schedules);
  const getSchedulesByDate = useScheduleStore((state) => state.getSchedulesByDate);
  const getStudentById = useStudentStore((state) => state.getStudentById);
  const getTeacherById = useScheduleStore((state) => state.getTeacherById);
  const getCourseById = useScheduleStore((state) => state.getCourseById);
  const isTodayDate = isTodayDateObj(currentDate);

  const schedules = useMemo(() => getSchedulesByDate(dateStr), [schedulesAll, getSchedulesByDate, dateStr]);
  const sortedSchedules = useMemo(() => 
    [...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedules]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">{formatDate(currentDate, 'yyyy年MM月dd日')}</h3>
        <p className="text-sm text-gray-500">
          {isTodayDate ? '今天' : ''} 共 {schedules.length} 节课程
        </p>
      </div>
      <button
        className="btn btn-secondary"
        onClick={() => onDateClick(getToday())}
      >
        新增预约
      </button>
    </div>

      <div className="relative">
        {sortedSchedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>今天暂无课程安排</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSchedules.map((schedule) => {
              const student = getStudentById(schedule.studentId);
              const teacher = getTeacherById(schedule.teacherId);
              const course = getCourseById(schedule.courseId);
              const intentionLevel = student?.intentionLevel || 'none';

              return (
                <div
                  key={schedule.id}
                  className={cn(
                    'card p-4 border-l-4 transition-all hover:shadow-md',
                    schedule.status === 'scheduled' ? 'border-l-blue-500' :
                    schedule.status === 'completed' ? 'border-l-emerald-500' : 'border-l-gray-400'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        SCHEDULE_STATUS[schedule.status].color
                      )}>
                        {SCHEDULE_STATUS[schedule.status].label}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white',
                      INTENTION_LEVELS[intentionLevel].color
                    )}>
                      {INTENTION_LEVELS[intentionLevel].label}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {student?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student?.parentName} · {student?.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {course?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {course?.duration}分钟
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {teacher?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {teacher?.subject}老师
                        </p>
                      </div>
                    </div>
                  </div>

                  {schedule.remark && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="text-gray-400">备注：</span>
                        {schedule.remark}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
