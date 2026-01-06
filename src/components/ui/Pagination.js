import React from 'react';

// Icons for pagination
const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// Perfect Pagination Component matching your design exactly
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Show: 1, 2, 3, 4, 5, ..., last
        pages.push(2, 3, 4, 5);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show: 1, ..., last-4, last-3, last-2, last-1, last
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        // Show: 1, ..., current-1, current, current+1, ..., last
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* Previous Button */}
      <button
        className={`
          flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white
          transition-all duration-200
          ${currentPage === 1 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
          }
        `}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {/* Page Numbers and Ellipsis */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-8 h-8 text-gray-400 text-sm"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            className={`
              flex items-center justify-center w-8 h-8 rounded border text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
              }
            `}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        className={`
          flex items-center justify-center w-8 h-8 rounded border border-gray-300 bg-white
          transition-all duration-200
          ${currentPage === totalPages 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'
          }
        `}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

// Compact pagination for mobile/small spaces
export const CompactPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous Button */}
      <button
        className={`
          flex items-center justify-center px-3 py-1 rounded border border-gray-300 bg-white text-sm
          transition-all duration-200
          ${currentPage === 1 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-500 hover:bg-gray-50'
          }
        `}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeftIcon className="h-3 w-3 mr-1" />
        Prev
      </button>

      {/* Page Info */}
      <span className="px-3 py-1 text-sm text-gray-600">
        {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        className={`
          flex items-center justify-center px-3 py-1 rounded border border-gray-300 bg-white text-sm
          transition-all duration-200
          ${currentPage === totalPages 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-500 hover:bg-gray-50'
          }
        `}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRightIcon className="h-3 w-3 ml-1" />
      </button>
    </div>
  );
};

// Pagination with page size selector
export const AdvancedPagination = ({ 
  currentPage, 
  totalPages, 
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [4, 6, 50, 100],
  className = '' 
}) => {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 ${className}`}>
      {/* Items info */}
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center space-x-4">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Pagination;
