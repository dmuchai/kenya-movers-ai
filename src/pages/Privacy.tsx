import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <>
      <Navigation />
      <div className="pt-24 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Types of Data We Collect</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Name, email address, phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                  <li>Government-issued ID for verification purposes</li>
                  <li>Profile preferences and communication settings</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Usage Data</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>IP address, browser type, operating system</li>
                  <li>Pages visited, time spent on site, click patterns</li>
                  <li>Referrer URLs and search terms used</li>
                  <li>Device identifiers and mobile app usage patterns</li>
                  <li>Location data (with your consent) for service delivery</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Service-Related Data</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Moving quotes and service requests</li>
                  <li>Property details and inventory lists</li>
                  <li>Communication records and support tickets</li>
                  <li>Reviews and feedback submissions</li>
                  <li>Service provider ratings and preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Legal Bases for Processing</h2>
                <p className="text-gray-700 mb-4">We process your personal data based on the following legal grounds:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Contract Performance:</strong> To provide moving services and fulfill our contractual obligations</li>
                  <li><strong>Legitimate Interest:</strong> For business operations, fraud prevention, and service improvement</li>
                  <li><strong>Consent:</strong> For marketing communications, cookies, and location tracking (where required)</li>
                  <li><strong>Legal Obligation:</strong> To comply with tax, accounting, and regulatory requirements</li>
                  <li><strong>Vital Interest:</strong> To protect health and safety during service delivery</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Retention Periods</h2>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Account Information:</strong> Retained for the duration of your account plus 3 years</li>
                  <li><strong>Transaction Records:</strong> Kept for 7 years for tax and legal compliance</li>
                  <li><strong>Communication Records:</strong> Stored for 2 years for quality assurance</li>
                  <li><strong>Usage Analytics:</strong> Aggregated data retained indefinitely; personal identifiers removed after 2 years</li>
                  <li><strong>Marketing Data:</strong> Until you opt-out or 3 years of inactivity</li>
                  <li><strong>Security Logs:</strong> Maintained for 1 year for fraud prevention</li>
                </ul>
                <p className="text-gray-700">We regularly review and delete data that is no longer necessary for the purposes for which it was collected.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Your Rights</h2>
                <p className="text-gray-700 mb-4">Under GDPR, CCPA, and other applicable laws, you have the following rights:</p>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Access and Correction</h3>
                <p className="text-gray-700 mb-4">
                  You can request a copy of your personal data and correct any inaccuracies. 
                  Access your account settings or email us at <a href="mailto:privacy@kenyamoversai.com" className="text-blue-600 hover:underline">privacy@kenyamoversai.com</a>.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Deletion and Erasure</h3>
                <p className="text-gray-700 mb-4">
                  Request deletion of your personal data, subject to legal retention requirements. 
                  Note: Some data may be retained for legal compliance or legitimate business interests.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Data Portability</h3>
                <p className="text-gray-700 mb-4">
                  Request your data in a machine-readable format for transfer to another service provider.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Opt-Out and Objection</h3>
                <p className="text-gray-700 mb-4">
                  Opt-out of marketing communications, object to processing based on legitimate interest, 
                  or withdraw consent where applicable. Use unsubscribe links or contact us directly.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">How to Exercise Your Rights</h3>
                <p className="text-gray-700 mb-4">
                  Submit requests via email to <a href="mailto:privacy@kenyamoversai.com" className="text-blue-600 hover:underline">privacy@kenyamoversai.com</a> 
                  or call <a href="tel:+254700123456" className="text-blue-600 hover:underline">+254 700 123 456</a>. 
                  We respond within 30 days and may request identity verification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services and International Transfers</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Service Providers</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li><strong>Payment Processors:</strong> Stripe, PayPal for secure payment processing</li>
                  <li><strong>Cloud Services:</strong> Supabase, Vercel for hosting and database services</li>
                  <li><strong>Communication:</strong> WhatsApp Business API, email service providers</li>
                  <li><strong>Analytics:</strong> Google Analytics, internal analytics tools</li>
                  <li><strong>Maps and Location:</strong> Google Maps API for location services</li>
                  <li><strong>Moving Partners:</strong> Verified moving companies in our network</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">International Transfers</h3>
                <p className="text-gray-700 mb-4">
                  Some service providers may be located outside Kenya/EEA. We ensure adequate protection through:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>European Commission adequacy decisions where applicable</li>
                  <li>Standard Contractual Clauses (SCCs) with service providers</li>
                  <li>Certification schemes and binding corporate rules</li>
                  <li>Your explicit consent for specific transfers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Consent Management</h2>
                <p className="text-gray-700 mb-4">
                  We use cookies and similar technologies to enhance your experience. For detailed information, 
                  see our <Link to="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>.
                </p>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Cookie Categories</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li><strong>Essential:</strong> Required for site functionality (cannot be disabled)</li>
                  <li><strong>Performance:</strong> Analytics and site optimization (requires consent)</li>
                  <li><strong>Functional:</strong> Enhanced features and preferences (requires consent)</li>
                  <li><strong>Marketing:</strong> Targeted advertising and remarketing (requires consent)</li>
                </ul>

                <p className="text-gray-700 mb-4">
                  Manage your cookie preferences through our cookie banner or by contacting us. 
                  Note that disabling certain cookies may affect site functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Security Measures</h2>
                <p className="text-gray-700 mb-4">We implement comprehensive security measures to protect your data:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li><strong>Encryption:</strong> TLS 1.3 for data in transit, AES-256 for data at rest</li>
                  <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication</li>
                  <li><strong>Network Security:</strong> Firewalls, intrusion detection systems</li>
                  <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
                  <li><strong>Employee Training:</strong> Regular security awareness programs</li>
                  <li><strong>Incident Response:</strong> Documented procedures for security incidents</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Breach Notification</h2>
                <p className="text-gray-700 mb-4">
                  In the event of a data breach that poses a risk to your rights and freedoms:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>We will notify relevant authorities within 72 hours where required by law</li>
                  <li>Affected individuals will be notified without undue delay if high risk is identified</li>
                  <li>Notifications will include the nature of the breach, potential consequences, and mitigation measures</li>
                  <li>We maintain detailed incident logs and conduct post-breach reviews</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Policy Changes</h2>
                <p className="text-gray-700 mb-4">
                  We may update this Privacy Policy to reflect changes in our practices, technology, or legal requirements:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Material changes will be communicated via email or prominent website notice</li>
                  <li>You will have 30 days to review changes before they take effect</li>
                  <li>Continued use of our services constitutes acceptance of updated terms</li>
                  <li>Previous versions are archived and available upon request</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information and Data Subject Requests</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Data Protection Officer</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 mb-2"><strong>Email:</strong> <a href="mailto:dpo@kenyamoversai.com" className="text-blue-600 hover:underline">dpo@kenyamoversai.com</a></p>
                  <p className="text-gray-700 mb-2"><strong>Privacy Inquiries:</strong> <a href="mailto:privacy@kenyamoversai.com" className="text-blue-600 hover:underline">privacy@kenyamoversai.com</a></p>
                  <p className="text-gray-700 mb-2"><strong>Phone:</strong> <a href="tel:+254700123456" className="text-blue-600 hover:underline">+254 700 123 456</a></p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> MoveEasy Moving Planner, Data Protection Officer<br />
                    Westlands Business Center, Waiyaki Way<br />
                    Westlands, Nairobi, Kenya
                  </p>
                </div>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Submitting Data Subject Access Requests (DSAR)</h3>
                <p className="text-gray-700 mb-4">
                  To submit a formal data subject request, please include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Full name and contact information</li>
                  <li>Proof of identity (government-issued ID)</li>
                  <li>Specific type of request (access, correction, deletion, etc.)</li>
                  <li>Detailed description of the data or processing activity</li>
                  <li>Preferred format for data delivery (if applicable)</li>
                </ul>

                <p className="text-gray-700 mb-4">
                  <strong>Response Time:</strong> We respond to valid requests within 30 days (may be extended to 60 days for complex requests).
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Supervisory Authority</h3>
                <p className="text-gray-700">
                  If you believe we have not adequately addressed your privacy concerns, you may lodge a complaint with 
                  the Office of the Data Protection Commissioner (ODPC) of Kenya or your local data protection authority.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;