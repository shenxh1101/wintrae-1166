import { Schedule, Student, Teacher, Course, Attendance, ATTENDANCE_STATUS, INTENTION_LEVELS } from '@/types';
import { cn } from '@/utils/cn';
import { CheckCircle, Clock, XCircle, User, Phone } from 'lucide-react';

interface ReceptionListProps {
  schedules: Schedule[];
  getStudentById: (id: string) => Student | undefined;
  getTeacherById: (id: string) => Teacher | undefined;
  getCourseById: (id: string) => Course | undefined;
  getAttendanceBySchedule: (scheduleId: string) => Attendance[];
  onCheckIn: (scheduleId: string, studentId: string) => void;
  onMarkLate: (scheduleId: string, studentId: string) => void;
  onMarkAbsent: (scheduleId: string, studentId: string) => void;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
}

export function ReceptionList({
  schedules,
  getStudentById,
  getTeacherById,
  getCourseById,
  getAttendanceBySchedule,
  onCheckIn,
  onMarkLate,
  onMarkAbsent,
  onSelect,
  selectedId,
}: ReceptionListProps) {
  const getAttendance = (schedule: Schedule) => {
    const attendances = getAttendanceBySchedule(schedule.id);
    return attendances.find(a => a.studentId === schedule.studentId);
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {sortedSchedules.map((schedule) => {
        const student = getStudentById(schedule.studentId);
        const teacher = getTeacherById(schedule.teacherId);
        const course = getCourseById(schedule.courseId);
        const attendance = getAttendance(schedule);
        const status = attendance?.status || 'pending';
        const statusInfo = ATTENDANCE_STATUS[status];
        const intentionLevel = student?.intentionLevel || 'none';

        if (!student) return null;

        return (
          <div
            key={schedule.id}
            onClick={() => onSelect(schedule.id)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all cursor-pointer',
              selectedId === schedule.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-transparent bg-white hover:border-gray-200'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 text-center">
                <p className="text-lg font-bold text-gray-800">{schedule.startTime}</p>
                <p className="text-xs text-gray-500">{schedule.endTime}</p>
              </div>

              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
              )}>
                {student.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{student.name}</span>
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    INTENTION_LEVELS[intentionLevel].color
                  )} />
                  <span className={cn('badge text-[10px]', statusInfo.color)}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{course?.name}</span>
                  <span>·</span>
                  <span>{teacher?.name}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {student.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status === 'pending' && (
                  <>
                    <button
                      className="btn btn-emerald btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCheckIn(schedule.id, student.id);
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      签到
                    </button>
                    <button
                      className="btn btn-amber btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkLate(schedule.id, student.id);
                      }}
                    >
                      <Clock className="w-4 h-4" />
                      迟到
                    </button>
                    <button
                      className="btn btn-red btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAbsent(schedule.id, student.id);
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                      缺席
                    </button>
                  </>
                )}
                {status !== 'pending' && (
                  <span className={cn('badge px-3 py-1.5', statusInfo.color)}>
                    {statusInfo.label}
                  </span>
                )}
              </div>
            </div>

            {attendance?.checkInTime && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                签到时间：{attendance.checkInTime}
                {attendance.remark && <span className="ml-4">备注：{attendance.remark}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
