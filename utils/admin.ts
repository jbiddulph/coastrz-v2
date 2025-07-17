// Admin email configuration
export const ADMIN_EMAILS = [
  process.env.ADMIN_USER, // Add your email here
  'admin@example.com',
];

// Helper function to check if a user is an admin
export function checkIsAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
} 