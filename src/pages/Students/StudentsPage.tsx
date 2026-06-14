import { useState } from 'react';
import { Search, Filter, Plus, Phone, User, Edit, Trash2, Eye } from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useFollowupStore } from '@/store/useFollowupStore';
import { Student, INTENTION_LEVELS, SOURCE_CHANNELS } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/date';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentFormModal } from './components/StudentFormModal';

export function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const students = useStudentStore((state) => state.students);
  const deleteStudent = useStudentStore((state) => state.deleteStudent);
  const getSchedulesByStudent = useScheduleStore((state) => state.getSchedulesByStudent);
  const getFeedbacksByStudent = useStudentStore((state) => state.getFeedbacksByStudent);
  const getFollowupsByStudent = useFollowupStore((state) => state.getFollowupsByStudent);

  const filteredStudents = students.filter((student) => {
    const matchSearch = student.name.includes(searchQuery) ||
      student.parentName.includes(searchQuery) ||
      student.phone.includes(searchQuery);
    const matchLevel = filterLevel === 'all' || student.intentionLevel === filterLevel;
    const matchStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchChannel = filterChannel === 'all' || student.sourceChannel === filterChannel;
    return matchSearch && matchLevel && matchStatus && matchChannel;
  });

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该学员吗？')) {
      deleteStudent(id);
    }
  };

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setShowForm(true);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">学员档案</h1>
          <p className="text-sm text-gray-500">管理学员信息、试听记录和跟进进度</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          新增学员
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索学员姓名、家长、电话..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="select"
            >
              <option value="all">全部意向</option>
              {Object.entries(INTENTION_LEVELS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select"
            >
              <option value="all">全部状态</option>
              <option value="potential">潜在客户</option>
              <option value="trial">试听中</option>
              <option value="formal">正式学员</option>
              <option value="lost">已流失</option>
            </select>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="select"
            >
              <option value="all">全部渠道</option>
              {SOURCE_CHANNELS.map((channel) => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">学员信息</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">家长联系</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">来源渠道</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">意向等级</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">创建时间</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const statusInfo = getStatusText(student.status);
                const scheduleCount = getSchedulesByStudent(student.id).length;
                const feedbackCount = getFeedbacksByStudent(student.id).length;
                const followupCount = getFollowupsByStudent(student.id).length;

                return (
                  <tr
                    key={student.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                          student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                        )}>
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">
                            {student.gender === 'male' ? '男' : '女'} · {student.age}岁
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{student.parentName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {student.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{student.sourceChannel}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white',
                        INTENTION_LEVELS[student.intentionLevel].color
                      )}>
                        {INTENTION_LEVELS[student.intentionLevel].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('badge', statusInfo.color)}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDateTime(student.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                          title="查看详情"
                          onClick={() => handleViewDetail(student)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"
                          title="编辑"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="删除"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无符合条件的学员</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>共 {filteredStudents.length} 条记录</div>
          <div className="flex gap-4">
            <span>试听 {students.filter(s => s.status === 'trial').length} 人</span>
            <span>正式 {students.filter(s => s.status === 'formal').length} 人</span>
            <span>潜在 {students.filter(s => s.status === 'potential').length} 人</span>
          </div>
        </div>
      </div>

      {showDetail && selectedStudent && (
        <StudentDetailModal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          student={selectedStudent}
        />
      )}

      {showForm && (
        <StudentFormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          student={editingStudent}
        />
      )}
    </div>
  );
}
