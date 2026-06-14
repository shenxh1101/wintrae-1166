import { useState, useMemo } from 'react';
import { Calendar, Search, CheckCircle, Clock, XCircle, User, Phone, Filter } from 'lucide-react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useStudentStore } from '@/store/useStudentStore';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { INTENTION_LEVELS, ATTENDANCE_STATUS } from '@/types';
import { cn } from '@/utils/cn';
import { formatDate, getToday } from '@/utils/date';
import { ReceptionList } from './components/ReceptionList';
import { ReceptionDetail } from './components/ReceptionDetail';

export function ReceptionPage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(getToday()));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const schedulesAll = useScheduleStore((state) => state.schedules);
  const getSchedulesByDate = useScheduleStore((state) => state.getSchedulesByDate);
  const getScheduleById = useScheduleStore((state) => state.getScheduleById);
  const getStudentById = useStudentStore((state) => state.getStudentById);
  const getTeacherById = useScheduleStore((state) => state.getTeacherById);
  const getCourseById = useScheduleStore((state) => state.getCourseById);
  const attendances = useAttendanceStore((state) => state.attendances);
  const getAttendanceBySchedule = useAttendanceStore((state) => state.getAttendanceBySchedule);
  const checkIn = useAttendanceStore((state) => state.checkIn);
  const markLate = useAttendanceStore((state) => state.markLate);
  const markAbsent = useAttendanceStore((state) => state.markAbsent);

  const schedules = useMemo(() => getSchedulesByDate(selectedDate), [selectedDate, getSchedulesByDate, schedulesAll, attendances]);

  const getAttendanceStatus = (scheduleId: string, studentId: string): 'pending' | 'checked' | 'late' | 'absent' => {
    const attendance = getAttendanceBySchedule(scheduleId);
    if (!attendance) return 'pending';
    return attendance.status;
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const student = getStudentById(schedule.studentId);
    const status = getAttendanceStatus(schedule.id, schedule.studentId);

    if (!student) return false;

    const matchSearch = student.name.includes(searchQuery) ||
      student.parentName.includes(searchQuery) ||
      student.phone.includes(searchQuery);

    const matchStatus = filterStatus === 'all' || status === filterStatus;

    return matchSearch && matchStatus;
  });

  const pendingCount = schedules.filter(s => getAttendanceStatus(s.id, s.studentId) === 'pending').length;
  const checkedInCount = schedules.filter(s => getAttendanceStatus(s.id, s.studentId) === 'checked').length;
  const lateCount = schedules.filter(s => getAttendanceStatus(s.id, s.studentId) === 'late').length;
  const absentCount = schedules.filter(s => getAttendanceStatus(s.id, s.studentId) === 'absent').length;

  const stats = [
    { label: '今日预约', value: schedules.length, icon: Calendar, color: 'bg-blue-500' },
    { label: '待接待', value: pendingCount, icon: Clock, color: 'bg-amber-500' },
    { label: '已签到', value: checkedInCount, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: '迟到', value: lateCount, icon: Clock, color: 'bg-orange-500' },
    { label: '缺席', value: absentCount, icon: XCircle, color: 'bg-red-500' },
  ];

  const handleCheckIn = (scheduleId: string, studentId: string) => {
    checkIn(scheduleId, studentId, selectedDate);
  };

  const handleMarkLate = (scheduleId: string, studentId: string) => {
    markLate(scheduleId, studentId, selectedDate);
  };

  const handleMarkAbsent = (scheduleId: string, studentId: string) => {
    markAbsent(scheduleId, studentId, selectedDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">签到接待</h1>
          <p className="text-sm text-gray-500">前台接待学员签到，管理到课情况</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">今日预约列表</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索学员..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 w-48"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待接待</option>
                    <option value="checked">已签到</option>
                    <option value="late">迟到</option>
                    <option value="absent">缺席</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredSchedules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无预约记录</p>
              </div>
            ) : (
              <ReceptionList
                schedules={filteredSchedules}
                getStudentById={getStudentById}
                getTeacherById={getTeacherById}
                getCourseById={getCourseById}
                getAttendanceBySchedule={getAttendanceBySchedule}
                onCheckIn={handleCheckIn}
                onMarkLate={handleMarkLate}
                onMarkAbsent={handleMarkAbsent}
                onSelect={setSelectedScheduleId}
                selectedId={selectedScheduleId}
              />
            )}
          </div>
        </div>

        <div className="w-80">
          <ReceptionDetail
            scheduleId={selectedScheduleId}
            getScheduleById={getScheduleById}
            getStudentById={getStudentById}
            getTeacherById={getTeacherById}
            getCourseById={getCourseById}
            getAttendanceBySchedule={getAttendanceBySchedule}
            onCheckIn={handleCheckIn}
            onMarkLate={handleMarkLate}
            onMarkAbsent={handleMarkAbsent}
          />
        </div>
      </div>
    </div>
  );
}
