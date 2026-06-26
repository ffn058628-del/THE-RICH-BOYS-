/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, ShieldCheck, MapPin, Briefcase, GraduationCap, Flag, Shield, Sparkles, MessageCircleCode } from 'lucide-react';

interface ProfileDetailsProps {
  profile: UserProfile;
  onClose: () => void;
  onBlock: (targetId: string) => void;
  onReport: (targetId: string, reason: string, description: string) => void;
}

export default function ProfileDetails({ profile, onClose, onBlock, onReport }: ProfileDetailsProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Offensive Content');
  const [reportDetails, setReportDetails] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReport(profile.id, reportReason, reportDetails);
    setSuccessMsg('Report submitted successfully to the moderation queue.');
    setTimeout(() => {
      setSuccessMsg('');
      setReportModalOpen(false);
    }, 2000);
  };

  const handleBlockUser = () => {
    onBlock(profile.id);
    onClose();
  };

  return (
    <div id="profile_details_container" className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto relative animate-[fadeIn_0.2s_ease-out]">
      {/* Photo Gallery Carousels */}
      <div className="relative h-96 bg-zinc-900 overflow-hidden">
        <img 
          src={profile.photos[activePhotoIndex]} 
          alt={profile.name} 
          className="w-full h-full object-cover" 
        />
        
        {/* Dark elegant top/bottom overlays */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-zinc-950/80 to-transparent pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"></div>

        {/* Floating Close Button */}
        <button
          id="profile_details_close_btn"
          onClick={onClose}
          className="absolute top-4 left-4 p-2.5 rounded-full bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 backdrop-blur-md text-zinc-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Picture index indicators */}
        {profile.photos.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-10">
            {profile.photos.map((_, index) => (
              <button
                id={`carousel_dot_${index}`}
                key={index}
                onClick={() => setActivePhotoIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === activePhotoIndex ? 'w-4 bg-violet-500' : 'bg-zinc-500'
                }`}
              ></button>
            ))}
          </div>
        )}
      </div>

      {/* Main details block */}
      <div className="px-6 py-6 space-y-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">{profile.name}, {profile.age}</h2>
            {profile.verificationStatus === 'verified' && (
              <ShieldCheck className="w-6 h-6 text-sky-400 fill-sky-400/10 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-violet-500" />
            <span>{profile.location}</span>
          </div>
        </div>

        {/* AI Insight banner if score is present */}
        {profile.matchScore && (
          <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 space-y-1">
            <div className="flex items-center space-x-1.5 text-violet-400 text-[10px] font-bold font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>Aura AI Compatibility Note</span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">{profile.compatibilityNotes || 'Analyzing mutual interests...'}</p>
          </div>
        )}

        {/* Education, Career, details */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/60 space-y-3.5 text-xs text-zinc-300">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-4 h-4 text-zinc-500" />
            <div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase">OCCUPATION</p>
              <p className="font-semibold text-zinc-200">{profile.occupation}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-4.5 h-4.5 text-zinc-500" />
            <div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase">EDUCATION</p>
              <p className="font-semibold text-zinc-200">{profile.education}</p>
            </div>
          </div>
        </div>

        {/* Bio segment */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">Bio</h3>
          <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900/50">
            {profile.bio}
          </p>
        </div>

        {/* Interests presets */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">Interests</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <span 
                key={interest} 
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Trust/Block and Report Actions Footer */}
        <div className="pt-6 border-t border-zinc-900/60 flex items-center justify-between">
          <button
            id="profile_report_trigger_btn"
            onClick={() => setReportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 transition-colors"
          >
            <Flag className="w-4 h-4 text-rose-500" />
            <span>Report User</span>
          </button>

          <button
            id="profile_block_trigger_btn"
            onClick={handleBlockUser}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 transition-colors"
          >
            <Shield className="w-4 h-4 text-zinc-500" />
            <span>Block User</span>
          </button>
        </div>
      </div>

      {/* REPORT CONTEXT MODAL OVERLAY */}
      {reportModalOpen && (
        <div id="report_modal_overlay" className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md z-50 p-6 flex flex-col justify-center">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 max-w-sm mx-auto w-full">
            <h3 className="text-lg font-bold text-white">Report {profile.name}</h3>
            
            {successMsg ? (
              <p className="text-xs text-emerald-400 font-medium">{successMsg}</p>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Reason</label>
                  <select
                    id="report_reason_select"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-violet-500 focus:outline-none text-xs text-zinc-300"
                  >
                    <option value="Offensive Content">Offensive Content / Bio</option>
                    <option value="Financial Scam/Spam">Financial Scam / Bot / Spam</option>
                    <option value="Harassment">Harassment / Abusive messages</option>
                    <option value="Fake Profile">Impersonation / Fake Profile</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Additional Details</label>
                  <textarea
                    id="report_desc_input"
                    rows={3}
                    placeholder="Provide specific details about why you are reporting this account..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-violet-500 focus:outline-none text-xs text-zinc-300 resize-none"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    id="report_cancel_btn"
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    id="report_submit_btn"
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
