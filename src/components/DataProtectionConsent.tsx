
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface DataProtectionConsentProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const DataProtectionConsent: React.FC<DataProtectionConsentProps> = ({
  isOpen,
  onAccept,
  onDecline
}) => {
  const { t } = useLanguage();
  const [hasRead, setHasRead] = useState(false);
  const [showDeclineWarning, setShowDeclineWarning] = useState(false);

  const handleDeclineClick = () => {
    setShowDeclineWarning(true);
  };

  const handleConfirmDecline = () => {
    onDecline();
  };

  const handleCancelDecline = () => {
    setShowDeclineWarning(false);
  };

  if (showDeclineWarning) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {t('consent.decline.warning.title')}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                {t('consent.decline.warning.message')}
              </p>
            </div>
            
            <p className="text-sm text-gray-600">
              {t('consent.decline.warning.contact')}
            </p>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancelDecline}
                className="flex-1"
              >
                {t('consent.decline.cancel')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDecline}
                className="flex-1"
              >
                {t('consent.decline.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {t('consent.title')}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {t('consent.subtitle')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Data Protection Content */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">{t('consent.section.data.title')}</h3>
            <p className="text-sm text-gray-700">{t('consent.section.data.content')}</p>
            
            <h3 className="font-semibold text-gray-900">{t('consent.section.purpose.title')}</h3>
            <p className="text-sm text-gray-700">{t('consent.section.purpose.content')}</p>
            
            <h3 className="font-semibold text-gray-900">{t('consent.section.rights.title')}</h3>
            <p className="text-sm text-gray-700">{t('consent.section.rights.content')}</p>
            
            <h3 className="font-semibold text-gray-900">{t('consent.section.contact.title')}</h3>
            <p className="text-sm text-gray-700">{t('consent.section.contact.content')}</p>
          </div>
          
          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Checkbox 
              id="consent-read"
              checked={hasRead}
              onCheckedChange={(checked) => setHasRead(checked as boolean)}
            />
            <label htmlFor="consent-read" className="text-sm text-gray-700 cursor-pointer">
              {t('consent.checkbox.label')}
            </label>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleDeclineClick}
              className="flex-1"
            >
              {t('consent.button.decline')}
            </Button>
            <Button 
              onClick={onAccept}
              disabled={!hasRead}
              className="flex-1"
            >
              {t('consent.button.accept')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataProtectionConsent;
