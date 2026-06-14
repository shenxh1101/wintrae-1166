import { useState, useEffect } from 'react';
import { X, AlertTriangle, UserPlus, Clock, User, BookOpen, CheckCircle } from 'lucide-react';
import { Teacher, Course, Student, Schedule } from '@/types';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useStudentStore } from '@/store/useStudentStore';
import { validatePhone, validateRequired, validateAge, validateTimeRange } from '@/utils/validation';
import { cn } from '@/utils/cn';
import { SOURCE_CHANNELS } from '@/types';
import { addDays } from 'date-fns';
import { format } from 'date-fns';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: string;
  teachers: Teacher[];
  courses: Course[];
}

type Step = 'student' | 'course' | 'confirm';

export function ScheduleModal({ isOpen, onClose, initialDate, teachers, courses }: ScheduleModalProps) {
  const [step, setStep] = useState<Step>('student');
  const [isNewStudent, setIsNewStudent] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [conflicts, setConflicts] = useState<Schedule[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [studentForm, setStudentForm] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    age: 5,
    parentName: '',
    phone: '',
    sourceChannel: '电话咨询',
    remark: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    date: initialDate,
    startTime: '09:00',
    endTime: '09:45',
    teacherId: '',
    courseId: '',
    remark: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const students = useStudentStore((state) => state.students);
  const addStudent = useStudentStore((state) => state.addStudent);
  const addSchedule = useScheduleStore((state) => state.addSchedule);
  const checkTimeConflict = useScheduleStore((state) => state.checkTimeConflict);
  const getStudentById = useStudentStore((state) => state.getStudentById);
  const getTeacherById = useScheduleStore((state) => state.getTeacherById);
  const getCourseById = useScheduleStore((state) => state.getCourseById);

  useEffect(() => {
    if (isOpen) {
      setStep('student');
      setIsNewStudent(true);
      setSelectedStudentId('');
      setConflicts([]);
      setShowSuccess(false);
      setScheduleForm(prev => ({ ...prev, date: initialDate }));
      setErrors({});
    }
  }, [isOpen, initialDate]);

  useEffect(() => {
    if (scheduleForm.teacherId && scheduleForm.startTime && scheduleForm.endTime && scheduleForm.date) {
      const conflictList = checkTimeConflict(
        scheduleForm.teacherId,
        scheduleForm.date,
        scheduleForm.startTime,
        scheduleForm.endTime
      );
      setConflicts(conflictList);
    } else {
      setConflicts([]);
    }
  }, [scheduleForm.teacherId, scheduleForm.startTime, scheduleForm.endTime, scheduleForm.date, checkTimeConflict]);

  const validateStudentStep = () => {
    const newErrors: Record<string, string> = {};

    if (isNewStudent) {
      if (!validateRequired(studentForm.name)) newErrors.name = '请输入学员姓名';
      if (!validateAge(studentForm.age)) newErrors.age = '年龄必须在3-18岁之间';
      if (!validateRequired(studentForm.parentName)) newErrors.parentName = '请输入家长姓名';
      if (!validatePhone(studentForm.phone)) newErrors.phone = '请输入正确的手机号';
    } else {
      if (!selectedStudentId) newErrors.student = '请选择学员';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCourseStep = () => {
    const newErrors: Record<string, string> = {};

    if (!scheduleForm.courseId) newErrors.courseId = '请选择课程';
    if (!scheduleForm.teacherId) newErrors.teacherId = '请选择老师';
    if (!validateTimeRange(scheduleForm.startTime, scheduleForm.endTime)) {
      newErrors.time = '结束时间必须晚于开始时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && conflicts.length === 0;
  };

  const handleNext = () => {
    if (step === 'student' && validateStudentStep()) {
      setStep('course');
    } else if (step === 'course' && validateCourseStep()) {
      setStep('confirm');
    }
  };

  const handleSubmit = () => {
    let studentId = selectedStudentId;

    if (isNewStudent) {
      const newStudent: Omit<Student, 'id' | 'createdAt'> = {
        ...studentForm,
        intentionLevel: 'none',
        status: 'potential',
      };
      const tempId = Date.now().toString();
      studentId = tempId;
      addStudent(newStudent);
      
      setTimeout(() => {
        const latestStudents = useStudentStore.getState().students;
        const created = latestStudents[latestStudents.length - 1];
        studentId = created.id;
        submitSchedule(studentId);
      }, 50);
    } else {
      submitSchedule(studentId);
    }
  };

  const submitSchedule = (studentId: string) => {
    const result = addSchedule({
      ...scheduleForm,
      studentId,
      status: 'scheduled',
    });

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
        setConflicts(result.conflicts || []);
    }
  };

  const selectedStudent = getStudentById(selectedStudentId);
  const selectedTeacher = getTeacherById(scheduleForm.teacherId);
  const selectedCourse = getCourseById(scheduleForm.courseId);

  const handleCourseChange = (courseId: string) => {
    const course = getCourseById(courseId);
    if (course) {
      const duration = course.duration;
      const [hours, minutes] = scheduleForm.startTime.split(':').map(Number);
      const endMinutes = hours * 60 + minutes + duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      setScheduleForm(prev => ({
        ...prev,
        courseId,
        endTime: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
      }));
    } else {
      setScheduleForm(prev => ({ ...prev, courseId }));
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">预约成功</h3>
          <p className="text-gray-500">试听预约已成功添加到日历中</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">新增试听预约</h2>
            <div className="flex items-center gap-2 mt-1">
              {['学员信息', '课程安排', '确认预约'].map((label, index) => {
                const steps: Step[] = ['student', 'course', 'confirm'];
                const currentIndex = steps.indexOf(step);
                return (
                  <>
                    <span className={cn(
                      'text-xs',
                      currentIndex >= index ? 'text-blue-600' : 'text-gray-400'
                    )}>
                      {label}
                    </span>
                    {index < 2 && (
                      <div className={cn(
                        'w-8 h-0.5',
                        currentIndex > index ? 'bg-blue-500' : 'bg-gray-200'
                      )} />
                    )}
                  </>
                );
              })}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {step === 'student' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isNewStudent}
                  onChange={() => setIsNewStudent(true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">新学员</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isNewStudent}
                  onChange={() => setIsNewStudent(false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">已有学员</span>
              </label>
            </div>

            {isNewStudent ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学员姓名 *</label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                    className={cn('input w-full', errors.name && 'border-red-300 focus:border-red-500 focus:ring-red-500/20')}
                    placeholder="请输入学员姓名"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={studentForm.gender === 'male'}
                        onChange={() => setStudentForm(prev => ({ ...prev, gender: 'male' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">男</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={studentForm.gender === 'female'}
                        onChange={() => setStudentForm(prev => ({ ...prev, gender: 'female' }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">女</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年龄 *</label>
                  <input
                    type="number"
                    value={studentForm.age}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    className={cn('input w-full', errors.age && 'border-red-300')}
                    min="3"
                    max="18"
                  />
                  {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">家长姓名 *</label>
                  <input
                    type="text"
                    value={studentForm.parentName}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, parentName: e.target.value }))}
                    className={cn('input w-full', errors.parentName && 'border-red-300')}
                    placeholder="请输入家长姓名"
                  />
                  {errors.parentName && <p className="text-xs text-red-500 mt-1">{errors.parentName}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">联系电话 *</label>
                  <input
                    type="tel"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                    className={cn('input w-full', errors.phone && 'border-red-300')}
                    placeholder="请输入手机号"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">来源渠道</label>
                  <select
                    value={studentForm.sourceChannel}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, sourceChannel: e.target.value }))}
                    className="select w-full"
                  >
                    {SOURCE_CHANNELS.map((channel) => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea
                    value={studentForm.remark}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, remark: e.target.value }))}
                    className="textarea w-full h-20"
                    placeholder="选填，如学员基础情况、特殊要求等"
                  />
                </div>
              </div>
            ) : (
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择学员 *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className={cn('select w-full', errors.student && 'border-red-300')}
              >
                <option value="">请选择学员</option>
                {students.filter(s => s.status !== 'lost').map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.parentName} ({student.phone})
                  </option>
                ))}
              </select>
              {errors.student && <p className="text-xs text-red-500 mt-1">{errors.student}</p>}

              {selectedStudent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">学员：</span>
                      <span className="font-medium">{selectedStudent.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">年龄：</span>
                      <span className="font-medium">{selectedStudent.age}岁</span>
                    </div>
                    <div>
                      <span className="text-gray-500">家长：</span>
                      <span className="font-medium">{selectedStudent.parentName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">电话：</span>
                      <span className="font-medium">{selectedStudent.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {step === 'course' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  预约日期
                </label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                  className="input w-full"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">试听课程 *</label>
                <select
                  value={scheduleForm.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className={cn('select w-full', errors.courseId && 'border-red-300')}
                >
                  <option value="">请选择课程</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.duration}分钟)
                    </option>
                  ))}
                </select>
                {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className={cn('input w-full', errors.time && 'border-red-300')}
                />
                {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">授课老师 *</label>
                <div className="grid grid-cols-2 gap-3">
                  {teachers.filter(t => t.active).map((teacher) => {
                    const isSelected = scheduleForm.teacherId === teacher.id;
                    return (
                      <div
                        key={teacher.id}
                        onClick={() => setScheduleForm(prev => ({ ...prev, teacherId: teacher.id }))}
                        className={cn(
                          'p-3 border-2 rounded-xl cursor-pointer transition-all',
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                            {teacher.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{teacher.name}</p>
                            <p className="text-xs text-gray-500">{teacher.subject}老师</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.teacherId && <p className="text-xs text-red-500 mt-1">{errors.teacherId}</p>}
              </div>

              {conflicts.length > 0 && (
                <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-2">时间冲突提醒</p>
                      <p className="text-sm text-red-600 mb-2">该老师在此时段已有课程安排：</p>
                      {conflicts.map((conflict) => {
                        const conflictStudent = getStudentById(conflict.studentId);
                        const conflictCourse = getCourseById(conflict.courseId);
                        return (
                          <div key={conflict.id} className="text-sm text-red-600 ml-2">
                            • {conflict.startTime}-{conflict.endTime} {conflictStudent?.name} - {conflictCourse?.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={scheduleForm.remark}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, remark: e.target.value }))}
                  className="textarea w-full h-20"
                  placeholder="选填，如学员基础情况、特殊要求等"
                />
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">请确认预约信息</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-blue-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {isNewStudent ? studentForm.name.charAt(0) : selectedStudent?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {isNewStudent ? studentForm.name : selectedStudent?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isNewStudent ? `${studentForm.parentName} · ${studentForm.phone}` : `${selectedStudent?.parentName} · ${selectedStudent?.phone}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">试听课程</p>
                      <p className="text-sm font-medium text-gray-800">{selectedCourse?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">授课老师</p>
                      <p className="text-sm font-medium text-gray-800">{selectedTeacher?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">预约日期</p>
                      <p className="text-sm font-medium text-gray-800">{scheduleForm.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">上课时间</p>
                      <p className="text-sm font-medium text-gray-800">{scheduleForm.startTime} - {scheduleForm.endTime}</p>
                    </div>
                  </div>
                </div>

                {scheduleForm.remark && (
                  <div className="pt-4 border-t border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">备注</p>
                    <p className="text-sm text-gray-700">{scheduleForm.remark}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
        <div>
          {step !== 'student' && (
            <button className="btn btn-secondary" onClick={() => setStep(prev => prev === 'course' ? 'student' : 'course')}>
              上一步
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          {step !== 'confirm' ? (
            <button className="btn btn-primary" onClick={handleNext}>
              下一步
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleSubmit}>
              确认预约
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
