import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface OnboardingFeedbackModalProps {
  onClose: () => void;
}

export default function OnboardingFeedbackModal({ onClose }: OnboardingFeedbackModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    journeyDelayFaced: null as boolean | null,
    journeyDelayComment: '',
    doctorWaitFaced: null as boolean | null,
    doctorWaitComment: '',
    floorInchargeIssue: null as boolean | null,
    floorInchargeComment: ''
  });

  const isFormValid = formData.journeyDelayFaced !== null && 
                      formData.doctorWaitFaced !== null && 
                      formData.floorInchargeIssue !== null;

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/onboarding-feedback', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingFeedbackCheck'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    mutation.mutate(formData);
  };

  const renderQuestion = (
    title: string, 
    fieldPrefix: 'journeyDelay' | 'doctorWait' | 'floorIncharge', 
    description: string,
    positiveLabel = 'Yes',
    negativeLabel = 'No'
  ) => {
    const fieldName = fieldPrefix === 'floorIncharge' ? 'floorInchargeIssue' : `${fieldPrefix}Faced`;
    const isYes = formData[fieldName as keyof typeof formData] === false;
    const isNo = formData[fieldName as keyof typeof formData] === true;

    return (
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>
        
        <div className="flex gap-3 mb-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [fieldName]: false }))}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${
              isYes 
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400' 
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Check className={`w-4 h-4 ${isYes ? 'opacity-100' : 'opacity-0'}`} /> {positiveLabel}
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [fieldName]: true }))}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${
              isNo 
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400' 
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <X className={`w-4 h-4 ${isNo ? 'opacity-100' : 'opacity-0'}`} /> {negativeLabel}
          </button>
        </div>

        <AnimatePresence>
          {(isYes || isNo) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <textarea
                placeholder="Please tell us more..."
                value={formData[`${fieldPrefix}Comment` as keyof typeof formData] as string}
                onChange={e => setFormData(prev => ({ ...prev, [`${fieldPrefix}Comment`]: e.target.value }))}
                className="w-full p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none h-20 mt-2"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Welcome to Manthena Ashram!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Please help us improve by answering a few quick questions about your arrival experience.
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="onboarding-form" onSubmit={handleSubmit}>
            {renderQuestion(
              'Journey and Arrival', 
              'journeyDelay', 
              'Was your journey and arrival at the ashram smooth and on time?'
            )}
            
            {renderQuestion(
              'Doctor Consultation', 
              'doctorWait', 
              'Was your doctor consultation completed without excessive waiting?'
            )}
            
            {renderQuestion(
              'Floor Incharge Receiving', 
              'floorIncharge', 
              'Were you received well by the floor incharge upon arrival?'
            )}
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          <button 
            type="submit" 
            form="onboarding-form"
            disabled={!isFormValid || mutation.isPending}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Feedback
          </button>
        </div>
      </motion.div>
    </div>
  );
}
