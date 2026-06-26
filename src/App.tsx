/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Match } from './types';
import DeviceFrame from './components/DeviceFrame';
import AuthScreen from './components/AuthScreen';
import OnboardingWizard from './components/OnboardingWizard';
import DatingDeck from './components/DatingDeck';
import ProfileDetails from './components/ProfileDetails';
import ChatScreen from './components/ChatScreen';
import DiscoveryFilters from './components/DiscoveryFilters';
import SubscriptionGate from './components/SubscriptionGate';
import AdminDashboard from './components/AdminDashboard';
import { 
  Flame, Heart, MessageSquare, Crown, Sliders, Shield, 
  Settings, LogOut, CheckCircle, Sparkles, MapPin, Bell, X 
} from 'lucide-react';

export default function App() {
  // Cross-platform device chassis simulator state
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('ios');

  // Session & Profiles
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // App views navigation
  const [activeTab, setActiveTab] = useState<'swipe' | 'chats' | 'premium' | 'admin'>('swipe');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  // Sub-detail overlays
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search filter query parameter states
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 35,
    interests: [] as string[],
    location: ''
  });

  // Push notifications state simulation
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null);

  // Initial user loading
  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
        if (data.name && data.photos.length > 0) {
          setIsOnboarded(true);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchDeck = async () => {
    try {
      const query = new URLSearchParams({
        ageMin: String(filters.ageMin),
        ageMax: String(filters.ageMax),
        interests: filters.interests.join(','),
        location: filters.location
      });
      const res = await fetch(`/api/profiles?${query}`);
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      console.error('Error fetching cards deck:', err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOnboarded) {
      fetchDeck();
      fetchMatches();
    }
  }, [isOnboarded, filters]);

  // Handle incoming push notification emulator (e.g. mutual matches or message suggestions)
  useEffect(() => {
    if (!isOnboarded) return;

    // Trigger a fake greeting / tip notification after 15 seconds
    const timer = setTimeout(() => {
      setNotification({
        title: 'Aura Premium Matching Tip 💎',
        body: 'Click "Draft AI Reply" in any chat to instantly generate context-aware icebreakers!'
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, [isOnboarded]);

  const handleSwipe = async (targetId: string, action: 'like' | 'dislike' | 'superlike') => {
    const res = await fetch('/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, action })
    });
    const result = await res.json();
    if (result.isMatch) {
      fetchMatches(); // Refresh matched contacts list
      
      // Trigger instant push notification for Match celebration!
      setNotification({
        title: "💖 It's a Mutual Match!",
        body: `You and ${result.matchedProfile.name} matched. Open chat to send an AI-suggested opener!`
      });
    }
    return result;
  };

  const handleOnboardingComplete = async (partialProfile: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialProfile)
      });
      const data = await res.json();
      if (data.success) {
        setUserProfile(data.profile);
        setIsOnboarded(true);
        setActiveTab('swipe');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async (targetId: string) => {
    try {
      await fetch('/api/user/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId })
      });
      fetchDeck();
      fetchMatches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportUser = async (targetId: string, reason: string, description: string) => {
    try {
      await fetch('/api/user/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, reason, description })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgradeSuccess = (newTier: any) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, subscriptionTier: newTier });
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const activeChatPartner = matches.find(m => m.matchId === activeMatchId)?.partnerProfile;

  // Master auth / onboard layouts routing
  const renderCoreContents = () => {
    if (!isAuthenticated) {
      return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
    }

    if (!isOnboarded) {
      return <OnboardingWizard onComplete={handleOnboardingComplete} />;
    }

    // Detail inspector override
    if (selectedProfile) {
      return (
        <ProfileDetails
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onBlock={handleBlockUser}
          onReport={handleReportUser}
        />
      );
    }

    // Chat room override
    if (activeMatchId && activeChatPartner && userProfile) {
      return (
        <ChatScreen
          matchId={activeMatchId}
          partnerProfile={activeChatPartner}
          userProfile={userProfile}
          onGoBack={() => setActiveMatchId(null)}
        />
      );
    }

    // Drawer Filters overlay
    if (showFilters && userProfile) {
      return (
        <DiscoveryFilters
          userProfile={userProfile}
          activePassport={filters.location}
          onOpenPremium={() => { setShowFilters(false); setActiveTab('premium'); }}
          onApplyFilters={handleApplyFilters}
        />
      );
    }

    // Main tabs rendering
    switch (activeTab) {
      case 'swipe':
        return (
          <DatingDeck
            userProfile={userProfile!}
            profiles={profiles}
            onSwipe={handleSwipe}
            onViewProfileDetails={setSelectedProfile}
            onOpenPremium={() => setActiveTab('premium')}
            passportLocationActive={filters.location}
          />
        );
      case 'chats':
        return (
          <div id="chats_tab_root" className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center select-none text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Vibe Chats</h2>
                <p className="text-xs text-zinc-500">Mutually attractive conversations</p>
              </div>
            </div>

            {/* Match circular launcher bar */}
            {matches.length > 0 && (
              <div className="p-4 border-b border-zinc-900/60 bg-zinc-950/20 text-left">
                <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block mb-3">NEW MUTUAL MATCHES</span>
                <div className="flex space-x-4 overflow-x-auto pb-1 scrollbar-none">
                  {matches.map((m) => (
                    <div 
                      id={`match_bubble_${m.matchId}`}
                      key={m.matchId} 
                      onClick={() => setActiveMatchId(m.matchId)}
                      className="flex flex-col items-center flex-shrink-0 cursor-pointer space-y-1 transform hover:scale-105 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-violet-500 p-0.5">
                        <img src={m.partnerProfile.photos[0]} alt={m.partnerProfile.name} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <span className="text-[10px] text-zinc-300 font-medium">{m.partnerProfile.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat conversations list list */}
            <div className="flex-1 p-4 space-y-3 text-left">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">CONVERSATIONS</span>
              {matches.length === 0 ? (
                <div className="py-20 text-center text-zinc-600">
                  <p className="text-xs">No active chats yet. Keep swiping to find mutual matches!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matches.map((m) => {
                    const hasUnread = m.lastMessage && !m.lastMessage.read && m.lastMessage.senderId !== 'current_user';
                    return (
                      <div
                        id={`chat_row_${m.matchId}`}
                        key={m.matchId}
                        onClick={() => setActiveMatchId(m.matchId)}
                        className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-11 h-11 rounded-full overflow-hidden border border-zinc-800/80 flex-shrink-0">
                            <img src={m.partnerProfile.photos[0]} alt={m.partnerProfile.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="min-w-0 text-left">
                            <h4 className="text-xs font-bold text-white tracking-tight flex items-center space-x-1.5">
                              <span>{m.partnerProfile.name}</span>
                              {m.partnerProfile.verificationStatus === 'verified' && <CheckCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400/10" />}
                            </h4>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                              {m.lastMessage ? m.lastMessage.text : 'Click to send an AI-suggested opener...'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 pl-2">
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {m.lastMessage ? new Date(m.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          {hasUnread && (
                            <span className="block w-2 h-2 rounded-full bg-violet-500 ml-auto mt-1.5 animate-pulse"></span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      case 'premium':
        return (
          <SubscriptionGate
            userProfile={userProfile!}
            onUpgradeSuccess={handleUpgradeSuccess}
            onClose={() => setActiveTab('swipe')}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            onClose={() => setActiveTab('swipe')}
          />
        );
      default:
        return null;
    }
  };

  // Nav actions bar
  const navItems = [
    { id: 'swipe', label: 'Swipe', icon: Heart },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'premium', label: 'Premium', icon: Crown },
    { id: 'admin', label: 'Admin', icon: Shield }
  ];

  return (
    <DeviceFrame activePlatform={platform} onChangePlatform={setPlatform}>
      {/* Real-time Push Notifications banner simulation */}
      {notification && (
        <div 
          id="push_notification_banner"
          className="absolute top-12 left-4 right-4 p-3.5 rounded-2xl bg-zinc-900/95 border-l-4 border-l-violet-500 border border-zinc-800 backdrop-blur-xl z-50 text-left text-xs shadow-2xl flex items-start space-x-2.5 animate-[fadeIn_0.3s_ease-out]"
        >
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-white text-[11px] tracking-tight">{notification.title}</h5>
            <p className="text-zinc-400 text-[10.5px] mt-0.5 leading-relaxed">{notification.body}</p>
          </div>
          <button 
            id="notification_dismiss"
            onClick={() => setNotification(null)} 
            className="text-zinc-600 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main app body viewport frame */}
      <div id="aura_inner_viewport" className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
        
        {/* Core application screen routing */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Static Top Header (shows when authenticated and onboarding complete, except in chat/details/filters) */}
          {isAuthenticated && isOnboarded && !selectedProfile && !activeMatchId && !showFilters && (
            <header id="aura_static_hud_header" className="h-14 px-4 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-violet-500 fill-violet-500/10" />
                <span className="text-sm font-black tracking-widest text-white">AURA</span>
              </div>

              {/* Action triggers */}
              <div className="flex items-center space-x-2">
                <button
                  id="filters_trigger_btn"
                  onClick={() => setShowFilters(true)}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 transition-colors"
                  title="Search filters"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                
                {/* Profile mini-tag preview */}
                <div className="w-8 h-8 rounded-full overflow-hidden border border-violet-500 p-0.5">
                  <img src={userProfile?.photos[0]} alt="You" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
            </header>
          )}

          {renderCoreContents()}
        </div>

        {/* Bottom Tab navigation bar (Only shows when authenticated and onboarding complete, except in active chats/details/filters overrides) */}
        {isAuthenticated && isOnboarded && !selectedProfile && !activeMatchId && !showFilters && (
          <nav id="aura_bottom_nav_bar" className="h-14 bg-zinc-950/95 border-t border-zinc-900/80 flex items-center justify-around px-2 z-10 select-none">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  id={`nav_tab_${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                    active ? 'text-violet-500' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-5.5 h-5.5" />
                  <span className="text-[9px] font-semibold mt-1 font-sans">{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </DeviceFrame>
  );
}
