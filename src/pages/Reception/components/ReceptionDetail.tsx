import { Schedule, Student, Teacher, Course, Attendance, ATTENDANCE_STATUS, INTENTION_LEVELS } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { User, Phone, MapPin, Calendar, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

interface ReceptionDetailProps {
  scheduleId: string | null;
  getScheduleById: (id: string) => Schedule | undefined;
  getStudentById: (id: string) => Student | undefined;
  getTeacherById: (id: string) => Teacher | undefined;
  getCourseById: (id: string) => Course | undefined;
  getAttendanceBySchedule: (scheduleId: string) => Attendance | undefined;
  onCheckIn: (scheduleId: string, studentId: string) => void;
  onMarkLate: (scheduleId: string, studentId: string) => void;
  onMarkAbsent: (scheduleId: string, studentId: string) => void;
}

export function ReceptionDetail({
  scheduleId,
  getScheduleById,
  getStudentById,
  getTeacherById,
  getCourseById,
  getAttendanceBySchedule,
  onCheckIn,
  onMarkLate,
  onMarkAbsent,
}: ReceptionDetailProps) {
  if (!scheduleId) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center h-[400px] text-gray-500">
        <User className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-sm">点击左侧列表查看学员详情</p>
      </div>
    );
  }

  const schedule = getScheduleById(scheduleId);
  if (!schedule) return null;

  const student = getStudentById(schedule.studentId);
  const teacher = getTeacherById(schedule.teacherId);
  const course = getCourseById(schedule.courseId);
  const attendance = getAttendanceBySchedule(scheduleId);
  const status = attendance?.status || 'pending';
  const statusInfo = ATTENDANCE_STATUS[status];
  const intentionLevel = student?.intentionLevel || 'none';

  if (!student) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center text-white font-medium text-xl',
          student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
        )}>
          {student.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{student.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">
              {student.gender === 'male' ? '男' : '女'} · {student.age}岁
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white',
              INTENTION_LEVELS[intentionLevel].color
            )}>
              {INTENTION_LEVELS[intentionLevel].label}
            </span>
          </div>
        </div>
      </div>

      <div className={cn('mb-6 p-3 rounded-lg text-center', statusInfo.color)}>
        <span className="font-medium">{statusInfo.label}</span>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">家长姓名</p>
            <p className="text-sm font-medium text-gray-800">{student.parentName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">联系电话</p>
            <p className="text-sm font-medium text-blue-600">{student.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">试听课程</p>
            <p className="text-sm font-medium text-gray-800">{course?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">授课老师</p>
            <p className="text-sm font-medium text-gray-800">{teacher?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">上课时间</p>
            <p className="text-sm font-medium text-gray-800">
              {schedule.date} {schedule.startTime} - {schedule.endTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">上课教室</p>
            <p className="text-sm font-medium text-gray-800">{schedule.classroom || '未安排'}</p>
          </div>
        </div>
      </div>

      {student.remark && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">备注信息</p>
          <p className="text-sm text-gray-700">{student.remark}</p>
        </div>
      )}

      {schedule.remark && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-500 mb-1">预约备注</p>
          <p className="text-sm text-blue-700">{schedule.remark}</p>
        </div>
      )}

      {attendance && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">签到信息</p>
          <p className="text-sm text-gray-700">
            {attendance.checkinTime && `签到时间：${attendance.checkinTime}`}
          </p>
          {attendance.remark && (
            <p className="text-sm text-gray-700 mt-1">备注：{attendance.remark}</p>
          )}
        </div>
      )}

      {status === 'pending' && (
        <div className="space-y-2">
          <button
            className="btn btn-emerald w-full"
            onClick={() => onCheckIn(scheduleId, student.id)}
          >
            <CheckCircle className="w-4 h-4" />
            确认签到
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="btn btn-amber"
              onClick={() => onMarkLate(scheduleId, student.id)}
            >
              <Clock className="w-4 h-4" />
              标记迟到
            </button>
            <button
              className="btn btn-red"
              onClick={() => onMarkAbsent(scheduleId, student.id)}
            >
              <XCircle className="w-4 h-4" />
              标记缺席
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
