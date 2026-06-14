import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Phone, Clock, CheckCircle, AlertCircle, User, MessageSquare, FileText, X } from 'lucide-react';
import { useFollowupStore } from '@/store/useFollowupStore';
import { useStudentStore } from '@/store/useStudentStore';
import { INTENTION_LEVELS } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateTime, isToday, isPast, isTomorrow, formatDate } from '@/utils/date';
import { FollowupList } from './components/FollowupList';
import { FollowupDetail } from './components/FollowupDetail';
import { FollowupFormModal } from './components/FollowupFormModal';

export function FollowupPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedFollowupId, setSelectedFollowupId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const getSortedFollowups = useFollowupStore((state) => state.getSortedFollowups);
  const completeFollowup = useFollowupStore((state) => state.completeFollowup);
  const deleteFollowup = useFollowupStore((state) => state.deleteFollowup);
  const getStudentById = useStudentStore((state) => state.getStudentById);

  const followups = useMemo(() => getSortedFollowups(), [getSortedFollowups]);

  const filteredFollowups = followups.filter((followup) => {
    const student = getStudentById(followup.studentId);
    if (!student) return false;

    const matchSearch = student.name.includes(searchQuery) ||
      student.parentName.includes(searchQuery) ||
      student.phone.includes(searchQuery) ||
      followup.content.includes(searchQuery);

    const matchStatus = filterStatus === 'all' || followup.status === filterStatus;

    let matchPriority = true;
    if (filterPriority !== 'all') {
      if (filterPriority === 'high') {
        matchPriority = student.intentionLevel === 'A';
      } else if (filterPriority === 'medium') {
        matchPriority = student.intentionLevel === 'B' || student.intentionLevel === 'C';
      } else if (filterPriority === 'low') {
        matchPriority = student.intentionLevel === 'D' || student.intentionLevel === 'none';
      }
    }

    return matchSearch && matchStatus && matchPriority;
  });

  const pendingCount = followups.filter(f => f.status === 'pending').length;
  const todayCount = followups.filter(f => f.status === 'pending' && f.nextContactDate && isToday(f.nextContactDate)).length;
  const overdueCount = followups.filter(f => {
    if (f.status !== 'pending' || !f.nextContactDate) return false;
    return isPast(f.nextContactDate) && !isToday(f.nextContactDate);
  }).length;
  const completedCount = followups.filter(f => f.status === 'completed').length;

  const stats = [
    { label: '待回访', value: pendingCount, icon: Clock, color: 'bg-amber-500' },
    { label: '今日回访', value: todayCount, icon: AlertCircle, color: 'bg-blue-500' },
    { label: '已逾期', value: overdueCount, icon: AlertCircle, color: 'bg-red-500' },
    { label: '已完成', value: completedCount, icon: CheckCircle, color: 'bg-emerald-500' },
  ];

  const getPriorityLabel = (date?: string) => {
    if (!date) return { text: '无计划', color: 'bg-gray-100 text-gray-700' };
    if (isPast(date) && !isToday(date)) return { text: '已逾期', color: 'bg-red-100 text-red-700' };
    if (isToday(date)) return { text: '今天', color: 'bg-blue-100 text-blue-700' };
    if (isTomorrow(date)) return { text: '明天', color: 'bg-amber-100 text-amber-700' };
    return { text: '待跟进', color: 'bg-gray-100 text-gray-700' };
  };

  const handleComplete = (id: string) => {
    setSelectedFollowupId(id);
    setShowCompleteModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条回访记录吗？')) {
      deleteFollowup(id);
      if (selectedFollowupId === id) {
        setSelectedFollowupId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">回访记录</h1>
          <p className="text-sm text-gray-500">管理待回访名单，记录跟进结果</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowFormModal(true)}>
          <Plus className="w-4 h-4" />
          新增回访
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
              <h2 className="text-lg font-semibold text-gray-800">回访列表</h2>
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
                    <option value="pending">待回访</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="select"
                  >
                    <option value="all">全部优先级</option>
                    <option value="high">高优先级(A级)</option>
                    <option value="medium">中优先级(B/C级)</option>
                    <option value="low">低优先级(D级)</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredFollowups.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无回访记录</p>
              </div>
            ) : (
              <FollowupList
                followups={filteredFollowups}
                getStudentById={getStudentById}
                getPriorityLabel={getPriorityLabel}
                onSelect={setSelectedFollowupId}
                selectedId={selectedFollowupId}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>

        <div className="w-96">
          <FollowupDetail
            followupId={selectedFollowupId}
            getFollowupById={useFollowupStore.getState().getFollowupById}
            getStudentById={getStudentById}
            getPriorityLabel={getPriorityLabel}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {showFormModal && (
        <FollowupFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
        />
      )}

      {showCompleteModal && selectedFollowupId && (
        <CompleteFollowupModal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedFollowupId(null);
          }}
          followupId={selectedFollowupId}
          onComplete={(result, nextDate, nextTime) => {
            completeFollowup(selectedFollowupId, result, nextDate, nextTime);
            setShowCompleteModal(false);
            setSelectedFollowupId(null);
          }}
        />
      )}
    </div>
  );
}

function CompleteFollowupModal({ isOpen, onClose, followupId, onComplete }: {
  isOpen: boolean;
  onClose: () => void;
  followupId: string;
  onComplete: (result: string, nextDate?: string, nextTime?: string) => void;
}) {
  const [result, setResult] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('');

  const handleSubmit = () => {
    if (!result.trim()) {
      alert('请输入回访结果');
      return;
    }
    onComplete(result, nextDate || undefined, nextTime || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-gray-800">完成回访</h2>
          <button className="modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">回访结果 *</label>
            <textarea
              className="input min-h-[120px]"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="请输入本次回访的结果..."
            />
          </div>
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <Clock className="w-4 h-4" />
              下次联系时间（可选）
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="input"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
              />
              <input
                type="time"
                className="input"
                value={nextTime}
                onChange={(e) => setNextTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit}>确认完成</button>
        </div>
      </div>
    </div>
  );
}


