import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MousePointer2, 
  Eye, 
  Users as UsersIcon,
  ArrowUpRight,
  ArrowDownRight,
  Copy
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { db, collection, getDocs, query, orderBy, limit, handleFirestoreError, OperationType } from '../../firebase';

const COLORS = ['#000000', '#334155', '#64748B', '#94A3B8', '#CBD5E1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalCopies: 0,
    totalUsers: 0,
    engagement: 0,
    assetsGrowth: '+0%',
    copiesGrowth: '+0%',
    engagementGrowth: '+0%',
    usersGrowth: '+0%'
  });
  const [pieData, setPieData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const promptsSnap = await getDocs(query(collection(db, 'prompts'), limit(100)));
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(100)));
        
        let copies = 0;
        let views = 0;
        const catCounts: Record<string, number> = {};
        const usageByDate: Record<string, number> = {};

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        let currentMonthAssets = 0;
        let prevMonthAssets = 0;
        let currentMonthCopies = 0;
        let prevMonthCopies = 0;
        let currentMonthViews = 0;
        let prevMonthViews = 0;
        let currentMonthUsers = 0;
        let prevMonthUsers = 0;

        promptsSnap.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          
          copies += data.copies || 0;
          views += data.views || 0;

          if (createdAt >= thirtyDaysAgo) {
            currentMonthAssets++;
            currentMonthCopies += data.copies || 0;
            currentMonthViews += data.views || 0;
          } else if (createdAt >= sixtyDaysAgo) {
            prevMonthAssets++;
            prevMonthCopies += data.copies || 0;
            prevMonthViews += data.views || 0;
          }

          if (createdAt >= thirtyDaysAgo) {
            const dateStr = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            usageByDate[dateStr] = (usageByDate[dateStr] || 0) + (data.copies || 0) + (data.views || 0);
          }

          const cat = data.tags?.[data.tags.length - 1] || 'General';
          catCounts[cat] = (catCounts[cat] || 0) + 1;
        });

        usersSnap.docs.forEach(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          if (createdAt >= thirtyDaysAgo) {
            currentMonthUsers++;
          } else if (createdAt >= sixtyDaysAgo) {
            prevMonthUsers++;
          }
        });

        const calculateGrowth = (current: number, prev: number) => {
          if (prev === 0) return current > 0 ? '+100%' : '+0%';
          const growth = ((current - prev) / prev) * 100;
          return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        };

        setStats({
          totalAssets: promptsSnap.size,
          totalCopies: copies,
          totalUsers: usersSnap.size,
          engagement: views,
          assetsGrowth: calculateGrowth(currentMonthAssets, prevMonthAssets),
          copiesGrowth: calculateGrowth(currentMonthCopies, prevMonthCopies),
          engagementGrowth: calculateGrowth(currentMonthViews, prevMonthViews),
          usersGrowth: calculateGrowth(currentMonthUsers, prevMonthUsers)
        });

        const pie = Object.entries(catCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        setPieData(pie.slice(0, 5));

        const line = Object.entries(usageByDate)
          .map(([name, usage]) => ({ name, usage }))
          .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
        
        setLineData(line.length > 0 ? line : [{ name: 'No Data', usage: 0 }]);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'prompts/users');
        } catch (e) {
          setError(e);
        }
      }
    };

    fetchStats();
  }, []);

  const metrics = [
    { label: 'Total Assets', value: stats.totalAssets.toLocaleString(), icon: TrendingUp, trend: stats.assetsGrowth, positive: !stats.assetsGrowth.startsWith('-') },
    { label: 'Total Copies', value: stats.totalCopies.toLocaleString(), icon: Copy, trend: stats.copiesGrowth, positive: !stats.copiesGrowth.startsWith('-') },
    { label: 'Engagement', value: stats.engagement.toLocaleString(), icon: MousePointer2, trend: stats.engagementGrowth, positive: !stats.engagementGrowth.startsWith('-') },
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: UsersIcon, trend: stats.usersGrowth, positive: !stats.usersGrowth.startsWith('-') },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">Dashboard</h1>
        <p className="text-slate-500 font-medium">Welcome back, here's what's happening today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-admin-card border border-admin-border p-6 rounded-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-admin-accent/10 rounded-xl">
                <metric.icon className="text-admin-accent" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                metric.positive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {metric.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {metric.trend}
              </div>
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{metric.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{metric.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-admin-card border border-admin-border p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Prompt Usage Trends</h3>
            <select className="bg-slate-50 border border-admin-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none text-slate-900">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#000000" 
                  strokeWidth={4} 
                  dot={{ fill: '#000000', strokeWidth: 2, r: 4, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-admin-card border border-admin-border p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-8 text-slate-900">Category Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm text-slate-500">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
