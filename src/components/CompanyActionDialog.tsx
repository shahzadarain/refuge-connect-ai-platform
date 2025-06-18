
import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface CompanyActionDialogProps {
  action: 'approve' | 'reject';
  companyName: string;
  onConfirm: (comment: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const CompanyActionDialog: React.FC<CompanyActionDialogProps> = ({
  action,
  companyName,
  onConfirm,
  disabled = false,
  children
}) => {
  const [comment, setComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setComment('');
    setIsOpen(false);
  };

  const isApproval = action === 'approve';

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isApproval ? (
              <CheckCircle className="w-5 h-5 text-success-green" />
            ) : (
              <XCircle className="w-5 h-5 text-error-red" />
            )}
            {isApproval ? 'Approve' : 'Reject'} Company
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action} <strong>{companyName}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <label htmlFor="admin-comment" className="block text-sm font-medium text-neutral-gray mb-2">
            {isApproval ? 'Approval Comment' : 'Rejection Reason'} (Required)
          </label>
          <Textarea
            id="admin-comment"
            placeholder={isApproval 
              ? "Enter approval comment or additional notes..." 
              : "Enter reason for rejection..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!comment.trim()}
            className={isApproval 
              ? "bg-success-green hover:bg-success-green/90" 
              : "bg-error-red hover:bg-error-red/90"
            }
          >
            {isApproval ? 'Approve' : 'Reject'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CompanyActionDialog;
