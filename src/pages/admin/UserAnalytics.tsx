import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  Search,
  MoreVertical,
  Mail,
  Shield,
  Ban,
  Copy
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { db, collection, getDocs, query, orderBy, handleFirestoreError, OperationType, limit } from '../../firebase';

const COLORS = ['#000000', '#334155', '#64748B', '#94A3B8', '#CBD5E1'];

export default function UserAnalytics() {
  const [users, setUsers] = useState<any[]>([]);
  const [dbPrompts, setDbPrompts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCreators: 0,
    totalCopies: 0,
    bannedUsers: 0,
    usersGrowth: '+0%',
    creatorsGrowth: '+0%',
    copiesGrowth: '+0%'
  });
  const [userData, setUserData] = useState<any[]>([]);

  const [error, setError] = useState<any>(null);

  if (error) throw error;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
        const userSnap = await getDocs(q);
        const userList = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setUsers(userList);

        const qPrompts = query(collection(db, 'prompts'), limit(100));
        const promptSnap = await getDocs(qPrompts);
        const promptList = promptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setDbPrompts(promptList);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.LIST, 'users/prompts');
        } catch (e) {
          setError(e);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    let currentMonthUsers = 0;
    let prevMonthUsers = 0;
    let currentMonthCreators = 0;
    let prevMonthCreators = 0;
    let currentMonthCopies = 0;
    let prevMonthCopies = 0;

    const userGrowthByMonth: Record<string, number> = {};

    users.forEach(u => {
      const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date();
      const isCreator = u.role === 'creator' || u.role === 'admin';

      if (createdAt >= thirtyDaysAgo) {
        currentMonthUsers++;
        if (isCreator) currentMonthCreators++;
      } else if (createdAt >= sixtyDaysAgo) {
        prevMonthUsers++;
        if (isCreator) prevMonthCreators++;
      }

      // Group by month for chart (last 6 months)
      const monthStr = createdAt.toLocaleDateString('en-US', { month: 'short' });
      userGrowthByMonth[monthStr] = (userGrowthByMonth[monthStr] || 0) + 1;
    });

    dbPrompts.forEach(p => {
      const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
      if (createdAt >= thirtyDaysAgo) {
        currentMonthCopies += p.copies || 0;
      } else if (createdAt >= sixtyDaysAgo) {
        prevMonthCopies += p.copies || 0;
      }
    });

    const calculateGrowth = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? '+100%' : '+0%';
      const growth = ((current - prev) / prev) * 100;
      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    };

    const creators = users.filter(u => u.role === 'creator' || u.role === 'admin').length;
    const totalCopies = dbPrompts.reduce((acc, p) => acc + (p.copies || 0), 0);
    
    setStats({
      totalUsers: users.length,
      activeCreators: creators,
      totalCopies: totalCopies,
      bannedUsers: users.filter(u => u.isBanned).length,
      usersGrowth: calculateGrowth(currentMonthUsers, prevMonthUsers),
      creatorsGrowth: calculateGrowth(currentMonthCreators, prevMonthCreators),
      copiesGrowth: calculateGrowth(currentMonthCopies, prevMonthCopies)
    });

    // Format chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sortedMonths = Object.entries(userGrowthByMonth)
      .map(([name, users]) => ({ name, users }))
      .sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));
    
    setUserData(sortedMonths.length > 0 ? sortedMonths : [{ name: 'No Data', users: 0 }]);
  }, [users, dbPrompts]);

  // Rank users by total copies of their prompts
  const rankedUsers = useMemo(() => {
    return users.map(user => {
      const userPrompts = dbPrompts.filter(p => p.authorId === user.uid);
      const totalUserCopies = userPrompts.reduce((acc, p) => acc + (p.copies || 0), 0);
      const totalUserShares = userPrompts.reduce((acc, p) => acc + (p.shares || 0), 0);
      return { ...user, copies: totalUserCopies, shares: totalUserShares };
    }).sort((a, b) => b.copies - a.copies);
  }, [users, dbPrompts]);

  const filteredUsers = rankedUsers.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">User Analytics</h1>
        <p className="text-slate-500 font-medium">Monitor user growth and manage community roles.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-admin-border p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-admin-accent/10 rounded-xl flex items-center justify-center text-admin-accent">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Users</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.totalUsers.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white border border-admin-border p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Creators</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.activeCreators.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white border border-admin-border p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-admin-accent/10 rounded-xl flex items-center justify-center text-admin-accent">
            <Copy size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Copies</p>
            <h3 className="text-2xl font-black text-slate-900">
              {stats.totalCopies >= 1000 ? `${(stats.totalCopies / 1000).toFixed(1)}k` : stats.totalCopies.toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="bg-white border border-admin-border p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Banned Users</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.bannedUsers}</h3>
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white border border-admin-border p-8 rounded-3xl">
        <h3 className="text-xl font-bold mb-8 text-slate-900">User Growth (6 Months)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="users" stroke="#000000" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white border border-admin-border rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-admin-border flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">User Management</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="bg-slate-50 border border-admin-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-admin-accent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total Copies</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total Share</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Running Plan</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                      index === 0 ? 'bg-amber-100 text-amber-600' :
                      index === 1 ? 'bg-slate-100 text-slate-500' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'text-slate-400'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL || 'https://picsum.photos/seed/user/100/100'} alt={user.displayName} className="w-10 h-10 rounded-xl object-cover" />
                      <span className="text-sm font-bold text-slate-900">{user.displayName || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-slate-500">{user.email}</td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-slate-900">{(user.copies || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-slate-900">{(user.shares || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      user.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-500' :
                      user.plan === 'Pro' ? 'bg-admin-accent/10 text-admin-accent' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {user.plan || 'Free'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-admin-accent hover:bg-slate-100 rounded-lg transition-all">
                        <Shield size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
