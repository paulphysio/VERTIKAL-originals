export default function ShippingPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b-2 border-ink px-4 py-8 sm:px-10 sm:py-12">
        <h1 className="font-display text-4xl uppercase sm:text-6xl">
          SHIPPING
        </h1>
      </div>

      <div className="px-4 py-12 sm:px-10 max-w-3xl">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Processing Time</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              Orders are typically processed and dispatched within 48 hours of purchase. 
              You'll receive a confirmation email once your order has been shipped.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Delivery Times</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              Delivery times vary based on your location within Nigeria. 
              Orders are shipped via reliable courier services to ensure safe and timely delivery.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Order Tracking</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              You can track your order status through your account. We'll send you updates 
              when your order is processed and shipped with tracking information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Shipping Address</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              Please ensure your shipping address is correct at checkout. We are not responsible 
              for orders shipped to incorrect addresses provided by the customer.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Questions?</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              If you have any questions about shipping or your order, please contact us 
              through our contact page or email us directly.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
