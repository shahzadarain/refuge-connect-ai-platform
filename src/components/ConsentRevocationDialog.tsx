
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface ConsentRevocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRevocationComplete: () => void;
}

const ConsentRevocationDialog: React.FC<ConsentRevocationDialogProps> = ({
  isOpen,
  onClose,
  onRevocationComplete
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinalWarning, setShowFinalWarning] = useState(false);

  const handleRevoke = async () => {
    if (!hasConfirmed) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('https://ab93e9536acd.ngrok.app/api/consent/revoke', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          reason: reason.trim() || undefined,
          confirm_revocation: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Consent revoked successfully:', data);
        
        toast({
          title: language === 'ar' ? 'تم إلغاء الموافقة' : 'Consent Revoked',
          description: language === 'ar' 
            ? 'تم إلغاء موافقتك على حماية البيانات. سيتم إلغاء تنشيط حسابك.'
            : 'Your data protection consent has been revoked. Your account will be deactivated.',
          variant: "destructive",
        });
        
        // Call the completion handler to log out the user
        onRevocationComplete();
      } else {
        throw new Error('Failed to revoke consent');
      }
    } catch (error) {
      console.error('Error revoking consent:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء إلغاء الموافقة. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while revoking consent. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToFinalWarning = () => {
    if (hasConfirmed) {
      setShowFinalWarning(true);
    }
  };

  const resetDialog = () => {
    setHasConfirmed(false);
    setReason('');
    setShowFinalWarning(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  if (showFinalWarning) {
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
                  {language === 'ar' ? 'تأكيد نهائي' : 'Final Confirmation'}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">
                {language === 'ar' 
                  ? 'تحذير: هذا الإجراء لا يمكن التراجع عنه'
                  : 'Warning: This action cannot be undone'
                }
              </p>
              <p className="text-sm text-red-700">
                {language === 'ar' 
                  ? 'بإلغاء موافقتك، سيتم إلغاء تنشيط حسابك فوراً ولن تتمكن من الوصول إلى المنصة. ستحتاج إلى إنشاء حساب جديد والموافقة على شروط حماية البيانات مرة أخرى للعودة.'
                  : 'By revoking your consent, your account will be immediately deactivated and you will not be able to access the platform. You will need to create a new account and consent to data protection terms again to return.'
                }
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowFinalWarning(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                {language === 'ar' ? 'العودة' : 'Go Back'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRevoke}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري الإلغاء...' : 'Revoking...'}
                  </>
                ) : (
                  language === 'ar' ? 'إلغاء الموافقة نهائياً' : 'Revoke Consent Permanently'
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
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {language === 'ar' ? 'إلغاء موافقة حماية البيانات' : 'Revoke Data Protection Consent'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {language === 'ar' 
                  ? 'يمكنك إلغاء موافقتك على معالجة بياناتك الشخصية في أي وقت'
                  : 'You can revoke your consent for processing your personal data at any time'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Information about consequences */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">
              {language === 'ar' ? 'ما سيحدث عند إلغاء الموافقة:' : 'What happens when you revoke consent:'}
            </h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• {language === 'ar' ? 'سيتم إلغاء تنشيط حسابك فوراً' : 'Your account will be deactivated immediately'}</li>
              <li>• {language === 'ar' ? 'لن تتمكن من الوصول إلى المنصة' : 'You will no longer be able to access the platform'}</li>
              <li>• {language === 'ar' ? 'ستفقد الوصول إلى جميع التطبيقات والفرص الوظيفية' : 'You will lose access to all job applications and opportunities'}</li>
              <li>• {language === 'ar' ? 'ستحتاج إلى إنشاء حساب جديد للعودة' : 'You will need to create a new account to return'}</li>
            </ul>
          </div>

          {/* Your rights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              {language === 'ar' ? 'حقوقك:' : 'Your rights:'}
            </h3>
            <p className="text-sm text-blue-700">
              {language === 'ar' 
                ? 'لديك الحق في إلغاء موافقتك في أي وقت وفقاً لقوانين حماية البيانات. هذا حقك الأساسي ولا يمكن منعك من ممارسته.'
                : 'You have the right to withdraw your consent at any time under data protection laws. This is your fundamental right and cannot be restricted.'
              }
            </p>
          </div>

          {/* Optional reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'السبب (اختياري)' : 'Reason (Optional)'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={language === 'ar' 
                ? 'يرجى إخبارنا بسبب إلغاء موافقتك (اختياري)'
                : 'Please tell us why you are revoking your consent (optional)'
              }
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === 'ar' ? `${reason.length}/500 حرف` : `${reason.length}/500 characters`}
            </p>
          </div>
          
          {/* Confirmation checkbox */}
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <Checkbox 
              id="consent-revoke"
              checked={hasConfirmed}
              onCheckedChange={(checked) => setHasConfirmed(checked as boolean)}
            />
            <label htmlFor="consent-revoke" className="text-sm text-red-800 cursor-pointer">
              {language === 'ar' 
                ? 'أؤكد أنني أفهم عواقب إلغاء موافقتي وأرغب في المتابعة. أدرك أن هذا الإجراء سيؤدي إلى إلغاء تنشيط حسابي فوراً.'
                : 'I confirm that I understand the consequences of revoking my consent and wish to proceed. I understand that this action will immediately deactivate my account.'
              }
            </label>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleProceedToFinalWarning}
              disabled={!hasConfirmed || isSubmitting}
              className="flex-1"
            >
              {language === 'ar' ? 'المتابعة' : 'Proceed'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentRevocationDialog;
