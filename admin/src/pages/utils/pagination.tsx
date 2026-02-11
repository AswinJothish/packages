import  { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Assuming you're using lucide-react for icons

interface PaginationProps {
  total: number;
  limit: number;
  page: number;
  callback: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ total, limit, page, callback }) => {
  const [currentPage, setCurrentPage] = useState<number>(page);
  const totalPages = Math.ceil(total / limit);
  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return; // Don't allow invalid pages
    setCurrentPage(newPage);
    callback(newPage);
  };

  return (
    <div className="mt-auto flex justify-between">
      <div className="flex w-5/6  my-2">
        <div className="flex items-center w-fit gap-3 justify-between ">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center`}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:block">Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center justify-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`py-1 px-3 mx-2  rounded ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-transparent'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={` ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center`}
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Page Information */}
      <div className="text-sm text-gray-500">
        {start} - {end} of {total}
      </div>
    </div>
  );
};

export default Pagination;
