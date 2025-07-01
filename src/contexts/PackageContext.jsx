import React, { createContext, useContext, useState } from 'react';

const PackageContext = createContext();

export const usePackageContext = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackageContext must be used within a PackageProvider');
  }
  return context;
};

export const PackageProvider = ({ children }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageFilters, setPackageFilters] = useState({
    treatment_type: '',
    price_min: 0,
    price_max: 50000,
    search: ''
  });

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const clearSelectedPackage = () => {
    setSelectedPackage(null);
  };

  const updateFilters = (newFilters) => {
    setPackageFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setPackageFilters({
      treatment_type: '',
      price_min: 0,
      price_max: 50000,
      search: ''
    });
  };

  const value = {
    selectedPackage,
    selectPackage,
    clearSelectedPackage,
    packageFilters,
    updateFilters,
    clearFilters
  };

  return (
    <PackageContext.Provider value={value}>
      {children}
    </PackageContext.Provider>
  );
};