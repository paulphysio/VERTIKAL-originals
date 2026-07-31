export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-600 mb-6">
            By accessing and using StyleHub, you accept and agree to be bound by the terms 
            and provisions of this agreement.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Products and Services</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Modify or discontinue products at any time</li>
            <li>Limit the quantity of products available for purchase</li>
            <li>Reject orders in our sole discretion</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Pricing</h2>
          <p className="text-gray-600 mb-6">
            All prices are listed in Nigerian Naira (NGN) and are subject to change without notice. 
            We reserve the right to modify prices at any time.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Payment and Billing</h2>
          <p className="text-gray-600 mb-4">
            We accept the following payment methods:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Paystack (debit/credit cards)</li>
            <li>Bank transfer</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Shipping and Delivery</h2>
          <p className="text-gray-600 mb-6">
            Shipping times and costs vary based on location. Free shipping is available 
            for orders over ₦10,000. Please refer to our shipping policy for more details.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Returns and Refunds</h2>
          <p className="text-gray-600 mb-6">
            We offer a 30-day return policy for unused items in their original packaging. 
            Refunds are processed within 5-7 business days of receiving the returned item.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">User Accounts</h2>
          <p className="text-gray-600 mb-6">
            You are responsible for maintaining the confidentiality of your account information 
            and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Limitation of Liability</h2>
          <p className="text-gray-600 mb-6">
            VERTIKAL originals shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages arising out of your access to or use of the website.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about these Terms of Service, please contact us at 
            legal@vertikaloriginals.com
          </p>
        </div>
      </div>
    </div>
  )
}
