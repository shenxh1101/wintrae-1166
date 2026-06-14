export interface Student {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  parentName: string;
  phone: string;
  sourceChannel: string;
  intentionLevel: 'A' | 'B' | 'C' | 'D' | 'none';
  status: 'potential' | 'trial' | 'formal' | 'lost';
  remark: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  phone: string;
  active: boolean;
}

export interface Course {
  id: string;
  name: string;
  type: 'trial' | 'formal';
  duration: number;
  price: number;
  description: string;
}

export interface Class {
  id: string;
  courseId: string;
  name: string;
  maxCapacity: number;
  currentCount: number;
  teacherId: string;
  schedule: string;
  startDate: string;
  endDate: string;
  status: 'recruiting' | 'ongoing' | 'finished';
}

export interface Schedule {
  id: string;
  studentId: string;
  teacherId: string;
  courseId: string;
  classId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  remark: string;
  classroom?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  scheduleId: string;
  studentId: string;
  date: string;
  checkinTime?: string;
  status: 'pending' | 'checked' | 'late' | 'absent';
  remark: string;
}

export interface Feedback {
  id: string;
  scheduleId: string;
  studentId: string;
  teacherId: string;
  rating: number;
  performance: string;
  ability: string;
  parentFeedback: string;
  suggestion: string;
  intentionLevel: 'A' | 'B' | 'C' | 'D';
  createdAt: string;
}

export interface Followup {
  id: string;
  studentId: string;
  handlerId: string;
  nextContactDate: string;
  nextContactTime: string;
  priority: 'high' | 'medium' | 'low';
  templateId?: string;
  templateName?: string;
  content: string;
  result?: string;
  lastContactDate?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface FollowupTemplate {
  id: string;
  name: string;
  type: 'first' | 'reminder' | 'promotion' | 'custom';
  content: string;
  active: boolean;
}

export interface DailyReport {
  date: string;
  totalScheduled: number;
  totalSchedules: number;
  totalChecked: number;
  totalAbsent: number;
  totalLate: number;
  checkedIn: number;
  late: number;
  checkinRate: number;
  newStudents: number;
  conversions: number;
  conversionRate: number;
  completedFollowups: number;
  missedStudents: Array<{ id: string; name: string; phone: string }>;
  highPriorityFollowups: Array<{ id: string; name: string; phone: string; nextContactDate: string }>;
}

export interface TrendData {
  date: string;
  scheduled: number;
  checked: number;
  conversions: number;
}

export interface ChannelStats {
  channel: string;
  count: number;
  percentage: number;
}

export interface ClassWarning {
  classId: string;
  className: string;
  currentCount: number;
  maxCapacity: number;
  fillRate: number;
  status: 'normal' | 'warning' | 'full';
  level: 'normal' | 'warning' | 'danger';
}

export type CalendarView = 'month' | 'week' | 'day';

export const SOURCE_CHANNELS = ['电话咨询', '微信推广', '朋友推荐', '到店咨询', '线上广告', '其他'] as const;

export const INTENTION_LEVELS = {
  A: { label: 'A级-强烈意向', color: 'bg-emerald-500' },
  B: { label: 'B级-较好意向', color: 'bg-blue-500' },
  C: { label: 'C级-一般意向', color: 'bg-amber-500' },
  D: { label: 'D级-低意向', color: 'bg-gray-500' },
  none: { label: '未评定', color: 'bg-gray-400' },
} as const;

export const ATTENDANCE_STATUS = {
  pending: { label: '待签到', color: 'bg-gray-100 text-gray-600' },
  checked: { label: '已签到', color: 'bg-emerald-100 text-emerald-700' },
  late: { label: '迟到', color: 'bg-amber-100 text-amber-700' },
  absent: { label: '缺席', color: 'bg-red-100 text-red-700' },
} as const;

export const SCHEDULE_STATUS = {
  scheduled: { label: '已预约', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700' },
} as const;
