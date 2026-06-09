// G-1, G-3, G-5, G-8, G-11: Twilio integration with mock fallback.
// All functions work in mock mode when TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are absent.

function hasTwilio() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

function client() {
  if (!hasTwilio()) throw new Error('Twilio credentials not configured');
  // Dynamic import avoids bundling issues when twilio package absent
  const twilio = require('twilio');
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  region: string;
  locality: string | null;
  capabilities: { voice: boolean; sms: boolean };
}

export interface ProvisionedNumber {
  sid: string;
  phoneNumber: string;
  provider: 'twilio' | 'mock';
}

// G-8: Search available numbers by country + type
export async function searchAvailableNumbers(
  countryCode: string,
  numberType: 'local' | 'tollFree' | 'mobile' | string,
  areaCode?: string,
  limit = 10,
): Promise<AvailableNumber[]> {
  if (!hasTwilio()) {
    // Return believable mock numbers
    const prefix = countryCode === 'US' ? '+1' : countryCode === 'GB' ? '+44' : '+1';
    return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      phoneNumber: `${prefix}${2025550100 + i}`,
      friendlyName: `${prefix}${2025550100 + i}`,
      region: 'NY',
      locality: 'New York',
      capabilities: { voice: true, sms: true },
    }));
  }

  try {
    const c = client();
    const nt = String(numberType).toLowerCase();
    const resource = nt === 'tollfree' || nt === 'toll_free'
      ? c.availablePhoneNumbers(countryCode).tollFree
      : nt === 'mobile'
      ? c.availablePhoneNumbers(countryCode).mobile
      : c.availablePhoneNumbers(countryCode).local;

    const params: any = { limit };
    if (areaCode) params.areaCode = areaCode;

    const numbers = await resource.list(params);
    return numbers.map((n: any) => ({
      phoneNumber: n.phoneNumber,
      friendlyName: n.friendlyName,
      region: n.region,
      locality: n.locality,
      capabilities: { voice: !!n.capabilities.voice, sms: !!n.capabilities.SMS },
    }));
  } catch (err) {
    console.error('[twilio] searchAvailableNumbers error:', err);
    return [];
  }
}

// G-1: Provision (purchase) a real Twilio number
export async function provisionNumber(
  phoneNumber: string,
  webhookBaseUrl: string,
): Promise<ProvisionedNumber> {
  if (!hasTwilio()) {
    return { sid: `MOCK_${Date.now()}`, phoneNumber, provider: 'mock' };
  }

  const incomingNumber = await client().incomingPhoneNumbers.create({
    phoneNumber,
    voiceUrl: `${webhookBaseUrl}/webhook/inbound`,
    voiceMethod: 'POST',
    smsUrl: `${webhookBaseUrl}/webhook/sms`,
    smsMethod: 'POST',
    statusCallbackUrl: `${webhookBaseUrl}/webhook/call-status`,
    statusCallbackMethod: 'POST',
  });

  return { sid: incomingNumber.sid, phoneNumber: incomingNumber.phoneNumber, provider: 'twilio' };
}

// G-1: Release a provisioned number back to Twilio
export async function releaseNumber(providerSid: string): Promise<void> {
  if (!hasTwilio() || providerSid.startsWith('MOCK_')) return;
  try {
    await client().incomingPhoneNumbers(providerSid).remove();
  } catch (err) {
    console.error('[twilio] releaseNumber error:', err);
  }
}

// G-11: Initiate outbound call
export async function initiateCall(
  to: string,
  from: string,
  webhookBaseUrl: string,
): Promise<string> {
  if (!hasTwilio()) {
    console.log(`[twilio mock] Outbound call: ${from} → ${to}`);
    return `MOCK_CALL_${Date.now()}`;
  }

  const call = await client().calls.create({
    to,
    from: from || process.env.TWILIO_PHONE_NUMBER,
    url: `${webhookBaseUrl}/webhook/outbound`,
    method: 'POST',
    statusCallback: `${webhookBaseUrl}/webhook/call-status`,
    statusCallbackMethod: 'POST',
  });

  return call.sid;
}

// G-12: Send SMS
export async function sendSms(
  to: string,
  from: string,
  body: string,
): Promise<string> {
  if (!hasTwilio()) {
    console.log(`[twilio mock] SMS: ${from} → ${to}: ${body}`);
    return `MOCK_SMS_${Date.now()}`;
  }

  const msg = await client().messages.create({
    to,
    from: from || process.env.TWILIO_PHONE_NUMBER,
    body,
  });

  return msg.sid;
}

export const twilioEnabled = hasTwilio;
