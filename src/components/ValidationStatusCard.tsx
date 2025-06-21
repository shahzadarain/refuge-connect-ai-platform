
import React from 'react';
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface ValidationStatusCardProps {
  isValidated: boolean;
  isVerified: boolean;
  unhcrId?: string;
  onValidateClick: () => void;
}

const ValidationStatusCard: React.FC<ValidationStatusCardProps> = ({
  isValidated,
  isVerified,
  unhcrId,
  onValidateClick
}) => {
  if (isValidated && isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-green-800">Account Verified</h3>
            <p className="text-sm text-green-700">
              Your UNHCR information has been successfully validated
            </p>
            {unhcrId && (
              <p className="text-xs text-green-600 mt-1">
                UNHCR ID: {unhcrId}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isValidated || !isVerified) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-orange-800">Validation Required</h3>
            <p className="text-sm text-orange-700 mb-3">
              Your account requires UNHCR validation to access all features
            </p>
            <Button
              onClick={onValidateClick}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              Validate UNHCR Information
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Clock className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">Validation Pending</h3>
          <p className="text-sm text-gray-600">
            Your validation is being processed
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidationStatusCard;
