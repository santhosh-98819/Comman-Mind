import React, { useState } from 'react';
import { useLegalAcceptance } from '../hooks/useLegalAcceptance';

interface LegalAcceptanceViewProps {
  onComplete: () => void;
  onNavigate: (view: string) => void;
}

export const LegalAcceptanceView: React.FC<LegalAcceptanceViewProps> = ({ onComplete, onNavigate }) => {
  const { acceptCurrentLegalDocuments, acceptanceLoading } = useLegalAcceptance();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await acceptCurrentLegalDocuments();
      onComplete();
    } catch (e) {
      setError("We couldn't save your acceptance. Please check your connection and try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Before you continue</h1>
      <p className="mb-6">Please review and accept our Terms & Conditions and Community Guidelines and acknowledge our Privacy Policy to continue using Common Mind.</p>
      
      <div className="space-y-4 mb-6">
        <button onClick={() => onNavigate('terms-and-conditions')} className="block text-indigo-600 hover:underline">Terms & Conditions</button>
        <button onClick={() => onNavigate('community-guidelines')} className="block text-indigo-600 hover:underline">Community Guidelines</button>
        <button onClick={() => onNavigate('privacy-policy')} className="block text-indigo-600 hover:underline">Privacy Policy</button>
      </div>

      <div className="flex items-center mb-6">
        <input 
          type="checkbox" 
          id="legal-acceptance" 
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="legal-acceptance">I agree to the Terms & Conditions and Community Guidelines, and I acknowledge the Privacy Policy.</label>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button 
        onClick={handleSubmit}
        disabled={!agreed || acceptanceLoading}
        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
      >
        {acceptanceLoading ? 'Saving...' : 'Accept & Continue'}
      </button>
    </div>
  );
};
