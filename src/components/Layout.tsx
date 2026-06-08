import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCircle, LogOut, Target, 
  CheckSquare, Rocket, Settings as SettingsIcon, BarChart3, Receipt, Wallet,
  Menu, X, Search, ChevronRight, Loader2, BookOpen
} from 'lucide-react';

import { supabase } from '../services/supabase';
import { useToast } from '../contexts/ToastContext';
import Notifications from './Notifications';
import AIAssistant from './AIAssistant';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{id: string, name: string, type: 'contact' | 'lead'}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click for search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    try {
      setIsSearching(true);
      setShowSearchDropdown(true);

      // Search Contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(3);

      // Search Leads (joining with contacts)
      const { data: leads } = await supabase
        .from('leads')
        .select(`
          id,
          contact:contacts(name)
        `)
        .ilike('contacts.name', `%${query}%`)
        .limit(3);

      const formattedResults: any[] = [
        ...(contacts?.map(c => ({ id: c.id, name: c.name, type: 'contact' })) || []),
        ...(leads?.map((l: any) => ({ id: l.id, name: l.contact?.name, type: 'lead' })) || [])
      ];

      setSearchResults(formattedResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast('Signed out successfully', 'success');
      navigate('/login');
    } catch (err: any) {
      toast(err.message || 'Failed to sign out', 'error');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Leads', path: '/leads', icon: Target },
    { name: 'Pipeline', path: '/pipeline', icon: Rocket },
    { name: 'Khata Book', path: '/khata', icon: BookOpen },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Payments', path: '/transactions', icon: Wallet },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark flex transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm transition-all animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-[#12141a] 
        border-r border-gray-200/70 dark:border-gray-800/40 z-[70] transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <img src="/logo.jpg" alt="Nowworks Logo" className="w-10 h-10 object-cover rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">Nowworks</span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">AI Business Workspace</span>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl transition-all group active:scale-[0.98] btn-premium
                    ${isActive 
                      ? 'bg-primary text-white shadow-[0_4px_12px_rgba(34,197,94,0.25)] ring-1 ring-primary/10' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 hover:text-primary dark:hover:text-primary'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform text-gray-400 dark:text-gray-500 group-hover:text-primary'}`} />
                    <span className="text-sm font-bold">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 animate-in slide-in-from-left-2" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200/70 dark:border-gray-800/40">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50/80 dark:hover:bg-red-950/20 rounded-xl transition-all group active:scale-[0.98] btn-premium"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className={`
          sticky top-0 z-40 w-full px-4 lg:px-8 py-4 flex items-center justify-between
          transition-all duration-300
          ${isScrolled ? 'bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-800/40 shadow-sm' : 'bg-transparent'}
        `}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-white dark:bg-[#12141a] border border-gray-200/70 dark:border-gray-800/40 rounded-xl text-gray-600 dark:text-gray-300 shadow-sm active:scale-95 transition-transform"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Functional Global Search */}
            <div ref={searchRef} className="relative hidden sm:block">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-[#12141a]/60 border border-gray-200/70 dark:border-gray-800/40 rounded-2xl shadow-sm w-64 lg:w-96 group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all duration-200">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Global search..." 
                  value={searchQuery}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full dark:text-white placeholder-gray-400"
                />
                {isSearching && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>

              {/* Search Dropdown */}
              {showSearchDropdown && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            navigate(result.type === 'contact' ? `/contacts` : `/leads`);
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${result.type === 'contact' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                              {result.type === 'contact' ? <UserCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{result.name}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{result.type}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                      ))
                    ) : !isSearching && (
                      <div className="p-8 text-center">
                        <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Notifications />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800/60 mx-1 hidden sm:block" />
            <Link 
              to="/settings" 
              className="p-2.5 bg-white dark:bg-[#12141a] border border-gray-200/70 dark:border-gray-800/40 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-[0.98] btn-premium"
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}
