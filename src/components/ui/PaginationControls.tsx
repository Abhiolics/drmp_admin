'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemName?: string;
  pageSizeOptions?: number[];
  activeButtonClass?: string;
  className?: string;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemName = 'records',
  pageSizeOptions = [10, 25, 50, 100],
  activeButtonClass = 'bg-indigo-600 text-white hover:bg-indigo-500 font-bold border-indigo-500 shadow-sm shadow-indigo-600/30',
  className = '',
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const activePage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const startRecord = totalCount === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const endRecord = totalCount === 0 ? 0 : Math.min(startRecord + pageSize - 1, totalCount);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (safeTotalPages <= 5) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (activePage > 3) {
      pages.push('ellipsis-start');
    }

    const start = Math.max(2, activePage - 1);
    const end = Math.min(safeTotalPages - 1, activePage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (activePage < safeTotalPages - 2) {
      pages.push('ellipsis-end');
    }

    pages.push(safeTotalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Records Count & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400">
        <div>
          Showing <span className="font-semibold text-white">{startRecord}</span> to{' '}
          <span className="font-semibold text-white">{endRecord}</span> of{' '}
          <span className="font-semibold text-white">{totalCount}</span> {itemName}
        </div>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(parseInt(val || '10', 10))}
          >
            <SelectTrigger className="h-8 w-18 border-slate-800 bg-slate-900 text-xs text-white">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-white">
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={opt.toString()}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* First page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={activePage <= 1}
          className="h-8 w-8 border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white disabled:opacity-40"
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage <= 1}
          className="h-8 px-2.5 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white disabled:opacity-40 text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Prev
        </Button>

        {/* Dynamic page numbers (hidden on very narrow screens) */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <span key={`ell-${index}`} className="px-1 text-slate-600 text-xs select-none">
                  ...
                </span>
              );
            }
            const isCurrent = page === activePage;
            return (
              <Button
                key={page}
                variant={isCurrent ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={`h-8 w-8 p-0 text-xs ${
                  isCurrent
                    ? activeButtonClass
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white'
                }`}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden text-xs text-slate-300 font-medium px-2">
          Page {activePage} / {safeTotalPages}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage >= safeTotalPages}
          className="h-8 px-2.5 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white disabled:opacity-40 text-xs"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={activePage >= safeTotalPages}
          className="h-8 w-8 border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white disabled:opacity-40"
          title="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
