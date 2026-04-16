import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarCheck2, LayoutDashboard, UserCircle2 } from 'lucide-react';

const tabs = [
  {
    to: '/patient/dashboard',
    label: 'Dashboard',
    description: 'Book new appointments',
    icon: LayoutDashboard,
  },
  {
    to: '/patient/appointments',
    label: 'My Bookings',
    description: 'Track and manage appointments',
    icon: CalendarCheck2,
  },
  {
    to: '/patient/profile',
    label: 'My Profile',
    description: 'View and edit personal details',
    icon: UserCircle2,
  },
];

const PatientPortalTabs = () => {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/95 p-3 shadow-medical backdrop-blur">
      <div className="grid gap-3 md:grid-cols-3">
        {tabs.map(({ to, label, description, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `rounded-2xl border px-4 py-4 transition ${
              isActive
                ? 'border-medilink-primary bg-sky-50 text-medilink-dark shadow-sm'
                : 'border-gray-100 bg-white text-gray-600 hover:border-sky-200 hover:bg-sky-50/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Icon className="h-5 w-5 text-medilink-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default PatientPortalTabs;
