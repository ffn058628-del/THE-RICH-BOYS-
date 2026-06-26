/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SystemStats, UserProfile, Report } from '../types';
import { 
  BarChart, Users, AlertTriangle, ShieldCheck, DollarSign, 
  Trash2, Eye, Ban, CheckCircle, Search, Sparkles, X, Activity, RefreshCw 
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  // AI Fake profile audit overlay
  const [auditingProfileId, setAuditingProfileId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/reports')
      ]);

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setReports(await reportsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlockUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-block`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'resolve' | 'block' | 'dismiss') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerAiFakeAudit = async (profileId: string) => {
    setAuditingProfileId(profileId);
    setAuditLoading(true);
    setAuditResult(null);

    try {
      const res = await fetch(`/api/profiles/${profileId}/fake-audit`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin_dashboard_root" className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto p-6 relative">
      
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-6 select-none">
        <div className="text-left">
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-1.5">
            <Activity className="w-5 h-5 text-violet-500 animate-pulse" />
            <span>Admin Control Panel</span>
          </h2>
          <p className="text-xs text-zinc-500">System metrics, report audits, and AI fake scanners</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            id="admin_refresh_btn"
            onClick={fetchAdminData}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="admin_close_btn"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Exit Dashboard
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-2 border-t-violet-500 border-zinc-800 animate-spin"></div>
          <span className="text-[10px] font-mono tracking-wider text-violet-400 uppercase">Polling Express stats...</span>
        </div>
      ) : (
        <div className="space-y-8 text-left">
          {/* Metrics dashboard panels bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 text-left space-y-1.5 shadow">
              <div className="flex items-center space-x-1.5 text-zinc-500">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider">TOTAL MEMBERS</span>
              </div>
              <p className="text-2xl font-black text-white font-mono">{stats?.totalUsers || 13}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 text-left space-y-1.5 shadow">
              <div className="flex items-center space-x-1.5 text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider">ACTIVE MATCHES</span>
              </div>
              <p className="text-2xl font-black text-white font-mono">{stats?.totalMatches || 2}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 text-left space-y-1.5 shadow">
              <div className="flex items-center space-x-1.5 text-zinc-500">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider">OPEN REPORTS</span>
              </div>
              <p className="text-2xl font-black text-rose-400 font-mono">{stats?.activeReports || 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 text-left space-y-1.5 shadow">
              <div className="flex items-center space-x-1.5 text-zinc-500">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider">SALES REVENUE</span>
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">${stats?.revenue.toFixed(2) || '1845.50'}</p>
            </div>
          </div>

          {/* Graphical custom SVG Revenue trends meter */}
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">Plan Tier Distributions</h3>
            
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1">
                <div className="bg-zinc-900 rounded-lg h-20 flex items-end justify-center p-1 relative overflow-hidden border border-zinc-850">
                  <div className="bg-zinc-750 w-full rounded" style={{ height: '35%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Free</span>
              </div>
              <div className="space-y-1">
                <div className="bg-zinc-900 rounded-lg h-20 flex items-end justify-center p-1 relative overflow-hidden border border-zinc-850">
                  <div className="bg-blue-500 w-full rounded" style={{ height: '20%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Plus</span>
              </div>
              <div className="space-y-1">
                <div className="bg-zinc-900 rounded-lg h-20 flex items-end justify-center p-1 relative overflow-hidden border border-zinc-850">
                  <div className="bg-amber-500 w-full rounded" style={{ height: '55%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Gold</span>
              </div>
              <div className="space-y-1">
                <div className="bg-zinc-900 rounded-lg h-20 flex items-end justify-center p-1 relative overflow-hidden border border-zinc-850">
                  <div className="bg-violet-600 w-full rounded" style={{ height: '40%' }}></div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Platinum</span>
              </div>
            </div>
          </div>

          {/* Reports Moderation Queue list */}
          {reports.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Reports Moderation Queue</span>
              </h3>

              <div className="space-y-3">
                {reports.map((rep) => (
                  <div 
                    id={`report_card_${rep.id}`}
                    key={rep.id} 
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono">
                          {rep.reason}
                        </span>
                        <span className="text-zinc-500 text-[10px] font-mono">{rep.id}</span>
                      </div>
                      
                      <p className="text-zinc-300 font-sans">
                        Reported User:{' '}
                        <strong className="text-white hover:underline cursor-pointer" onClick={() => {
                          const target = users.find(u => u.id === rep.reportedId);
                          if (target) setSelectedUser(target);
                        }}>
                          {rep.reportedName}
                        </strong>{' '}
                        by {rep.reporterName}
                      </p>
                      
                      <p className="text-[11px] text-zinc-500 italic">"{rep.description}"</p>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        id={`report_ai_audit_btn_${rep.id}`}
                        onClick={() => handleTriggerAiFakeAudit(rep.reportedId)}
                        className="px-2.5 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 rounded-lg text-xs font-bold border border-violet-500/15 flex items-center space-x-1 cursor-pointer"
                        title="Scan with Gemini AI"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                        <span>AI Scan</span>
                      </button>

                      <button
                        id={`report_block_btn_${rep.id}`}
                        onClick={() => handleResolveReport(rep.id, 'block')}
                        className="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/25 text-rose-400 rounded-lg text-xs font-semibold border border-rose-500/15 cursor-pointer"
                      >
                        Block
                      </button>

                      <button
                        id={`report_dismiss_btn_${rep.id}`}
                        onClick={() => handleResolveReport(rep.id, 'dismiss')}
                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 rounded-lg text-xs font-semibold border border-zinc-750 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Directory Management list */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Dating User Directory</span>
            </h3>

            {/* Simple Search filter field */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                id="admin_user_search"
                type="text"
                placeholder="Search profiles by name, occupation, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredUsers.map((user) => (
                <div 
                  id={`admin_user_item_${user.id}`}
                  key={user.id} 
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0">
                      <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white">{user.name}, {user.age}</span>
                        {user.verificationStatus === 'verified' && <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-zinc-500">{user.occupation} • {user.location}</p>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      id={`admin_user_inspect_${user.id}`}
                      onClick={() => setSelectedUser(user)}
                      className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                      title="Inspect Profile info"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`admin_user_audit_${user.id}`}
                      onClick={() => handleTriggerAiFakeAudit(user.id)}
                      className="p-1.5 rounded bg-violet-600/10 hover:bg-violet-600/20 text-violet-400"
                      title="Run Gemini Fraud Check"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`admin_user_block_${user.id}`}
                      onClick={() => handleToggleBlockUser(user.id)}
                      className="p-1.5 rounded bg-rose-600/10 hover:bg-rose-600/20 text-rose-400"
                      title="Toggle Suspend / Ban"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED USER INSPECTOR OVERLAY PANEL */}
      {selectedUser && (
        <div id="inspector_user_overlay" className="absolute inset-0 bg-zinc-950/95 backdrop-blur z-50 p-6 flex flex-col justify-center">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 max-w-sm mx-auto w-full text-left">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white">Inspect User: {selectedUser.name}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3.5 py-2 border-b border-zinc-800/60 pb-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-zinc-800">
                <img src={selectedUser.photos[0]} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">{selectedUser.name}, {selectedUser.age}</p>
                <p className="text-zinc-500 font-mono uppercase tracking-widest text-[9px] mt-0.5">ID: {selectedUser.id}</p>
                <p className="text-zinc-400 mt-1">{selectedUser.occupation}</p>
              </div>
            </div>

            <div className="text-xs text-zinc-300 leading-relaxed space-y-2">
              <p><strong>Bio:</strong> "{selectedUser.bio}"</p>
              <p><strong>Interests:</strong> {selectedUser.interests.join(', ')}</p>
              <p><strong>Verified Badge:</strong> {selectedUser.verificationStatus === 'verified' ? 'YES (Verified Mesh)' : 'NO'}</p>
              <p><strong>System Classification:</strong> {selectedUser.isFake ? 'Marked Fake (Demo Trigger)' : 'Verified organic User'}</p>
            </div>

            <button
              id="user_inspect_close_btn"
              onClick={() => setSelectedUser(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-semibold"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* GEMINI AI FAKE AUDIT REPORT MODAL */}
      {auditingProfileId && (
        <div id="fake_audit_overlay" className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md z-50 p-6 flex flex-col justify-center">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-violet-500/20 space-y-4 max-w-sm mx-auto w-full text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5 font-mono">
                <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
                <span>GEMINI PROFILE AUDIT CO-PILOT</span>
              </span>
              <button onClick={() => setAuditingProfileId(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {auditLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-2 border-t-violet-500 border-zinc-800 animate-spin"></div>
                <span className="text-[10px] font-mono tracking-wider text-violet-400 uppercase">Analyzing safety indices...</span>
              </div>
            ) : (
              auditResult && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-mono">Verdict Index:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        auditResult.isSuspicious 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {auditResult.isSuspicious ? 'FLAGGED HIGH ALERT' : 'SAFETY VERIFIED'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-mono">Suspicion Score:</span>
                      <span className={`font-mono font-bold text-sm ${
                        auditResult.suspicionScore > 60 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {auditResult.suspicionScore}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-zinc-400 font-mono text-[10px] uppercase">Audit rationale:</span>
                      <p className="text-zinc-300 leading-relaxed font-sans">{auditResult.reason}</p>
                    </div>
                  </div>

                  {auditResult.isSuspicious && (
                    <button
                      id="audit_quick_ban_btn"
                      onClick={() => {
                        handleToggleBlockUser(auditingProfileId);
                        setAuditingProfileId(null);
                      }}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-1.5 cursor-pointer shadow"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Immediately Suspend Spammer</span>
                    </button>
                  )}
                </div>
              )
            )}

            <button
              id="fake_audit_close_btn"
              onClick={() => setAuditingProfileId(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 rounded-xl text-xs font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
