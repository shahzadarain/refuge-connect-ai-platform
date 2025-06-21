
import React from 'react';

interface Company {
  id: string;
  is_approved: boolean;
}

interface User {
  id: string;
  user_type: 'employer_admin' | 'refugee';
}

interface AdminStatsProps {
  companies: Company[];
  users: User[];
}

const AdminStats: React.FC<AdminStatsProps> = ({ companies, users }) => {
  const pendingCompanies = companies.filter(c => !c.is_approved).length;
  const approvedCompanies = companies.filter(c => c.is_approved).length;
  const employerUsers = users.filter(u => u.user_type === 'employer_admin').length;
  const refugeeUsers = users.filter(u => u.user_type === 'refugee').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-border">
        <h3 className="text-small-mobile text-neutral-gray/70 mb-1">Pending Companies</h3>
        <p className="text-2xl font-bold text-orange-600">{pendingCompanies}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-border">
        <h3 className="text-small-mobile text-neutral-gray/70 mb-1">Approved Companies</h3>
        <p className="text-2xl font-bold text-green-600">{approvedCompanies}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-border">
        <h3 className="text-small-mobile text-neutral-gray/70 mb-1">Employer Users</h3>
        <p className="text-2xl font-bold text-blue-600">{employerUsers}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-border">
        <h3 className="text-small-mobile text-neutral-gray/70 mb-1">Refugee Users</h3>
        <p className="text-2xl font-bold text-purple-600">{refugeeUsers}</p>
      </div>
    </div>
  );
};

export default AdminStats;
