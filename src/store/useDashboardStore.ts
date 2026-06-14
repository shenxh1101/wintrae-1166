import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyReport, ChannelStats, SOURCE_CHANNELS, TrendData } from '@/types';
import { getToday, subDaysStr, formatDate } from '@/utils/date';
import { useStudentStore } from './useStudentStore';
import { useScheduleStore } from './useScheduleStore';
import { useAttendanceStore } from './useAttendanceStore';
import { useFollowupStore } from './useFollowupStore';

interface DashboardState {
  getDailyReport: (date: string) => DailyReport;
  getChannelStats: () => ChannelStats[];
  getWeeklyTrend: () => TrendData[];
  getIntentionDistribution: () => { level: string; count: number; percentage: number }[];
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    () => ({
      getDailyReport: (date) => {
        const schedules = useScheduleStore.getState().getSchedulesByDate(date);
        const attendances = useAttendanceStore.getState().getAttendancesByDate(date);
        const students = useStudentStore.getState().students;
        const followups = useFollowupStore.getState().followups;
        const getStudentById = useStudentStore.getState().getStudentById;

        const totalScheduled = schedules.length;
        const totalSchedules = schedules.length;
        const checkedIn = attendances.filter((a) => a.status === 'checked').length;
        const totalChecked = checkedIn;
        const late = attendances.filter((a) => a.status === 'late').length;
        const totalLate = late;
        const totalAbsent = attendances.filter((a) => a.status === 'absent').length;
        const checkinRate = totalScheduled > 0 ? ((checkedIn + late) / totalScheduled) * 100 : 0;

        const newStudents = students.filter((s) => 
          formatDate(s.createdAt, 'yyyy-MM-dd') === date
        ).length;

        const conversions = students.filter(
          (s) => s.status === 'formal' && formatDate(s.createdAt, 'yyyy-MM-dd') === date
        ).length;
        const conversionRate = totalScheduled > 0 ? (conversions / totalScheduled) * 100 : 0;

        const completedFollowups = followups.filter(
          (f) => f.status === 'completed' && f.lastContactDate === date
        ).length;

        const absentStudentIds = attendances
          .filter((a) => a.status === 'absent')
          .map((a) => a.studentId);
        const missedStudents = Array.from(new Set(absentStudentIds))
          .map((sid) => getStudentById(sid))
          .filter(Boolean)
          .map((s) => ({ id: s!.id, name: s!.name, phone: s!.phone }));

        const highPriorityFollowups = followups
          .filter((f) => f.status === 'pending' && f.priority === 'high')
          .slice(0, 5)
          .map((f) => {
            const stu = getStudentById(f.studentId);
            return {
              id: f.id,
              name: stu?.name || '未知',
              phone: stu?.phone || '',
              nextContactDate: f.nextContactDate,
            };
          });

        return {
          date,
          totalScheduled,
          totalSchedules,
          totalChecked,
          totalAbsent,
          totalLate,
          checkedIn,
          late,
          checkinRate,
          newStudents,
          conversions,
          conversionRate,
          completedFollowups,
          missedStudents,
          highPriorityFollowups,
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
        const trend: TrendData[] = [];
        const getStudentById = useStudentStore.getState().getStudentById;
        for (let i = 6; i >= 0; i--) {
          const date = subDaysStr(today, i);
          const schedules = useScheduleStore.getState().getSchedulesByDate(date);
          const attendances = useAttendanceStore.getState().getAttendancesByDate(date);
          const students = useStudentStore.getState().students;
          
          const checked = attendances.filter((a) => a.status === 'checked' || a.status === 'late').length;
          const newStudents = students.filter((s) => 
            formatDate(s.createdAt, 'yyyy-MM-dd') === date
          ).length;
          const conversions = students.filter(
            (s) => s.status === 'formal' && formatDate(s.createdAt, 'yyyy-MM-dd') === date
          ).length;
          
          trend.push({
            date: formatDate(date, 'MM-dd'),
            scheduled: schedules.length,
            checked,
            conversions: newStudents + conversions,
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
