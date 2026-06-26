/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, Gender } from '../types';
import { Sliders, MapPin, Sparkles, Filter, Check, Crown } from 'lucide-react';

interface DiscoveryFiltersProps {
  userProfile: UserProfile;
  onApplyFilters: (filters: {
    ageMin: number;
    ageMax: number;
    interests: string[];
    location?: string;
  }) => void;
  onOpenPremium: () => void;
  activePassport: string;
}

const PASSPORT_PRESETS = [
  'Tokyo, Japan 🇯🇵',
  'Paris, France 🇫🇷',
  'London, United Kingdom 🇬🇧',
  'New York, USA 🇺🇸'
];

export default function DiscoveryFilters({ userProfile, onApplyFilters, onOpenPremium, activePassport }: DiscoveryFiltersProps) {
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(35);
  const [selectedLocation, setSelectedLocation] = useState(activePassport || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleApply = () => {
    onApplyFilters({
      ageMin,
      ageMax,
      interests: selectedInterests,
      location: selectedLocation || undefined
    });
  };

  const handlePassportSelect = (loc: string) => {
    if (userProfile.subscriptionTier === 'free') {
      onOpenPremium();
      return;
    }
    // Select location toggle
    if (selectedLocation === loc) {
      setSelectedLocation('');
    } else {
      setSelectedLocation(loc);
    }
  };

  const toggleInterestFilter = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(t => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const INTEREST_FILTERS = ['Photography', 'Travel', 'Modern Art', 'Hiking', 'Sushi', 'Dogs', 'Tech'];

  return (
    <div id="filters_drawer_container" className="flex-1 flex flex-col justify-between px-6 py-6 bg-zinc-950 overflow-y-auto">
      <div className="space-y-6 text-left">
        <div className="flex items-center space-x-2 border-b border-zinc-900 pb-4">
          <Sliders className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-bold text-white">Discovery Filters</h2>
        </div>

        {/* Passport / Location section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Dating Passport</span>
            </span>
            {userProfile.subscriptionTier === 'free' && (
              <span 
                onClick={onOpenPremium}
                className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold tracking-wider uppercase flex items-center space-x-1 cursor-pointer hover:bg-amber-500/20 transition-all"
              >
                <Crown className="w-2.5 h-2.5 mr-0.5" />
                <span>Plus Feature</span>
              </span>
            )}
          </div>
          
          <div className="space-y-1.5">
            {PASSPORT_PRESETS.map((loc) => {
              const active = selectedLocation === loc;
              return (
                <button
                  id={`passport_loc_${loc.split(',')[0].toLowerCase()}`}
                  key={loc}
                  onClick={() => handlePassportSelect(loc)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                    active
                      ? 'bg-violet-600/10 border-violet-500 text-violet-300 shadow-sm'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span>{loc}</span>
                  {active && <Check className="w-4 h-4 text-violet-400" />}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-zinc-600 leading-normal">
            Passport allows you to unlock matches anywhere in the world instantly. Toggle back off to return local.
          </p>
        </div>

        {/* Age Range Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
            <span>Age Range Filter</span>
            <span className="text-violet-400 font-bold">{ageMin} – {ageMax} Years</span>
          </div>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase">Min Age</span>
                <input
                  id="filter_min_age_input"
                  type="range"
                  min="18"
                  max="50"
                  value={ageMin}
                  onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax - 2))}
                  className="w-full accent-violet-500 bg-zinc-900 h-1 rounded"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase">Max Age</span>
                <input
                  id="filter_max_age_input"
                  type="range"
                  min="18"
                  max="50"
                  value={ageMax}
                  onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin + 2))}
                  className="w-full accent-violet-500 bg-zinc-900 h-1 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specific Interests filter */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Common Interests</span>
          </span>

          <div className="flex flex-wrap gap-1.5">
            {INTEREST_FILTERS.map((interest) => {
              const active = selectedInterests.includes(interest);
              return (
                <button
                  id={`filter_tag_${interest.toLowerCase()}`}
                  key={interest}
                  onClick={() => toggleInterestFilter(interest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-violet-600/25 border-violet-500 text-violet-300 shadow-sm'
                      : 'bg-zinc-900/60 text-zinc-500 border-zinc-800/80 hover:text-zinc-200'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-900/85 mt-6">
        <button
          id="filters_apply_btn"
          onClick={handleApply}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-md shadow-violet-600/10 transition-all uppercase tracking-wider"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
