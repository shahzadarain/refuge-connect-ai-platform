
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Mail } from 'lucide-react';
import VerificationCodeInput from './email-verification/VerificationCodeInput';
import VerificationActions from './email-verification/VerificationActions';
import SecurityNotice from './email-verification/SecurityNotice';
import { useEmailVerification } from './email-verification/hooks/useEmailVerification';

interface EmailVerificationProps {
  onBack: () => void;
  onVerificationSuccess: () => void;
  email?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  onBack, 
  onVerificationSuccess,
  email 
}) => {
  const { t } = useLanguage();
  
  const {
    verificationCode,
    setVerificationCode,
    isVerifying,
    isSendingReset,
    handleVerifyCode,
    handleResendCode,
    handleForgotPassword
  } = useEmailVerification({ email, onVerificationSuccess });

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-gray hover:text-un-blue transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="form-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-un-blue" />
              </div>
              <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                Verify Your Email
              </h1>
              <p className="text-body-mobile text-neutral-gray/70 mb-2">
                We've sent a 6-digit verification code to:
              </p>
              {email && (
                <p className="text-body-mobile font-medium text-un-blue">
                  {email}
                </p>
              )}
            </div>

            <div className="space-y-6">
              <VerificationCodeInput
                value={verificationCode}
                onChange={setVerificationCode}
              />

              <VerificationActions
                onVerify={handleVerifyCode}
                onResendCode={handleResendCode}
                onForgotPassword={handleForgotPassword}
                isVerifying={isVerifying}
                isSendingReset={isSendingReset}
                verificationCode={verificationCode}
              />

              <SecurityNotice />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
