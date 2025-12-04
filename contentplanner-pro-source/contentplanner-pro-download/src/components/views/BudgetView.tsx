import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown,
  Wallet, CreditCard, PiggyBank, Plus,
  ArrowUpRight, ArrowDownRight, Filter, Download
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const BudgetView: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscriptions'>('overview');

  // Mock Data for PhD-Level Financial Charts
  const cashFlowData = [
    { name: 'Jan', income: 4500, expense: 3200 },
    { name: 'Feb', income: 5200, expense: 3400 },
    { name: 'Mar', income: 4800, expense: 3100 },
    { name: 'Apr', income: 6100, expense: 3800 },
    { name: 'May', income: 5900, expense: 3600 },
    { name: 'Jun', income: 7200, expense: 4100 },
  ];

  const expenseCategories = [
    { name: 'Software', value: 35, color: '#4361ee' },
    { name: 'Marketing', value: 25, color: '#a855f7' },
    { name: 'Office', value: 15, color: '#06b6d4' },
    { name: 'Travel', value: 10, color: '#f59e0b' },
    { name: 'Misc', value: 15, color: '#10b981' },
  ];

  const recentTransactions = [
    { id: 1, name: 'Adobe Creative Cloud', date: '2024-12-04', amount: -54.99, type: 'expense', category: 'Software' },
    { id: 2, name: 'Client Payment - Tech Corp', date: '2024-12-03', amount: 1250.00, type: 'income', category: 'Service' },
    { id: 3, name: 'Google Workspace', date: '2024-12-01', amount: -12.00, type: 'expense', category: 'Software' },
    { id: 4, name: 'Upwork Earnings', date: '2024-11-30', amount: 850.00, type: 'income', category: 'Freelance' },
  ];

  return (
    <div className="view-container">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="view-title flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
              <DollarSign size={24} className="text-white" />
            </div>
            {t('nav.budgetTracker')}
          </h1>
          <p className="view-subtitle">
            Professional financial tracking and forecasting
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary">
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="stat-card stat-card-success">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">Total Balance</span>
              <Wallet size={20} className="opacity-80" />
            </div>
            <div className="text-3xl font-bold">€12,450.00</div>
            <div className="text-sm opacity-80 mt-1 flex items-center gap-1">
              <ArrowUpRight size={14} /> +15% this month
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-primary">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">Monthly Income</span>
              <TrendingUp size={20} className="opacity-80" />
            </div>
            <div className="text-3xl font-bold">€7,200.00</div>
            <div className="text-sm opacity-80 mt-1 flex items-center gap-1">
              <ArrowUpRight size={14} /> +8% vs last month
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">Monthly Expenses</span>
              <TrendingDown size={20} className="opacity-80" />
            </div>
            <div className="text-3xl font-bold">€4,100.00</div>
            <div className="text-sm opacity-80 mt-1 flex items-center gap-1">
              <ArrowDownRight size={14} /> -2% vs last month
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cash Flow Chart */}
        <div className="card lg:col-span-2">
          <h3 className="section-title mb-6">Cash Flow Analysis</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="card">
          <h3 className="section-title mb-6">Expense Breakdown</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title mb-0">Recent Transactions</h3>
          <button className="btn-ghost text-sm">View All</button>
        </div>

        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${transaction.type === 'income'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                  {transaction.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                }`}>
                {transaction.type === 'income' ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetView;