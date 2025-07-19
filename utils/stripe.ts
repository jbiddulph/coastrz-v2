import { loadStripe } from '@stripe/stripe-js';

// This is a singleton to ensure we only create one instance
let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('Stripe publishable key is not set');
  }
  
  // Always create a new instance to ensure we get the current key
  stripePromise = loadStripe(key);
  return stripePromise;
}; 