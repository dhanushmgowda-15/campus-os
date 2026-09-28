import React, { useState, useEffect } from 'react';
import { 
  BellRing, AlertTriangle, Calendar, User, Search, 
  Loader2, Filter 
} from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = ['All', 'Academic', 'Examination', 'Administrative', 'Placement'];

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotices = async () => {
    try {
      const data = await api.getNotices(selectedCategory);
      setNotices(data.notices || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory]);

  const filteredNotices = notices.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.posted_by || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <BellRing className="text-brand-600" />
          <span>Official Campus Notices</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Stay informed with announcements from Academic Affairs, Exam Cell, and Placement Office.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Notices Feed */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading notices feed...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BellRing className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No announcements found</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting another category or clear your search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const isUrgent = notice.priority === 'urgent';
            const postDate = notice.posted_at ? new Date(notice.posted_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'Recent';

            return (
              <div
                key={notice.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition hover:shadow-md ${
                  isUrgent
                    ? 'border-red-300 dark:border-red-900/60 shadow-red-500/5'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      isUrgent
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {notice.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                      {notice.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Calendar size={13} />
                      <span>{postDate}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug mb-2">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notice.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-1.5 text-xs text-slate-500">
                  <User size={13} className="text-slate-400" />
                  <span>Posted by: <b className="text-slate-700 dark:text-slate-300">{notice.posted_by || 'Campus Administration'}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
