import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Video, 
  Clock, 
  Building, 
  UserPlus,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';

const DoctorSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/doctor/dashboard',
      color: 'text-medilink-primary'
    },
    {
      title: 'Appointments',
      icon: Calendar,
      path: '/doctor/appointments',
      color: 'text-medilink-info'
    },
    {
      title: 'Patients',
      icon: Users,
      path: '/doctor/patients',
      color: 'text-medilink-success'
    },
    {
      title: 'Telemedicine',
      icon: Video,
      path: '/doctor/telemedicine',
      color: 'text-medilink-secondary'
    },
    {
      title: 'Prescriptions',
      icon: FileText,
      path: '/doctor/prescriptions',
      color: 'text-medilink-warning'
    },
    {
      title: 'Schedule',
      icon: Clock,
      path: '/doctor/schedule',
      color: 'text-medilink-accent'
    },
    {
      title: 'Doctors',
      icon: User,
      path: '/doctor/view-doctors',
      color: 'text-medical-purple'
    },
    // {
    //   title: 'Hospitals',
    //   icon: Building,
    //   path: '/doctor/view-hospitals',
    //   color: 'text-medical-blue'
    // },
    // {
    //   title: 'Add Doctor',
    //   icon: UserPlus,
    //   path: '/doctor/add-doctor',
    //   color: 'text-medical-purple'
    // }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-medical-lg z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-0 lg:w-64'} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-medilink-primary to-medilink-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-medilink-dark font-display">Medilink</h1>
                <p className="text-xs text-gray-500">Doctor Portal</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-medilink-light text-medilink-primary shadow-medical'
                      : 'hover:bg-gray-50 text-gray-700 hover:text-medilink-primary'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.path) ? item.color : 'text-gray-500'}`} />
                  <span className={`font-medium ${isActive(item.path) ? 'text-medilink-primary' : 'text-gray-700'}`}>
                    {item.title}
                  </span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-medilink-primary rounded-full animate-pulse-soft" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-medilink-accent to-medilink-success rounded-full flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Dr. Profile</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 mt-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorSidebar;
