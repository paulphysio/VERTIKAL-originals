export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b-2 border-ink px-4 py-8 sm:px-10 sm:py-12">
        <h1 className="font-display text-4xl uppercase sm:text-6xl">
          RETURNS
        </h1>
      </div>

      <div className="px-4 py-12 sm:px-10 max-w-3xl">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Our Policy</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              We want you to be completely satisfied with your purchase. If you're not happy 
              with your order, please contact us and we'll do our best to make it right.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Contact Us</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              If you have any issues with your order, please reach out to us through our 
              contact page or email us directly. We'll respond as quickly as possible to 
              help resolve any concerns.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Quality Assurance</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              All items are carefully inspected before shipping to ensure they meet our 
              quality standards. If you receive a defective item, please contact us 
              immediately with photos of the issue.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl uppercase mb-4">Questions?</h2>
            <p className="font-mono text-sm text-ink/70 leading-relaxed">
              For any questions about your order or our policies, please don't hesitate to 
              contact us. We're here to help.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
