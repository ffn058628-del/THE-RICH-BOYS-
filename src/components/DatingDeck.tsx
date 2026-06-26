/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Match } from '../types';
import { Heart, X, Star, RotateCcw, ShieldCheck, MapPin, Briefcase, GraduationCap, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface DatingDeckProps {
  userProfile: UserProfile;
  profiles: UserProfile[];
  onSwipe: (targetId: string, action: 'like' | 'dislike' | 'superlike') => Promise<{ isMatch: boolean; match?: Match; matchedProfile?: UserProfile; aiOpeners?: string[] }>;
  onViewProfileDetails: (profile: UserProfile) => void;
  onOpenPremium: () => void;
  passportLocationActive: string;
}

export default function DatingDeck({ 
  userProfile, 
  profiles, 
  onSwipe, 
  onViewProfileDetails, 
  onOpenPremium,
  passportLocationActive 
}: DatingDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]); // Stack of swiped indices
  const [matchOverlay, setMatchOverlay] = useState<{
    visible: boolean;
    partnerProfile?: UserProfile;
    matchId?: string;
    aiOpeners?: string[];
  }>({ visible: false });

  const [swipeDirect, setSwipeDirect] = useState<'left' | 'right' | 'up' | 'none'>('none');
  const [showAiInsightId, setShowAiInsightId] = useState<string | null>(null);

  const activeProfile = profiles[currentIndex];

  // Reset index when profiles list changes or is filtered
  useEffect(() => {
    setCurrentIndex(0);
    setHistory([]);
  }, [profiles]);

  const handleAction = async (action: 'like' | 'dislike' | 'superlike') => {
    if (!activeProfile) return;

    // Check premium limits for Super Like / Rewind
    const tier = userProfile.subscriptionTier;
    if (action === 'superlike' && tier === 'free') {
      onOpenPremium();
      return;
    }

    setSwipeDirect(action === 'like' ? 'right' : action === 'dislike' ? 'left' : 'up');

    setTimeout(async () => {
      try {
        const res = await onSwipe(activeProfile.id, action);
        
        setHistory([...history, currentIndex]);
        setCurrentIndex(currentIndex + 1);
        setSwipeDirect('none');

        if (res.isMatch && res.matchedProfile) {
          setMatchOverlay({
            visible: true,
            partnerProfile: res.matchedProfile,
            matchId: res.match?.id,
            aiOpeners: res.aiOpeners
          });
        }
      } catch (err) {
        console.error('Swipe action failed:', err);
        setSwipeDirect('none');
      }
    }, 450);
  };

  const handleRewind = () => {
    const tier = userProfile.subscriptionTier;
    if (tier === 'free') {
      onOpenPremium();
      return;
    }

    if (history.length === 0) return;

    const previousIndex = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentIndex(previousIndex);
  };

  if (!activeProfile) {
    return (
      <div id="deck_empty_state" className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12 bg-zinc-950">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100">Deck Cleared!</h3>
        <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">
          You've swiped on everyone in your area. Try resetting search filters, or use the <span className="text-violet-400 font-semibold cursor-pointer" onClick={onOpenPremium}>Passport</span> premium feature to change location globally!
        </p>
        <button
          id="deck_empty_passport_btn"
          onClick={onOpenPremium}
          className="mt-6 px-5 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600/20 text-violet-300 text-xs font-semibold transition-all"
        >
          Change Location with Passport
        </button>
      </div>
    );
  }

  return (
    <div id="dating_deck_container" className="flex-1 flex flex-col justify-between p-4 bg-zinc-950 overflow-hidden relative">
      {/* Cards Deck Container */}
      <div className="flex-1 flex items-center justify-center relative mt-2 select-none">
        
        {/* Underlay card shadow (background card vibe) */}
        {profiles[currentIndex + 1] && (
          <div className="absolute w-[94%] h-[94%] rounded-3xl bg-zinc-900/50 border border-zinc-800/40 opacity-55 transform translate-y-3 pointer-events-none scale-98"></div>
        )}

        {/* Primary swiping card */}
        <div 
          id={`swipe_card_${activeProfile.id}`}
          onClick={(e) => {
            // Avoid clicks on floating action triggers
            const target = e.target as HTMLElement;
            if (!target.closest('.no-details-expand')) {
              onViewProfileDetails(activeProfile);
            }
          }}
          className={`relative w-full max-w-[360px] h-[520px] rounded-3xl overflow-hidden border border-zinc-800/60 bg-zinc-900 shadow-2xl transition-all duration-300 cursor-pointer ${
            swipeDirect === 'left' ? 'translate-x-[-150%] rotate-[-20deg] opacity-0 scale-95' :
            swipeDirect === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0 scale-95' :
            swipeDirect === 'up' ? 'translate-y-[-150%] opacity-0 scale-95' : 'translate-x-0 rotate-0 scale-100'
          }`}
        >
          {/* Main profile image */}
          <img 
            src={activeProfile.photos[0]} 
            alt={activeProfile.name} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
          />

          {/* Dark elegant gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>

          {/* Top Info HUD Bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
            {/* Active Passport HUD pill */}
            {passportLocationActive && (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-950/75 backdrop-blur-md border border-zinc-800 text-[10px] text-amber-400 font-medium font-mono uppercase">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>PASSPORT: {passportLocationActive}</span>
              </div>
            )}

            {/* AI compatibility score badge */}
            <button
              id={`ai_insight_trigger_${activeProfile.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowAiInsightId(showAiInsightId === activeProfile.id ? null : activeProfile.id);
              }}
              className="no-details-expand ml-auto flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600/95 to-fuchsia-600/95 border border-violet-500/30 text-[10.5px] font-semibold text-white shadow-lg shadow-violet-600/10 hover:scale-105 transition-transform cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-white fill-white/10" />
              <span>{activeProfile.matchScore || 85}% Match</span>
            </button>
          </div>

          {/* AI compatibility popup details */}
          {showAiInsightId === activeProfile.id && (
            <div 
              id="ai_insight_popup"
              className="no-details-expand absolute top-14 right-4 left-4 p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-violet-500/20 z-20 text-zinc-200 text-xs shadow-xl animate-[fadeIn_0.2s_ease-out]"
            >
              <div className="flex items-center space-x-1.5 mb-1 text-violet-400 font-semibold font-mono uppercase text-[9.5px]">
                <Sparkles className="w-3 h-3 text-violet-500" />
                <span>AURA CO-PILOT ANALYSIS</span>
              </div>
              <p className="text-zinc-300 leading-relaxed font-sans">{activeProfile.compatibilityNotes || 'Analyzing mutual interests...'}</p>
              <div className="flex justify-end pt-2">
                <span 
                  onClick={() => setShowAiInsightId(null)}
                  className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  Got it
                </span>
              </div>
            </div>
          )}

          {/* Swipe indicator text HUD */}
          {swipeDirect === 'right' && (
            <div className="absolute top-1/4 left-8 -rotate-12 border-4 border-emerald-500 text-emerald-500 text-3xl font-black px-6 py-1.5 rounded-xl uppercase tracking-widest pointer-events-none z-10">
              LIKE
            </div>
          )}
          {swipeDirect === 'left' && (
            <div className="absolute top-1/4 right-8 rotate-12 border-4 border-rose-500 text-rose-500 text-3xl font-black px-6 py-1.5 rounded-xl uppercase tracking-widest pointer-events-none z-10">
              NOPE
            </div>
          )}
          {swipeDirect === 'up' && (
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 -rotate-6 border-4 border-violet-500 text-violet-500 text-3xl font-black px-4 py-1.5 rounded-xl uppercase tracking-widest pointer-events-none z-10">
              SUPER LIKE
            </div>
          )}

          {/* Bottom Card details */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end text-left z-10 pointer-events-none">
            {/* Header info */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white tracking-tight">{activeProfile.name}, {activeProfile.age}</span>
              {activeProfile.verificationStatus === 'verified' && (
                <ShieldCheck className="w-5.5 h-5.5 text-sky-400 fill-sky-400/10 flex-shrink-0" title="Verified Member" />
              )}
            </div>

            {/* Subtitles: career */}
            <div className="flex flex-col space-y-1 mt-1 text-xs text-zinc-300 font-medium">
              <div className="flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                <span>{activeProfile.occupation}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                <span>{activeProfile.education}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{activeProfile.location}</span>
              </div>
            </div>

            {/* Interest tag micro-chips list */}
            <div className="flex flex-wrap gap-1 mt-4">
              {activeProfile.interests.slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="px-2.5 py-1 rounded-full bg-zinc-950/60 border border-zinc-800/40 text-[10px] font-medium text-zinc-400"
                >
                  {tag}
                </span>
              ))}
              {activeProfile.interests.length > 3 && (
                <span className="px-2 py-1 rounded-full bg-zinc-950/60 border border-zinc-800/40 text-[9px] font-semibold text-zinc-500 font-mono">
                  +{activeProfile.interests.length - 3} MORE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Actions Floating HUD Controls */}
      <div id="deck_actions_row" className="flex items-center justify-center space-x-3.5 pt-4 pb-2">
        {/* Rewind/Undo Button */}
        <button
          id="deck_rewind_btn"
          onClick={handleRewind}
          disabled={history.length === 0}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-amber-500 disabled:opacity-35 disabled:hover:bg-zinc-900 transition-all shadow-md active:scale-95"
          title="Rewind/Undo Dismissal"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>

        {/* Dislike/Nope Button */}
        <button
          id="deck_dislike_btn"
          onClick={() => handleAction('dislike')}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-rose-500 shadow-md active:scale-90 transition-all duration-200"
          title="Nope / Dislike"
        >
          <X className="w-7 h-7" />
        </button>

        {/* Super Like Button */}
        <button
          id="deck_superlike_btn"
          onClick={() => handleAction('superlike')}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-violet-400 shadow-md active:scale-90 transition-all duration-200"
          title="Super Like"
        >
          <Star className="w-5 h-5 fill-violet-500/10" />
        </button>

        {/* Like/Heart Button */}
        <button
          id="deck_like_btn"
          onClick={() => handleAction('like')}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 shadow-lg shadow-emerald-500/5 active:scale-90 transition-all duration-200"
          title="Like Profile"
        >
          <Heart className="w-7 h-7 fill-emerald-500/10" />
        </button>
      </div>

      {/* FULL-SCREEN MUTUAL MATCH CELEBRATION MODAL */}
      {matchOverlay.visible && matchOverlay.partnerProfile && (
        <div 
          id="match_celebration_overlay"
          className="absolute inset-0 bg-zinc-950/95 z-50 flex flex-col justify-between p-6 overflow-y-auto animate-[fadeIn_0.3s_ease-out]"
        >
          {/* Confetti particles mock */}
          <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-pink-500 animate-bounce"></div>
            <div className="absolute top-20 right-20 w-3 h-3 rounded-full bg-violet-400 animate-ping"></div>
            <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></div>
          </div>

          <div className="text-center mt-12 space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              IT'S A MATCH!
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              You and {matchOverlay.partnerProfile.name} are mutually attracted to each other's vibe.
            </p>
          </div>

          {/* Overlapping circular profile photos */}
          <div className="flex items-center justify-center my-8 relative h-40">
            <div className="w-28 h-28 rounded-full border-4 border-zinc-950 shadow-xl overflow-hidden absolute translate-x-[-30px] z-10 rotate-[-6deg]">
              <img src={userProfile.photos[0]} alt="You" className="w-full h-full object-cover" />
            </div>
            <div className="w-28 h-28 rounded-full border-4 border-zinc-950 shadow-xl overflow-hidden absolute translate-x-[30px] z-20 rotate-[6deg]">
              <img src={matchOverlay.partnerProfile.photos[0]} alt={matchOverlay.partnerProfile.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 z-30 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-amber-500 text-[10px] font-bold text-white shadow border border-violet-500/20 font-mono uppercase">
              {matchOverlay.partnerProfile.matchScore || 85}% Vibe Match
            </div>
          </div>

          {/* AI-Generated Icebreaker recommendations box */}
          <div className="px-4 py-4 rounded-2xl bg-zinc-900 border border-violet-500/15 max-w-sm mx-auto space-y-3 shadow-lg">
            <div className="flex items-center space-x-1.5 text-violet-400 text-[10px] font-bold font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
              <span>AURA AI ICEBREAKERS SUGGESTION</span>
            </div>
            
            <div className="space-y-2">
              {matchOverlay.aiOpeners && matchOverlay.aiOpeners.map((opener, i) => (
                <button
                  id={`icebreaker_option_${i}`}
                  key={i}
                  onClick={async () => {
                    // Send message immediately
                    await fetch(`/api/matches/${matchOverlay.matchId}/messages`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: opener, type: 'text' })
                    });
                    setMatchOverlay({ visible: false });
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-violet-500 text-zinc-300 text-[11px] leading-relaxed transition-all cursor-pointer hover:bg-zinc-950/80 flex items-start space-x-2"
                >
                  <ArrowRight className="w-3 h-3 text-violet-500 mt-1 flex-shrink-0" />
                  <span>{opener}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-2.5 max-w-sm mx-auto w-full pb-8">
            <button
              id="match_dismiss_keep_swiping"
              onClick={() => setMatchOverlay({ visible: false })}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-all"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
