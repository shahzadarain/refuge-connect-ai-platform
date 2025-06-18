
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, MapPin, Clock, Building2, Filter } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  salary?: string;
  description: string;
  requirements: string[];
  posted_date: string;
  logo?: string;
}

const JobBoard: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Software Developer',
      company: 'Tech Solutions Jordan',
      location: 'Amman, Jordan',
      type: 'full-time',
      salary: '800-1200 JOD',
      description: 'We are looking for a skilled software developer to join our team.',
      requirements: ['JavaScript', 'React', 'Node.js', 'Database knowledge'],
      posted_date: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Customer Service Representative',
      company: 'Global Services',
      location: 'Irbid, Jordan',
      type: 'part-time',
      salary: '400-600 JOD',
      description: 'Handle customer inquiries and provide excellent service.',
      requirements: ['Arabic fluency', 'English proficiency', 'Communication skills'],
      posted_date: '2024-01-14T15:20:00Z'
    }
  ]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !selectedLocation || job.location.includes(selectedLocation);
    const matchesType = !selectedType || job.type === selectedType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleApply = (jobId: string) => {
    console.log('Applying for job:', jobId);
    // This would integrate with the application system
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-h1-mobile font-bold text-neutral-gray mb-2">
            Job Opportunities
          </h1>
          <p className="text-body-mobile text-neutral-gray/80">
            Find employment opportunities that match your skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="form-card mb-6">
          <div className="grid gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mobile-input pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray/50 w-5 h-5" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="mobile-input pl-10"
                >
                  <option value="">All Locations</option>
                  <option value="Amman">Amman</option>
                  <option value="Irbid">Irbid</option>
                  <option value="Zarqa">Zarqa</option>
                  <option value="Aqaba">Aqaba</option>
                </select>
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray/50 w-5 h-5" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mobile-input pl-10"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-body-mobile text-neutral-gray">
            Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="form-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-un-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-un-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-gray mb-1">{job.title}</h3>
                    <p className="text-body-mobile text-neutral-gray/70 mb-2">{job.company}</p>
                    <div className="flex items-center gap-4 text-small-mobile text-neutral-gray/70">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(job.posted_date)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-3 py-1 rounded-full text-small-mobile ${
                    job.type === 'full-time' 
                      ? 'bg-green-100 text-green-800'
                      : job.type === 'part-time'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                  </div>
                  {job.salary && (
                    <p className="text-small-mobile font-medium text-neutral-gray">
                      {job.salary}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-body-mobile text-neutral-gray/80 mb-4">
                {job.description}
              </p>

              <div className="mb-4">
                <p className="text-small-mobile font-medium text-neutral-gray mb-2">Requirements:</p>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-light-gray text-neutral-gray text-small-mobile rounded-full"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApply(job.id)}
                  className="btn-primary flex-1"
                >
                  Apply Now
                </button>
                <button className="btn-secondary">
                  Save Job
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-gray/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-gray/50" />
            </div>
            <h3 className="text-h3-mobile font-semibold text-neutral-gray mb-2">
              No jobs found
            </h3>
            <p className="text-body-mobile text-neutral-gray/70">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
