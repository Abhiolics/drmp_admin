'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { upiApi } from '@/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Wallet, 
  RefreshCw, 
  AlertTriangle,
  Search,
  UserCheck
} from 'lucide-react';
import PaginationControls from '@/components/ui/PaginationControls';

export default function UpiDirectoryTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sync currentPage from URL query parameter on navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get('page') || '1', 10);
      if (!isNaN(p) && p > 0 && p !== currentPage) {
        setCurrentPage(p);
      }
    }
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, newPage);
    setCurrentPage(validPage);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'upi-directory');
      params.set('page', validPage.toString());
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'upi-directory');
      params.set('page', '1');
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'upi-directory');
      params.set('page', '1');
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all registered user UPIs (Admin API)
  const { data: upisRes, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['admin', 'upis'],
    queryFn: () => upiApi.getAllUpisAdmin(),
    enabled: mounted,
  });

  const getUpisList = () => {
    if (!upisRes) return [];
    const rData = upisRes.data?.data;
    if (Array.isArray(rData)) return rData;
    if (rData && typeof rData === 'object') {
      for (const key of Object.keys(rData)) {
        if (Array.isArray((rData as any)[key])) return (rData as any)[key];
      }
    }
    const responseData = upisRes.data;
    if (Array.isArray(responseData)) return responseData;
    if (responseData && typeof responseData === 'object') {
      for (const key of Object.keys(responseData)) {
        if (Array.isArray((responseData as any)[key])) return (responseData as any)[key];
      }
    }
    return [];
  };

  const upiList = getUpisList();

  // Filter list by search query
  const filteredUpis = upiList.filter((upi: any) => {
    const handle = String(upi.upiId || '').toLowerCase();
    const holder = String(upi.accountHolderName || '').toLowerCase();
    const email = String(upi.userId?.email || upi.user?.email || '').toLowerCase();
    const name = String(upi.userId?.fullName || upi.user?.fullName || '').toLowerCase();
    
    return handle.includes(searchTerm.toLowerCase()) || 
           holder.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase()) || 
           name.includes(searchTerm.toLowerCase());
  });

  const totalCount = filteredUpis.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const displayedUpis = filteredUpis.slice((activePage - 1) * pageSize, activePage * pageSize);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Wallet className="h-8 w-8 text-indigo-400" />
            Global UPI Directory
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor and audit all UPI virtual payment addresses (VPAs) registered across platform client wallets.
          </p>
        </div>
        
        <Button 
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
          className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-850 hover:text-white font-semibold gap-2 w-fit self-start md:self-auto"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </Button>
      </div>

      {/* Filter and Table container */}
      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-xl shadow-xl">
        <CardHeader className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold text-white">Payment Addresses Directory</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Registered UPI virtual addresses mapped to user profile accounts.
            </CardDescription>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search VPA, owner, email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-850 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-550 transition-colors"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-60 flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-400">Loading payment addresses...</p>
            </div>
          ) : isError ? (
            <div className="flex h-60 flex-col items-center justify-center gap-2 text-rose-400 p-6 text-center">
              <AlertTriangle className="h-8 w-8" />
              <p className="text-sm font-semibold">Failed to fetch UPI records</p>
              <p className="text-xs text-rose-500/80">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : displayedUpis.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm italic">
              {searchTerm ? 'No matching UPI records found.' : 'No registered UPI handles on the platform.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-950/20 border-b border-slate-800">
                    <TableRow className="border-slate-850 hover:bg-transparent">
                      <TableHead className="text-slate-400 font-semibold text-xs py-3.5 pl-6">Owner Name</TableHead>
                      <TableHead className="text-slate-400 font-semibold text-xs py-3.5">UPI ID / VPA</TableHead>
                      <TableHead className="text-slate-400 font-semibold text-xs py-3.5">Owner User Account</TableHead>
                      <TableHead className="text-slate-400 font-semibold text-xs py-3.5">Priority</TableHead>
                      <TableHead className="text-slate-400 font-semibold text-xs py-3.5 pr-6 text-right">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedUpis.map((upi: any) => {
                      const upiIdVal = upi._id || upi.id;
                      const userEmail = upi.userId?.email || upi.user?.email || upi.userId || 'N/A';
                      const userFullName = upi.userId?.fullName || upi.user?.fullName || 'Client User';

                      return (
                        <TableRow key={upiIdVal} className="border-slate-850 hover:bg-slate-850/20">
                          <TableCell className="py-3.5 pl-6">
                            <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                              <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                              {upi.accountHolderName || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 font-mono text-indigo-400 text-sm font-semibold">
                            {upi.upiId}
                          </TableCell>
                          <TableCell className="py-3.5">
                            <div className="text-white text-xs font-semibold">{userFullName}</div>
                            <div className="text-slate-500 text-xs">{userEmail}</div>
                          </TableCell>
                          <TableCell className="py-3.5">
                            {upi.isPrimary ? (
                              <Badge className="bg-emerald-500/10 text-emerald-450 hover:bg-emerald-500/10 border border-emerald-500/20 text-[10px] px-2 py-0.5 font-bold">
                                Primary
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5">
                                Secondary
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-3.5 pr-6 text-right text-xs text-slate-500 font-mono">
                            {upi.createdAt ? new Date(upi.createdAt).toLocaleString('en-IN') : 'Just now'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination Controls */}
              <PaginationControls
                currentPage={activePage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                itemName="addresses"
                activeButtonClass="bg-indigo-600 text-white hover:bg-indigo-500 font-bold border-indigo-500 shadow-sm shadow-indigo-600/30"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
