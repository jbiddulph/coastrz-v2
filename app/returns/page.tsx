export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-cooper-std text-primary mb-8">Returns Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Our Return Promise</h2>
          <p className="text-secondary mb-4">
            We want you to be completely satisfied with your purchase. If you're not happy with your order,
            you can return it within 30 days of receipt for a full refund or exchange.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Return Process</h2>
          <div className="space-y-6">
            <div className="bg-neutral p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-primary mb-3">1. Start Your Return</h3>
              <p className="text-secondary">
                Log into your account and select the order you wish to return. Fill out the return form
                indicating your reason for return.
              </p>
            </div>
            <div className="bg-neutral p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-primary mb-3">2. Package Your Return</h3>
              <p className="text-secondary">
                Place the item(s) in their original packaging along with all tags and labels. Include
                your return form in the package.
              </p>
            </div>
            <div className="bg-neutral p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-primary mb-3">3. Send Your Return</h3>
              <p className="text-secondary">
                Use our prepaid return label or send to our returns address. We recommend using a
                tracked service.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Return Conditions</h2>
          <ul className="list-disc pl-6 space-y-3 text-secondary">
            <li>Items must be unused and in their original condition</li>
            <li>All original tags and packaging must be intact</li>
            <li>Returns must be initiated within 30 days of receipt</li>
            <li>Sale items can only be returned if faulty</li>
            <li>Hygiene products cannot be returned once opened</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Refund Information</h2>
          <p className="text-secondary mb-4">
            Once we receive your return, we'll process it within 5-7 working days. Refunds will be
            issued to your original payment method.
          </p>
          <div className="bg-neutral p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-primary mb-3">Refund Timeframes</h3>
            <ul className="space-y-2 text-secondary">
              <li>Return processing: 5-7 working days</li>
              <li>Refund to credit/debit card: 3-5 working days</li>
              <li>Refund to store credit: 1-2 working days</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-primary mb-4">Need Help?</h2>
          <p className="text-secondary">
            If you have any questions about returns or refunds, please contact our customer service team:
          </p>
          <ul className="mt-4 space-y-2 text-secondary">
            <li>Email: returns@mcpstore.com</li>
            <li>Phone: 0800 123 4567</li>
            <li>Hours: Monday-Friday, 9am-5pm GMT</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 