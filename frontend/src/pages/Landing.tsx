import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  BarChart3, MessageSquare, FolderOpen, Users, Projector, Shield,
  CheckCircle, ArrowRight, Star, Menu, X, Github, Twitter, Linkedin,
  ChevronRight, Zap, Clock, Lock, TrendingUp, Layout, Bell
} from 'lucide-react';

const features = [
  {
    icon: BarChart3, title: 'Analytics & Charts', description: 'Visualize project progress with real-time charts, burndown reports, and performance metrics.',
    color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: MessageSquare, title: 'Real-Time Chat', description: 'Communicate instantly with team members through direct messages and group conversations.',
    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: Projector, title: 'Kanban Boards', description: 'Manage tasks with drag-and-drop Kanban boards. Track progress from backlog to done.',
    color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: FolderOpen, title: 'File Management', description: 'Upload, organize, and share files with version control and smart search.',
    color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: Users, title: 'Team Collaboration', description: 'Create teams, assign roles, and collaborate seamlessly on projects.',
    color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: Shield, title: 'Enterprise Security', description: 'Role-based access control, audit logs, and end-to-end encryption.',
    color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
];

const stats = [
  { label: 'Active Users', value: '10K+', icon: Users },
  { label: 'Projects Managed', value: '50K+', icon: Projector },
  { label: 'Messages Sent', value: '1M+', icon: MessageSquare },
  { label: 'Countries', value: '120+', icon: Globe },
];

const plans = [
  {
    name: 'Free', price: '$0', description: 'For small teams getting started',
    features: ['Up to 5 team members', '3 projects', '1GB storage', 'Basic chat', 'Kanban boards'],
    cta: 'Get Started', popular: false,
  },
  {
    name: 'Pro', price: '$12', description: 'For growing teams',
    features: ['Unlimited members', 'Unlimited projects', '50GB storage', 'Advanced analytics', 'Priority support'],
    cta: 'Start Free Trial', popular: true,
  },
  {
    name: 'Enterprise', price: '$29', description: 'For large organizations',
    features: ['Everything in Pro', 'Unlimited storage', 'SSO & SAML', 'Audit logs', 'Dedicated support'],
    cta: 'Contact Sales', popular: false,
  },
];

function Globe(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold">CF</span>
              </div>
              <span className="text-xl font-bold text-surface-900 dark:text-white">ChartFlow</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">About</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/app" className="btn-primary gap-2">
                  Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden btn-ghost p-2">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 animate-slide-down">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-xl">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-xl">Pricing</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-xl">About</a>
              <hr className="border-surface-200 dark:border-surface-800" />
              {isAuthenticated ? (
                <Link to="/app" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full justify-center">Dashboard</Link>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary flex-1 justify-center">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary flex-1 justify-center">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-emerald-50/50 dark:from-primary-950/20 dark:via-transparent dark:to-emerald-950/20" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary-500/5 dark:bg-primary-500/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 mb-8">
            <Zap size={14} className="text-primary-500" />
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">The future of team collaboration</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-surface-900 dark:text-white leading-[1.1] tracking-tight mb-6">
            Collaborate smarter
            <br />
            <span className="bg-gradient-to-r from-primary-500 via-emerald-500 to-primary-500 bg-clip-text text-transparent">
              with real-time charts
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-surface-500 dark:text-surface-400 mb-10 leading-relaxed">
            ChartFlow brings your team together with powerful analytics, real-time chat,
            Kanban boards, and file management — all in one beautiful platform.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isAuthenticated ? (
              <Link to="/app" className="btn-primary px-8 py-3.5 text-base gap-2">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base gap-2">
                  Start Free <ArrowRight size={18} />
                </Link>
                <a href="#features" className="btn-secondary px-8 py-3.5 text-base">
                  Learn More
                </a>
              </>
            )}
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary-500" />
                <p className="text-3xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-surface-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-50/50 dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              Everything your team needs
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Powerful features designed to make your team more productive and organized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group glass-card p-6 hover:shadow-xl">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon size={24} className={feature.color} />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Choose the plan that fits your team. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`glass-card p-8 relative ${plan.popular ? 'ring-2 ring-primary-500 shadow-xl scale-[1.02]' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-surface-500 mb-4">{plan.description}</p>
                <p className="text-4xl font-bold text-surface-900 dark:text-white mb-6">
                  {plan.price}<span className="text-lg font-normal text-surface-400">/mo</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`w-full justify-center ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to transform your workflow?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using ChartFlow to collaborate, analyze, and ship faster.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-600 font-semibold hover:bg-white/90 transition-all text-base">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-surface-900 dark:bg-black text-surface-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">CF</span>
                </div>
                <span className="font-semibold text-white">ChartFlow</span>
              </div>
              <p className="text-sm text-surface-500">Modern collaboration platform for teams who ship.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Blog</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Careers</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Security</span></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-surface-800">
            <p className="text-sm">&copy; 2026 ChartFlow. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="hover:text-white transition-colors"><Github size={18} /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
