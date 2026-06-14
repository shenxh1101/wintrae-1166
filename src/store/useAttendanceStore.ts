import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attendance } from '@/types';
import { generateId } from '@/utils/id';
import { getNowTime } from '@/utils/date';
import { mockAttendances } from '@/data/mockData';

interface AttendanceState {
  attendances: Attendance[];
  checkIn: (scheduleId: string, studentId: string, date: string) => void;
  markLate: (scheduleId: string, studentId: string, date: string) => void;
  markAbsent: (scheduleId: string, studentId: string, date: string) => void;
  getAttendanceBySchedule: (scheduleId: string) => Attendance | undefined;
  getAttendancesByDate: (date: string) => Attendance[];
  getAttendanceByStudentAndDate: (studentId: string, date: string) => Attendance | undefined;
  updateAttendance: (id: string, updates: Partial<Attendance>) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      attendances: mockAttendances,

      checkIn: (scheduleId, studentId, date) => {
        const existing = get().getAttendanceBySchedule(scheduleId);
        if (existing) {
          get().updateAttendance(existing.id, {
            status: 'checked',
            checkinTime: getNowTime(),
          });
        } else {
          const newAttendance: Attendance = {
            id: generateId(),
            scheduleId,
            studentId,
            date,
            checkinTime: getNowTime(),
            status: 'checked',
            remark: '',
          };
          set((state) => ({ attendances: [...state.attendances, newAttendance] }));
        }
      },

      markLate: (scheduleId, studentId, date) => {
        const existing = get().getAttendanceBySchedule(scheduleId);
        if (existing) {
          get().updateAttendance(existing.id, {
            status: 'late',
            checkinTime: getNowTime(),
          });
        } else {
          const newAttendance: Attendance = {
            id: generateId(),
            scheduleId,
            studentId,
            date,
            checkinTime: getNowTime(),
            status: 'late',
            remark: '',
          };
          set((state) => ({ attendances: [...state.attendances, newAttendance] }));
        }
      },

      markAbsent: (scheduleId, studentId, date) => {
        const existing = get().getAttendanceBySchedule(scheduleId);
        if (existing) {
          get().updateAttendance(existing.id, {
            status: 'absent',
          });
        } else {
          const newAttendance: Attendance = {
            id: generateId(),
            scheduleId,
            studentId,
            date,
            status: 'absent',
            remark: '',
          };
          set((state) => ({ attendances: [...state.attendances, newAttendance] }));
        }
      },

      getAttendanceBySchedule: (scheduleId) => {
        return get().attendances.find((a) => a.scheduleId === scheduleId);
      },

      getAttendancesByDate: (date) => {
        return get().attendances.filter((a) => a.date === date);
      },

      getAttendanceByStudentAndDate: (studentId, date) => {
        return get().attendances.find(
          (a) => a.studentId === studentId && a.date === date
        );
      },

      updateAttendance: (id, updates) => {
        set((state) => ({
          attendances: state.attendances.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },
    }),
    {
      name: 'attendance-storage',
    }
  )
);
