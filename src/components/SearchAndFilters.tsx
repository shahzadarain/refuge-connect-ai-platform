
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  verifiedFilter: string;
  onVerifiedFilterChange: (value: string) => void;
  showCompanyFilter?: boolean;
  companyFilter?: string;
  onCompanyFilterChange?: (value: string) => void;
  type: 'companies' | 'users';
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  verifiedFilter,
  onVerifiedFilterChange,
  showCompanyFilter = false,
  companyFilter = 'all',
  onCompanyFilterChange,
  type
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg border border-border">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray/50 w-4 h-4" />
        <Input
          placeholder={type === 'companies' ? 'Search companies by name...' : 'Search users by email or company...'}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {type === 'companies' ? (
              <>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        {type === 'users' && (
          <Select value={verifiedFilter} onValueChange={onVerifiedFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showCompanyFilter && onCompanyFilterChange && (
          <Select value={companyFilter} onValueChange={onCompanyFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Company Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="employer_admin">Employers</SelectItem>
              <SelectItem value="refugee">Refugees</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilters;
