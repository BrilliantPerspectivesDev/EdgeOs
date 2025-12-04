'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-white/60 mb-12">Last updated: December 4, 2025</p>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-white/70 leading-relaxed">
                i49 Group, Inc. ("we," "our," or "us") operates the LeaderForge platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <p className="text-white/70 leading-relaxed mb-4">We may collect information about you in a variety of ways, including:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li><strong className="text-white">Personal Data:</strong> Name, email address, phone number, and company information that you voluntarily provide when registering.</li>
                <li><strong className="text-white">Usage Data:</strong> Information about how you access and use the platform, including training progress, completion rates, and engagement metrics.</li>
                <li><strong className="text-white">Device Data:</strong> Information about your device, browser type, IP address, and operating system.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-white/70 leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>Provide, operate, and maintain our platform</li>
                <li>Improve, personalize, and expand our services</li>
                <li>Track your training progress and provide relevant recommendations</li>
                <li>Communicate with you about updates, support, and marketing (with your consent)</li>
                <li>Process transactions and send related information</li>
                <li>Protect against fraudulent or illegal activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Sharing Your Information</h2>
              <p className="text-white/70 leading-relaxed">
                We do not sell your personal information. We may share your information with third-party service providers who assist us in operating our platform, conducting our business, or serving our users. These parties are obligated to keep your information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="text-white/70 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="text-white/70 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                If you have questions about this Privacy Policy, please contact us at:
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
            <Link href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/40 hover:text-white/60 text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

