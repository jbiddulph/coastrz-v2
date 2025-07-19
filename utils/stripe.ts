import { loadStripe } from '@stripe/stripe-js';

// This is a singleton to ensure we only create one instance
let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  // Debug logging
  console.log('Stripe key being used:', key);
  console.log('Key starts with pk_live_:', key?.startsWith('pk_live_'));
  console.log('Key starts with pk_test_:', key?.startsWith('pk_test_'));
  
  if (!key) {
    throw new Error('Stripe publishable key is not set');
  }
  
  // Always create a new instance to ensure we get the current key
  stripePromise = loadStripe(key);
  return stripePromise;
}; 