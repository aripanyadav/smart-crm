import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  Target, 
  CheckSquare, 
  LayoutDashboard, 
  ArrowRight, 
  Zap, 
  Shield, 
  BarChart3 
} from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SmartCRM</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">About</a>
              {isLoggedIn ? (
                <Link 
                  to="/dashboard" 
                  className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Login</Link>
                  <Link 
                    to="/signup" 
                    className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
            {/* Mobile nav */}
            <div className="md:hidden">
              {isLoggedIn ? (
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-all flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-all"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4" />
            <span>The Intelligence Your Sales Team Needs</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Manage your leads, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              Grow your business.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            The smart way to track contacts, manage sales pipelines, and follow up with leads. Everything you need to scale your business in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            {isLoggedIn ? (
              <Link 
                to="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  Live Demo
                </Link>
              </>
            )}
          </div>

          <div className="mt-20 relative mx-auto max-w-5xl group">
             <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-950 via-transparent to-transparent z-10" />
             <div className="relative rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-1000 delay-500">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-800 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="aspect-video bg-white dark:bg-gray-950 flex items-center justify-center text-gray-300 dark:text-gray-700 font-bold text-4xl italic">
                  [ SmartCRM Dashboard Preview ]
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our powerful features are designed to help you organize your workflow and close more deals faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-current/10 transition-transform group-hover:scale-110`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary overflow-hidden relative">
         <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:40px_40px]" />
         </div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
               <div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">10k+</div>
                  <div className="text-primary-dark/70 font-medium">Active Users</div>
               </div>
               <div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">99.9%</div>
                  <div className="text-primary-dark/70 font-medium">Uptime Reliable</div>
               </div>
               <div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">24/7</div>
                  <div className="text-primary-dark/70 font-medium">Expert Support</div>
               </div>
               <div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">4.9/5</div>
                  <div className="text-primary-dark/70 font-medium">Rating Score</div>
               </div>
            </div>
         </div>
      </section>

      {/* Trust Section */}
      <section id="about" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-[3rem] p-8 lg:p-20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[30%] h-[100%] bg-primary/20 blur-[100px]" />
             <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2">
                   <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                      Trusted by teams worldwide to scale their growth.
                   </h2>
                   <p className="text-gray-400 mb-8 text-lg">
                      We provide the tools, you provide the vision. Together, we'll build a systematic approach to sales that ensures no lead is left behind.
                   </p>
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-white">
                         <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                            <CheckSquare className="w-4 h-4" />
                         </div>
                         <span>Advanced Security Protocols</span>
                      </div>
                      <div className="flex items-center gap-3 text-white">
                         <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                            <CheckSquare className="w-4 h-4" />
                         </div>
                         <span>Automatic Data Synchronization</span>
                      </div>
                   </div>
                </div>
                <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                   <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 text-center">
                      <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
                      <div className="text-white font-bold">Secure</div>
                   </div>
                   <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 text-center">
                      <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                      <div className="text-white font-bold">Fast</div>
                   </div>
                   <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 text-center">
                      <BarChart3 className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                      <div className="text-white font-bold">Smart</div>
                   </div>
                   <div className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border border-white/10 text-center">
                      <Users className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                      <div className="text-white font-bold">Social</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SmartCRM</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Help Center</a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} SmartCRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Contact Management',
    description: 'Keep all your customer details organized in one secure place with easy access.',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Lead Pipeline',
    description: 'Visualize your sales process and move deals through stages with a simple drag-and-drop.',
    icon: Target,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Task Follow-ups',
    description: 'Never miss a callback again. Schedule and track follow-up tasks effortlessly.',
    icon: CheckSquare,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    title: 'Real-time Analytics',
    description: 'Track your performance with powerful metrics and actionable insights on your dashboard.',
    icon: LayoutDashboard,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
];
