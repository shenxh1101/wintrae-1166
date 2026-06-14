import { Student, Teacher, Course, Class, Schedule, Attendance, Feedback, Followup, FollowupTemplate } from '@/types';
import { generateId } from '@/utils/id';
import { getToday, addDaysStr } from '@/utils/date';

const today = getToday();
const tomorrow = addDaysStr(today, 1);
const yesterday = addDaysStr(today, -1);

export const mockTeachers: Teacher[] = [
  { id: 't1', name: '张老师', subject: '英语', phone: '13800138001', active: true },
  { id: 't2', name: '李老师', subject: '数学', phone: '13800138002', active: true },
  { id: 't3', name: '王老师', subject: '语文', phone: '13800138003', active: true },
  { id: 't4', name: '刘老师', subject: '美术', phone: '13800138004', active: true },
  { id: 't5', name: '陈老师', subject: '钢琴', phone: '13800138005', active: false },
];

export const mockCourses: Course[] = [
  { id: 'c1', name: '少儿英语启蒙', type: 'trial', duration: 45, price: 0, description: '适合4-6岁儿童，通过游戏化方式培养英语兴趣' },
  { id: 'c2', name: '小学数学思维', type: 'trial', duration: 60, price: 0, description: '培养逻辑思维能力，提升数学学习兴趣' },
  { id: 'c3', name: '创意美术', type: 'trial', duration: 90, price: 0, description: '激发创造力，培养艺术感知能力' },
  { id: 'c4', name: '钢琴入门', type: 'trial', duration: 30, price: 0, description: '零基础钢琴启蒙课程' },
  { id: 'c5', name: '英语系统班', type: 'formal', duration: 60, price: 2980, description: '系统学习英语听说读写' },
  { id: 'c6', name: '数学培优班', type: 'formal', duration: 90, price: 3680, description: '数学思维拓展训练' },
];

export const mockClasses: Class[] = [
  { id: 'cl1', courseId: 'c5', name: '少儿英语启蒙A班', maxCapacity: 12, currentCount: 10, teacherId: 't1', schedule: '每周一、三、五 16:00-17:00', startDate: '2026-06-01', endDate: '2026-12-31', status: 'recruiting' },
  { id: 'cl2', courseId: 'c5', name: '少儿英语启蒙B班', maxCapacity: 12, currentCount: 5, teacherId: 't1', schedule: '每周二、四、六 10:00-11:00', startDate: '2026-06-01', endDate: '2026-12-31', status: 'recruiting' },
  { id: 'cl3', courseId: 'c6', name: '数学思维培优班', maxCapacity: 10, currentCount: 9, teacherId: 't2', schedule: '每周六、日 14:00-15:30', startDate: '2026-06-01', endDate: '2026-12-31', status: 'recruiting' },
  { id: 'cl4', courseId: 'c3', name: '创意美术班', maxCapacity: 8, currentCount: 8, teacherId: 't4', schedule: '每周六 9:00-10:30', startDate: '2026-06-01', endDate: '2026-12-31', status: 'recruiting' },
];

export const mockStudents: Student[] = [
  { id: 's1', name: '小明', gender: 'male', age: 5, parentName: '王先生', phone: '13900139001', sourceChannel: '朋友推荐', intentionLevel: 'A', status: 'trial', remark: '对英语很感兴趣，家长希望尽快报名', createdAt: '2026-06-10T10:00:00Z' },
  { id: 's2', name: '小红', gender: 'female', age: 7, parentName: '李女士', phone: '13900139002', sourceChannel: '电话咨询', intentionLevel: 'B', status: 'trial', remark: '数学基础较好，需要拓展训练', createdAt: '2026-06-11T14:30:00Z' },
  { id: 's3', name: '小华', gender: 'male', age: 6, parentName: '张先生', phone: '13900139003', sourceChannel: '微信推广', intentionLevel: 'C', status: 'potential', remark: '家长还在考虑中', createdAt: '2026-06-12T09:15:00Z' },
  { id: 's4', name: '小美', gender: 'female', age: 8, parentName: '陈女士', phone: '13900139004', sourceChannel: '到店咨询', intentionLevel: 'A', status: 'formal', remark: '已报名英语系统班', createdAt: '2026-06-01T11:00:00Z' },
  { id: 's5', name: '小强', gender: 'male', age: 9, parentName: '刘先生', phone: '13900139005', sourceChannel: '线上广告', intentionLevel: 'B', status: 'trial', remark: '数学成绩中等，需要提升', createdAt: '2026-06-13T16:45:00Z' },
  { id: 's6', name: '小丽', gender: 'female', age: 4, parentName: '赵女士', phone: '13900139006', sourceChannel: '朋友推荐', intentionLevel: 'none', status: 'potential', remark: '刚预约，还未试听', createdAt: '2026-06-14T10:30:00Z' },
  { id: 's7', name: '小刚', gender: 'male', age: 7, parentName: '孙先生', phone: '13900139007', sourceChannel: '电话咨询', intentionLevel: 'D', status: 'lost', remark: '价格太高，放弃报名', createdAt: '2026-06-05T14:00:00Z' },
  { id: 's8', name: '小燕', gender: 'female', age: 6, parentName: '周女士', phone: '13900139008', sourceChannel: '微信推广', intentionLevel: 'B', status: 'trial', remark: '对美术很感兴趣，家长在考虑长期班', createdAt: '2026-06-12T15:20:00Z' },
];

export const mockSchedules: Schedule[] = [
  { id: 'sch1', studentId: 's1', teacherId: 't1', courseId: 'c1', date: today, startTime: '09:00', endTime: '09:45', status: 'scheduled', remark: '首次试听', createdAt: '2026-06-14T10:00:00Z' },
  { id: 'sch2', studentId: 's2', teacherId: 't2', courseId: 'c2', date: today, startTime: '10:00', endTime: '11:00', status: 'scheduled', remark: '', createdAt: '2026-06-14T11:00:00Z' },
  { id: 'sch3', studentId: 's3', teacherId: 't1', courseId: 'c1', date: today, startTime: '10:30', endTime: '11:15', status: 'scheduled', remark: '家长希望了解课程内容', createdAt: '2026-06-14T12:00:00Z' },
  { id: 'sch4', studentId: 's5', teacherId: 't2', courseId: 'c2', date: today, startTime: '14:00', endTime: '15:00', status: 'scheduled', remark: '', createdAt: '2026-06-14T14:00:00Z' },
  { id: 'sch5', studentId: 's8', teacherId: 't4', courseId: 'c3', date: today, startTime: '15:30', endTime: '17:00', status: 'scheduled', remark: '自带绘画工具', createdAt: '2026-06-14T15:00:00Z' },
  { id: 'sch6', studentId: 's6', teacherId: 't1', courseId: 'c1', date: tomorrow, startTime: '09:00', endTime: '09:45', status: 'scheduled', remark: '', createdAt: '2026-06-14T16:00:00Z' },
  { id: 'sch7', studentId: 's4', teacherId: 't1', courseId: 'c5', classId: 'cl1', date: yesterday, startTime: '16:00', endTime: '17:00', status: 'completed', remark: '', createdAt: '2026-06-10T10:00:00Z' },
];

export const mockAttendances: Attendance[] = [
  { id: generateId(), scheduleId: 'sch7', studentId: 's4', date: yesterday, checkinTime: '15:55', status: 'checked', remark: '' },
];

export const mockFeedbacks: Feedback[] = [
  { id: generateId(), scheduleId: 'sch7', studentId: 's4', teacherId: 't1', rating: 5, performance: '课堂表现积极，注意力集中，能够跟上教学进度', parentFeedback: '孩子很喜欢张老师的课，回家后还在复习今天学习的内容', suggestion: '建议增加一些互动游戏环节', intentionLevel: 'A', createdAt: '2026-06-14T18:00:00Z' },
];

export const mockTemplates: FollowupTemplate[] = [
  { id: 'tmpl1', name: '首次回访', type: 'first', active: true, content: `您好，我是XX机构的课程顾问XXX。\n\n请问是【家长姓名】的家长吗？\n\n今天打电话是想了解一下【学员姓名】昨天试听【课程名称】的情况，孩子和您对课程感觉怎么样呢？\n\n【倾听家长反馈】\n\n非常感谢您的反馈。关于我们的课程，您还有其他疑问吗？\n\n好的，如果您有任何问题随时联系我。祝您生活愉快，再见！` },
  { id: 'tmpl2', name: '意向跟进', type: 'reminder', active: true, content: `您好，我是XX机构的课程顾问XXX。\n\n请问是【家长姓名】的家长吗？\n\n上次和您沟通后，不知道您考虑得怎么样了？\n\n我们本周有一个优惠活动，如果在本周五前报名可以享受XX折扣，这个活动还是很划算的。\n\n【倾听家长反馈】\n\n好的，我帮您保留这个优惠名额。期待您的回复！` },
  { id: 'tmpl3', name: '活动邀约', type: 'promotion', active: true, content: `您好，我是XX机构的课程顾问XXX。\n\n请问是【家长姓名】的家长吗？\n\n打电话是想通知您，我们本周六下午有一场【活动名称】，非常适合【学员姓名】这个年龄段的孩子参加。\n\n活动是免费的，现场还有精美礼品赠送，请问您方便带孩子来参加吗？\n\n【确认时间】\n\n好的，我帮您预留名额，活动前一天我会再发消息提醒您。` },
  { id: 'tmpl4', name: '节日问候', type: 'custom', active: true, content: `您好，我是XX机构的课程顾问XXX。\n\n【节日名称】快到了，祝您节日快乐！\n\n借此机会也想问问【学员姓名】最近学习情况怎么样？\n\n如果有任何问题随时可以联系我。再次祝您节日快乐！` },
];

export const mockFollowups: Followup[] = [
  { id: 'f1', studentId: 's1', handlerId: 'h1', nextContactDate: today, nextContactTime: '10:00', priority: 'high', templateId: 'tmpl1', content: '', status: 'pending', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z' },
  { id: 'f2', studentId: 's2', handlerId: 'h1', nextContactDate: tomorrow, nextContactTime: '14:00', priority: 'medium', templateId: 'tmpl1', content: '', status: 'pending', createdAt: '2026-06-14T11:00:00Z', updatedAt: '2026-06-14T11:00:00Z' },
  { id: 'f3', studentId: 's3', handlerId: 'h2', nextContactDate: addDaysStr(today, -2), nextContactTime: '16:00', priority: 'high', templateId: 'tmpl2', content: '', status: 'pending', createdAt: '2026-06-12T09:00:00Z', updatedAt: '2026-06-12T09:00:00Z' },
  { id: 'f4', studentId: 's5', handlerId: 'h2', nextContactDate: addDaysStr(today, 2), nextContactTime: '11:00', priority: 'medium', templateId: 'tmpl1', content: '', status: 'pending', createdAt: '2026-06-14T16:00:00Z', updatedAt: '2026-06-14T16:00:00Z' },
  { id: 'f5', studentId: 's8', handlerId: 'h1', nextContactDate: addDaysStr(today, 3), nextContactTime: '15:00', priority: 'low', templateId: 'tmpl2', content: '', status: 'pending', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z' },
];
