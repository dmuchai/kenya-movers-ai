import Navigation from "@/components/Navigation";

const Terms = () => {
  return (
    <>
      <Navigation />
      <div className="pt-24 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using Kenya Movers AI services, you accept and agree to be bound 
                  by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
                <p className="text-gray-700 mb-4">
                  Kenya Movers AI provides moving and relocation services across Kenya. We connect 
                  customers with professional moving companies and provide quote estimation services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
                <p className="text-gray-700 mb-4">
                  Users are responsible for providing accurate information, maintaining the security 
                  of their account, and complying with all applicable laws and regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  Kenya Movers AI shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages resulting from your use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-700">
                  For questions regarding these Terms of Service, please contact us at 
                  legal@kenyamoversai.com or +254 700 123 456.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;