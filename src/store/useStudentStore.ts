import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, Feedback } from '@/types';
import { generateId } from '@/utils/id';
import { mockStudents, mockFeedbacks } from '@/data/mockData';

interface StudentState {
  students: Student[];
  feedbacks: Feedback[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void;
  getFeedbacksByStudent: (studentId: string) => Feedback[];
  updateIntentionLevel: (studentId: string, level: Student['intentionLevel']) => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: mockStudents,
      feedbacks: mockFeedbacks,

      addStudent: (student) => {
        const newStudent: Student = {
          ...student,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ students: [...state.students, newStudent] }));
      },

      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteStudent: (id) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        }));
      },

      getStudentById: (id) => {
        return get().students.find((s) => s.id === id);
      },

      addFeedback: (feedback) => {
        const newFeedback: Feedback = {
          ...feedback,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ feedbacks: [...state.feedbacks, newFeedback] }));
        
        if (feedback.intentionLevel) {
          get().updateIntentionLevel(feedback.studentId, feedback.intentionLevel);
        }
      },

      getFeedbacksByStudent: (studentId) => {
        return get().feedbacks.filter((f) => f.studentId === studentId);
      },

      updateIntentionLevel: (studentId, level) => {
        get().updateStudent(studentId, { intentionLevel: level });
      },
    }),
    {
      name: 'student-storage',
    }
  )
);
