import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../common/ThemeToggle';

export const PublicHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">TaskFlow <span className="text-indigo-500">AI</span></span>
            <span className="text-[9px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase -mt-1">Enterprise Platform</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
          <a href="#workflow" className="hover:text-indigo-500 transition-colors">Workflow</a>
          <a href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-indigo-500 transition-colors">Testimonials</a>
          <a href="#faq" className="hover:text-indigo-500 transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/signup')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </header>
  );
};
