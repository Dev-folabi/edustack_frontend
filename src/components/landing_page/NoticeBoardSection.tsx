'use client';

import { COLORS } from '@/constants/colors';

export default function NoticeBoardSection() {
  const notices = [
    {
      id: 1,
      title: 'Parent-Teacher Conference',
      date: '2024-02-15',
      category: 'meeting',
      content: 'Annual parent-teacher conferences scheduled for February 15-16. Please book your slots online.',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Science Fair Registration',
      date: '2024-02-10',
      category: 'event',
      content: 'Registration open for the annual science fair. Deadline: February 20th.',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Winter Break Schedule',
      date: '2024-02-05',
      category: 'holiday',
      content: 'School will be closed from December 20th to January 5th for winter break.',
      priority: 'low'
    },
    {
      id: 4,
      title: 'New Library Hours',
      date: '2024-02-01',
      category: 'facility',
      content: 'Library will now be open until 6 PM on weekdays and 4 PM on Saturdays.',
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Sports Team Tryouts',
      date: '2024-01-28',
      category: 'sports',
      content: 'Basketball and soccer team tryouts begin next week. See coach for details.',
      priority: 'medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.primary[500];
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meeting': return '👥';
      case 'event': return '🎉';
      case 'holiday': return '🏖️';
      case 'facility': return '🏢';
      case 'sports': return '⚽';
      default: return '📢';
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: COLORS.primary[700] }}>
            Notice Board
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest announcements and important information.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Latest Notices */}
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: COLORS.primary[600] }}>
              Latest Notices
            </h3>
            <div className="space-y-4">
              {notices.slice(0, 3).map((notice) => (
                <div 
                  key={notice.id}
                  className="bg-gray-50 p-6 rounded-lg border-l-4 hover:shadow-md transition-shadow duration-200"
                  style={{ borderLeftColor: getPriorityColor(notice.priority) }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(notice.category)}</span>
                      <h4 className="font-bold text-lg" style={{ color: COLORS.primary[600] }}>
                        {notice.title}
                      </h4>
                    </div>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getPriorityColor(notice.priority) }}
                    >
                      {notice.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{notice.content}</p>
                  <p className="text-sm text-gray-500">
                    Posted: {new Date(notice.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* All Notices */}
          <div>
            <h3 className="text-2xl font-bold mb-6" style={{ color: COLORS.primary[600] }}>
              All Notices
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div 
                    key={notice.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getCategoryIcon(notice.category)}</span>
                      <div>
                        <h5 className="font-medium" style={{ color: COLORS.primary[600] }}>
                          {notice.title}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {new Date(notice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPriorityColor(notice.priority) }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                className="px-6 py-2 rounded-full text-white font-medium hover:shadow-lg transition-all duration-200"
                style={{ backgroundColor: COLORS.primary[500] }}
              >
                View All Notices
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}