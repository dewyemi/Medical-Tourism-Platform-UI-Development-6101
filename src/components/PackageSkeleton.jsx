import React from 'react';
import { motion } from 'framer-motion';

const PackageSkeleton = () => {
  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200 animate-pulse relative">
        <div className="absolute top-4 right-4 bg-gray-300 rounded-full w-16 h-6 animate-pulse" />
        <div className="absolute top-4 left-4 bg-gray-300 rounded-full w-8 h-8 animate-pulse" />
        <div className="absolute bottom-4 left-4 flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-300 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title and Badge */}
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse" />
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="h-6 bg-gray-200 rounded w-20 mb-1 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 rounded-xl w-24 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

export default PackageSkeleton;