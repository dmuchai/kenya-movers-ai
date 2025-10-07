import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <>
      <Navigation />
      <div className="pt-24 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <h2 className="text-xl text-blue-600 font-semibold mb-8">MoveEasy - Kenya Moving Planner</h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <p className="text-sm text-gray-700">
                <strong>Effective Date:</strong> October 3, 2025<br />
                <strong>Last Updated:</strong> October 3, 2025
              </p>
            </div>
            
            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  MoveEasy ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application MoveEasy - Kenya Moving Planner (the "App").
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Information You Provide Directly</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                  <li><strong>Moving Details:</strong> Pickup and delivery locations, property type, moving date</li>
                  <li><strong>Quote Requests:</strong> Details about your moving requirements</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Information Collected Automatically</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Location Data:</strong> Approximate location to provide relevant moving services and quotes</li>
                  <li><strong>Device Information:</strong> Device type, operating system, app version</li>
                  <li><strong>Usage Data:</strong> How you interact with the app features</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Information from Third Parties</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Google Places API:</strong> Location suggestions and address verification</li>
                  <li><strong>Moving Service Providers:</strong> Quotes and availability information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">We use the collected information to:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Provide Services:</strong> Connect you with moving service providers in Kenya</li>
                  <li><strong>Generate Quotes:</strong> Calculate accurate moving estimates based on your requirements</li>
                  <li><strong>Improve Experience:</strong> Enhance app functionality and user interface</li>
                  <li><strong>Customer Support:</strong> Respond to your inquiries and provide assistance</li>
                  <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">With Moving Service Providers</h3>
                <p className="text-gray-700 mb-4">
                  We share your moving request details (locations, property type, contact information) with relevant moving companies <strong>with your explicit consent</strong> to provide you with quotes and services. Your contact details are shared with a maximum of 5 verified moving providers per quote request to ensure competitive pricing while protecting your privacy.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Alternative Option:</strong> You may choose to receive anonymized quotes without sharing direct contact details. In this case, moving companies provide quotes through our platform, and you can choose to reveal your contact information only to selected providers.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Consent Management:</strong> You provide consent when submitting a quote request and can modify your sharing preferences in app settings or withdraw consent by contacting us at privacy@moveeasy.co.ke.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">With Service Providers</h3>
                <p className="text-gray-700 mb-3">We may share information with third-party service providers who assist us in:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>App hosting and maintenance</li>
                  <li>Location services (Google Places)</li>
                  <li>Analytics and app improvement</li>
                  <li>Customer support</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Legal Requirements</h3>
                <p className="text-gray-700 mb-3">We may disclose your information if required by law or to:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Comply with legal processes</li>
                  <li>Protect our rights and property</li>
                  <li>Ensure user safety</li>
                  <li>Investigate potential violations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 mb-3">We implement appropriate security measures to protect your information:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Encryption:</strong> Data transmission is encrypted using SSL/TLS</li>
                  <li><strong>Access Controls:</strong> Limited access to personal information</li>
                  <li><strong>Regular Updates:</strong> Security measures are regularly reviewed and updated</li>
                  <li><strong>Secure Storage:</strong> Data is stored on secure servers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Access and Control</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>View Data:</strong> Request access to your personal information</li>
                  <li><strong>Update Information:</strong> Correct or update your details in the app</li>
                  <li><strong>Delete Account:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from promotional communications</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Location Data</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                  <li><strong>Permission Control:</strong> Grant or revoke location permissions in device settings</li>
                  <li><strong>Limited Use:</strong> Location data is only used for moving service matching</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
                <p className="text-gray-700 mb-3">We retain your information for as long as necessary to:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Provide our services</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes</li>
                  <li>Enforce our agreements</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Specific Retention Periods</h3>
                <div className="space-y-3 mb-4">
                  <p className="text-gray-700"><strong>Contact Information:</strong> Retained while your account is active and deleted within 30 days after account deletion request.</p>
                  <p className="text-gray-700"><strong>Moving Request Data:</strong> Retained for 1 year after the scheduled moving date to provide support and service improvements.</p>
                  <p className="text-gray-700"><strong>Location Data:</strong> Deleted immediately after quote generation is complete, unless saved as part of a moving request.</p>
                  <p className="text-gray-700"><strong>Account Activity Logs:</strong> Retained for 2 years for security purposes, fraud prevention, and legal compliance requirements.</p>
                  <p className="text-gray-700"><strong>Payment Information:</strong> Processed by third-party providers and not stored on our servers. Refer to payment processor's retention policies.</p>
                </div>

                <h3 className="text-xl font-medium text-gray-900 mb-3">User-Initiated Deletion</h3>
                <p className="text-gray-700 mb-4">
                  You can request deletion of your personal data at any time by contacting us at <strong>privacy@moveeasy.co.ke</strong> or <strong>dpo@moveeasy.co.ke</strong>. We will process deletion requests within 30 days, subject to legal retention requirements.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Third-Party Data Handling</h3>
                <p className="text-gray-700 mb-3">For data already shared with moving service providers or other third parties:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>We will request deletion from third parties when you request account deletion</li>
                  <li>Third parties are contractually required to delete your data within 90 days of our request</li>
                  <li>We will notify you if any third party cannot delete your data due to legal obligations</li>
                  <li>You may contact third parties directly for immediate deletion using contact information provided in quote responses</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-700 mb-4">
                  MoveEasy is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that a child under 18 has provided us with personal information, we will delete it immediately unless we have verifiable consent from the child's parent or guardian as required by Kenya's Data Protection Act, 2019. Processing personal data of a child under 18 will only occur with the consent of their parent or guardian in accordance with the Act.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
                <p className="text-gray-700 mb-4">
                  Your information may be transferred to and processed in countries other than Kenya. We ensure that such transfers comply with applicable data protection laws and that adequate safeguards are in place.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                <p className="text-gray-700 mb-3">We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Posting the new Privacy Policy in the app</li>
                  <li>Sending an email notification (if applicable)</li>
                  <li>Updating the "Last Updated" date</li>
                </ul>
              </section>

              <section className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="text-gray-700">
                  <p><strong>MoveEasy Support</strong></p>
                  <p><strong>Email:</strong> privacy@moveeasy.co.ke</p>
                  <p><strong>Address:</strong> MoveEasy Technologies Ltd, Westlands Office Park, Block C, 3rd Floor, Waiyaki Way, Westlands, P.O. Box 12345-00100, Nairobi, Kenya</p>
                  <p><strong>Data Protection Officer:</strong> dpo@moveeasy.co.ke</p>
                  <p><strong>In-App Contact:</strong> Use the contact form in the MoveEasy app</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kenya Data Protection Compliance</h2>
                <p className="text-gray-700 mb-4">
                  This privacy policy complies with the Data Protection Act, 2019 of Kenya and other applicable Kenyan data protection regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Consent</h2>
                <p className="text-gray-700 mb-4">
                  By using the MoveEasy app, you consent to the collection and use of your information as described in this Privacy Policy.
                </p>
              </section>

              <div className="border-t-2 border-gray-200 pt-8 mt-8 text-center text-gray-600">
                <p><em>This Privacy Policy is governed by the laws of Kenya.</em></p>
                <p className="mt-2">© 2025 MoveEasy - Kenya Moving Planner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Privacy;