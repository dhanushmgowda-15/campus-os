import React, { useState, useEffect } from 'react';
import { 
  Bus, Search, MapPin, Phone, Clock, Sun, Moon, 
  Loader2 
} from 'lucide-react';
import api from '../../services/api';

export default function BusSchedulePage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBusRoutes = async (query = '') => {
    try {
      const data = await api.getBusRoutes(query);
      setRoutes(data.routes || []);
    } catch (err) {
      console.error('Failed to load bus routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusRoutes(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Bus className="text-brand-600" />
          <span>Campus Bus Schedule & Routes</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Daily transit timings, campus shuttle routes, and driver contact directory.
        </p>
      </div>

      {/* Search Input */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search route number, line, or bus stop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Bus Routes List */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading bus schedule...</p>
        </div>
      ) : routes.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Bus className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching bus routes</h3>
          <p className="text-xs text-slate-500 mt-1">Try another stop name or route number query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition"
            >
              {/* Route Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm shrink-0">
                    <Bus size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                      {route.route_number}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                      {route.route_name}
                    </h3>
                  </div>
                </div>

                {route.driver_contact && (
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
                    <Phone size={13} className="text-brand-500" />
                    <span>Driver: {route.driver_contact}</span>
                  </div>
                )}
              </div>

              {/* Stop Timings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Pickup / Drop-off Stop</th>
                      <th className="py-2.5 px-3">
                        <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                          <Sun size={12} />
                          <span>Morning Pickup</span>
                        </div>
                      </th>
                      <th className="py-2.5 px-3">
                        <div className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400">
                          <Moon size={12} />
                          <span>Evening Return</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(route.stops || []).map((stop, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                          <MapPin size={13} className="text-brand-500 shrink-0" />
                          <span>{stop.stop_name}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                          {stop.morning_time}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                          {stop.evening_time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
