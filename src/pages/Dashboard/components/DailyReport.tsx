import { DailyReport as DailyReportType } from '@/types';
import { Calendar, Users, CheckCircle, Clock, XCircle, TrendingUp, UserPlus, FileText } from 'lucide-react';

interface DailyReportProps {
  report: DailyReportType;
}

export function DailyReport({ report }: DailyReportProps) {
  const items = [
    { label: '新增学员', value: report.newStudents, icon: UserPlus, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { label: '预约试听', value: report.totalSchedules, icon: Calendar, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { label: '已签到', value: report.checkedIn, icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { label: '迟到', value: report.late, icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-50' },
    { label: '缺席', value: report.totalAbsent, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' },
    { label: '新增回访', value: 0, icon: FileText, color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
    { label: '完成回访', value: report.completedFollowups, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
    { label: '转正数', value: report.conversions, icon: TrendingUp, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  ];

  const attendanceRate = report.totalSchedules > 0
    ? Math.round(((report.checkedIn + report.late) / report.totalSchedules) * 100)
    : 0;

  const conversionRate = report.totalSchedules > 0
    ? Math.round((report.conversions / report.totalSchedules) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`${item.bgColor} rounded-xl p-3 text-center`}
          >
            <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
            <p className="text-lg font-bold text-gray-800">{item.value}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">到课率</span>
            <span className="text-lg font-bold text-blue-600">{attendanceRate}%</span>
          </div>
          <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            应到 {report.totalSchedules} 人，实到 {report.checkedIn + report.late} 人
          </p>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">转化率</span>
            <span className="text-lg font-bold text-emerald-600">{conversionRate}%</span>
          </div>
          <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            试听 {report.totalSchedules} 人，转正 {report.conversions} 人
          </p>
        </div>
      </div>

      {report.missedStudents.length > 0 && (
        <div className="p-4 bg-red-50 rounded-xl">
          <p className="text-sm font-medium text-red-600 mb-2">缺席学员</p>
          <div className="flex flex-wrap gap-2">
            {report.missedStudents.map((student, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border border-red-200"
              >
                {student.name} ({student.phone})
              </span>
            ))}
          </div>
        </div>
      )}

      {report.highPriorityFollowups.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-xl">
          <p className="text-sm font-medium text-amber-600 mb-2">高优先级待回访</p>
          <div className="flex flex-wrap gap-2">
            {report.highPriorityFollowups.map((student, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border border-amber-200"
              >
                {student.name} ({student.phone})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
