
import React from 'react';
import { Shield } from 'lucide-react';

const SecurityNotice: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-small-mobile font-medium text-blue-800 mb-1">
            Security Note
          </p>
          <p className="text-xs text-blue-700">
            The verification code expires in 3 hours. If you don't verify your email within this time, you'll need to request a new code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice;
