import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { LayoutDashboard, Settings as SettingsIcon, LogOut, Code, Zap, Menu, X as CloseIcon, AlertTriangle, Sparkles, Info, Stethoscope } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const { user, setUser } = useUserStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutWarning(true);
  };

  const handleLogoutConfirm = () => {
    setUser(null);
    setShowLogoutWarning(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutWarning(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const Logo = () => (
    <div className="flex items-center gap-2">
      <Stethoscope className="w-6 h-6 text-blue-500" />
      <span className="font-bold text-xl">
        TransMed<span className="text-blue-500">.ai</span>
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Warning Modal */}
      {showLogoutWarning && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={handleLogoutCancel} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-[70] w-[90%] max-w-md">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                <p className="text-gray-600 mt-1">Warning: Logging out will erase all your session history. Please save your work before logging out.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-30">
        <Logo />
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex pt-[57px] lg:pt-0">
        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-50 h-[100dvh]
            w-64 bg-white border-r border-gray-200
            transform transition-transform duration-200 ease-in-out
            lg:transform-none
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            <div className="p-4">
              {/* Desktop Header - hidden on mobile */}
              <div className="hidden lg:block mb-8">
                <Logo />
                <p className="text-sm text-gray-500 mt-2">Welcome, {user?.name}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                <Link
                  to="/dashboard"
                  onClick={closeSidebar}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>

                {user?.role === 'doctor' && (
                  <Link
                    to="/settings"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      location.pathname === '/settings'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    Settings
                  </Link>
                )}
              </nav>
            </div>

            {/* Flexible Space */}
            <div className="flex-grow" />

            {/* Beta Trial Banner */}
            <div className="p-4 border-t bg-white">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-medium">Beta Trial Active</h3>
                </div>
                <div className="flex items-start gap-2 text-sm text-purple-100">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>All activity history will be deleted upon logout during the Trial period. Please save your work regularly.</p>
                </div>
              </div>
            </div>

            {/* Promotional Section */}
            <div className="px-4 pb-4 bg-white">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <h3 className="font-medium mb-2">Need Custom APIs?</h3>
                <div className="text-sm text-blue-100 space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    <span>Custom Development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Fast Integration</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const contactButton = document.querySelector('[title="Contact Us"]') as HTMLButtonElement;
                    if (contactButton) {
                      contactButton.click();
                    }
                    closeSidebar();
                  }}
                  className="w-full px-3 py-1.5 bg-white text-blue-600 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Contact Us
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="p-4 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors border-t"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}