/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, Gender, SubscriptionTier, VerificationStatus } from '../types';
import { Sparkles, MapPin, Briefcase, GraduationCap, Check, Camera, ShieldCheck, Heart, User } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

const INTEREST_PRESETS = [
  'Photography', 'Travel', 'Modern Art', 'Hiking', 'Sushi', 'Yoga', 'Vinyl Records',
  'Design', 'Tech', 'Tacos', 'Craft Beer', 'Dogs', 'Cinema', 'Cooking', 'Camping',
  'Road Trips', 'Hot Sauce', 'Tennis', 'Skiing', 'Cycling', 'Startup Ideas', 'Espresso'
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Alex Mercer');
  const [age, setAge] = useState(26);
  const [gender, setGender] = useState<'male' | 'female' | 'nonbinary'>('male');
  const [seeking, setSeeking] = useState<Gender>('female');
  const [location, setLocation] = useState('San Francisco, CA');
  
  const [occupation, setOccupation] = useState('Product Designer');
  const [education, setEducation] = useState('RISD (BFA)');
  const [bio, setBio] = useState('Lead Product Designer who loves matcha lattes, brutalist architecture, and searching for the perfect record store. Looking for someone to explore hidden cafes with!');
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Coffee', 'Design', 'Vinyl Records']);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600');
  
  // Verification states
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationPose, setVerificationPose] = useState('Raise your right hand in a peace sign ✌️');

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleVerificationScan = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerificationSuccess(true);
    }, 2800); // Simulated Face mesh/landmark scans
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete
      onComplete({
        name,
        age,
        gender,
        seeking,
        location,
        occupation,
        education,
        bio,
        interests: selectedInterests,
        photos: [photoUrl],
        verificationStatus: verificationSuccess ? 'verified' : 'unverified'
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div id="onboarding_wizard_root" className="flex-1 flex flex-col justify-between px-6 py-6 bg-zinc-950 overflow-y-auto">
      {/* Top indicator bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs text-zinc-500 font-mono mb-2">
          <span className="text-violet-400">PROFILE BUILDER</span>
          <span>STEP {step} OF 5</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main step container */}
      <div className="flex-1 my-auto">
        {step === 1 && (
          <div id="onboarding_step_1" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>The Basics</span>
                <Heart className="w-5 h-5 text-violet-500 animate-pulse" />
              </h2>
              <p className="text-xs text-zinc-500">Let’s lay down the foundation of your profile card</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">First Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    id="onboard_name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Age</label>
                  <input
                    id="onboard_age"
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      id="onboard_loc"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">My Gender</label>
                  <select
                    id="onboard_gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-300"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="nonbinary">Non-Binary</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Show Me</label>
                  <select
                    id="onboard_seeking"
                    value={seeking}
                    onChange={(e) => setSeeking(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-300"
                  >
                    <option value="female">Women</option>
                    <option value="male">Men</option>
                    <option value="everyone">Everyone</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div id="onboarding_step_2" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>About Your Life</span>
                <Briefcase className="w-5 h-5 text-violet-500" />
              </h2>
              <p className="text-xs text-zinc-500">Provide bio context to enrich matching rates</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    id="onboard_occ"
                    type="text"
                    placeholder="e.g. Architect, Software Engineer"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Education</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3 w-4.5 h-4.5 text-zinc-500" />
                  <input
                    id="onboard_edu"
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Bio / Description</label>
                <textarea
                  id="onboard_bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div id="onboarding_step_3" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>Interests & Vibes</span>
                <Sparkles className="w-5 h-5 text-violet-500" />
              </h2>
              <p className="text-xs text-zinc-500">Pick tags for AI compatibility scoring & suggestions</p>
            </div>

            <div className="pt-2">
              <div className="flex flex-wrap gap-1.5 max-h-[320px] overflow-y-auto p-1 border border-zinc-900 rounded-xl bg-zinc-950/40">
                {INTEREST_PRESETS.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button
                      id={`tag_${interest.toLowerCase().replace(/\s+/g, '_')}`}
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selected
                          ? 'bg-violet-600/25 border-violet-500 text-violet-300 border shadow-sm'
                          : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800/60 hover:text-zinc-200'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-600 font-mono mt-3 text-center">Selected {selectedInterests.length} tags</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div id="onboarding_step_4" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>Identity Verification</span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </h2>
              <p className="text-xs text-zinc-500">Verify your photo to earn an exclusive verification badge</p>
            </div>

            <div className="flex flex-col items-center justify-center py-3">
              {/* Selfie scanning box */}
              <div className="relative w-44 h-44 rounded-2xl border-2 border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center overflow-hidden mb-4 shadow-xl">
                {verifying ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-zinc-950/85">
                    <div className="w-12 h-12 rounded-full border-2 border-t-2 border-t-violet-500 border-zinc-800 animate-spin mb-3"></div>
                    <span className="text-[10px] font-mono tracking-wider text-violet-400 text-center uppercase">Scanning face mesh...</span>
                  </div>
                ) : verificationSuccess ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/90 text-center p-4 z-10">
                    <ShieldCheck className="w-14 h-14 text-emerald-400 mb-2 animate-bounce" />
                    <span className="text-xs font-semibold text-emerald-300">Identity Verified</span>
                    <span className="text-[9px] font-mono text-emerald-500 mt-1 uppercase">100% Match Verified</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Camera className="w-10 h-10 text-zinc-500 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Selfie camera ready</span>
                  </div>
                )}
                {/* Photo profile clip */}
                <img 
                  src={photoUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover opacity-60" 
                />
                
                {/* Animated scanning line overlay */}
                {verifying && (
                  <div className="absolute left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_8px_#8b5cf6] animate-[bounce_2s_infinite]"></div>
                )}
              </div>

              {!verificationSuccess && (
                <div className="text-center max-w-sm space-y-3">
                  <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">Assigned Pose</p>
                    <p className="text-xs font-semibold text-zinc-200">{verificationPose}</p>
                  </div>
                  <button
                    id="trigger_verification_btn"
                    onClick={handleVerificationScan}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg border border-zinc-700 transition-all flex items-center space-x-2 mx-auto"
                  >
                    <Camera className="w-3.5 h-3.5 text-violet-400" />
                    <span>Launch Verification Camera</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div id="onboarding_step_5" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>Profile Photo</span>
                <Camera className="w-5 h-5 text-violet-500" />
              </h2>
              <p className="text-xs text-zinc-500">Provide an attractive portrait photo for other users to see</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-center">
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-violet-500 ring-4 ring-violet-500/10">
                  <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Unsplash Portrait URL</label>
                <input
                  id="avatar_url_input"
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:outline-none text-xs text-zinc-400 font-mono"
                />
                
                {/* Seed presets list */}
                <div className="flex justify-around pt-2">
                  <button
                    id="select_avatar_1_btn"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600')}
                    className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white hover:border-violet-500 transition-all"
                  >
                    Portrait 1 (Casual Man)
                  </button>
                  <button
                    id="select_avatar_2_btn"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600')}
                    className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white hover:border-violet-500 transition-all"
                  >
                    Portrait 2 (Alternative)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between border-t border-zinc-900 pt-5 mt-6">
        <button
          id="onboard_back_btn"
          onClick={handleBack}
          disabled={step === 1}
          className="px-4 py-2 rounded-xl text-zinc-500 text-xs font-semibold hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-500 transition-all"
        >
          Back
        </button>

        <button
          id="onboard_next_btn"
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold shadow-md shadow-violet-600/10 transition-all flex items-center space-x-1"
        >
          <span>{step === 5 ? 'Complete Profile' : 'Continue'}</span>
        </button>
      </div>
    </div>
  );
}
