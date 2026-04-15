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
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu button and search */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medilink-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-medical-lg border border-gray-200 animate-slide-up">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${getNotificationColor(notification.type)}`}>
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <p className="text-xs mt-1 opacity-75">{notification.message}</p>
                            <p className="text-xs mt-2 opacity-60">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="w-full text-sm text-center text-medilink-primary hover:text-medilink-secondary transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

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
