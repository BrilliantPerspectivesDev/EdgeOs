'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3 group">
            <Image 
              src="/i49-blue-dots.png" 
              alt="LeaderForge" 
              width={32} 
              height={40}
              className="group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-semibold tracking-tight text-white">
              LeaderForge
            </span>
          </Link>
          <Link 
            href="/signin"
            className="px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white border border-white/10 hover:border-white/20 rounded-full transition-all hover:bg-white/5"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
          <p className="text-white/60 mb-12">Last updated: December 4, 2025</p>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
              <p className="text-white/70 leading-relaxed">
                By accessing or using LeaderForge, operated by i49 Group, Inc., you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-white/70 leading-relaxed">
                LeaderForge is a leadership development and training platform that provides video-based training sessions, worksheets, and team management tools designed to help organizations build high-performance cultures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="text-white/70 leading-relaxed mb-4">When you create an account, you agree to:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Payments</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Access to LeaderForge requires a paid subscription. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>Pay all fees associated with your selected plan</li>
                <li>Automatic renewal unless cancelled before the renewal date</li>
                <li>Our 30-day refund policy for new subscriptions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
              <p className="text-white/70 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>Share your account credentials with unauthorized users</li>
                <li>Copy, distribute, or reproduce our training content</li>
                <li>Use the service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-white/70 leading-relaxed">
                All content on LeaderForge, including but not limited to videos, text, graphics, logos, and training materials, is the property of i49 Group, Inc. or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-white/70 leading-relaxed">
                LeaderForge is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free. Results from using our training program may vary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-white/70 leading-relaxed">
                To the maximum extent permitted by law, i49 Group, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Termination</h2>
              <p className="text-white/70 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violation of these terms. You may cancel your subscription at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Governing Law</h2>
              <p className="text-white/70 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Nevada, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <p className="text-white/70 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <div className="text-white/70 bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="font-semibold text-white">i49 Group, Inc.</p>
                <p>Attn: Dionne van Zyl</p>
                <p>2248 Meridian Boulevard, Suite H</p>
                <p>Minden, NV 89423</p>
                <p className="mt-2">Tel: 404-803-4180</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/i49-blue-dots.png" 
              alt="LeaderForge" 
              width={24} 
              height={30}
            />
            <span className="text-white/40 text-sm">
              © 2025 i49 Group, Inc. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/40 hover:text-white/60 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}



