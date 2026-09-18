import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Download,
  CheckCheck,
  Search,
  Filter,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
  Send
} from 'lucide-react';
import { useDashboard, AlertItem } from '../../../context/DashboardContext';
import { smsService } from '../../../services/smsService';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, acknowledgeAllAlerts, resolveAllAlerts, smsDispatches } = useDashboard();
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [smsTestNotice, setSmsTestNotice] = useState<string | null>(null);
  const [customPhoneNumber, setCustomPhoneNumber] = useState('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.camera.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedAlertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedAlertIds.length === filteredAlerts.length) {
      setSelectedAlertIds([]);
    } else {
      setSelectedAlertIds(filteredAlerts.map((a) => a.id));
    }
  };

  const handleBulkAcknowledge = () => {
    selectedAlertIds.forEach((id) => acknowledgeAlert(id));
    setSelectedAlertIds([]);
  };

  const handleBulkResolve = () => {
    selectedAlertIds.forEach((id) => resolveAlert(id));
    setSelectedAlertIds([]);
  };

  const handleExport = () => {
    setExportNotice('EXPORTED INCIDENT LOG (JSON / CSV) TO LOCAL ARCHIVE');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleTriggerTestSMS = async () => {
    const res = await smsService.sendViolationSMS({
      incidentId: 'ALT-MANUAL-TEST',
      title: 'MANUAL CITATION DISPATCH',
      severity: 'CRITICAL',
      camera: 'CAM-DEMO-07',
      sector: 'Main Transit Corridor',
      plateNumber: 'RJ14 AB 1234',
      timestamp: 'Just now',
      speed: '86.4 km/h',
      message: 'Automated SMS test alert issued to regional control officer.',
      recipientNumber: customPhoneNumber || '+91-9876543210'
    });

    setSmsTestNotice(
      res.isSimulated 
        ? `SMS alert simulated — no provider configured [To: ${res.recipient}: "${res.body.slice(0, 70)}..."]`
        : `SMS sent successfully via Fast2SMS [To: ${res.recipient}]`
    );
    setTimeout(() => setSmsTestNotice(null), 6000);
  };

  const latestSms = smsDispatches[0];

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Automated SMS Dispatch Status Banner */}
      <div className="p-3.5 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <MessageSquare size={16} className="text-[#00C2FF] flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider">AUTOMATED SMS DISPATCH ENGINE</span>
              <span className="px-1.5 py-0.2 rounded bg-[#22C55E]/15 border border-[#22C55E]/40 text-[9px] text-[#22C55E] font-bold">
                {latestSms?.isSimulated !== false ? 'DEMO SIMULATION (₹0 COST)' : 'GATEWAY CONNECTED'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {latestSms
                ? `Latest: ${latestSms.recipient} · ${latestSms.timestamp} · "${latestSms.body.slice(0, 60)}..."`
                : 'Ready for automated violation dispatch on Critical threshold breaches.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Phone Number"
            value={customPhoneNumber}
            onChange={(e) => setCustomPhoneNumber(e.target.value)}
            className="bg-[#050816] border border-[#00C2FF]/30 focus:border-[#00C2FF] rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-36"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTriggerTestSMS}
            icon={<Send size={12} />}
          >
            SEND SMS
          </Button>
        </div>
      </div>

      {smsTestNotice && (
        <div className="p-3 rounded bg-[#00C2FF]/10 border border-[#00C2FF]/50 text-xs text-[#7DD3FC] flex items-center justify-between shadow-glow-cyan">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#00C2FF] flex-shrink-0" />
            <span>{smsTestNotice}</span>
          </div>
          <button onClick={() => setSmsTestNotice(null)} className="text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Filter & Search Bar */}
      <div className="p-4 bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="SEARCH INCIDENTS, NODES, OR PROTOCOLS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050816] border border-[#00C2FF]/30 focus:border-[#00C2FF] rounded pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
          {/* Severity Tabs */}
          <div className="flex items-center gap-1 bg-[#081426] p-1 rounded border border-slate-700">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                  severityFilter === sev
                    ? 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#081426] border border-[#00C2FF]/30 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="NEW">NEW ONLY</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBulkAcknowledge}
            disabled={selectedAlertIds.length === 0}
            icon={<CheckCircle2 size={13} />}
          >
            ACKNOWLEDGE SELECTED ({selectedAlertIds.length})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleBulkResolve}
            disabled={selectedAlertIds.length === 0}
            icon={<CheckCheck size={13} />}
          >
            RESOLVE SELECTED ({selectedAlertIds.length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            icon={<Download size={13} />}
          >
            EXPORT INCIDENT LOG
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-2.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/40 text-xs text-[#22C55E] flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Incident Log Table */}
      {filteredAlerts.length > 0 ? (
        <div className="bg-[#0D1B2A]/90 hud-border corner-bracket-tl corner-bracket-tr corner-bracket-bl corner-bracket-br overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#00C2FF]/20 text-[10px] text-slate-400 bg-[#081426]/60">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedAlertIds.length === filteredAlerts.length && filteredAlerts.length > 0}
                    onChange={selectAll}
                    className="accent-[#00C2FF]"
                  />
                </th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">INCIDENT TITLE</th>
                <th className="p-3">CAMERA / SECTOR</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00C2FF]/10 text-[11px]">
              {filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className={`hover:bg-[#00C2FF]/5 transition-colors ${
                    alert.status === 'NEW' ? 'border-l-2 border-l-[#00C2FF]' : ''
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedAlertIds.includes(alert.id)}
                      onChange={() => toggleSelect(alert.id)}
                      className="accent-[#00C2FF]"
                    />
                  </td>
                  <td className="p-3">
                    <Badge status={alert.severity} size="sm" />
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-white">{alert.title}</div>
                    <div className="text-slate-400 text-[10px] truncate max-w-md">{alert.message}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-white font-semibold">{alert.camera}</div>
                    <div className="text-slate-400 text-[10px]">{alert.sector}</div>
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {alert.timestamp}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                        alert.status === 'NEW'
                          ? 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/40'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                          : 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {alert.status === 'NEW' ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-[10px] text-[#00C2FF] hover:underline mr-3"
                      >
                        ACKNOWLEDGE
                      </button>
                    ) : alert.status === 'ACKNOWLEDGED' ? (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-[10px] text-[#22C55E] hover:underline"
                      >
                        RESOLVE
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">CLOSED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Intentional Empty State */
        <div className="p-12 bg-[#0D1B2A]/70 hud-border corner-bracket-tl corner-bracket-br text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/30 flex items-center justify-center text-[#00C2FF] mx-auto">
            <ShieldCheck size={24} />
          </div>
          <div className="text-sm font-bold text-white tracking-widest uppercase">
            NO ACTIVE ALERTS DETECTED
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All 24 optical nodes report clear traffic corridors. No anomaly threshold breaches active.
          </p>
        </div>
      )}
    </div>
  );
};
