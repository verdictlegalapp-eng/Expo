import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PhoneAuthProvider,
  signInWithCredential,
  type ApplicationVerifier,
  type Auth,
} from 'firebase/auth';

export const STORAGE_VERIFICATION_ID = 'verdict_phone_verification_id';

export function toE164Us(digitsOrFormatted: string): string {
  const d = digitsOrFormatted.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return digitsOrFormatted.startsWith('+') ? digitsOrFormatted : `+${d}`;
}

/** Sends SMS via Firebase Phone Auth (Recaptcha verifier required from expo-firebase-recaptcha). */
export async function sendPhoneVerificationCode(
  auth: Auth,
  phoneE164: string,
  appVerifier: ApplicationVerifier
): Promise<string> {
  const provider = new PhoneAuthProvider(auth);
  const verificationId = await provider.verifyPhoneNumber(phoneE164, appVerifier);
  await AsyncStorage.setItem(STORAGE_VERIFICATION_ID, verificationId);
  return verificationId;
}

export async function confirmPhoneCode(auth: Auth, verificationId: string, smsCode: string) {
  const credential = PhoneAuthProvider.credential(verificationId, smsCode);
  const result = await signInWithCredential(auth, credential);
  const idToken = await result.user.getIdToken(true);
  return { user: result.user, idToken };
}

export async function getStoredVerificationId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_VERIFICATION_ID);
}
