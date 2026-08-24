import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLegalAcceptance } from '../hooks/useLegalAcceptance';

export const LegalAcceptanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { needsAcceptance, acceptanceLoading } = useLegalAcceptance();
  const location = useLocation();

  if (acceptanceLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>; // Replace with proper loading component
  }

  if (needsAcceptance) {
    return <Navigate to="/legal-acceptance" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
