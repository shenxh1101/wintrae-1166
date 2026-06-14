import { useState } from 'react';
import { X, Phone, Calendar, MessageSquare, FileText, Star, User, Clock } from 'lucide-react';
import { Student, INTENTION_LEVELS, SCHEDULE_STATUS } from '@/types';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useStudentStore } from '@/store/useStudentStore';
import { useFollowupStore } from '@/store/useFollowupStore';
import { formatDateTime, formatDate } from '@/utils/date';
import { cn } from '@/utils/cn';
import { FeedbackFormModal } from './FeedbackFormModal';
import { FollowupFormModal } from './FollowupFormModal';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

type TabType = 'info' | 'schedules' | 'feedbacks' | 'followups';

export function StudentDetailModal({ isOpen, onClose, student }: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const getSchedulesByStudent = useScheduleStore((state) => state.getSchedulesByStudent);
  const getTeacherById = useScheduleStore((state) => state.getTeacherById);
  const getCourseById = useScheduleStore((state) => state.getCourseById);
  const getFeedbacksByStudent = useStudentStore((state) => state.getFeedbacksByStudent);
  const getFollowupsByStudent = useFollowupStore((state) => state.getFollowupsByStudent);

  const schedules = getSchedulesByStudent(student.id);
  const feedbacks = getFeedbacksByStudent(student.id);
  const followups = getFollowupsByStudent(student.id);

  const handleAddFeedback = (scheduleId?: string) => {
    if (scheduleId) setSelectedScheduleId(scheduleId);
    setShowFeedbackModal(true);
  };

  const handleAddFollowup = () => {
    setShowFollowupModal(true);
  };

  const getStatusText = (status: Student['status']) => {
    const map = {
      potential: { text: '潜在客户', color: 'bg-gray-100 text-gray-700' },
      trial: { text: '试听中', color: 'bg-blue-100 text-blue-700' },
      formal: { text: '正式学员', color: 'bg-emerald-100 text-emerald-700' },
      lost: { text: '已流失', color: 'bg-red-100 text-red-700' },
    };
    return map[status];
  };

  const tabs = [
    { key: 'info', label: '基本信息', icon: User },
    { key: 'schedules', label: `试听记录 (${schedules.length})`, icon: Calendar },
    { key: 'feedbacks', label: `反馈记录 (${feedbacks.length})`, icon: MessageSquare },
    { key: 'followups', label: `回访记录 (${followups.length})`, icon: FileText },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-4xl">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg',
              student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
            )}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{student.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {student.gender === 'male' ? '男' : '女'} · {student.age}岁
                </span>
                <span className={cn('badge', getStatusText(student.status).color)}>
                  {getStatusText(student.status).text}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white',
                  INTENTION_LEVELS[student.intentionLevel].color
                )}>
                  <Star className="w-3 h-3" />
                  {INTENTION_LEVELS[student.intentionLevel].label}
                </span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-gray-100">
          <div className="flex gap-1 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2',
                  activeTab === tab.key
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  个人信息
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">学员姓名</span>
                    <span className="font-medium text-gray-800">{student.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">性别</span>
                    <span className="font-medium text-gray-800">{student.gender === 'male' ? '男' : '女'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">年龄</span>
                    <span className="font-medium text-gray-800">{student.age}岁</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">创建时间</span>
                    <span className="font-medium text-gray-800">{formatDateTime(student.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  家长联系方式
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">家长姓名</span>
                    <span className="font-medium text-gray-800">{student.parentName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">联系电话</span>
                    <span className="font-medium text-blue-600">{student.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">来源渠道</span>
                    <span className="font-medium text-gray-800">{student.sourceChannel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">备注</span>
                    <span className="font-medium text-gray-800">{student.remark || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedules' && (
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无试听记录</p>
                </div>
              ) : (
                schedules.map((schedule) => {
                  const teacher = getTeacherById(schedule.teacherId);
                  const course = getCourseById(schedule.courseId);
                  return (
                    <div key={schedule.id} className="card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={cn(
                              'badge',
                              SCHEDULE_STATUS[schedule.status].color
                            )}>
                              {SCHEDULE_STATUS[schedule.status].label}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatDate(schedule.date)} {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <p className="font-medium text-gray-800 mb-1">{course?.name}</p>
                          <p className="text-sm text-gray-500">授课老师：{teacher?.name}</p>
                          {schedule.remark && (
                            <p className="text-sm text-gray-500 mt-1">备注：{schedule.remark}</p>
                          )}
                        </div>
                        {schedule.status === 'completed' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAddFeedback(schedule.id)}
                          >
                            添加反馈
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'feedbacks' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-700">试听反馈记录</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAddFeedback()}
                >
                  新增反馈
                </button>
              </div>
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无反馈记录</p>
                </div>
              ) : (
                feedbacks.map((feedback) => {
                  const teacher = getTeacherById(feedback.teacherId);
                  return (
                    <div key={feedback.id} className="card p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white',
                              INTENTION_LEVELS[feedback.intentionLevel].color
                            )}>
                              <Star className="w-3 h-3" />
                              {INTENTION_LEVELS[feedback.intentionLevel].label}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(feedback.createdAt)}
                            </span>
                            <span className="text-sm text-gray-500">
                              点评老师：{teacher?.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <span className="text-xs text-gray-500">课堂表现</span>
                              <p className="text-sm text-gray-800">{feedback.performance || '-'}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">接受能力</span>
                              <p className="text-sm text-gray-800">{feedback.ability || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-xs text-gray-500">老师建议</span>
                              <p className="text-sm text-gray-800">{feedback.suggestion || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-xs text-gray-500">家长反馈</span>
                              <p className="text-sm text-gray-800">{feedback.parentFeedback || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'followups' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-700">回访记录</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddFollowup}
                >
                  新增回访
                </button>
              </div>
              {followups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无回访记录</p>
                </div>
              ) : (
                followups.map((followup) => (
                  <div key={followup.id} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'badge',
                          followup.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          followup.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                        )}>
                          {followup.status === 'pending' ? '待回访' :
                           followup.status === 'completed' ? '已完成' : '已取消'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(followup.createdAt)}
                        </span>
                      </div>
                      {followup.nextContactDate && (
                        <span className="text-xs text-blue-600">
                          下次联系：{followup.nextContactDate} {followup.nextContactTime || ''}
                        </span>
                      )}
                    </div>
                    {followup.templateName && (
                      <p className="text-xs text-gray-500 mb-2">使用模板：{followup.templateName}</p>
                    )}
                    <p className="text-sm text-gray-800 mb-1">{followup.content}</p>
                    {followup.result && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">回访结果</p>
                        <p className="text-sm text-gray-700">{followup.result}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackFormModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedScheduleId(null);
          }}
          studentId={student.id}
          scheduleId={selectedScheduleId || undefined}
        />
      )}

      {showFollowupModal && (
        <FollowupFormModal
          isOpen={showFollowupModal}
          onClose={() => setShowFollowupModal(false)}
          studentId={student.id}
        />
      )}
    </div>
  );
}
