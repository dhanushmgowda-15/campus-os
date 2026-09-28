import React, { useState, useEffect } from 'react';
import { 
  Radio, Calendar, Clock, MapPin, Users, CheckCircle, 
  ExternalLink, Loader2, Sparkles 
} from 'lucide-react';
import api from '../../services/api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleToggleRsvp = async (event) => {
    try {
      const res = await api.toggleRsvp(event.id);
      setEvents(events.map(ev => 
        ev.id === event.id 
          ? { ...ev, is_rsvpd: res.is_rsvpd, rsvp_count: res.rsvp_count } 
          : ev
      ));
    } catch (err) {
      console.error('RSVP toggle failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Radio className="text-brand-600" />
          <span>Campus Events & Hackathons</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore upcoming tech symposiums, workshops, and guest lectures across the university.
        </p>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading campus calendar...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Radio className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No events found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back soon for new student activities and competitions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Event Category & Club Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                    {event.category}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {event.organizer_club}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug mb-2">
                  {event.title}
                </h3>

                {/* Event Metadata */}
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={13} className="text-slate-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* RSVP Action Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
                  <Users size={14} className="text-brand-500" />
                  <span>{event.rsvp_count || 0} Attending</span>
                </div>

                <button
                  onClick={() => handleToggleRsvp(event)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    event.is_rsvpd
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                  }`}
                >
                  {event.is_rsvpd && <CheckCircle size={14} />}
                  <span>{event.is_rsvpd ? 'RSVP Confirmed' : 'RSVP Now'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
