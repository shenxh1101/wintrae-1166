import { useState, useMemo } from 'react';
import { Calendar, Users, TrendingUp, AlertTriangle, BarChart3, PieChart, LineChart, FileText } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useStudentStore } from '@/store/useStudentStore';
import { cn } from '@/utils/cn';
import { formatDate, getToday, addDays } from '@/utils/date';
import { ChannelChart } from './components/ChannelChart';
import { TrendChart } from './components/TrendChart';
import { ClassWarningList } from './components/ClassWarningList';
import { DailyReport } from './components/DailyReport';

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(getToday()));

  const getDailyReport = useDashboardStore((state) => state.getDailyReport);
  const getChannelStats = useDashboardStore((state) => state.getChannelStats);
  const getWeeklyTrend = useDashboardStore((state) => state.getWeeklyTrend);
  const getClassWarnings = useScheduleStore((state) => state.getClassWarnings);
  const students = useStudentStore((state) => state.students);
  const schedules = useScheduleStore((state) => state.schedules);

  const dailyReport = useMemo(() => getDailyReport(selectedDate), [selectedDate, getDailyReport]);
  const channelStats = useMemo(() => getChannelStats(), [getChannelStats]);
  const weeklyTrend = useMemo(() => getWeeklyTrend(), [getWeeklyTrend]);
  const classWarnings = useMemo(() => getClassWarnings(), [getClassWarnings]);

  const totalStudents = students.length;
  const trialStudents = students.filter(s => s.status === 'trial').length;
  const formalStudents = students.filter(s => s.status === 'formal').length;
  const conversionRate = totalStudents > 0 ? Math.round((formalStudents / totalStudents) * 100) : 0;
  const todaySchedules = schedules.filter(s => s.date === selectedDate).length;

  const stats = [
    { label: '总学员数', value: totalStudents, icon: Users, color: 'bg-blue-500' },
    { label: '试听学员', value: trialStudents, icon: Users, color: 'bg-amber-500' },
    { label: '正式学员', value: formalStudents, icon: Users, color: 'bg-emerald-500' },
    { label: '转化率', value: `${conversionRate}%`, icon: TrendingUp, color: 'bg-purple-500' },
    { label: '今日课程', value: todaySchedules, icon: Calendar, color: 'bg-orange-500' },
    { label: '班级预警', value: classWarnings.length, icon: AlertTriangle, color: classWarnings.some(w => w.level === 'danger') ? 'bg-red-500' : 'bg-amber-500' },
  ];

  const quickDates = [
    { label: '今天', days: 0 },
    { label: '昨天', days: -1 },
    { label: '3天前', days: -3 },
    { label: '1周前', days: -7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">统计看板</h1>
          <p className="text-sm text-gray-500">查看运营数据、渠道分析和班级预警</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {quickDates.map((item) => (
              <button
                key={item.days}
                onClick={() => setSelectedDate(formatDate(addDays(getToday(), item.days)))}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  selectedDate === formatDate(addDays(getToday(), item.days))
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              来源渠道统计
            </h2>
          </div>
          <ChannelChart data={channelStats} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-emerald-500" />
              周转化趋势
            </h2>
          </div>
          <TrendChart data={weeklyTrend} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              班级满班预警
            </h2>
          </div>
          <ClassWarningList warnings={classWarnings} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              日报汇总
              <span className="text-sm font-normal text-gray-500">
                {selectedDate}
              </span>
            </h2>
          </div>
          <DailyReport report={dailyReport} />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            意向等级分布
          </h2>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {['A', 'B', 'C', 'D', 'none'].map((level) => {
            const count = students.filter(s => s.intentionLevel === level).length;
            const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
            const labels: Record<string, string> = {
              A: 'A级 - 强烈意向',
              B: 'B级 - 较有意向',
              C: 'C级 - 意向一般',
              D: 'D级 - 意向较低',
              none: '未评估',
            };
            const colors: Record<string, string> = {
              A: 'bg-rose-500',
              B: 'bg-orange-500',
              C: 'bg-amber-500',
              D: 'bg-gray-500',
              none: 'bg-gray-300',
            };

            return (
              <div key={level} className="text-center">
                <div className={cn('w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl', colors[level])}>
                  {count}
                </div>
                <p className="text-sm font-medium text-gray-800">{labels[level]}</p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
