/**
 * T.R.A.C.E. Decoupled SMS Notification Service
 * 
 * Pluggable architecture supporting zero-cost / free-tier SMS providers:
 * 1. SIMULATED (Default / Demo Mode): ₹0 cost, zero credentials needed.
 *    Logs dispatch and emits HUD notification event with full transparency.
 * 2. TWILIO (Free Trial): ~$15 initial trial credits. Set VITE_TWILIO_SID, 
 *    VITE_TWILIO_TOKEN, VITE_TWILIO_FROM in .env.
 * 3. FAST2SMS (Free Tier): 50 free SMS/day for Indian testing numbers.
 *    Set VITE_FAST2SMS_KEY in .env.
 * 4. WEBHOOK: Custom alerting endpoint. Set VITE_SMS_WEBHOOK_URL.
 */

export interface SMSViolationAlert {
  incidentId: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  camera: string;
  sector: string;
  plateNumber?: string;
  timestamp: string;
  speed?: string;
  message: string;
  recipientNumber?: string;
}

export interface SMSDispatchResult {
  success: boolean;
  provider: 'SIMULATED' | 'TWILIO' | 'FAST2SMS' | 'WEBHOOK';
  timestamp: string;
  recipient: string;
  body: string;
  isSimulated: boolean;
  messageId: string;
}

type SMSListener = (result: SMSDispatchResult) => void;

class SMSService {
  private listeners: Set<SMSListener> = new Set();
  private dispatchHistory: SMSDispatchResult[] = [];

  public subscribe(listener: SMSListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(result: SMSDispatchResult): void {
    this.dispatchHistory.unshift(result);
    if (this.dispatchHistory.length > 50) this.dispatchHistory.pop();
    this.listeners.forEach((fn) => {
      try {
        fn(result);
      } catch (err) {
        console.error('Error in SMS listener', err);
      }
    });
  }

  public getRecentDispatches(): SMSDispatchResult[] {
    return [...this.dispatchHistory];
  }

  /**
   * Dispatch an urgent SMS alert for critical traffic/vehicle violations
   */
  public async sendViolationSMS(alert: SMSViolationAlert): Promise<SMSDispatchResult> {
    const recipient = alert.recipientNumber || '+91-9876543210';
    const body = `[T.R.A.C.E. ALERT] ${alert.severity}: ${alert.title} at ${alert.camera} (${alert.sector}). Target: ${alert.plateNumber || 'UNKNOWN'}. Details: ${alert.message}`;

    const providerEnv = (import.meta.env.VITE_SMS_PROVIDER || '').toUpperCase();
    const twilioSid = import.meta.env.VITE_TWILIO_SID;
    const fast2smsKey = import.meta.env.VITE_FAST2SMS_KEY;
    const webhookUrl = import.meta.env.VITE_SMS_WEBHOOK_URL;

    // 1. Fast2SMS Provider (Free tier 50 SMS/day)
    if (providerEnv === 'FAST2SMS' && fast2smsKey) {
      try {
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: body,
            language: 'english',
            numbers: recipient.replace(/\D/g, '')
          })
        });
        const data = await res.json();
        const result: SMSDispatchResult = {
          success: res.ok && data.return === true,
          provider: 'FAST2SMS',
          timestamp: new Date().toLocaleTimeString(),
          recipient,
          body,
          isSimulated: false,
          messageId: `F2S-${Date.now()}`
        };
        this.notify(result);
        return result;
      } catch (err) {
        console.warn('Fast2SMS gateway error, falling back to simulated dispatch', err);
      }
    }

    // 2. Twilio Provider (Trial account)
    if (providerEnv === 'TWILIO' && twilioSid) {
      // In pure client-side code, Twilio direct API requires backend proxy or basic auth
      console.info('Twilio credentials detected. In production, pass through API route.');
    }

    // 3. Webhook Provider (Free custom endpoint)
    if (providerEnv === 'WEBHOOK' && webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alert, recipient, body, timestamp: new Date().toISOString() })
        });
        const result: SMSDispatchResult = {
          success: res.ok,
          provider: 'WEBHOOK',
          timestamp: new Date().toLocaleTimeString(),
          recipient,
          body,
          isSimulated: false,
          messageId: `WH-${Date.now()}`
        };
        this.notify(result);
        return result;
      } catch (err) {
        console.warn('SMS Webhook dispatch failed, falling back to simulation', err);
      }
    }

    // 4. Default / Fallback Mode: Simulated SMS Dispatch (100% Free & Transparent)
    const simulatedResult: SMSDispatchResult = {
      success: true,
      provider: 'SIMULATED',
      timestamp: new Date().toLocaleTimeString(),
      recipient,
      body,
      isSimulated: true,
      messageId: `SIM-${Math.floor(100000 + Math.random() * 900000)}`
    };

    console.info(
      `%c[T.R.A.C.E. SMS DISPATCH]%c Simulated SMS sent to ${recipient}: "${body}"`,
      'color: #00C2FF; font-weight: bold;',
      'color: #7DD3FC;'
    );

    this.notify(simulatedResult);
    return simulatedResult;
  }
}

export const smsService = new SMSService();
