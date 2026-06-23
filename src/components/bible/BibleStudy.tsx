import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Eye, 
  BookOpen, 
  PenTool, 
  Milestone, 
  Sparkles, 
  ChevronRight, 
  History, 
  Save, 
  Book,
  Table as TableIcon,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  List,
  Users,
  Clock,
  MapPin,
  Link as LinkIcon,
  GitBranch,
  Info,
  Heart,
  HelpCircle as HelpIcon
} from 'lucide-react';
// import { dbService } from '../../services/db'; // Placeholder for future DB integration
import { useAuth } from '../../context/AuthContext';

const BIBLE_VERSIONS = [
  { id: 'KJV', name: 'King James Version' },
  { id: 'NIV', name: 'New International Version' },
  { id: 'ESV', name: 'English Standard Version' },
  { id: 'NLT', name: 'New Living Translation' },
  { id: 'NASB', name: 'New American Standard Bible' },
];

export const BibleStudy: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'PBS' | 'GBS'>('PBS');
  const [pbsStep, setPbsStep] = useState(1);
  const [version, setVersion] = useState('NIV');
  
  // PBS State
  const [pbsData, setPbsData] = useState({
    book: '',
    passage: '',
    date: new Date().toISOString().split('T')[0],
    observation: {
      literaryForm: '',
      repeatedWords: [{ word: '', count: '', ref: '' }],
      timeRefs: [{ word: '', ref: '' }],
      placeRefs: [{ word: '', ref: '' }],
      linkingWords: [{ word: '', count: '', ref: '' }],
      compare: '',
      contrast: '',
      unknownWords: [{ word: '', meaning: '' }],
      figuresOfSpeech: { metaphor: '', simile: '', personification: '' },
      grammarWords: { noun: '', verb: '', tense: '' },
      mood: '',
      factFinding: { who: '', what: '', when: '', where: '', why: '', how: '', so: '' },
      causeEffect: [{ cause: '', effect: '' }]
    },
    interpretation: {
      background: { historical: '', geographical: '', cultural: '', social: '' },
      context: { near: '', far: '' },
      purpose: '',
      meaning: '',
      notes: '',
      themes: ''
    },
    application: {
      aspect: { god: '', sins: '', promises: '', examples: '', commands: '', theme: '' },
      summary: '',
      response: ''
    }
  });

  const handleSave = () => {
    // Optional save log
    console.log('Saved Bible Study:', pbsData);
  };

  const renderPBS = () => {
    switch (pbsStep) {
      case 1: // Header & Initial Observation
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 block">Book & Chapter</label>
                <input 
                  type="text" 
                  value={pbsData.book}
                  onChange={(e) => setPbsData(prev => ({ ...prev, book: e.target.value }))}
                  placeholder="e.g. Romans 8"
                  className="bg-transparent border-b border-slate-200 w-full py-2 text-xl font-serif text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 block">Passage Range</label>
                <input 
                  type="text" 
                  value={pbsData.passage}
                  onChange={(e) => setPbsData(prev => ({ ...prev, passage: e.target.value }))}
                  placeholder="e.g. 1-17"
                  className="bg-transparent border-b border-slate-200 w-full py-2 text-xl font-serif text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-serif text-slate-900">1. Literary Form</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {['Narrative', 'History', 'Discourse', 'Poetry', 'Prophecy', 'Parable'].map(type => (
                  <button
                    key={type}
                    onClick={() => setPbsData(prev => ({ ...prev, observation: { ...prev.observation, literaryForm: type } }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      pbsData.observation.literaryForm === type 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <TableIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-serif text-slate-900">2. Repeated Words / Phrases</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold text-slate-500">
                      <th className="pb-4">Word</th>
                      <th className="pb-4 w-24 text-center">Count</th>
                      <th className="pb-4">Verse Ref</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {[0, 1, 2].map(i => (
                      <tr key={i}>
                        <td className="py-2 pr-4"><input className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="e.g. Grace" /></td>
                        <td className="py-2 pr-4"><input className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full text-sm text-slate-900 text-center focus:outline-none focus:border-indigo-500" placeholder="5" /></td>
                        <td className="py-2"><input className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="v.1, 4" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-serif text-slate-900">3. Time References</h3>
                </div>
                <div className="space-y-4">
                  {[0, 1].map(i => (
                    <div key={i} className="flex gap-3">
                      <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Time word (e.g. Until)" />
                      <input className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Ref" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-serif text-slate-900">4. Place References</h3>
                </div>
                <div className="space-y-4">
                  {[0, 1].map(i => (
                    <div key={i} className="flex gap-3">
                      <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Place word (e.g. Rome)" />
                      <input className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Ref" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <LinkIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-serif text-slate-900">5. Linking / Conjunction Words</h3>
              </div>
              <div className="space-y-4">
                {[0, 1].map(i => (
                  <div key={i} className="flex gap-3">
                    <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Word (e.g. Therefore)" />
                    <input className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Count" />
                    <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Verse Ref" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="h-5 w-5 text-indigo-600" />
                <h3 className="text-xl font-serif text-slate-900">6. Compare / Contrast</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compare (similarities)</label>
                  <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 h-32 resize-none" placeholder="..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contrast (differences)</label>
                  <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 h-32 resize-none" placeholder="..." />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Search className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-serif text-slate-900">7. Unknown Words</h3>
                </div>
                <div className="space-y-4">
                  {[0, 1].map(i => (
                    <div key={i} className="flex gap-3">
                      <input className="w-1/3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Word" />
                      <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Meaning / Definition" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-serif text-slate-900">8. Figures of Speech</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { l: 'Metaphor', p: 'She is the sunshine' },
                    { l: 'Simile', p: 'Like, as like...' },
                    { l: 'Personification', p: 'The earth cries out' }
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-32 text-xs font-bold text-slate-500 uppercase tracking-widest">{f.l}</span>
                      <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder={f.p} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-serif text-slate-900">9. Grammar Words</h3>
                </div>
                <div className="space-y-4">
                  {['Noun', 'Verb', 'Tense'].map((g) => (
                    <div key={g} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-bold text-slate-500 uppercase tracking-widest">{g}</span>
                      <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder={`Significant ${g}s...`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-serif text-slate-900">10. Mood / Tone</h3>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Joyful? Grieving? Tense? Hopeful?</p>
                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 h-24 resize-none" placeholder="Describe the atmosphere..." />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <HelpIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-2xl font-serif text-slate-900">11. Fact-Finding Questions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Who', 'What', 'When', 'Where', 'Why', 'How', 'So'].map(q => (
                  <div key={q} className="flex items-center gap-4">
                    <span className="w-16 text-xs font-bold text-indigo-600 uppercase tracking-widest">{q}</span>
                    <input className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="Answer..." />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <List className="h-6 w-6 text-indigo-600" />
                <h3 className="text-2xl font-serif text-slate-900">12. Cause & Effect</h3>
              </div>
              <div className="space-y-4">
                {[0, 1].map(i => (
                  <div key={i} className="flex gap-4 flex-col sm:flex-row">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cause</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="The action..." />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Effect</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" placeholder="The consequence..." />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 2: // Interpretation
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                <h3 className="text-2xl font-serif text-slate-900">Background Study</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { id: 'historical', label: 'Historical Context', sub: 'The world events & timeline' },
                  { id: 'geographical', label: 'Geographical Context', sub: 'Location significance' },
                  { id: 'cultural', label: 'Cultural Context', sub: 'Beliefs & traditions' },
                  { id: 'social', label: 'Social Context', sub: 'Family, roles, challenges' }
                ].map(item => (
                  <div key={item.id} className="space-y-2">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{item.label}</label>
                    <p className="text-[10px] text-slate-500 leading-tight italic">{item.sub}</p>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 resize-none"
                      rows={3}
                      placeholder="..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 3: // Application
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'god', label: 'A: About God', p: 'Reveal about His character?' },
                { id: 'sins', label: 'S: Sins to avoid', p: 'Specific sins mentioned?' },
                { id: 'promises', label: 'P: Promises to claim', p: 'What can we anchor on?' },
                { id: 'examples', label: 'E: Examples to follow', p: 'Whose faith to emulate?' },
                { id: 'commands', label: 'C: Commands to obey', p: 'Steps of obedience?' },
                { id: 'theme', label: 'T: Theme', p: 'Core message of the passage?' },
              ].map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                  <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{item.label}</label>
                  <p className="text-[10px] text-slate-500 italic leading-tight">{item.p}</p>
                  <textarea className="w-full bg-transparent border-b border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-600 py-2 resize-none" rows={4} />
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
              <PenTool className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-3xl font-light tracking-tight text-slate-900 leading-tight">Bible Study</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Deep Work in the Word</p>
            </div>
          </div>
          
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit">
            <button 
              onClick={() => setActiveTab('PBS')}
              className={`px-6 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'PBS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              PBS Template
            </button>
            <button 
              onClick={() => setActiveTab('GBS')}
              className={`px-6 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'GBS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              GBS Leader
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <select 
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 sm:px-8 py-3 pr-12 text-sm font-bold text-slate-700 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shadow-sm"
            >
              {BIBLE_VERSIONS.map(v => (
                <option key={v.id} value={v.id} className="bg-white">{v.name} ({v.id})</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>
          <button 
            onClick={handleSave}
            className="bg-slate-900 px-6 sm:px-8 py-3 rounded-xl text-sm font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Study
          </button>
        </div>
      </div>

      {activeTab === 'PBS' ? (
        <div className="space-y-8 flex-1">
          {/* Step Progress */}
          <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-slate-50 rounded-3xl border border-slate-100">
            {[1, 2, 3].map(step => (
              <button
                key={step}
                onClick={() => setPbsStep(step)}
                className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${
                  pbsStep === step ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center text-[7px] sm:text-[8px] border ${
                  pbsStep === step ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-300"
                }`}>
                  {step}
                </span>
                {step === 1 ? 'Observation' : step === 2 ? 'Interpretation' : 'Application'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={pbsStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPBS()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center pt-8 border-t border-slate-100">
            <button 
              disabled={pbsStep === 1}
              onClick={() => setPbsStep(s => s - 1)}
              className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-all"
            >
              Previous Section
            </button>
            <button 
              disabled={pbsStep === 3}
              onClick={() => setPbsStep(s => s + 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-0"
            >
              Next Section <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 flex-1">
           <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-indigo-600" />
                <h3 className="text-2xl font-serif text-slate-900">GBS Leader Template</h3>
              </div>
              <p className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Guide your group deeper</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  { q: '1. Approach Question', d: 'An opening question or scenario to capture interest' },
                  { q: '2. Observation Questions', d: 'Basic comprehension (Who, What, When, Where...)' },
                  { q: '3. Interpretation Questions', d: 'To draw out meaning & insight (What does ___ mean?)' }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{item.q}</label>
                    <p className="text-[10px] text-slate-500 leading-tight italic">{item.d}</p>
                    <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-300 resize-none placeholder:text-slate-400" placeholder="Type your questions here..." />
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                 {[
                  { q: '4. Reflective Questions', d: 'To place participants in the story (How would you feel...?)' },
                  { q: '5. Application Questions', d: 'Turning reflection into real action' },
                  { q: '6. Title / Theme', d: 'Concise 1-2 word title summarizing main message' }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{item.q}</label>
                    <p className="text-[10px] text-slate-500 leading-tight italic">{item.d}</p>
                    <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-300 resize-none placeholder:text-slate-400" placeholder="Type your questions here..." />
                  </div>
                ))}
              </div>
            </div>
           </div>
        </div>
      )}
    </div>
  );
};
