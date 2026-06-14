import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyReport, ChannelStats, SOURCE_CHANNELS } from '@/types';
import { getToday, subDaysStr, formatDate } from '@/utils/date';
import { useStudentStore } from './useStudentStore';
import { useScheduleStore } from './useScheduleStore';
import { useAttendanceStore } from './useAttendanceStore';
import { useFollowupStore } from './useFollowupStore';

interface DashboardState {
  getDailyReport: (date: string) => DailyReport;
  getChannelStats: () => ChannelStats[];
  getWeeklyTrend: () => { date: string; checkinRate: number; conversionRate: number }[];
  getIntentionDistribution: () => { level: string; count: number; percentage: number }[];
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    () => ({
      getDailyReport: (date) => {
        const schedules = useScheduleStore.getState().getSchedulesByDate(date);
        const attendances = useAttendanceStore.getState().getAttendancesByDate(date);
        const students = useStudentStore.getState().students;

        const totalScheduled = schedules.length;
        const totalChecked = attendances.filter((a) => a.status === 'checked').length;
        const totalLate = attendances.filter((a) => a.status === 'late').length;
        const totalAbsent = attendances.filter((a) => a.status === 'absent').length;
        const checkinRate = totalScheduled > 0 ? ((totalChecked + totalLate) / totalScheduled) * 100 : 0;

        const newStudents = students.filter((s) => 
          formatDate(s.createdAt, 'yyyy-MM-dd') === date
        ).length;

        const conversions = students.filter(
          (s) => s.status === 'formal' && formatDate(s.createdAt, 'yyyy-MM-dd') === date
        ).length;
        const conversionRate = totalScheduled > 0 ? (conversions / totalScheduled) * 100 : 0;

        return {
          date,
          totalScheduled,
          totalChecked,
          totalAbsent,
          totalLate,
          checkinRate,
          newStudents,
          conversions,
          conversionRate,
        };
      },

      getChannelStats: () => {
        const students = useStudentStore.getState().students;
        const total = students.length;

        const stats: ChannelStats[] = SOURCE_CHANNELS.map((channel) => {
          const count = students.filter((s) => s.sourceChannel === channel).length;
          return {
            channel,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          };
        }).filter((s) => s.count > 0);

        return stats.sort((a, b) => b.count - a.count);
      },

      getWeeklyTrend: () => {
        const today = getToday();
        const trend = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDaysStr(today, i);
          const report = useDashboardStore.getState().getDailyReport(date);
          trend.push({
            date: formatDate(date, 'MM-dd'),
            checkinRate: report.checkinRate,
            conversionRate: report.conversionRate,
          });
        }
        return trend;
      },

      getIntentionDistribution: () => {
        const students = useStudentStore.getState().students;
        const levels = ['A', 'B', 'C', 'D', 'none'] as const;
        const total = students.filter((s) => s.status !== 'formal').length;

        return levels.map((level) => {
          const count = students.filter(
            (s) => s.intentionLevel === level && s.status !== 'formal'
          ).length;
          return {
            level,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          };
        });
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: () => ({}),
    }
  )
);
