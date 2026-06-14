import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Schedule, Teacher, Course, Class } from '@/types';
import { generateId } from '@/utils/id';
import { isTimeOverlap } from '@/utils/date';
import { mockSchedules, mockTeachers, mockCourses, mockClasses } from '@/data/mockData';

interface ScheduleState {
  schedules: Schedule[];
  teachers: Teacher[];
  courses: Course[];
  classes: Class[];
  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt'>) => { success: boolean; conflicts?: Schedule[] };
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedulesByDate: (date: string) => Schedule[];
  getSchedulesByTeacher: (teacherId: string, date: string) => Schedule[];
  getSchedulesByStudent: (studentId: string) => Schedule[];
  checkTimeConflict: (teacherId: string, date: string, startTime: string, endTime: string, excludeId?: string) => Schedule[];
  getClassWarnings: () => { classId: string; className: string; currentCount: number; maxCapacity: number; fillRate: number; status: 'normal' | 'warning' | 'full' }[];
  getTeacherById: (id: string) => Teacher | undefined;
  getCourseById: (id: string) => Course | undefined;
  getClassById: (id: string) => Class | undefined;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: mockSchedules,
      teachers: mockTeachers,
      courses: mockCourses,
      classes: mockClasses,

      addSchedule: (schedule) => {
        const conflicts = get().checkTimeConflict(
          schedule.teacherId,
          schedule.date,
          schedule.startTime,
          schedule.endTime
        );

        if (conflicts.length > 0) {
          return { success: false, conflicts };
        }

        const newSchedule: Schedule = {
          ...schedule,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ schedules: [...state.schedules, newSchedule] }));
        return { success: true };
      },

      updateSchedule: (id, updates) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
        }));
      },

      getSchedulesByDate: (date) => {
        return get().schedules.filter((s) => s.date === date);
      },

      getSchedulesByTeacher: (teacherId, date) => {
        return get().schedules.filter(
          (s) => s.teacherId === teacherId && s.date === date
        );
      },

      getSchedulesByStudent: (studentId) => {
        return get().schedules.filter((s) => s.studentId === studentId);
      },

      checkTimeConflict: (teacherId, date, startTime, endTime, excludeId) => {
        const teacherSchedules = get().getSchedulesByTeacher(teacherId, date);
        return teacherSchedules.filter((s) => {
          if (excludeId && s.id === excludeId) return false;
          return isTimeOverlap(s.startTime, s.endTime, startTime, endTime);
        });
      },

      getClassWarnings: () => {
        return get().classes.map((cls) => {
          const fillRate = (cls.currentCount / cls.maxCapacity) * 100;
          let status: 'normal' | 'warning' | 'full' = 'normal';
          if (fillRate >= 100) status = 'full';
          else if (fillRate >= 90) status = 'warning';

          return {
            classId: cls.id,
            className: cls.name,
            currentCount: cls.currentCount,
            maxCapacity: cls.maxCapacity,
            fillRate,
            status,
          };
        });
      },

      getTeacherById: (id) => {
        return get().teachers.find((t) => t.id === id);
      },

      getCourseById: (id) => {
        return get().courses.find((c) => c.id === id);
      },

      getClassById: (id) => {
        return get().classes.find((c) => c.id === id);
      },
    }),
    {
      name: 'schedule-storage',
    }
  )
);
