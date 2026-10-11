'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { adminApi, upiApi } from '@/lib/api';
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
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Lock, 
  Unlock, 
  UserMinus, 
  UserCheck, 
  Wallet, 
  Loader2, 
  User,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import PaginationControls from '@/components/ui/PaginationControls';

// Fallback mockup data
const fallbackUsers = [
  { id: '6a265cedaa6616b5229e932c', fullName: 'Sandeep Gupta', email: 'sgupta73853@bbdu.ac.in', phoneNumber: '9198140801', balance: 3500, isBlocked: false, isActive: true },
  { id: '6a256d2e6eb9af80615c2e10', fullName: 'Amit Kumar', email: 'amit@gmail.com', phoneNumber: '9198140802', balance: 450, isBlocked: true, isActive: true },
  { id: '6a20e4b6035e8afb971f3597', fullName: 'John Doe', email: 'johndoe@example.com', phoneNumber: '9198140803', balance: 120, isBlocked: false, isActive: false },
];

const fallbackUpis = [
  { id: 'u1', upiId: 'sgupta73853@paytm', accountHolderName: 'Sandeep Gupta', userId: '6a265cedaa6616b5229e932c', isPrimary: true },
  { id: 'u2', upiId: 'amitkumar@okaxis', accountHolderName: 'Amit Kumar', userId: '6a256d2e6eb9af80615c2e10', isPrimary: true },
  { id: 'u3', upiId: 'amit.k@upi', accountHolderName: 'Amit Kumar', userId: '6a256d2e6eb9af80615c2e10', isPrimary: false },
  { id: 'u4', upiId: 'johndoe@okicici', accountHolderName: 'John Doe', userId: '6a20e4b6035e8afb971f3597', isPrimary: true },
];

export default function UserManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

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
      params.set('tab', 'users');
      params.set('page', validPage.toString());
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'users');
      params.set('page', '1');
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'users');
      params.set('page', '1');
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };
  
  // Wallet Adjust form state
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('debit');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Users
  const { data: usersRes, isLoading: isQueryLoading, isFetching, error, isError } = useQuery({
    queryKey: ['admin', 'users', currentPage, pageSize, searchTerm],
    queryFn: () => adminApi.getUsers(currentPage, pageSize, searchTerm),
    enabled: mounted,
    placeholderData: keepPreviousData,
  });

  // Fetch UPIs
  const { data: upisRes } = useQuery({
    queryKey: ['admin', 'upis'],
    queryFn: () => upiApi.getAllUpisAdmin(),
    enabled: mounted,
  });

  const isLoading = !mounted || isQueryLoading;

  const getUpisList = () => {
    if (!upisRes) return fallbackUpis;
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
    return fallbackUpis;
  };

  const upiList = getUpisList();


  // Robust list extractor
  const getUsersList = () => {
    if (!usersRes) return [];
    const rData = usersRes.data?.data;
    if (Array.isArray(rData)) return rData;
    if (rData && typeof rData === 'object') {
      for (const key of Object.keys(rData)) {
        if (Array.isArray((rData as any)[key])) return (rData as any)[key];
      }
    }
    const responseData = usersRes.data;
    if (Array.isArray(responseData)) return responseData;
    if (responseData && typeof responseData === 'object') {
      for (const key of Object.keys(responseData)) {
        if (Array.isArray((responseData as any)[key])) return (responseData as any)[key];
      }
    }
    return [];
  };

  const users = getUsersList();

  // Robust server pagination extractor
  const extractServerPagination = () => {
    if (!usersRes?.data) return null;
    const raw = usersRes.data;

    // Check nested pagination objects
    const nested = raw.data?.pagination || raw.pagination || raw.meta?.pagination || raw.meta;
    if (nested && typeof nested === 'object') {
      const page = Number(nested.page || nested.currentPage || 1);
      const limit = Number(nested.limit || nested.perPage || nested.pageSize || pageSize);
      const total = Number(nested.total || nested.totalUsers || nested.totalCount || nested.count || 0);
      const pages = Number(nested.pages || nested.totalPages || (limit > 0 ? Math.ceil(total / limit) : 1));
      if (total >= 0) {
        return { page, limit, total, pages: Math.max(1, pages) };
      }
    }

    // Direct fields on raw or raw.data
    const target = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw;
    const directTotal = Number(target.total ?? target.totalUsers ?? target.totalCount);
    const directPages = Number(target.pages ?? target.totalPages);
    const directPage = Number(target.page ?? target.currentPage);
    const directLimit = Number(target.limit ?? target.perPage ?? target.pageSize);

    if (!isNaN(directTotal) && directTotal >= 0) {
      const lim = !isNaN(directLimit) && directLimit > 0 ? directLimit : pageSize;
      const pgs = !isNaN(directPages) && directPages > 0 ? directPages : Math.max(1, Math.ceil(directTotal / lim));
      const pg = !isNaN(directPage) && directPage > 0 ? directPage : currentPage;
      return { page: pg, limit: lim, total: directTotal, pages: pgs };
    }

    return null;
  };

  const serverPagination = extractServerPagination();

  // Mutation: Block/Unblock
  const toggleBlockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) => 
      isBlocked ? adminApi.unblockUser(id) : adminApi.blockUser(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(`User successfully ${variables.isBlocked ? 'unblocked' : 'blocked'}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Block action failed');
    }
  });

  // Mutation: Activate/Deactivate
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      isActive ? adminApi.deactivateUser(id) : adminApi.activateUser(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(`User successfully ${variables.isActive ? 'deactivated' : 'activated'}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Activation action failed');
    }
  });

  // Mutation: Adjust Wallet
  const adjustWalletMutation = useMutation({
    mutationFn: (data: { userId: string; amount: number; type: 'credit' | 'debit'; description: string }) => 
      adminApi.adjustWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Wallet adjusted successfully');
      setIsAdjustOpen(false);
      setAdjustAmount('');
      setAdjustReason('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Wallet adjustment failed');
    }
  });

  const handleWalletAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;
    
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    adjustWalletMutation.mutate({
      userId: selectedUser.id || selectedUser._id,
      amount: amountNum,
      type: adjustType,
      description: adjustReason || `${adjustType === 'credit' ? 'Manual credit' : 'Manual debit'} by admin`,
    });
  };

  // Client filter fallback if server pagination is absent
  const clientFilteredUsers = users.filter((user: any) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (user.fullName || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term) ||
      (user.phoneNumber || '').includes(term) ||
      (user.referralCode || '').toLowerCase().includes(term)
    );
  });

  const isServerPaginated = Boolean(serverPagination);
  const totalCount = isServerPaginated && serverPagination ? serverPagination.total : clientFilteredUsers.length;
  const totalPages = isServerPaginated && serverPagination 
    ? Math.max(1, serverPagination.pages) 
    : Math.max(1, Math.ceil(clientFilteredUsers.length / pageSize));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  const displayedUsers = isServerPaginated 
    ? users 
    : clientFilteredUsers.slice((activePage - 1) * pageSize, activePage * pageSize);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">User Directory</h1>
          <p className="text-slate-400 text-sm">Control account statuses, manage security holds, and adjust wallet balances.</p>
        </div>
        
        {/* Search controls */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-slate-800 bg-slate-900/50 text-white focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-60 flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-400">Loading user registry...</p>
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-rose-400 text-sm">
              Failed to load users: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              {searchTerm ? 'No accounts matching criteria found.' : 'No users registered on the platform.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto relative">
                {isFetching && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  </div>
                )}
                <Table>
                <TableHeader className="border-slate-800 bg-slate-950/45">
                  <TableRow className="border-slate-850 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-semibold py-3.5">User Profile</TableHead>
                    <TableHead className="text-slate-400 font-semibold py-3.5">Contact</TableHead>
                    <TableHead className="text-slate-400 font-semibold py-3.5 text-right">Wallet Balance</TableHead>
                    <TableHead className="text-slate-400 font-semibold py-3.5 text-center">UPI</TableHead>
                    <TableHead className="text-slate-400 font-semibold py-3.5 text-center">Account State</TableHead>
                    <TableHead className="text-slate-400 font-semibold py-3.5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedUsers.map((u: any) => {
                    const userId = u.id || u._id;
                    const userUpis = upiList.filter((upi: any) => {
                      const upiUserId = upi.userId?._id || upi.userId?.id || upi.userId;
                      const upiUserObjId = upi.user?._id || upi.user?.id;
                      return upiUserId === userId || upiUserObjId === userId;
                    });

                    return (
                      <TableRow key={userId} className="border-slate-850 hover:bg-slate-900/20 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-slate-200 truncate max-w-[120px]">{u.fullName}</span>
                                {u.isBlocked && (
                                  <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-[9px] px-1 py-0 shrink-0 font-semibold">
                                    Blocked
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[150px]">{u.email}</span>
                              <span className="text-[9px] text-slate-600 font-mono mt-0.5 truncate max-w-[150px]">ID: {userId}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-slate-350 text-xs font-mono">{u.phoneNumber}</span>
                            {u.registeredAt && (
                              <span className="text-[10px] text-slate-500 mt-0.5">
                                Reg: {new Date(u.registeredAt).toLocaleDateString('en-IN')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-white text-sm">
                              ₹{(u.wallet?.balance ?? u.balance ?? 0).toLocaleString('en-IN')}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-mono shrink-0">
                              <span className="text-emerald-400">Cr: ₹{(u.wallet?.totalCredited ?? 0).toLocaleString('en-IN')}</span>
                              <span className="text-slate-600">|</span>
                              <span className="text-rose-450">Dr: ₹{(u.wallet?.totalDebited ?? 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {userUpis.length === 0 ? (
                            <span className="text-slate-600 text-xs italic">No UPI Registered</span>
                          ) : (
                            <div className="flex flex-col gap-1.5 items-center justify-center">
                              {userUpis.map((upi: any) => (
                                <div key={upi._id || upi.id} className="flex items-center gap-1.5 justify-center group/upi font-mono text-xs">
                                  <span className="text-indigo-400 font-semibold">{upi.upiId}</span>
                                  {upi.isPrimary && (
                                    <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 text-[9px] px-1 py-0 font-bold shrink-0">
                                      Primary
                                    </Badge>
                                  )}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(upi.upiId);
                                      toast.success(`Copied: ${upi.upiId}`);
                                    }}
                                    className="p-0.5 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors opacity-0 group-hover/upi:opacity-100 cursor-pointer"
                                    title="Copy UPI ID"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {u.isActive ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                              Deactivated
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Wallet Adjust Action */}
                            <Button
                              onClick={() => {
                                setSelectedUser(u);
                                setIsAdjustOpen(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="h-8 border-slate-800 bg-slate-950 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 gap-1 text-xs"
                            >
                              <Wallet className="h-3.5 w-3.5" />
                              Adjust Wallet
                            </Button>

                            {/* Block Toggle */}
                            <Button
                              onClick={() => toggleBlockMutation.mutate({ id: userId, isBlocked: u.isBlocked })}
                              size="icon"
                              variant="outline"
                              className={`h-8 w-8 border-slate-800 bg-slate-950 ${
                                u.isBlocked 
                                  ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300' 
                                  : 'text-rose-450 hover:bg-rose-500/10 hover:text-rose-400'
                              }`}
                              title={u.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              {u.isBlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            </Button>

                            {/* Active Toggle */}
                            <Button
                              onClick={() => toggleActiveMutation.mutate({ id: userId, isActive: u.isActive })}
                              size="icon"
                              variant="outline"
                              className={`h-8 w-8 border-slate-800 bg-slate-950 ${
                                u.isActive 
                                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                                  : 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300'
                              }`}
                              title={u.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {u.isActive ? <UserMinus className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
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
              itemName="users"
            />
          </>
          )}
        </CardContent>
      </Card>

      {/* Wallet Adjustment Dialog Modal */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-md sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-400" />
              Adjust Wallet Balance
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Directly credit or debit wallet balance for <strong>{selectedUser?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWalletAdjustSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="adjustType">Type</Label>
                <Input
                  id="adjustType"
                  value="Debit (-)"
                  className="border-slate-800 bg-slate-950 text-rose-450 font-semibold"
                  disabled
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjustAmount">Amount (₹)</Label>
                <Input
                  id="adjustAmount"
                  type="number"
                  placeholder="1000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adjustReason">Adjustment Reason</Label>
              <Textarea
                id="adjustReason"
                placeholder="Referral bonus / correction adjustment / refund"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="border-slate-800 bg-slate-950 text-white placeholder:text-slate-700 resize-none h-20"
                required
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustOpen(false)}
                className="border-slate-800 text-slate-350 hover:bg-slate-850 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adjustWalletMutation.isPending}
                className="bg-indigo-650 hover:bg-indigo-550 text-white font-semibold"
              >
                {adjustWalletMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Ledger...
                  </>
                ) : (
                  'Submit Adjust'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
