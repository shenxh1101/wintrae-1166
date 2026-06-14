import { useState, useMemo } from 'react';
import { CalendarView } from '@/types';
import { getToday } from '@/utils/date';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { ScheduleModal } from './components/ScheduleModal';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { formatDate } from '@/utils/date';
import { cn } from '@/utils/cn';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  
  const teachers = useScheduleStore((state) => state.teachers);
  const coursesAll = useScheduleStore((state) => state.courses);
  const getClassWarnings = useScheduleStore((state) => state.getClassWarnings);
  const classes = useScheduleStore((state) => state.classes);
  
  const courses = useMemo(() => coursesAll.filter((c) => c.type === 'trial'), [coursesAll]);
  const classWarnings = useMemo(() => getClassWarnings(), [getClassWarnings, classes]);

  const goToPrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTitle = () => {
    if (view === 'month') return formatDate(currentDate, 'yyyy年MM月');
    if (view === 'week') return `${formatDate(currentDate, 'MM月dd日')} 所在周`;
    return formatDate(currentDate, 'yyyy年MM月dd日 EEEE');
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">日历排课</h1>
          <p className="text-sm text-gray-500">管理试听预约和课程安排</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          新增预约
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={goToPrev} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToToday} className="btn btn-secondary text-sm">
              <CalendarIcon className="w-4 h-4" />
              今天
            </button>
            <button onClick={goToNext} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold ml-2">{getTitle()}</h2>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                  view === v ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-600 hover:text-gray-800'
                )}
              >
                {v === 'month' ? '月视图' : v === 'week' ? '周视图' : '日视图'}
              </button>
            ))}
          </div>
        </div>

        {view === 'month' && <MonthView currentDate={currentDate} onDateClick={handleDateClick} />}
        {view === 'week' && <WeekView currentDate={currentDate} onDateClick={handleDateClick} />}
        {view === 'day' && <DayView currentDate={currentDate} onDateClick={handleDateClick} />}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="section-title">试听课程</h3>
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{course.name}</p>
                  <p className="text-xs text-gray-500">{course.duration}分钟</p>
                </div>
                <span className="badge bg-blue-50 text-blue-600">可预约</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="section-title">授课老师</h3>
          <div className="space-y-2">
            {teachers.filter((t) => t.active).map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{teacher.name}</p>
                    <p className="text-xs text-gray-500">{teacher.subject}</p>
                  </div>
                </div>
                <span className="w-2 h-2 bg-emerald-500 rounded-full" title="在线" />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="section-title">班级名额</h3>
          <div className="space-y-3">
            {classWarnings.map((warning) => (
              <div key={warning.classId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{warning.className}</span>
                  <span className={cn(
                    'text-xs font-medium',
                    warning.status === 'full' ? 'text-red-600' :
                    warning.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                  )}>
                    {warning.currentCount}/{warning.maxCapacity}人
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      warning.status === 'full' ? 'bg-red-500' :
                      warning.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${Math.min(warning.fillRate, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <ScheduleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          initialDate={selectedDate}
          teachers={teachers}
          courses={courses}
        />
      )}
    </div>
  );
}
