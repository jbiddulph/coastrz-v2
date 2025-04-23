import { loadStripe } from '@stripe/stripe-js';

// This is a singleton to ensure we only create one instance
let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Stripe publishable key is not set');
    }
    
    // Force clear any existing instances
    stripePromise = null;
    // Create a new instance with the current key
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}; 