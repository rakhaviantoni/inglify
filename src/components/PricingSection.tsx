import React, { useState, useEffect } from 'react';
import { Check, X, Crown, Sparkle, ArrowsClockwise, BookOpen, Trophy, Lightning } from '@phosphor-icons/react';
import { getDeviceId } from '../utils/auth';

const PricingSection: React.FC = () => {
  const [trakteerUrl, setTrakteerUrl] = useState('https://trakteer.id/rakhaviantoni?quantity=3');

  useEffect(() => {
    const deviceId = getDeviceId();
    const msg = encodeURIComponent(`app:inglify device:${deviceId}`);
    setTrakteerUrl(`https://trakteer.id/rakhaviantoni?quantity=3&message=${msg}`);
  }, []);
  return (
    <div id="pricing-section" className="bg-gray-800 rounded-lg border border-gray-700 p-5 mt-6">
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Crown size={20} weight="duotone" className="text-orange-400" />
          <h3 className="text-lg font-bold text-gray-100">Inglify Pro</h3>
        </div>
        <p className="text-xs text-gray-400">Buka semua fitur premium</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Free */}
        <div className="rounded-lg border border-gray-700 p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-1">Free</h4>
          <p className="text-xs text-gray-500 mb-3">Gratis selamanya</p>
          <ul className="space-y-2">
            <FeatureRow included text="6 gaya terjemahan" />
            <FeatureRow included text="70+ bahasa target" />
            <FeatureRow included text="Voice input & text-to-speech" />
            <FeatureRow included text="Riwayat terjemahan (lokal)" />
            <FeatureRow included text="Gamifikasi (XP, level, streak)" />
            <FeatureRow included text="Tantangan harian" />
            <FeatureRow included={false} text="Gaya slang, puitis, akademis, marketing" />
            <FeatureRow included={false} text="Regenerate per gaya (unlimited)" />
            <FeatureRow included={false} text="Global leaderboard" />
            <FeatureRow included={false} text="Phrasebook unlimited" />
          </ul>
        </div>

        {/* Pro */}
        <div className="rounded-lg border border-orange-400/30 bg-orange-400/5 p-4 relative">
          <div className="absolute -top-2.5 right-3">
            <span className="text-[10px] px-2 py-0.5 bg-orange-500 text-white rounded-full font-medium">Populer</span>
          </div>
          <h4 className="text-sm font-semibold text-orange-400 mb-1">Pro</h4>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl font-bold text-gray-100">Rp15.000</span>
            <span className="text-xs text-gray-500">lifetime</span>
          </div>
          <ul className="space-y-2">
            <FeatureRow included text="Semua fitur Free" />
            <FeatureRow included text="10 gaya terjemahan (+ slang, puitis, akademis, marketing)" />
            <FeatureRow included text="Regenerate unlimited per gaya" />
            <FeatureRow included text="Global leaderboard" />
            <FeatureRow included text="Phrasebook unlimited" />
            <FeatureRow included text="Cloud sync riwayat" />
            <FeatureRow included text="Tanpa iklan (soon)" />
            <FeatureRow included text="Priority support via DM" />
          </ul>

          <a
            href={trakteerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Sparkle size={14} weight="fill" />
            Upgrade via Trakteer
          </a>
          <p className="text-[10px] text-gray-500 text-center mt-2">
            3 unit kopi = Pro lifetime
          </p>
        </div>
      </div>

      {/* Support info */}
      <div className="text-center p-2 border-t border-gray-700 mt-1">
        <p className="text-xs text-gray-500">
          Ada pertanyaan? Hubungi{' '}
          <a href="https://instagram.com/rakhaviantoni" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300">@rakhaviantoni</a>
          {' '}atau email{' '}
          <a href="mailto:halo@rakhaviantoni.com" className="text-blue-400 hover:text-blue-300">halo@rakhaviantoni.com</a>
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-700">
        <FeatureHighlight icon={<Sparkle size={16} weight="duotone" className="text-orange-400" />} label="10 gaya" />
        <FeatureHighlight icon={<ArrowsClockwise size={16} weight="duotone" className="text-blue-400" />} label="Regenerate" />
        <FeatureHighlight icon={<BookOpen size={16} weight="duotone" className="text-green-400" />} label="Cloud sync" />
        <FeatureHighlight icon={<Trophy size={16} weight="duotone" className="text-yellow-400" />} label="Leaderboard" />
      </div>
    </div>
  );
};

function FeatureRow({ included, text }: { included: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2">
      {included
        ? <Check size={14} weight="bold" className="text-green-400 mt-0.5 shrink-0" />
        : <X size={14} weight="bold" className="text-gray-600 mt-0.5 shrink-0" />
      }
      <span className={`text-xs ${included ? 'text-gray-300' : 'text-gray-500'}`}>{text}</span>
    </li>
  );
}

function FeatureHighlight({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      {icon}
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </div>
  );
}

export default PricingSection;
