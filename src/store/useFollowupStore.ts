import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Followup, FollowupTemplate } from '@/types';
import { generateId } from '@/utils/id';
import { getToday, getDaysFromNow } from '@/utils/date';
import { mockFollowups, mockTemplates } from '@/data/mockData';

interface FollowupState {
  followups: Followup[];
  templates: FollowupTemplate[];
  addFollowup: (followup: Omit<Followup, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateFollowup: (id: string, updates: Partial<Followup>) => void;
  completeFollowup: (id: string, result: string, nextDate?: string, nextTime?: string) => void;
  cancelFollowup: (id: string) => void;
  deleteFollowup: (id: string) => void;
  getFollowupById: (id: string) => Followup | undefined;
  getPendingFollowups: () => Followup[];
  getOverdueFollowups: () => Followup[];
  getTodayFollowups: () => Followup[];
  getCompletedFollowups: () => Followup[];
  getFollowupsByStudent: (studentId: string) => Followup[];
  getSortedFollowups: () => Followup[];
  addTemplate: (template: Omit<FollowupTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<FollowupTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getActiveTemplates: () => FollowupTemplate[];
}

export const useFollowupStore = create<FollowupState>()(
  persist(
    (set, get) => ({
      followups: mockFollowups,
      templates: mockTemplates,

      addFollowup: (followup) => {
        const now = new Date().toISOString();
        const newFollowup: Followup = {
          ...followup,
          id: generateId(),
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ followups: [...state.followups, newFollowup] }));
      },

      updateFollowup: (id, updates) => {
        set((state) => ({
          followups: state.followups.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          ),
        }));
      },

      completeFollowup: (id, result, nextDate, nextTime) => {
        const followup = get().followups.find((f) => f.id === id);
        if (!followup) return;

        const now = new Date().toISOString();
        const today = getToday();

        if (nextDate && nextTime) {
          const newFollowup: Followup = {
            id: generateId(),
            studentId: followup.studentId,
            handlerId: followup.handlerId,
            nextContactDate: nextDate,
            nextContactTime: nextTime,
            priority: followup.priority,
            templateId: followup.templateId,
            templateName: followup.templateName,
            content: '',
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({
            followups: [
              ...state.followups.map((f) =>
                f.id === id
                  ? ({
                      ...f,
                      status: 'completed' as const,
                      result,
                      lastContactDate: today,
                      updatedAt: now,
                    } as Followup)
                  : f
              ),
              newFollowup,
            ],
          }));
        } else {
          set((state) => ({
            followups: state.followups.map((f) =>
              f.id === id
                ? ({
                    ...f,
                    status: 'completed' as const,
                    result,
                    lastContactDate: today,
                    updatedAt: now,
                  } as Followup)
                : f
            ),
          }));
        }
      },

      cancelFollowup: (id) => {
        set((state) => ({
          followups: state.followups.map((f) =>
            f.id === id
              ? ({ ...f, status: 'cancelled' as const, updatedAt: new Date().toISOString() } as Followup)
              : f
          ),
        }));
      },

      deleteFollowup: (id) => {
        set((state) => ({
          followups: state.followups.filter((f) => f.id !== id),
        }));
      },

      getFollowupById: (id) => {
        return get().followups.find((f) => f.id === id);
      },

      getPendingFollowups: () => {
        return get().followups.filter((f) => f.status === 'pending');
      },

      getOverdueFollowups: () => {
        const today = getToday();
        return get()
          .getPendingFollowups()
          .filter((f) => f.nextContactDate < today);
      },

      getTodayFollowups: () => {
        const today = getToday();
        return get()
          .getPendingFollowups()
          .filter((f) => f.nextContactDate === today);
      },

      getCompletedFollowups: () => {
        return get().followups.filter((f) => f.status === 'completed');
      },

      getFollowupsByStudent: (studentId) => {
        return get().followups.filter((f) => f.studentId === studentId);
      },

      getSortedFollowups: () => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return get()
          .getPendingFollowups()
          .sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            const dateDiff = getDaysFromNow(a.nextContactDate) - getDaysFromNow(b.nextContactDate);
            if (dateDiff !== 0) return dateDiff;
            
            return a.nextContactTime.localeCompare(b.nextContactTime);
          });
      },

      addTemplate: (template) => {
        const newTemplate: FollowupTemplate = {
          ...template,
          id: generateId(),
        };
        set((state) => ({ templates: [...state.templates, newTemplate] }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      getActiveTemplates: () => {
        return get().templates.filter((t) => t.active);
      },
    }),
    {
      name: 'followup-storage',
    }
  )
);
