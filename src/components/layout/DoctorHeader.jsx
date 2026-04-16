import React, { useState } from 'react';
import { Menu, Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';

const DoctorHeader = ({ toggleSidebar, user }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'New appointment', message: 'Patient John Smith booked an appointment', time: '5 min ago', type: 'appointment' },
    { id: 2, title: 'Lab results', message: 'Lab results for Sarah Johnson are ready', time: '1 hour ago', type: 'lab' },
    { id: 3, title: 'Urgent message', message: 'Patient requires immediate attention', time: '2 hours ago', type: 'urgent' },
  ];

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'appointment': return '📅';
      case 'lab': return '🧪';
      case 'urgent': return '🚨';
      default: return '📬';
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      case 'appointment': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'lab': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end space-x-4">

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center justify-end space-x-4">

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">Dr. {user?.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-medical-lg border border-gray-200 animate-slide-up">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dr. {user?.name || 'Doctor'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'doctor@medilink.com'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/';
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
