/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Message, UserProfile, Match } from '../types';
import { 
  Send, Mic, Image, Video, Phone, ArrowLeft, Sparkles, 
  Smile, ShieldAlert, CheckCheck, Play, Pause, X, AlertCircle, Camera 
} from 'lucide-react';

interface ChatScreenProps {
  matchId: string;
  partnerProfile: UserProfile;
  userProfile: UserProfile;
  onGoBack: () => void;
}

export default function ChatScreen({ matchId, partnerProfile, userProfile, onGoBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  // Voice note recorder simulation
  const [recording, setRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recIntervalRef = useRef<any>(null);

  // Playing audio states
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  // Simulated image attachments
  const [showImageMock, setShowImageMock] = useState(false);
  const [mockSelectedImg, setMockSelectedImg] = useState('');

  // AI Assistant integration
  const [aiHelperOpen, setAiHelperOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  // Simulated Video Call Overlay
  const [videoCallState, setVideoCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callIntervalRef = useRef<any>(null);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages initially and poll for simulated partner replies
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}/messages`);
      const list = await res.json();
      setMessages(list);
    } catch (err) {
      console.error('Error fetching chat:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 1.5 seconds for incoming simulated partner replies (typing indicator sync)
    const interval = setInterval(() => {
      fetchMessages();
    }, 1500);

    return () => clearInterval(interval);
  }, [matchId]);

  // Handle auto scrolling
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // Simulate typing indicator when user sends a message
  useEffect(() => {
    // If the last message was sent by 'current_user', trigger typing indicator for 2 seconds
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.senderId === 'current_user') {
      setPartnerTyping(true);
      const timer = setTimeout(() => {
        setPartnerTyping(false);
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Send textual/generic message
  const handleSendMessage = async (textToSend?: string, customType?: 'text' | 'image' | 'voice', voiceDuration?: number, imageUrl?: string) => {
    const textContent = textToSend !== undefined ? textToSend : inputText;
    if (!textContent && !imageUrl) return;

    try {
      const payload = {
        text: textContent,
        type: customType || 'text',
        voiceDuration,
        imageUrl
      };

      const res = await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const userMsg = await res.json();
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setMockSelectedImg('');
      setShowImageMock(false);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Trigger AI Copilot suggested response based on chat history
  const handleGetAiReplySuggestion = async () => {
    setAiLoading(true);
    setAiHelperOpen(true);
    setAiSuggestions([]);
    try {
      const res = await fetch(`/api/matches/${matchId}/ai-reply-helper`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.suggestedReply) {
        setAiSuggestions([data.suggestedReply]);
        setAiExplanation(`Aura AI analyzed ${partnerProfile.name}'s bio and your chat history to draft this witty, context-aware reply.`);
      } else {
        setAiSuggestions(['Hey! I love your photo, let’s go out sometime!']);
      }
    } catch (err) {
      console.error('AI assistant failed:', err);
      setAiSuggestions(['That sounds incredible! Tell me more?']);
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger AI Icebreaker sugestions list
  const handleGetAiIcebreakers = async () => {
    setAiLoading(true);
    setAiHelperOpen(true);
    setAiSuggestions([]);
    try {
      const res = await fetch(`/api/matches/${matchId}/ai-icebreakers`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.icebreakers) {
        setAiSuggestions(data.icebreakers);
        setAiExplanation(`Custom conversational templates crafted to target mutual vibes.`);
      }
    } catch (err) {
      console.error('AI icebreakers failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Voice recording triggers
  const handleStartRecording = () => {
    setRecording(true);
    setRecordDuration(0);
    recIntervalRef.current = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
  };

  const handleStopRecordingAndSend = () => {
    clearInterval(recIntervalRef.current);
    setRecording(false);
    if (recordDuration > 0) {
      handleSendMessage(`Sent a voice message (${recordDuration}s)`, 'voice', recordDuration);
    }
  };

  // Video calling triggers
  const handleStartVideoCall = () => {
    setVideoCallState('calling');
    setTimeout(() => {
      setVideoCallState('connected');
      setCallDuration(0);
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 2500); // 2.5s simulated connection delay
  };

  const handleEndVideoCall = () => {
    clearInterval(callIntervalRef.current);
    setVideoCallState('idle');
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const selectSuggested = (reply: string) => {
    setInputText(reply);
    setAiHelperOpen(false);
  };

  return (
    <div id="chat_screen_root" className="flex-1 flex flex-col bg-zinc-950 relative h-full">
      
      {/* Top Chat HUD bar */}
      <header id="chat_hud_bar" className="h-16 px-4 border-b border-zinc-900/80 bg-zinc-950/95 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <button
            id="chat_back_btn"
            onClick={onGoBack}
            className="p-1.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800">
              <img src={partnerProfile.photos[0]} alt={partnerProfile.name} className="w-full h-full object-cover" />
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 ${
              partnerProfile.onlineStatus === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'
            }`}></div>
          </div>

          <div className="text-left">
            <p className="text-xs font-semibold text-white tracking-tight">{partnerProfile.name}</p>
            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
              {partnerTyping ? 'Typing...' : (partnerProfile.onlineStatus === 'online' ? 'Online' : 'Away')}
            </p>
          </div>
        </div>

        {/* Video & Phone Call simulation */}
        <div className="flex items-center space-x-1">
          <button
            id="chat_video_trigger_btn"
            onClick={handleStartVideoCall}
            className="p-2.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            id="chat_phone_trigger_btn"
            onClick={handleStartVideoCall}
            className="p-2.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title="Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating AI Conversation Co-pilot Trigger banner */}
      <div className="px-4 py-2 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 font-medium flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-500 fill-violet-500/10" />
          <span>Aura AI Chat Co-pilot Active</span>
        </span>
        <div className="flex space-x-1.5">
          <button
            id="ai_suggest_reply_btn"
            onClick={handleGetAiReplySuggestion}
            className="px-2.5 py-1 rounded bg-violet-600/10 hover:bg-violet-600/20 text-[9.5px] font-bold text-violet-300 border border-violet-500/20 transition-all cursor-pointer"
          >
            Draft AI Reply
          </button>
          <button
            id="ai_get_icebreakers_btn"
            onClick={handleGetAiIcebreakers}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-[9.5px] font-bold text-zinc-300 border border-zinc-800 transition-all cursor-pointer"
          >
            Icebreakers
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div id="messages_scroll_box" className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
            <AlertCircle className="w-6 h-6 text-zinc-700 mb-2 animate-bounce" />
            <p className="text-xs">No messages yet. Send an AI opener to get started!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === 'current_user';
          return (
            <div 
              id={`message_bubble_${msg.id}`}
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-normal relative ${
                isMe 
                  ? 'bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-600/5' 
                  : 'bg-zinc-900 text-zinc-200 rounded-bl-none border border-zinc-800/60'
              }`}>
                {/* Image messages rendering */}
                {msg.type === 'image' && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                    <img src={msg.imageUrl} alt="Attached attachment" className="max-w-full h-auto object-cover" />
                  </div>
                )}

                {/* Voice note message rendering with custom play toggle */}
                {msg.type === 'voice' ? (
                  <div className="flex items-center space-x-3.5 py-1 font-sans select-none">
                    <button
                      id={`play_voice_btn_${msg.id}`}
                      onClick={() => setPlayingMsgId(playingMsgId === msg.id ? null : msg.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isMe ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-violet-600/10 hover:bg-violet-600/20 text-violet-400'
                      }`}
                    >
                      {playingMsgId === msg.id ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>
                    
                    {/* Simulated Voice note wave bar */}
                    <div className="flex-1 flex items-center space-x-0.5 h-6">
                      <div className={`w-0.5 h-3 rounded-full ${playingMsgId === msg.id ? 'bg-violet-400 animate-pulse' : (isMe ? 'bg-white/30' : 'bg-zinc-600')}`}></div>
                      <div className={`w-0.5 h-5 rounded-full ${playingMsgId === msg.id ? 'bg-violet-400 animate-pulse' : (isMe ? 'bg-white/30' : 'bg-zinc-600')}`}></div>
                      <div className={`w-0.5 h-4 rounded-full ${playingMsgId === msg.id ? 'bg-violet-400 animate-pulse' : (isMe ? 'bg-white/30' : 'bg-zinc-600')}`}></div>
                      <div className={`w-0.5 h-2 rounded-full ${playingMsgId === msg.id ? 'bg-violet-400 animate-pulse' : (isMe ? 'bg-white/30' : 'bg-zinc-600')}`}></div>
                      <div className={`w-0.5 h-5 rounded-full ${playingMsgId === msg.id ? 'bg-violet-400 animate-pulse' : (isMe ? 'bg-white/30' : 'bg-zinc-600')}`}></div>
                    </div>
                    
                    <span className="text-[10px] font-mono text-zinc-400">{msg.voiceDuration}s</span>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}

                {/* Micro timestamps */}
                <div className="flex justify-end items-center space-x-1.5 mt-1.5 text-[8.5px] text-zinc-400">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-sky-400" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Partner Typing status preview */}
        {partnerTyping && (
          <div id="partner_typing_container" className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl px-4 py-2.5 rounded-bl-none text-xs flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        <div ref={listEndRef} />
      </div>

      {/* Floating Image Preset Selection Panel (simulates choosing a photo) */}
      {showImageMock && (
        <div id="image_mock_selector" className="absolute bottom-20 left-4 right-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 z-20 space-y-3.5">
          <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
            <span>Choose Image to Send</span>
            <button onClick={() => setShowImageMock(false)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setMockSelectedImg('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300');
                handleSendMessage('Sent a coffee snapshot ☕', 'image', undefined, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300');
              }}
              className="h-16 rounded-xl overflow-hidden border border-zinc-800 focus:border-violet-500 relative"
            >
              <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=150" alt="Coffee" className="w-full h-full object-cover" />
            </button>
            <button
              onClick={() => {
                setMockSelectedImg('https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=300');
                handleSendMessage('Hiking view! 🏔️', 'image', undefined, 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=300');
              }}
              className="h-16 rounded-xl overflow-hidden border border-zinc-800 focus:border-violet-500 relative"
            >
              <img src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=150" alt="Mountain" className="w-full h-full object-cover" />
            </button>
            <button
              onClick={() => {
                setMockSelectedImg('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300');
                handleSendMessage('Drafting code at a cafe 💻', 'image', undefined, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300');
              }}
              className="h-16 rounded-xl overflow-hidden border border-zinc-800 focus:border-violet-500 relative"
            >
              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=150" alt="Work" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      )}

      {/* Main chat input panel */}
      <footer id="chat_input_panel" className="p-3 bg-zinc-950 border-t border-zinc-900/80 flex items-center space-x-2">
        {recording ? (
          <div className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-full bg-rose-950/20 border border-rose-500/25">
            <span className="flex items-center space-x-1.5 text-xs text-rose-400 font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Recording simulated audio...</span>
            </span>
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-mono text-rose-300">{formatDuration(recordDuration)}</span>
              <button
                id="voice_recording_stop_btn"
                onClick={handleStopRecordingAndSend}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-[10px] font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              id="attachment_image_btn"
              onClick={() => setShowImageMock(!showImageMock)}
              className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Attach photo preset"
            >
              <Image className="w-4.5 h-4.5" />
            </button>

            <button
              id="recorder_voice_btn"
              onClick={handleStartRecording}
              className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Record voice note"
            >
              <Mic className="w-4.5 h-4.5" />
            </button>

            <input
              id="chat_text_input"
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-xs text-zinc-200"
            />

            <button
              id="chat_send_submit_btn"
              onClick={() => handleSendMessage()}
              className="p-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-all shadow shadow-violet-600/10"
              title="Send Text"
            >
              <Send className="w-4 h-4 fill-white/10" />
            </button>
          </>
        )}
      </footer>

      {/* SIDEBAR CO-PILOT ASSISTANT PANEL */}
      {aiHelperOpen && (
        <div id="ai_copilot_sidebar" className="absolute inset-0 bg-zinc-950/95 z-40 p-6 flex flex-col justify-between overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
          <div className="space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5 font-mono">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>AURA AI CO-PILOT</span>
              </span>
              <button onClick={() => setAiHelperOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-2 border-t-violet-500 border-zinc-800 animate-spin"></div>
                <span className="text-[10px] font-mono tracking-wider text-violet-400 uppercase">Consulting Gemini-3.5-Flash...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-violet-600/5 border border-violet-500/10 text-zinc-300 text-xs leading-relaxed space-y-1">
                  <div className="text-[10px] text-violet-400 font-bold uppercase tracking-wider font-mono">Co-pilot Logic</div>
                  <p>{aiExplanation}</p>
                </div>

                <div className="space-y-2">
                  {aiSuggestions.map((reply, i) => (
                    <button
                      id={`copilot_suggestion_${i}`}
                      key={i}
                      onClick={() => selectSuggested(reply)}
                      className="w-full text-left p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-violet-500 text-zinc-300 text-xs transition-all leading-relaxed flex items-start space-x-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0"></span>
                      <span>{reply}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            id="ai_copilot_close_btn"
            onClick={() => setAiHelperOpen(false)}
            className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-400 text-xs font-semibold"
          >
            Go Back to Chat
          </button>
        </div>
      )}

      {/* FULL-SCREEN VIDEO CALL SIMULATOR OVERLAY */}
      {videoCallState !== 'idle' && (
        <div id="video_call_overlay" className="absolute inset-0 bg-zinc-950 z-50 flex flex-col justify-between p-6">
          {videoCallState === 'calling' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet-500 animate-pulse">
                  <img src={partnerProfile.photos[0]} alt={partnerProfile.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-ping"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Calling {partnerProfile.name}...</h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">ESTABLISHING ENCRYPTED PEER-TO-PEER AUDIO/VIDEO</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative rounded-3xl overflow-hidden border border-zinc-900 bg-zinc-900">
              {/* Partner video feeds (main viewport) */}
              <img 
                src={partnerProfile.photos[0]} 
                alt={partnerProfile.name} 
                className="w-full h-full object-cover brightness-95" 
              />
              
              {/* Selfie video feeds PIP (picture-in-picture) */}
              {!cameraOff && (
                <div className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-950">
                  <img src={userProfile.photos[0]} alt="Selfie feed" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Call timing metrics overlay */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-zinc-950/70 backdrop-blur border border-zinc-800/60 text-[10px] text-zinc-300 font-mono">
                {formatDuration(callDuration)} • HD AUDIO/VIDEO
              </div>

              {/* Call context controls HUD */}
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center space-x-4">
                <button
                  id="call_mute_toggle"
                  onClick={() => setMicMuted(!micMuted)}
                  className={`p-3.5 rounded-full transition-all border ${
                    micMuted ? 'bg-zinc-800 border-zinc-700 text-rose-400' : 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-800 text-white'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  id="call_end_btn"
                  onClick={handleEndVideoCall}
                  className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-all shadow shadow-rose-600/10"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  id="call_camera_toggle"
                  onClick={() => setCameraOff(!cameraOff)}
                  className={`p-3.5 rounded-full transition-all border ${
                    cameraOff ? 'bg-zinc-800 border-zinc-700 text-rose-400' : 'bg-zinc-950/80 hover:bg-zinc-900 border-zinc-800 text-white'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
