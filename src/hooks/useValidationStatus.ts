
import { useState, useEffect } from 'react';

interface ValidationStatus {
  email: string;
  is_validated: boolean;
  is_verified: boolean;
  is_active: boolean;
  has_unhcr_id: boolean;
  unhcr_id?: string;
  full_name?: string;
}

export const useValidationStatus = (email?: string) => {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkValidationStatus = async (userEmail: string) => {
    if (!userEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Checking validation status for:', userEmail);
      
      const response = await fetch(
        `https://ab93e9536acd.ngrok.app/api/refugee/check-validation-status?email=${encodeURIComponent(userEmail)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check validation status');
      }

      const data = await response.json();
      console.log('Validation status response:', data);
      setValidationStatus(data);
    } catch (err) {
      console.error('Error checking validation status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      checkValidationStatus(email);
    }
  }, [email]);

  return {
    validationStatus,
    isLoading,
    error,
    refetch: () => email && checkValidationStatus(email),
    checkStatus: checkValidationStatus
  };
};
