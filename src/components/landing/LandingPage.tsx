import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  BookOpen, 
  Sparkles, 
  Users, 
  Calendar, 
  Heart, 
  Send, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight, 
  Menu, 
  X, 
  MessageSquare, 
  Clock, 
  FileText, 
  Flame, 
  Bot, 
  DollarSign, 
  Layers, 
  MapPin, 
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { ANDROID_DOWNLOAD_URL, WEB_APP_URL, CONTACT_EMAIL } from './config';

interface LandingPageProps {
  onOpenApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownload = () => {
    if (ANDROID_DOWNLOAD_URL && ANDROID_DOWNLOAD_URL.trim() !== '') {
      window.open(ANDROID_DOWNLOAD_URL, '_blank');
    } else {
      setShowDownloadModal(true);
    }
  };

  const handleOpenWebApp = () => {
    if (WEB_APP_URL && WEB_APP_URL.trim() !== '') {
      window.open(WEB_APP_URL, '_blank');
    } else if (onOpenApp) {
      onOpenApp();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* ─── NAVIGATION BAR ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">ALTAR</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Hub
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('why-altar')} className="hover:text-slate-900 transition-colors">Why Altar</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-900 transition-colors">Features</button>
            <button onClick={() => scrollToSection('aspect')} className="hover:text-slate-900 transition-colors">ASPECT Method</button>
            <button onClick={() => scrollToSection('bible-study')} className="hover:text-slate-900 transition-colors">Bible Study</button>
            <button onClick={() => scrollToSection('prayer-cells')} className="hover:text-slate-900 transition-colors">Prayer Cells</button>
            <button onClick={() => scrollToSection('committee')} className="hover:text-slate-900 transition-colors">Committee</button>
            <button onClick={() => scrollToSection('vision')} className="hover:text-slate-900 transition-colors">Vision</button>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 border border-slate-200/80"
            >
              <Download size={15} />
              <span>Download</span>
            </button>
            <button
              onClick={handleOpenWebApp}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-slate-900/10 flex items-center gap-2"
            >
              <span>Open Web App</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={handleOpenWebApp}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
            >
              Open
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl"
            >
              <div className="flex flex-col space-y-3 font-semibold text-slate-700">
                <button onClick={() => scrollToSection('why-altar')} className="text-left py-2 hover:text-slate-900">Why Altar</button>
                <button onClick={() => scrollToSection('features')} className="text-left py-2 hover:text-slate-900">Features</button>
                <button onClick={() => scrollToSection('aspect')} className="text-left py-2 hover:text-slate-900">ASPECT Method</button>
                <button onClick={() => scrollToSection('bible-study')} className="text-left py-2 hover:text-slate-900">Bible Study</button>
                <button onClick={() => scrollToSection('prayer-cells')} className="text-left py-2 hover:text-slate-900">Prayer Cells</button>
                <button onClick={() => scrollToSection('committee')} className="text-left py-2 hover:text-slate-900">Committee</button>
                <button onClick={() => scrollToSection('vision')} className="text-left py-2 hover:text-slate-900">Vision & Mission</button>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-slate-100 text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download Android App
                </button>
                <button
                  onClick={handleOpenWebApp}
                  className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                >
                  Open Web App <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>


      {/* ─── HERO SECTION ──────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest shadow-sm">
              <span>Christ-Centred &bull; Bible-Based &bull; Community-Oriented</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-slate-900 leading-[1.15]">
              Grow in Christ. <br />
              <span className="font-bold text-slate-900">Walk with His people.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed">
              ALTAR is a Christ-centred platform designed to help believers grow in their relationship with God through Bible study, prayer, quiet time, fellowship and community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
              >
                <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                <span>Download Altar</span>
              </button>
              <button
                onClick={handleOpenWebApp}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border border-slate-200 shadow-sm flex items-center justify-center gap-2"
              >
                <span>Explore Web App</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Hero UI Showcase */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-2xl shadow-slate-200/70 overflow-hidden">
              {/* Mock App Shell Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">Altar Hub Dashboard</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pioneering Fellowship</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-600">Live Workspace</span>
                </div>
              </div>

              {/* Mock Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Verse of the day */}
                <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-slate-800/80 px-2.5 py-1 rounded-full">
                      Verse of the Day
                    </span>
                    <BookOpen size={18} className="text-indigo-400" />
                  </div>
                  <blockquote className="text-lg md:text-xl font-light italic leading-relaxed text-slate-100">
                    &ldquo;Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.&rdquo;
                  </blockquote>
                  <p className="text-xs font-bold text-indigo-300 mt-4 tracking-wider uppercase">— Philippians 4:6</p>
                </div>

                {/* Quick Stats & Prayer Cell Preview */}
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Cells</span>
                      <Users size={16} className="text-indigo-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-1">Prayer Cell 1</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Believers Study &bull; Online Gathering</p>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Quiet Time Routine</span>
                      <Flame size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-emerald-900 mt-1">ASPECT Meditation</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Daily reflection & journal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── WHY ALTAR SECTION ─────────────────────────────────── */}
      <section id="why-altar" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
              Faith was never meant to be lived alone.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Many believers have access to Bible apps, devotional tools, messaging platforms and separate community systems. 
              But spiritual growth, fellowship and community responsibilities often remain scattered across different places.
            </p>
            <p className="text-base sm:text-lg text-slate-900 font-semibold leading-relaxed">
              Altar brings these areas together in one Christ-centred platform.
            </p>

            {/* Progression Flow */}
            <div className="pt-8">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <span className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">Bible</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">Prayer</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">Growth</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="px-4 py-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">Fellowship</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="px-4 py-2 bg-slate-900 text-white rounded-xl shadow-sm">Community</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── WHAT IS ALTAR? (FEATURES GRID) ────────────────────── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
              One platform. <span className="font-bold">A life centred on Christ.</span>
            </h2>
            <p className="text-slate-600 text-base">
              Altar harmoniously unites personal spiritual disciplines with interactive community fellowship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Quiet Time */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Flame size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Quiet Time</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Reflect on Scripture through a structured Bible meditation process with daily streaks and history.
              </p>
            </div>

            {/* 2. Prayer */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Heart size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Prayer</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Record, organise and revisit prayers through structured ACTS and free-form personal prayer journals.
              </p>
            </div>

            {/* 3. Bible Study */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Bible Study</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Study Scripture individually (PBS) and participate in group Bible study (GBS) with comprehensive templates.
              </p>
            </div>

            {/* 4. Journal */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Journal</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Record thoughts, reflections, lessons from Scripture, tags, and spiritual milestones over time.
              </p>
            </div>

            {/* 5. Prayer Cells */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Prayer Cells</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect believers through small group prayer-cell communities with leaders, meeting links, and group chats.
              </p>
            </div>

            {/* 6. Fellowship */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Fellowship</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Share testimonies and pictures, participate in real-time community chat, and encourage fellow believers.
              </p>
            </div>

            {/* 7. Committee Records */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Layers size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Committee Hub</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Organise historical records, official event categories (EvaCa, MEET, HSS), meeting minutes, and member registries.
              </p>
            </div>

            {/* 8. Treasury & Offering */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Offering & Treasury</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Manage transparent community contributions, track social funds, and verify official receipt vouchers.
              </p>
            </div>

            {/* 9. Bible-Centred AI */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Bot size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Bible-Centred AI</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Use AI as a Scripture-oriented companion that directs questions toward biblical context and God's Word.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ─── PERSONAL GROWTH SECTION ───────────────────────────── */}
      <section className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Spiritual Disciplines</span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900 leading-tight">
                Build a consistent <br />
                <span className="font-bold text-slate-900">walk with God.</span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Spiritual growth flourishes through everyday faithfulness. Altar provides a quiet, dedicated digital space to establish and sustain personal habits in God's presence without distractions.
              </p>
              <blockquote className="p-4 bg-slate-50 border-l-4 border-slate-900 rounded-r-2xl text-slate-700 italic font-medium text-sm">
                &ldquo;Small, faithful steps every day can shape a lifetime of growth.&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>Daily Quiet Time</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>Personal Prayer ACTS</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>Scripture Reflections</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>Spiritual Journal</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personal Prayer Log (ACTS)</h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">Structured</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A &bull; Adoration</span>
                    <p className="text-xs text-slate-600 mt-1">Praise God for who He is and His holiness.</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">C &bull; Confession</span>
                    <p className="text-xs text-slate-600 mt-1">Confess sins and humble yourself before Him.</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">T &bull; Thanksgiving</span>
                    <p className="text-xs text-slate-600 mt-1">Thank Him for His blessings and answers.</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">S &bull; Supplication</span>
                    <p className="text-xs text-slate-600 mt-1">Ask for your needs, leaders, and fellowship.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── ASPECT METHOD SECTION ─────────────────────────────── */}
      <section id="aspect" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Meditation Framework</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
              Reflect on Scripture with <span className="font-bold text-indigo-300">ASPECT</span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Altar&apos;s structured quiet-time approach guides you through six meaningful questions to uncover God&apos;s truth from every passage:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* A */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-lg border border-indigo-500/30">
                A
              </div>
              <h3 className="text-base font-bold text-white">About God</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                What does this passage reveal about God&apos;s nature, character, holiness, and love?
              </p>
            </div>

            {/* S */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-lg border border-rose-500/30">
                S
              </div>
              <h3 className="text-base font-bold text-white">Sins to Avoid</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                What attitudes, sinful actions, doubts or patterns should I turn away from?
              </p>
            </div>

            {/* P */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg border border-amber-500/30">
                P
              </div>
              <h3 className="text-base font-bold text-white">Promises to Claim</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                What everlasting promises and assurances does Scripture declare for His children?
              </p>
            </div>

            {/* E */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                E
              </div>
              <h3 className="text-base font-bold text-white">Examples to Follow</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                What godly examples should I imitate — or what warnings should I heed?
              </p>
            </div>

            {/* C */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-lg border border-blue-500/30">
                C
              </div>
              <h3 className="text-base font-bold text-white">Commands to Obey</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                What is God specifically calling me to do in obedience to His Word today?
              </p>
            </div>

            {/* T */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg border border-purple-500/30">
                T
              </div>
              <h3 className="text-base font-bold text-white">Theme of the Passage</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                What is the overarching central message and spiritual truth of the passage?
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ─── BIBLE STUDY SECTION ───────────────────────────────── */}
      <section id="bible-study" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">In-Depth Hermeneutics</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
              Go beyond reading. <span className="font-bold">Learn to study God&apos;s Word.</span>
            </h2>
            <p className="text-slate-600 text-base">
              Altar equips believers to engage deeply with Scripture rather than passively consuming text.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Bible Study (PBS) */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  Individual Study
                </span>
                <span className="text-xs text-slate-400 font-bold">PBS Format</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Personal Bible Study</h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80">
                  <h4 className="text-sm font-bold text-slate-900">1. Observation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">What does the text say? Identify literary form, repeated words, time/place references, linking words, and facts.</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80">
                  <h4 className="text-sm font-bold text-slate-900">2. Interpretation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">What does the text mean? Unpack figures of speech, context, cause-and-effect relationships, and original intent.</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80">
                  <h4 className="text-sm font-bold text-slate-900">3. Application</h4>
                  <p className="text-xs text-slate-500 mt-0.5">How does this apply to my life? Formulate concrete, measurable life actions rooted in biblical truth.</p>
                </div>
              </div>
            </div>

            {/* Group Bible Study (GBS) */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  Group Leadership
                </span>
                <span className="text-xs text-slate-400 font-bold">GBS Leader Template</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Group Bible Study</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-900">Approach Question</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Opening scenario to capture group interest.</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-900">Observation Questions</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Who, what, when, where comprehension.</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-900">Interpretation Questions</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Drawing out spiritual meaning and insight.</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-900">Reflective Questions</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Empathy and putting participants in the story.</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-900">Application Questions</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Turning reflection into real-world action.</p>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-900">Central Theme</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Concise summary of the main message.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── PRAYER CELLS SECTION ──────────────────────────────── */}
      <section id="prayer-cells" className="py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Small Group Fellowship</span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
                Your prayer cell, <br />
                <span className="font-bold text-slate-900">together in one place.</span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Small groups form the heartbeat of spiritual encouragement. Altar makes organising and maintaining prayer-cell fellowship effortless:
              </p>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                  <span><b>Structured Roles:</b> Cell Leaders, Cell Parents, Students, Graduates, and Staff.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                  <span><b>Meeting Coordination:</b> Google Meet links, physical venue details, and topics.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                  <span><b>Dedicated Group Chat:</b> Direct, distraction-free messaging for your cell.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                  <span><b>Attendance Logs:</b> Track participant records across weekly gatherings.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              {/* Cell Card Mockup */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg">
                      P
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">PrayerCell 1</h4>
                      <p className="text-xs text-slate-500">Believers Study &bull; Online Gathering</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cell Leader</span>
                    <p className="font-bold text-slate-800 mt-0.5">Leader L</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cell Parent</span>
                    <p className="font-bold text-slate-800 mt-0.5">Parent P</p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Next Gathering</span>
                    <p className="font-bold text-slate-900 mt-0.5">Sunday &bull; 6:00 PM</p>
                  </div>
                  <span className="text-indigo-600 font-bold">Google Meet &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── COMMITTEE & MINISTRY SECTION ──────────────────────── */}
      <section id="committee" className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Ministry Administration</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
              Serve well. <span className="font-bold">Organise faithfully.</span>
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Administration is not the purpose of the ministry — it is the faithful infrastructure that helps people serve effectively and transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Records */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
              <h4 className="text-base font-bold text-slate-900">Official Registries</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maintains Prayer Cell Registry, Membership Registry, College Registry, and Event archives.
              </p>
            </div>

            {/* Events */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
              <h4 className="text-base font-bold text-slate-900">Events & Camps</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Categorised records for EvaCa, MEET, HSS, Bible Seminars, CMTC, DTC, LTC, and general meetings.
              </p>
            </div>

            {/* Treasury */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
              <h4 className="text-base font-bold text-slate-900">Treasury & Offering</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Records state contributions, expenses, member breakdown lists, and attached receipt vouchers.
              </p>
            </div>

            {/* Prayer Secretary */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
              <h4 className="text-base font-bold text-slate-900">Corporate Prayer</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coordinates Dawn Prayer, Dusk Prayer, Monthly Fasting, and community prayer requests.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ─── BIBLE-CENTRED AI SECTION ──────────────────────────── */}
      <section className="py-24 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                <Bot size={14} />
                <span>Scripture Assistant</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white leading-tight">
                AI that points <br />
                <span className="font-bold text-indigo-300">back to Scripture.</span>
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Altar includes a Bible-centred AI assistant designed to help users explore questions through Scripture and biblical truth.
              </p>
              <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 text-slate-300 text-xs leading-relaxed space-y-2">
                <p className="font-semibold text-white">Biblical Integrity & Purpose:</p>
                <p>
                  The goal is not to replace God&apos;s Word, prayer, fellowship or wise Christian counsel. It is to help users engage with Scripture and direct their attention back to God and His truth.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Altar Scripture AI</h4>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Bible Study Companion</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-700/60 rounded-xl text-slate-200 self-end">
                    &ldquo;How does the ASPECT method help me meditate on Romans 8:1?&rdquo;
                  </div>
                  <div className="p-3 bg-indigo-950/60 rounded-xl text-indigo-200 border border-indigo-800/40 leading-relaxed">
                    <p className="font-bold text-indigo-300 mb-1">Romans 8:1 Meditation Guide:</p>
                    <p>&bull; <b>About God:</b> God removes all condemnation for those in Christ Jesus.</p>
                    <p>&bull; <b>Promises:</b> Complete freedom and security in Christ.</p>
                    <p>&bull; <b>Commands:</b> Walk not according to the flesh, but according to the Spirit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── HOW IT WORKS (4 STEPS) ────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Getting Started</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
              How Altar works in four simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <span className="text-2xl font-bold text-slate-300">01</span>
              <h3 className="text-lg font-bold text-slate-900">Start</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create your secure Altar account via Google Sign-In or your personal invite link.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <span className="text-2xl font-bold text-indigo-400">02</span>
              <h3 className="text-lg font-bold text-slate-900">Grow</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build a consistent rhythm of Bible study, quiet time, prayer and personal reflection.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <span className="text-2xl font-bold text-emerald-400">03</span>
              <h3 className="text-lg font-bold text-slate-900">Connect</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Join prayer cells, interactive fellowship feeds, and community discussion channels.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <span className="text-2xl font-bold text-amber-400">04</span>
              <h3 className="text-lg font-bold text-slate-900">Serve</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Participate in and organise committee responsibilities, records, and corporate meetings.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ─── VISION & MISSION SECTION ──────────────────────────── */}
      <section id="vision" className="py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-10 shadow-xl">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Our Foundation</span>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">Our Vision & Mission</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-indigo-300 uppercase tracking-wider">Vision</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  To provide a platform for believers to grow in their personal relationship with God consistently and have interactive fellowship with believers, and thus build a strong Christ-centred community in India.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-emerald-300 uppercase tracking-wider">Mission</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Engage and grow in biblical knowledge daily, attend meetings and discussions for fellowship with fellow believers and encourage each other, organise and maintain details of the activities conducted by the community.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Values:</span>
              <div className="flex justify-center gap-4 mt-2">
                <span className="px-4 py-1.5 rounded-full bg-slate-800 text-indigo-300 text-xs font-bold border border-slate-700">
                  Christ-Centred
                </span>
                <span className="px-4 py-1.5 rounded-full bg-slate-800 text-emerald-300 text-xs font-bold border border-slate-700">
                  Bible-Based
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─── DOWNLOAD CTA SECTION ──────────────────────────────── */}
      <section id="download" className="py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-slate-900">
              Take Altar with you.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Build a consistent rhythm of Scripture, prayer, fellowship and service — wherever you are.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
              >
                <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                <span>Download Altar</span>
              </button>
              <button
                onClick={handleOpenWebApp}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border border-slate-200 shadow-sm flex items-center justify-center gap-2"
              >
                <span>Open Web App</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <Shield size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-900">ALTAR</p>
              <p className="text-xs text-slate-400">Grow in Christ. Walk with His people.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-600">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900">Home</button>
            <button onClick={() => scrollToSection('why-altar')} className="hover:text-slate-900">About</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-900">Features</button>
            <button onClick={() => scrollToSection('aspect')} className="hover:text-slate-900">ASPECT</button>
            <button onClick={() => scrollToSection('bible-study')} className="hover:text-slate-900">Bible Study</button>
            <button onClick={() => scrollToSection('vision')} className="hover:text-slate-900">Vision</button>
            <button onClick={handleDownload} className="hover:text-slate-900">Download</button>
            <button onClick={handleOpenWebApp} className="hover:text-slate-900">Web App</button>
          </div>

          <div className="text-xs text-slate-400 text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} ALTAR &bull; Altar Committee & Fellowship Hub.</p>
            {CONTACT_EMAIL ? (
              <p className="mt-1 font-medium text-indigo-600">{CONTACT_EMAIL}</p>
            ) : (
              <p className="mt-1 font-medium text-slate-400">Christ-Centred &bull; Bible-Based</p>
            )}
          </div>
        </div>
      </footer>


      {/* ─── DOWNLOAD MODAL (IF NO DIRECT URL CONFIGURED) ──────── */}
      <AnimatePresence>
        {showDownloadModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-6 relative"
            >
              <button
                onClick={() => setShowDownloadModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-sm">
                <Download size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Altar is coming to your device soon.</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The Android APK release package is being prepared for direct distribution. In the meantime, you can immediately access the full platform in your browser via the Web Application.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowDownloadModal(false);
                    handleOpenWebApp();
                  }}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-md"
                >
                  Launch Web Application
                </button>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="w-full py-3 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
