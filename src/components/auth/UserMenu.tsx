import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  Sprout,
} from 'lucide-react';
import { FarmerProfile } from '../../types/farming';
import { AuthUser } from '../../types/auth';
import { useI18n } from '../../context/I18nContext';

interface UserMenuProps {
  farmer: FarmerProfile;
  authUser: AuthUser | null;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
  onOpenLanguageModal?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  farmer,
  authUser,
  onNavigateTab,
  onLogout,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = farmer.name || authUser?.name || t('nav.profile');
  const displayPhone = farmer.phone || authUser?.phone;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="user-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
        title={t('nav.profile')}
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-600">
          {initial}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-xs font-bold text-white max-w-[100px] truncate">{displayName}</p>
          <p className="text-[10px] text-emerald-200/80 font-medium">
            {farmer.role === 'AGRICULTURAL_OFFICER' ? t('nav.officerDashboard') : t('nav.krishiMitra')}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-emerald-200/70 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-stone-900 rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
          {/* User Details Header */}
          <div className="px-4 py-2.5 border-b border-stone-100">
            <p className="text-xs font-bold text-stone-900 truncate">{displayName}</p>
            {displayPhone && (
              <p className="text-[11px] text-stone-500 font-medium">+91 {displayPhone}</p>
            )}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {farmer.district}, {farmer.state}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {farmer.farms.length} {farmer.farms.length === 1 ? t('nav.switchFarm') : t('profile.landHoldings')}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-1 space-y-0.5 text-xs">
            <button
              id="menu-profile-link"
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('profile');
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>{t('profile.title')}</span>
            </button>

            <button
              id="menu-farms-link"
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('soil');
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>{t('profile.landHoldings')}</span>
            </button>

            <button
              id="menu-expert-link"
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('expert');
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>{t('nav.expertSupport')}</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="p-1 pt-1.5 border-t border-stone-100">
            <button
              id="menu-logout-btn"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-bold text-red-700 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
