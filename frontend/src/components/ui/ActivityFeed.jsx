import React, { useState, useMemo } from 'react';

export default function ActivityFeed({ activities = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter activities based on search term
  const filteredActivities = useMemo(() => {
    if (!searchTerm) return activities;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return activities.filter(activity => 
      activity.title.toLowerCase().includes(lowerSearchTerm) ||
      activity.description.toLowerCase().includes(lowerSearchTerm) ||
      activity.type.toLowerCase().includes(lowerSearchTerm)
    );
  }, [activities, searchTerm]);

  const getActivityIcon = (type) => {
    const icons = {
      profile: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      skill: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      project: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      resume: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    };
    return icons[type] || icons.profile;
  };

  const getActivityColor = (type) => {
    const colors = {
      profile: "bg-blue-100 text-blue-600 border-blue-200",
      skill: "bg-emerald-100 text-emerald-600 border-emerald-200", 
      project: "bg-purple-100 text-purple-600 border-purple-200",
      resume: "bg-amber-100 text-amber-600 border-amber-200"
    };
    return colors[type] || colors.profile;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Activities List */}
      {filteredActivities.length > 0 ? (
        filteredActivities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{activity.title}</p>
              <p className="text-xs text-slate-600 mt-1">{activity.description}</p>
              <p className="text-xs text-slate-500 mt-2">{activity.time}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm text-slate-600">
            {searchTerm ? 'No activities found matching your search.' : 'No activities yet.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
