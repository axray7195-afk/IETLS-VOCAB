
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { IELTS_VOCABULARY } from './constants';
import { VocabularyWord } from './types';

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Logic to select 10 words based on the current day of the month
  const dailyWords = useMemo(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    // We now have 40 words, so we pick a block of 10.
    // (dayOfMonth % 4) will be 0, 1, 2, or 3.
    const startIdx = (dayOfMonth % 4) * 10;
    return IELTS_VOCABULARY.slice(startIdx, startIdx + 10);
  }, []);

  const currentWord: VocabularyWord = dailyWords[currentIndex];

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text to speech!");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => 
      v.lang.startsWith('en-GB') || v.name.includes('United Kingdom') || v.name.includes('Google UK')
    );

    if (ukVoice) {
      utterance.voice = ukVoice;
    }
    
    utterance.lang = 'en-GB';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const handleNext = () => {
    if (currentIndex < dailyWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  const formattedDate = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(new Date());

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center flex flex-col items-center gap-6 border border-indigo-100 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Goal Met!</h2>
          <p className="text-slate-500">
            Fantastic work! You've mastered your 10 words for today. Consistency is the key to a high IELTS band score.
          </p>
          <div className="w-full h-px bg-slate-100 my-2"></div>
          <p className="text-indigo-600 font-semibold text-sm">See you tomorrow for 10 new words!</p>
          <button 
            onClick={handleReset}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 mt-4"
          >
            Review Today's Words
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      {/* Header */}
      <div className="w-full max-w-md mb-6 px-2">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-2xl font-black text-indigo-900 leading-none">IELTS Daily</h1>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-tighter mt-1">{formattedDate}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block mb-1">GOAL REACHED</span>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= currentIndex ? 'bg-indigo-600' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Word Card */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-indigo-50 flex flex-col min-h-[500px] transition-all duration-500 transform">
        {/* Top Gradient Header */}
        <div className={`bg-gradient-to-br p-8 text-white relative transition-colors duration-500 ${currentWord.category === 'Essential Basic' ? 'from-emerald-600 to-teal-700' : 'from-indigo-600 to-violet-700'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                {currentWord.category}
              </span>
            </div>
            <div className="text-xs font-bold text-white/60">
              WORD {currentIndex + 1} OF 10
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-5xl font-black tracking-tight mb-2 break-words">{currentWord.word}</h2>
            <div className="flex items-center gap-2">
              <span className="text-indigo-100/80 font-mono text-lg">{currentWord.phonetic}</span>
              <button 
                onClick={() => speak(currentWord.word)}
                disabled={isSpeaking}
                className={`p-2 rounded-full transition-all ${
                  isSpeaking ? 'bg-white/40 scale-90' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <svg className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex-grow flex flex-col justify-between">
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-[0.2em]">The Definition</h3>
              <p className="text-slate-800 text-xl font-medium leading-relaxed">
                {currentWord.meaning}
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-[0.2em]">Contextual Example</h3>
              <div className="relative">
                <div className={`absolute -left-4 top-0 bottom-0 w-1 rounded-full opacity-20 ${currentWord.category === 'Essential Basic' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <p className="text-slate-600 text-base italic leading-relaxed pl-2">
                  "{currentWord.example}"
                </p>
              </div>
            </section>
          </div>

          {/* Controls */}
          <div className="mt-10 flex gap-4">
            <button 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`p-4 rounded-2xl flex items-center justify-center transition-all border ${
                currentIndex === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-400 active:scale-90'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={handleNext}
              className={`flex-grow py-4 font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group text-white ${currentWord.category === 'Essential Basic' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-black'}`}
            >
              {currentIndex === dailyWords.length - 1 ? 'Finish Challenge' : 'Next Word'}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 7l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 flex gap-8 text-slate-400">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Target</span>
          <span className="text-sm font-bold text-slate-600">Band 8.0+</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Set</span>
          <span className="text-sm font-bold text-slate-600">Daily 10</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Accent</span>
          <span className="text-sm font-bold text-slate-600">RP British</span>
        </div>
      </div>
    </div>
  );
};

export default App;
