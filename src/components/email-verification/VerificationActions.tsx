
import React from 'react';

interface VerificationActionsProps {
  onVerify: () => void;
  onResendCode: () => void;
  onForgotPassword: () => void;
  isVerifying: boolean;
  isSendingReset: boolean;
  verificationCode: string;
}

const VerificationActions: React.FC<VerificationActionsProps> = ({
  onVerify,
  onResendCode,
  onForgotPassword,
  isVerifying,
  isSendingReset,
  verificationCode
}) => {
  return (
    <>
      <button
        onClick={onVerify}
        disabled={isVerifying || verificationCode.length !== 6}
        className="btn-primary w-full disabled:opacity-50"
      >
        {isVerifying ? 'Verifying...' : 'Verify Email'}
      </button>

      <div className="text-center space-y-4">
        <p className="text-small-mobile text-neutral-gray/70">
          Didn't receive the code?
        </p>
        <div className="space-y-2">
          <button
            onClick={onResendCode}
            className="btn-secondary w-full text-small-mobile font-medium"
          >
            Resend Code
          </button>
          <button
            onClick={onForgotPassword}
            disabled={isSendingReset}
            className="btn-secondary w-full text-small-mobile font-medium disabled:opacity-50"
          >
            {isSendingReset ? 'Sending Reset Link...' : 'Forgot Password?'}
          </button>
        </div>
      </div>
    </>
  );
};

export default VerificationActions;
