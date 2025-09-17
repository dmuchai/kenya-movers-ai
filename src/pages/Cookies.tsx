import Navigation from "@/components/Navigation";

const Cookies = () => {
  return (
    <>
      <Navigation />
      <div className="pt-24 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
                <p className="text-gray-700 mb-4">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience and understand how our website is used.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Essential Cookies</h3>
                    <p className="text-gray-700">
                      These cookies are necessary for the website to function and cannot be switched off.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Cookies</h3>
                    <p className="text-gray-700">
                      These cookies help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Functional Cookies</h3>
                    <p className="text-gray-700">
                      These cookies enable enhanced functionality and personalization.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
                <p className="text-gray-700 mb-4">
                  You can control and/or delete cookies as you wish. You can delete all cookies 
                  that are already on your computer and set most browsers to prevent them from being placed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700">
                  If you have questions about our use of cookies, please contact us at 
                  privacy@kenyamoversai.com or +254 700 123 456.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cookies;