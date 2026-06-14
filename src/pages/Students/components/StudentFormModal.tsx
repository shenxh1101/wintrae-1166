import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Student, SOURCE_CHANNELS, INTENTION_LEVELS } from '@/types';
import { useStudentStore } from '@/store/useStudentStore';
import { validatePhone, validateRequired, validateAge } from '@/utils/validation';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
}

export function StudentFormModal({ isOpen, onClose, student }: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    age: 5,
    parentName: '',
    phone: '',
    sourceChannel: '电话咨询',
    intentionLevel: 'none' as Student['intentionLevel'],
    status: 'potential' as Student['status'],
    remark: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addStudent = useStudentStore((state) => state.addStudent);
  const updateStudent = useStudentStore((state) => state.updateStudent);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        gender: student.gender,
        age: student.age,
        parentName: student.parentName,
        phone: student.phone,
        sourceChannel: student.sourceChannel,
        intentionLevel: student.intentionLevel,
        status: student.status,
        remark: student.remark,
      });
    } else {
      setFormData({
        name: '',
        gender: 'male',
        age: 5,
        parentName: '',
        phone: '',
        sourceChannel: '电话咨询',
        intentionLevel: 'none',
        status: 'potential',
        remark: '',
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!validateRequired(formData.name)) newErrors.name = '请输入学员姓名';
    if (!validateRequired(formData.parentName)) newErrors.parentName = '请输入家长姓名';
    if (!validatePhone(formData.phone)) newErrors.phone = '请输入正确的手机号';
    if (!validateAge(formData.age)) newErrors.age = '年龄必须在2-18岁之间';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (student) {
      updateStudent(student.id, formData);
    } else {
      addStudent(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-gray-800">
            {student ? '编辑学员' : '新增学员'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">学员姓名 *</label>
              <input
                type="text"
                className={cn('input', errors.name && 'input-error')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入学员姓名"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">性别</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={formData.gender === 'male'}
                    onChange={() => setFormData({ ...formData, gender: 'male' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">男</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={formData.gender === 'female'}
                    onChange={() => setFormData({ ...formData, gender: 'female' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">女</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">年龄 *</label>
              <input
                type="number"
                min="2"
                max="18"
                className={cn('input', errors.age && 'input-error')}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              />
              {errors.age && <p className="form-error">{errors.age}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">家长姓名 *</label>
              <input
                type="text"
                className={cn('input', errors.parentName && 'input-error')}
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="请输入家长姓名"
              />
              {errors.parentName && <p className="form-error">{errors.parentName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">联系电话 *</label>
              <input
                type="tel"
                className={cn('input', errors.phone && 'input-error')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入联系电话"
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">来源渠道</label>
              <select
                className="select"
                value={formData.sourceChannel}
                onChange={(e) => setFormData({ ...formData, sourceChannel: e.target.value })}
              >
                {SOURCE_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">意向等级</label>
              <select
                className="select"
                value={formData.intentionLevel}
                onChange={(e) => setFormData({ ...formData, intentionLevel: e.target.value as Student['intentionLevel'] })}
              >
                {Object.entries(INTENTION_LEVELS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">学员状态</label>
              <select
                className="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Student['status'] })}
              >
                <option value="potential">潜在客户</option>
                <option value="trial">试听中</option>
                <option value="formal">正式学员</option>
                <option value="lost">已流失</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">备注</label>
              <textarea
                className="input min-h-[80px]"
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                placeholder="输入备注信息..."
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {student ? '保存修改' : '添加学员'}
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ');
}
