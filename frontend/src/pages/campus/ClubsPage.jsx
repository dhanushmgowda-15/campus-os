import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserPlus, Check, Loader2, Sparkles 
} from 'lucide-react';
import api from '../../services/api';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClubs = async () => {
    try {
      const data = await api.getClubs();
      setClubs(data.clubs || []);
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleToggleJoin = async (club) => {
    try {
      if (club.is_member) {
        const res = await api.leaveClub(club.id);
        setClubs(clubs.map(c => 
          c.id === club.id 
            ? { ...c, is_member: res.is_member, member_count: res.member_count } 
            : c
        ));
      } else {
        const res = await api.joinClub(club.id);
        setClubs(clubs.map(c => 
          c.id === club.id 
            ? { ...c, is_member: res.is_member, member_count: res.member_count } 
            : c
        ));
      }
    } catch (err) {
      console.error('Failed to update club membership:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Users className="text-brand-600" />
          <span>Student Clubs & Societies</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Join campus tech groups, competitive teams, and student guilds to collaborate with peers.
        </p>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading student organizations...</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No clubs found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later for newly approved student chapters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                    {club.category}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <Users size={13} className="text-brand-500" />
                    <span>{club.member_count || 0} Members</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-snug mb-1">
                  {club.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Club Lead: <span className="font-semibold text-slate-700 dark:text-slate-300">{club.lead}</span>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {club.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {club.is_member ? 'You are a member' : 'Open to all students'}
                </span>

                <button
                  onClick={() => handleToggleJoin(club)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    club.is_member
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                  }`}
                >
                  {club.is_member ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  <span>{club.is_member ? 'Leave Club' : 'Join Club'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
