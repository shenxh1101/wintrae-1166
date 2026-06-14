import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChannelStats } from '@/types';
import { cn } from '@/utils/cn';

interface ChannelChartProps {
  data: ChannelStats[];
}

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

export function ChannelChart({ data }: ChannelChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        暂无数据
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}人`, '学员数']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => {
              const item = data.find(d => d.channel === value);
              const percentage = total > 0 ? ((item?.count || 0) / total * 100).toFixed(1) : 0;
              return `${value} (${percentage}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={item.channel} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-600 flex-1">{item.channel}</span>
            <span className="text-sm font-medium text-gray-800">{item.count}人</span>
          </div>
        ))}
      </div>
    </div>
  );
}
