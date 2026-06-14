import { ClassWarning } from '@/types';
import { cn } from '@/utils/cn';
import { AlertTriangle, Users } from 'lucide-react';

interface ClassWarningListProps {
  warnings: ClassWarning[];
}

export function ClassWarningList({ warnings }: ClassWarningListProps) {
  if (warnings.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
        <Users className="w-12 h-12 mb-3 opacity-30" />
        <p>暂无班级预警</p>
        <p className="text-sm mt-1">所有班级名额充足</p>
      </div>
    );
  }

  const activeWarnings = warnings.filter((w) => w.level !== 'normal');

  if (activeWarnings.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
        <Users className="w-12 h-12 mb-3 opacity-30" />
        <p>暂无班级预警</p>
        <p className="text-sm mt-1">所有班级名额充足</p>
      </div>
    );
  }

  const sortedWarnings = [...activeWarnings].sort((a, b) => {
    if (a.level === 'danger' && b.level === 'warning') return -1;
    if (a.level === 'warning' && b.level === 'danger') return 1;
    return b.fillRate - a.fillRate;
  });

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
      {sortedWarnings.map((warning) => (
        <div
          key={warning.classId}
          className={cn(
            'p-4 rounded-xl border-2',
            warning.level === 'danger'
              ? 'border-red-200 bg-red-50'
              : 'border-amber-200 bg-amber-50'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                {warning.className}
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  warning.level === 'danger'
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-500 text-white'
                )}>
                  {warning.level === 'danger' ? '已满班' : '即将满班'}
                </span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                任课老师：{warning.teacherName || '未安排'}
              </p>
            </div>
            <AlertTriangle className={cn(
              'w-5 h-5',
              warning.level === 'danger' ? 'text-red-500' : 'text-amber-500'
            )} />
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">已报名 {warning.currentCount} / {warning.maxCapacity} 人</span>
              <span className="font-medium text-gray-800">{Math.round(warning.fillRate)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  warning.level === 'danger' ? 'bg-red-500' : 'bg-amber-500'
                )}
                style={{ width: `${warning.fillRate}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            {warning.level === 'danger'
              ? '该班级已达到最大容量，建议开启新班级'
              : `剩余 ${warning.maxCapacity - warning.currentCount} 个名额，请注意招生进度`}
          </p>
        </div>
      ))}
    </div>
  );
}
