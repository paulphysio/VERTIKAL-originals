export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Vertikal</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            Welcome to Vertikal, your premium destination for quality fashion and style. 
            We believe that everyone deserves to look and feel their best, which is why 
            we curate the finest collection of clothing and accessories.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            Our mission is to provide high-quality, stylish clothing at accessible prices. 
            We work directly with manufacturers to bring you the best value without compromising 
            on quality or style.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Quality: We never compromise on the quality of our products</li>
            <li>Style: We stay ahead of trends to bring you the latest fashion</li>
            <li>Sustainability: We're committed to ethical and sustainable practices</li>
            <li>Customer Service: Your satisfaction is our top priority</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-6">
            Founded in 2024, VERTIKAL originals started with a simple idea: make premium fashion 
            accessible to everyone. What began as a small online store has grown into a 
            trusted destination for fashion enthusiasts across the region.
          </p>
        </div>
      </div>
    </div>
  )
}
