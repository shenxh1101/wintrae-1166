import { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useFollowupStore } from '@/store/useFollowupStore';
import { getToday, formatDate, addDaysStr } from '@/utils/date';
import { validateRequired } from '@/utils/validation';
import { cn } from '@/utils/cn';

interface FollowupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

export function FollowupFormModal({ isOpen, onClose, studentId }: FollowupFormModalProps) {
  const [formData, setFormData] = useState({
    templateId: '',
    content: '',
    result: '',
    nextContactDate: '',
    nextContactTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFollowup = useFollowupStore((state) => state.addFollowup);
  const templates = useFollowupStore((state) => state.templates);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setFormData(prev => ({
      ...prev,
      templateId,
      content: template ? template.content : prev.content,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!validateRequired(formData.content)) newErrors.content = '请输入回访内容';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const template = templates.find(t => t.id === formData.templateId);
    const today = getToday();

    addFollowup({
      studentId,
      handlerId: 'current-user',
      templateId: formData.templateId || undefined,
      templateName: template?.name || '',
      priority: 'medium',
      content: formData.content,
      nextContactDate: formData.nextContactDate || today,
      nextContactTime: formData.nextContactTime || '10:00',
    });

    onClose();
  };

  const quickDates = [
    { label: '明天', days: 1 },
    { label: '3天后', days: 3 },
    { label: '1周后', days: 7 },
    { label: '2周后', days: 14 },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-gray-800">添加回访记录</h2>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">回访模板</label>
            <select
              className="select"
              value={formData.templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <option value="">选择模板（可选）</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">回访内容 *</label>
            <textarea
              className={cn('input min-h-[120px]', errors.content && 'input-error')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="请输入回访内容..."
            />
            {errors.content && <p className="form-error">{errors.content}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">回访结果</label>
            <textarea
              className="input min-h-[80px]"
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              placeholder="请输入本次回访的结果..."
            />
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Clock className="w-4 h-4" />
              下次联系时间
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickDates.map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    nextContactDate: addDaysStr(getToday(), item.days),
                  })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    formData.nextContactDate === addDaysStr(getToday(), item.days)
                      ? 'bg-blue-500 text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="input"
                value={formData.nextContactDate}
                onChange={(e) => setFormData({ ...formData, nextContactDate: e.target.value })}
              />
              <input
                type="time"
                className="input"
                value={formData.nextContactTime}
                onChange={(e) => setFormData({ ...formData, nextContactTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit}>保存回访</button>
        </div>
      </div>
    </div>
  );
}
