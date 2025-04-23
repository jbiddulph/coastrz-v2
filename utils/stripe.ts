import { loadStripe } from '@stripe/stripe-js';

// This is a singleton to ensure we only create one instance
let stripePromise: Promise<any> | null = null;
let currentKey: string | null = null;

export const getStripe = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  
  // If the key has changed, clear the singleton
  if (currentKey && currentKey !== key) {
    stripePromise = null;
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(key);
    currentKey = key;
  }
  
  return stripePromise;
}; 