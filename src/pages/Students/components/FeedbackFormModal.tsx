import { useState } from 'react';
import { X } from 'lucide-react';
import { INTENTION_LEVELS } from '@/types';
import { useStudentStore } from '@/store/useStudentStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { validateRequired } from '@/utils/validation';
import { cn } from '@/utils/cn';

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  scheduleId?: string;
}

export function FeedbackFormModal({ isOpen, onClose, studentId, scheduleId }: FeedbackFormModalProps) {
  const [formData, setFormData] = useState({
    scheduleId: scheduleId || '',
    teacherId: '',
    performance: '',
    ability: '',
    suggestion: '',
    parentFeedback: '',
    intentionLevel: 'none' as keyof typeof INTENTION_LEVELS,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFeedback = useStudentStore((state) => state.addFeedback);
  const updateStudent = useStudentStore((state) => state.updateStudent);
  const teachers = useScheduleStore((state) => state.teachers);
  const getSchedulesByStudent = useScheduleStore((state) => state.getSchedulesByStudent);

  const schedules = getSchedulesByStudent(studentId).filter(s => s.status === 'completed');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!validateRequired(formData.teacherId)) newErrors.teacherId = '请选择点评老师';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    addFeedback({
      ...formData,
      studentId,
    });

    if (formData.intentionLevel !== 'none') {
      updateStudent(studentId, {
        intentionLevel: formData.intentionLevel,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-gray-800">添加试听反馈</h2>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          {schedules.length > 0 && (
            <div className="form-group">
              <label className="form-label">关联试听课程</label>
              <select
                className="select"
                value={formData.scheduleId}
                onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
              >
                <option value="">请选择试听课程（可选）</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.date} {schedule.startTime}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">点评老师 *</label>
            <select
              className={cn('select', errors.teacherId && 'input-error')}
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            >
              <option value="">请选择老师</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
            {errors.teacherId && <p className="form-error">{errors.teacherId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">课堂表现</label>
              <select
                className="select"
                value={formData.performance}
                onChange={(e) => setFormData({ ...formData, performance: e.target.value })}
              >
                <option value="">请选择</option>
                <option value="非常积极">非常积极</option>
                <option value="比较积极">比较积极</option>
                <option value="一般">一般</option>
                <option value="不够专注">不够专注</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">接受能力</label>
              <select
                className="select"
                value={formData.ability}
                onChange={(e) => setFormData({ ...formData, ability: e.target.value })}
              >
                <option value="">请选择</option>
                <option value="很强">很强</option>
                <option value="较强">较强</option>
                <option value="一般">一般</option>
                <option value="需要加强">需要加强</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">老师建议</label>
            <textarea
              className="input min-h-[80px]"
              value={formData.suggestion}
              onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
              placeholder="请输入老师的专业建议..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">家长反馈</label>
            <textarea
              className="input min-h-[80px]"
              value={formData.parentFeedback}
              onChange={(e) => setFormData({ ...formData, parentFeedback: e.target.value })}
              placeholder="请输入家长的反馈意见..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">转正意向评估</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(INTENTION_LEVELS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, intentionLevel: key as any })}
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-medium transition-all border-2',
                    formData.intentionLevel === key
                      ? `${val.color} text-white border-transparent`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {val.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A-强烈意向 | B-较有意向 | C-意向一般 | D-意向较低 | none-暂未评估
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit}>保存反馈</button>
        </div>
      </div>
    </div>
  );
}
