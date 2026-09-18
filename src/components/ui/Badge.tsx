import React from 'react';

export type BadgeStatus = 'ONLINE' | 'ACTIVE' | 'CALIBRATING' | 'WARNING' | 'CRITICAL' | 'SUCCESS' | 'INFO';

interface BadgeProps {
  status?: BadgeStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status = 'ONLINE', label, size = 'sm' }) => {
  const displayLabel = label || status;

  const colorMap: Record<BadgeStatus, { bg: string; border: string; text: string; dot: string }> = {
    ONLINE: { bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/40', text: 'text-[#22C55E]', dot: 'bg-[#22C55E]' },
    SUCCESS: { bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/40', text: 'text-[#22C55E]', dot: 'bg-[#22C55E]' },
    ACTIVE: { bg: 'bg-[#00C2FF]/10', border: 'border-[#00C2FF]/40', text: 'text-[#00C2FF]', dot: 'bg-[#00C2FF]' },
    CALIBRATING: { bg: 'bg-[#2563EB]/10', border: 'border-[#2563EB]/40', text: 'text-[#7DD3FC]', dot: 'bg-[#2563EB]' },
    WARNING: { bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/40', text: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]' },
    CRITICAL: { bg: 'bg-[#FF3B4E]/10', border: 'border-[#FF3B4E]/40', text: 'text-[#FF3B4E]', dot: 'bg-[#FF3B4E]' },
    INFO: { bg: 'bg-[#2563EB]/10', border: 'border-[#2563EB]/40', text: 'text-[#7DD3FC]', dot: 'bg-[#00C2FF]' },
  };

  const style = colorMap[status] || colorMap.ONLINE;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-widest font-medium border rounded ${style.bg} ${style.border} ${style.text} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      <span>{displayLabel}</span>
    </span>
  );
};
