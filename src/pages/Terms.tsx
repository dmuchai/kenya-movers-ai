import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const Terms = () => {
  return (
    <>
      <Navigation />
      <div className="pt-24 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          {/* Legal Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  <strong>Legal Notice:</strong> These terms are draft templates and must be reviewed and finalized by a qualified Kenyan attorney before publication. 
                  This content is for development purposes only and should not be used as final legal documentation.
                </p>
              </div>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using MoveLink Moving Planner services, you accept and agree to be bound 
                  by the terms and provision of this agreement. If you do not agree to these terms, 
                  please do not use our services.
                </p>
                <p className="text-gray-700 mb-4">
                  These terms apply to all users, including customers seeking moving services and 
                  moving companies providing services through our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
                <p className="text-gray-700 mb-4">
                  MoveLink Moving Planner provides an online platform that connects customers with professional 
                  moving companies across Kenya. Our services include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>AI-powered moving cost estimation</li>
                  <li>Quote comparison from multiple moving companies</li>
                  <li>Booking and scheduling coordination</li>
                  <li>Customer support and dispute resolution assistance</li>
                  <li>Review and rating system for service providers</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  We act as an intermediary platform and do not directly provide moving services. 
                  All actual moving services are provided by independent third-party companies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
                <p className="text-gray-700 mb-4">As a user of our platform, you agree to:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Provide accurate and complete information when requesting quotes or services</li>
                  <li>Maintain the security and confidentiality of your account credentials</li>
                  <li>Comply with all applicable Kenyan laws and regulations</li>
                  <li>Treat all service providers and other users with respect and professionalism</li>
                  <li>Report any issues or disputes promptly through our support channels</li>
                  <li>Not use the platform for any illegal, fraudulent, or harmful activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Availability & Modifications</h2>
                <p className="text-gray-700 mb-4">
                  We strive to maintain continuous service availability, but we cannot guarantee 
                  uninterrupted access to our platform. We may temporarily suspend or limit access for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Scheduled maintenance and system updates</li>
                  <li>Emergency repairs or security measures</li>
                  <li>Technical difficulties beyond our control</li>
                  <li>Compliance with legal requirements</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  We reserve the right to modify, update, or discontinue any part of our services 
                  with reasonable notice to users. Major changes will be communicated at least 30 days in advance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Fees & Payment Terms</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Platform Fees</h3>
                <p className="text-gray-700 mb-4">
                  Our platform operates on a commission-based model. Moving companies pay us a percentage 
                  of completed bookings. Customers do not pay platform fees directly.
                </p>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Payment Processing</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>All payments are processed through secure, PCI-compliant payment providers</li>
                  <li>Moving service payments are made directly to the moving company</li>
                  <li>We may hold deposits in escrow until service completion for certain bookings</li>
                  <li>Refunds and cancellations are subject to individual moving company policies</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Pricing and Quotes</h3>
                <p className="text-gray-700 mb-4">
                  All quotes provided through our platform are estimates. Final pricing may vary based on 
                  actual service requirements, accessibility, and other factors determined during service delivery.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Termination & Suspension</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">User-Initiated Termination</h3>
                <p className="text-gray-700 mb-4">
                  You may terminate your account at any time by contacting our support team or 
                  using the account deletion feature in your profile settings.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Platform-Initiated Suspension</h3>
                <p className="text-gray-700 mb-4">We may suspend or terminate accounts for:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Violation of these terms of service</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Abusive behavior toward other users or staff</li>
                  <li>Repeated failure to pay for services</li>
                  <li>Extended periods of account inactivity (over 2 years)</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Effect of Termination</h3>
                <p className="text-gray-700 mb-4">
                  Upon termination, your access to the platform will cease, but data retention and 
                  processing will continue as outlined in our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Platform Content</h3>
                <p className="text-gray-700 mb-4">
                  All content, trademarks, logos, and intellectual property on the MoveLink Moving Planner platform 
                  are owned by us or our licensors and are protected by Kenyan and international copyright laws.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">User-Generated Content</h3>
                <p className="text-gray-700 mb-4">
                  By submitting reviews, photos, or other content to our platform, you grant us a 
                  non-exclusive license to use, display, and distribute this content for platform operations and marketing purposes.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Prohibited Use</h3>
                <p className="text-gray-700 mb-4">
                  You may not copy, modify, distribute, or create derivative works from our platform content 
                  without explicit written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Protection & Kenya Data Protection Act Compliance</h2>
                <p className="text-gray-700 mb-4">
                  We are committed to protecting your personal data in compliance with the Kenya Data Protection Act, 2019 
                  and other applicable data protection laws. Our data processing practices include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Processing personal data only for legitimate business purposes</li>
                  <li>Implementing appropriate technical and organizational security measures</li>
                  <li>Obtaining proper consent for data processing where required</li>
                  <li>Respecting your rights as a data subject under Kenyan law</li>
                  <li>Notifying authorities and affected individuals of data breaches as required</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  For detailed information about our data practices, please review our 
                  <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Internal Resolution</h3>
                <p className="text-gray-700 mb-4">
                  We encourage users to first attempt to resolve disputes through our customer support team. 
                  Most issues can be resolved quickly through direct communication.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Mediation</h3>
                <p className="text-gray-700 mb-4">
                  If internal resolution is unsuccessful, disputes may be resolved through mediation 
                  conducted by a qualified mediator in Nairobi, Kenya. Mediation costs will be shared equally between parties.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Arbitration</h3>
                <p className="text-gray-700 mb-4">
                  For disputes exceeding KES 500,000, either party may request binding arbitration under 
                  the Arbitration Act, 1995 of Kenya. Arbitration will be conducted in Nairobi by a qualified arbitrator.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Class Action Waiver</h3>
                <p className="text-gray-700 mb-4">
                  Users agree to resolve disputes individually and waive the right to participate in 
                  class action lawsuits, except where prohibited by Kenyan law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  To the maximum extent permitted by Kenyan law, MoveLink Moving Planner shall not be liable for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages caused by third-party moving companies or their employees</li>
                  <li>Service interruptions due to technical issues or force majeure events</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Our total liability for any claim shall not exceed the total amount paid by the user 
                  for services in the 12 months preceding the claim.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law & Jurisdiction</h2>
                <p className="text-gray-700 mb-4">
                  These Terms of Service are governed by and construed in accordance with the laws of Kenya. 
                  Any legal proceedings arising from these terms or your use of our services shall be subject 
                  to the exclusive jurisdiction of the courts of Kenya.
                </p>
                <p className="text-gray-700 mb-4">
                  The parties agree that Nairobi shall be the preferred venue for any legal proceedings, 
                  arbitration, or mediation related to these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Privacy Policy Reference</h2>
                <p className="text-gray-700 mb-4">
                  Your privacy is important to us. Our collection, use, and protection of your personal information 
                  is governed by our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, 
                  which is incorporated into these terms by reference.
                </p>
                <p className="text-gray-700 mb-4">
                  By using our services, you also agree to the terms of our Privacy Policy. 
                  Please review it carefully to understand how we handle your personal data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
                <p className="text-gray-700 mb-4">
                  We may update these Terms of Service periodically to reflect changes in our services, 
                  legal requirements, or business practices. Material changes will be communicated through:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                  <li>Email notification to registered users</li>
                  <li>Prominent notice on our website</li>
                  <li>In-app notifications where applicable</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Continued use of our services after changes take effect constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    <strong>Legal Inquiries:</strong> <a href="mailto:legal@move-link.co.ke" className="text-blue-600 hover:underline">legal@move-link.co.ke</a>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>General Support:</strong> <a href="mailto:support@move-link.co.ke" className="text-blue-600 hover:underline">support@move-link.co.ke</a>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Phone:</strong> <a href="tel:+254700123456" className="text-blue-600 hover:underline">+254 700 123 456</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> MoveLink Technologies Ltd<br />
                    Westlands Business Center, Waiyaki Way<br />
                    Westlands, Nairobi, Kenya
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;