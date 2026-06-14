import { Followup, Student, INTENTION_LEVELS } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { CheckCircle, Trash2, Phone, User } from 'lucide-react';

interface FollowupListProps {
  followups: Followup[];
  getStudentById: (id: string) => Student | undefined;
  getPriorityLabel: (date?: string) => { text: string; color: string };
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FollowupList({
  followups,
  getStudentById,
  getPriorityLabel,
  onSelect,
  selectedId,
  onComplete,
  onDelete,
}: FollowupListProps) {
  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {followups.map((followup) => {
        const student = getStudentById(followup.studentId);
        if (!student) return null;

        const priorityLabel = getPriorityLabel(followup.nextContactDate);
        const intentionLevel = student.intentionLevel;

        return (
          <div
            key={followup.id}
            onClick={() => onSelect(followup.id)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all cursor-pointer',
              selectedId === followup.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-transparent bg-white hover:border-gray-200'
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0',
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
                  <span className={cn('badge text-[10px]', priorityLabel.color)}>
                    {priorityLabel.text}
                  </span>
                  {followup.nextContactDate && (
                    <span className="text-xs text-gray-500">
                      {followup.nextContactDate} {followup.nextContactTime || ''}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{followup.content}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {student.phone}
                  </span>
                  <span>·</span>
                  <span>{formatDateTime(followup.createdAt)}</span>
                </div>
                {followup.templateName && (
                  <p className="text-xs text-blue-600 mt-1">模板：{followup.templateName}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                {followup.status === 'pending' && (
                  <button
                    className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                    title="完成回访"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete(followup.id);
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  title="删除"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(followup.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
