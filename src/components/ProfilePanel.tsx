import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase';
import { signInWithEmail, signOut, checkPremiumStatus, getDeviceId } from '../utils/auth';
import { mergeCloudHistory } from '../utils/cloudSync';
import { getStats } from '../utils/gamification';
import { User, SignOut, EnvelopeSimple, Crown, CloudArrowUp, CloudCheck, Spinner, Copy, Check } from '@phosphor-icons/react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const ProfilePanel: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [email, setEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    setDeviceId(getDeviceId());

    // Check premium (device-based, no login needed)
    checkPremiumStatus().then(setIsPremium);

    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) mergeCloudHistory(u.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Broadcast premium status
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('premium-status-changed', {
      detail: { isPremium, userId: user?.id || null }
    }));
  }, [isPremium, user]);

  const handleLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setMessage('');

    const { error } = await signInWithEmail(email.trim());
    setMessage(error || 'Link login terkirim! Cek inbox/spam.');
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setShowLogin(false);
  };

  const handleSync = async () => {
    if (!user || syncing) return;
    setSyncing(true);
    await mergeCloudHistory(user.id);
    setSyncing(false);
    setSynced(true);
    setTimeout(() => setSynced(false), 2000);
  };

  const copyDeviceId = async () => {
    await navigator.clipboard.writeText(`app:inglify device:${deviceId}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const [level, setLevel] = useState(1);
  useEffect(() => {
    setLevel(getStats().level);
  }, [isPremium]);

  // Not logged in
  if (!user) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
        {!showLogin ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-gray-100 transition-colors"
            >
              <User size={16} weight="duotone" className="text-blue-400" />
              <span>Login untuk sync & pro</span>
            </button>
            {isPremium && (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <Crown size={12} weight="fill" /> Pro
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} weight="duotone" className="text-blue-400" />
                <span className="text-sm font-medium text-gray-200">Login</span>
              </div>
              <button onClick={() => setShowLogin(false)} className="text-[11px] text-gray-500 hover:text-gray-300">
                Batal
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <EnvelopeSimple size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@kamu.com"
                  className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading || !email.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs rounded-md transition-colors shrink-0"
              >
                {loading ? <Spinner size={14} className="animate-spin" /> : 'Kirim'}
              </button>
            </div>
            {message && (
              <p className={`text-[11px] ${message.includes('terkirim') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}

            {/* Device ID for Trakteer payment */}
            <div className="pt-2 border-t border-gray-700">
              <p className="text-[10px] text-gray-500 mb-1">Device ID (sertakan di pesan Trakteer untuk aktifkan Pro):</p>
              <div className="flex items-center gap-2">
                <code className="text-[10px] text-gray-400 bg-gray-700 px-2 py-1 rounded font-mono truncate flex-1">
                  app:inglify device:{deviceId}
                </code>
                <button onClick={copyDeviceId} className="p-1 text-gray-500 hover:text-blue-400 shrink-0">
                  {copiedId ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged in
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center">
            <User size={14} weight="bold" className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-gray-200 truncate max-w-[150px]">
                {user.email?.split('@')[0]}
              </span>
              {isPremium && <Crown size={12} weight="fill" className="text-orange-400" />}
            </div>
            <span className="text-[10px] text-gray-500">
              {isPremium ? 'Pro' : 'Free'} · Lv.{level}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`p-2 rounded-md transition-colors ${
              synced ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
            }`}
            title="Sync riwayat ke cloud"
          >
            {syncing ? <Spinner size={16} className="animate-spin" /> :
             synced ? <CloudCheck size={16} weight="fill" /> :
             <CloudArrowUp size={16} />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
            title="Logout"
          >
            <SignOut size={16} />
          </button>
        </div>
      </div>

      {/* Device ID */}
      {!isPremium && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-[10px] text-gray-500 mb-1">Upgrade Pro — sertakan di pesan Trakteer:</p>
          <div className="flex items-center gap-2">
            <code className="text-[10px] text-gray-400 bg-gray-700 px-2 py-1 rounded font-mono truncate flex-1">
              app:inglify device:{deviceId}
            </code>
            <button onClick={copyDeviceId} className="p-1 text-gray-500 hover:text-blue-400 shrink-0">
              {copiedId ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePanel;
