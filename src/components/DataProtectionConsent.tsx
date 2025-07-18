import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { buildApiUrl, getApiHeaders } from '@/config/api';

interface DataProtectionConsentProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

interface ConsentData {
  consent_id: number;
  consent_text: string;
  language: string;
  user_type: string;
  created_at: string;
}

const DataProtectionConsent: React.FC<DataProtectionConsentProps> = ({
  isOpen,
  onAccept,
  onDecline
}) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [hasRead, setHasRead] = useState(false);
  const [showDeclineWarning, setShowDeclineWarning] = useState(false);
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch consent text from API
  useEffect(() => {
    if (isOpen) {
      fetchConsentText();
    }
  }, [isOpen, language]);

  const fetchConsentText = async () => {
    setIsLoading(true);
    try {
      const apiLanguage = language === 'ar' ? 'ar' : 'en';
      
      const response = await fetch(buildApiUrl(`/api/consent/current?language=${apiLanguage}`), {
        headers: getApiHeaders(true)
      });

      if (response.ok) {
        const data = await response.json();
        setConsentData(data);
        console.log('Consent data fetched:', data);
      } else {
        console.error('Failed to fetch consent data:', response.status);
        // Fallback to local translations if API fails
        toast({
          title: t('consent.error.fetch.title'),
          description: t('consent.error.fetch.description'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching consent data:', error);
      toast({
        title: t('consent.error.network.title'),
        description: t('consent.error.network.description'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptClick = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl('/api/consent/accept'), {
        method: 'POST',
        headers: getApiHeaders(true),
        body: JSON.stringify({
          consent_given: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Consent accepted:', data);
        
        if (data.status === 'success') {
          onAccept();
        } else {
          throw new Error(data.message || 'Failed to accept consent');
        }
      } else {
        throw new Error('Failed to submit consent');
      }
    } catch (error) {
      console.error('Error accepting consent:', error);
      toast({
        title: t('consent.error.submit.title'),
        description: t('consent.error.submit.description'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineClick = () => {
    setShowDeclineWarning(true);
  };

  const handleConfirmDecline = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl('/api/consent/accept'), {
        method: 'POST',
        headers: getApiHeaders(true),
        body: JSON.stringify({
          consent_given: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Consent declined:', data);
        
        if (data.status === 'declined') {
          onDecline();
        } else {
          throw new Error(data.message || 'Failed to decline consent');
        }
      } else {
        throw new Error('Failed to submit consent decline');
      }
    } catch (error) {
      console.error('Error declining consent:', error);
      toast({
        title: t('consent.error.submit.title'),
        description: t('consent.error.submit.description'),
        variant: "destructive",
      });
      // Still proceed with decline on error
      onDecline();
    } finally {
      setIsSubmitting(false);
    }
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
                  {language === 'ar' ? 'تأكيد الرفض' : 'Confirm Decline'}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                {language === 'ar' 
                  ? 'بدون قبول شروط حماية البيانات، لن تتمكن من الوصول إلى خدمات المنصة. سيتم تسجيل خروجك تلقائياً.'
                  : 'Without accepting the data protection terms, you will not be able to access the platform services. You will be automatically logged out.'
                }
              </p>
            </div>
            
            <p className="text-sm text-gray-600">
              {language === 'ar'
                ? 'إذا كانت لديك مخاوف، يرجى الاتصال بفريق الدعم للحصول على المساعدة.'
                : 'If you have concerns, please contact our support team for assistance.'
              }
            </p>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancelDecline}
                className="flex-1"
                disabled={isSubmitting}
              >
                {language === 'ar' ? 'العودة' : 'Go Back'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDecline}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  language === 'ar' ? 'تأكيد الرفض' : 'Confirm Decline'
                )}
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
                {language === 'ar' ? 'موافقة حماية البيانات' : 'Data Protection Consent'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {language === 'ar' 
                  ? 'يرجى مراجعة وقبول شروط حماية البيانات الخاصة بنا للمتابعة'
                  : 'Please review and accept our data protection terms to continue'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </span>
            </div>
          ) : (
            <>
              {/* Data Protection Content from API */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {consentData ? (
                  <div 
                    className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {consentData.consent_text}
                  </div>
                ) : (
                  // Fallback content if API fails
                  <>
                    <h3 className="font-semibold text-gray-900">{t('consent.section.data.title')}</h3>
                    <p className="text-sm text-gray-700">{t('consent.section.data.content')}</p>
                    
                    <h3 className="font-semibold text-gray-900">{t('consent.section.purpose.title')}</h3>
                    <p className="text-sm text-gray-700">{t('consent.section.purpose.content')}</p>
                    
                    <h3 className="font-semibold text-gray-900">{t('consent.section.rights.title')}</h3>
                    <p className="text-sm text-gray-700">{t('consent.section.rights.content')}</p>
                    
                    <h3 className="font-semibold text-gray-900">{t('consent.section.contact.title')}</h3>
                    <p className="text-sm text-gray-700">{t('consent.section.contact.content')}</p>
                  </>
                )}
              </div>
              
              {/* Consent Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Checkbox 
                  id="consent-read"
                  checked={hasRead}
                  onCheckedChange={(checked) => setHasRead(checked as boolean)}
                />
                <label htmlFor="consent-read" className="text-sm text-gray-700 cursor-pointer">
                  {language === 'ar' 
                    ? 'لقد قرأت وفهمت شروط حماية البيانات وأوافق على معالجة بياناتي الشخصية'
                    : 'I have read and understood the data protection terms and agree to the processing of my personal data'
                  }
                </label>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleDeclineClick}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {language === 'ar' ? 'أرفض' : 'Decline'}
                </Button>
                <Button 
                  onClick={handleAcceptClick}
                  disabled={!hasRead || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                    </>
                  ) : (
                    language === 'ar' ? 'أوافق والمتابعة' : 'Accept & Continue'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataProtectionConsent;
