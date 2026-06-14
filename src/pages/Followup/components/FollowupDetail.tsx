import { Followup, Student, INTENTION_LEVELS } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { User, Phone, Calendar, Clock, FileText, CheckCircle, Trash2, MessageSquare } from 'lucide-react';

interface FollowupDetailProps {
  followupId: string | null;
  getFollowupById: (id: string) => Followup | undefined;
  getStudentById: (id: string) => Student | undefined;
  getPriorityLabel: (date?: string) => { text: string; color: string };
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FollowupDetail({
  followupId,
  getFollowupById,
  getStudentById,
  getPriorityLabel,
  onComplete,
  onDelete,
}: FollowupDetailProps) {
  if (!followupId) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center h-[400px] text-gray-500">
        <FileText className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-sm">点击左侧列表查看回访详情</p>
      </div>
    );
  }

  const followup = getFollowupById(followupId);
  if (!followup) return null;

  const student = getStudentById(followup.studentId);
  if (!student) return null;

  const priorityLabel = getPriorityLabel(followup.nextContactDate);
  const intentionLevel = student.intentionLevel;

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

      <div className={cn('mb-6 p-3 rounded-lg text-center', priorityLabel.color)}>
        <span className="font-medium">{priorityLabel.text}</span>
        {followup.nextContactDate && (
          <p className="text-xs mt-1 opacity-80">
            {followup.nextContactDate} {followup.nextContactTime || ''}
          </p>
        )}
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
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">回访状态</p>
            <p className="text-sm font-medium text-gray-800">
              {followup.status === 'pending' ? '待回访' :
               followup.status === 'completed' ? '已完成' : '已取消'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">创建时间</p>
            <p className="text-sm font-medium text-gray-800">{formatDateTime(followup.createdAt)}</p>
          </div>
        </div>
        {followup.templateName && (
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">使用模板</p>
              <p className="text-sm font-medium text-gray-800">{followup.templateName}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">回访内容</p>
        <p className="text-sm text-gray-700">{followup.content}</p>
      </div>

      {followup.result && (
        <div className="mb-6 p-3 bg-emerald-50 rounded-lg">
          <p className="text-xs text-emerald-500 mb-1">回访结果</p>
          <p className="text-sm text-emerald-700">{followup.result}</p>
        </div>
      )}

      {student.remark && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">学员备注</p>
          <p className="text-sm text-gray-700">{student.remark}</p>
        </div>
      )}

      <div className="space-y-2">
        {followup.status === 'pending' && (
          <button
            className="btn btn-emerald w-full"
            onClick={() => onComplete(followupId)}
          >
            <CheckCircle className="w-4 h-4" />
            完成回访
          </button>
        )}
        <button
          className="btn btn-red w-full"
          onClick={() => {
            if (confirm('确定要删除这条回访记录吗？')) {
              onDelete(followupId);
            }
          }}
        >
          <Trash2 className="w-4 h-4" />
          删除记录
        </button>
      </div>
    </div>
  );
}
