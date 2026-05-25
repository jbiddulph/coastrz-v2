'use client';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-cooper-std text-primary mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Acceptance of Terms</h2>
          <p className="text-secondary mb-4">
            By accessing and using Coastrz, you agree to these terms and all applicable laws and regulations.
            If you do not agree with any of these terms, please do not use our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Orders and Payments</h2>
          <p className="text-secondary mb-4">
            All orders are subject to acceptance and availability. Prices, product descriptions, and shipping fees
            may change without notice. Payment must be completed before your order is processed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Custom Designs</h2>
          <p className="text-secondary mb-4">
            You are responsible for ensuring that any uploaded artwork or text does not infringe third-party rights.
            We reserve the right to reject content that is unlawful, offensive, or otherwise inappropriate.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Limitation of Liability</h2>
          <p className="text-secondary mb-4">
            Coastrz is not liable for indirect, incidental, or consequential damages related to your use of our site
            or products, except where such liability cannot be excluded by law.
          </p>
        </section>

        <section id="privacy-policy" className="mb-8 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-primary mb-4">Privacy Policy</h2>
          <p className="text-secondary mb-4">
            We collect only the information needed to process orders, provide support, and improve your experience.
            We do not sell your personal data.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-secondary">
            <li>Account and order details are used to fulfill purchases and provide customer support.</li>
            <li>Payment information is handled securely by our payment providers.</li>
            <li>We may send service emails related to your order status and account activity.</li>
            <li>You can request access, correction, or deletion of your personal data by contacting support.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
