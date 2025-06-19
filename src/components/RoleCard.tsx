
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RoleCardProps {
  role: 'employer' | 'refugee' | 'admin';
  icon: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, icon, onClick, selected = false }) => {
  const { t } = useLanguage();

  const getRoleTitle = () => {
    if (role === 'admin') {
      return 'Login to Account';
    }
    return t(`role.${role}`);
  };

  const getRoleDescription = () => {
    if (role === 'admin') {
      return 'Access your existing account (Admin, Employer, or Refugee)';
    }
    return t(`role.${role}.description`);
  };

  return (
    <div
      className={`role-card ${selected ? 'ring-2 ring-un-blue' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-un-light-blue/10 rounded-full flex items-center justify-center">
          {icon}
        </div>
        
        <div>
          <h3 className="text-h2-mobile font-semibold text-neutral-gray mb-2">
            {getRoleTitle()}
          </h3>
          <p className="text-body-mobile text-neutral-gray/80">
            {getRoleDescription()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
