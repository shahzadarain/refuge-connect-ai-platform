
import React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="text-center">
      <label className="block text-small-mobile font-medium text-neutral-gray mb-4">
        Enter Verification Code
      </label>
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={onChange}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );
};

export default VerificationCodeInput;
