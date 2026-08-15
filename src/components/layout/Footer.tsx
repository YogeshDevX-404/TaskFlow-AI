import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Github, Twitter, Linkedin, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">TaskFlow AI</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The next-generation enterprise issue tracker and project management suite combining the speed of Linear, flexibility of ClickUp, and power of Jira.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="p-2 rounded-lg bg-slate-800 hover:text-white transition-colors cursor-pointer"><Github className="w-4 h-4" /></span>
              <span className="p-2 rounded-lg bg-slate-800 hover:text-white transition-colors cursor-pointer"><Twitter className="w-4 h-4" /></span>
              <span className="p-2 rounded-lg bg-slate-800 hover:text-white transition-colors cursor-pointer"><Linkedin className="w-4 h-4" /></span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Kanban & Sprints</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">GitHub Sync</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Roadmaps</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">AI Release Summarizer</a></li>
              <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Solutions</h4>
            <ul className="space-y-2">
              <li><Link to="/app/dashboard" className="hover:text-indigo-400 transition-colors">Engineering Teams</Link></li>
              <li><Link to="/app/dashboard" className="hover:text-indigo-400 transition-colors">Product Managers</Link></li>
              <li><Link to="/app/dashboard" className="hover:text-indigo-400 transition-colors">DevOps Engineers</Link></li>
              <li><Link to="/app/dashboard" className="hover:text-indigo-400 transition-colors">Enterprise Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-indigo-400 cursor-pointer">About Us</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Careers</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Security Portal</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} TaskFlow AI Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>SOC2 Type II Certified & ISO 27001 Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
