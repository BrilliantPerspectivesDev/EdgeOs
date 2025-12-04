'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Check, ArrowRight, Zap, Users, TrendingUp, Clock, Target, Brain } from 'lucide-react'
import landingContent from '@/content/landingContent.json'

export default function LandingPage() {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-x-hidden">
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
              {landingContent.brand.name}
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#00A8E8]/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-[#5B4FD9]/20 rounded-full blur-[128px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-8">
            <Zap className="w-4 h-4 text-[#00A8E8]" />
            <span>Used to build 27 startups</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
            {landingContent.hero.headline}
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-4 leading-relaxed">
            {landingContent.hero.subheadline}
          </p>
          
          <p className="text-base text-white/40 max-w-2xl mx-auto mb-10">
            {landingContent.hero.description}
          </p>
          
          <button 
            onClick={scrollToPricing}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-[#00A8E8] hover:bg-[#00A8E8]/90 text-white font-semibold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,168,232,0.3)]"
          >
            {landingContent.hero.cta}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Module Table Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.02] border-b border-white/10">
              <div className="col-span-5 md:col-span-6">
                <span className="text-[#00A8E8] font-semibold italic text-lg">{landingContent.brand.name}</span>
              </div>
              <div className="col-span-1 text-center text-white/40 text-sm hidden md:block">Module</div>
              <div className="col-span-7 md:col-span-5 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="font-semibold text-white/90">Startup</div>
                  <div className="text-xs text-white/40">(12 Sessions)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-white/90">Growth</div>
                  <div className="text-xs text-white/40">(36 Sessions)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-[#00A8E8] italic">All-In</div>
                  <div className="text-xs text-white/40">(48 Sessions)</div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            {landingContent.modules.series.map((series, seriesIndex) => (
              <div key={series.name} className={seriesIndex > 0 ? 'border-t border-white/5' : ''}>
                {/* Series Header */}
                <div className="px-6 py-3 bg-white/[0.01]">
                  <div className="font-semibold text-white/90">{series.name}</div>
                  <div className="text-xs text-white/40">{series.subtitle}</div>
                </div>
                
                {/* Sessions */}
                {series.sessions.map((session) => (
                  <div 
                    key={session.number} 
                    className="grid grid-cols-12 gap-4 px-6 py-3 border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="col-span-5 md:col-span-6 flex items-center gap-4">
                      <span className="text-white/40 text-sm w-6 hidden md:block">{session.number}</span>
                      <span className="text-white/80 text-sm">{session.title}</span>
                    </div>
                    <div className="col-span-1 hidden md:block"></div>
                    <div className="col-span-7 md:col-span-5 grid grid-cols-3 gap-2">
                      <div className="flex justify-center">
                        {session.startup && <Check className="w-5 h-5 text-[#00A8E8]" />}
                      </div>
                      <div className="flex justify-center">
                        {session.growth && <Check className="w-5 h-5 text-[#00A8E8]" />}
                      </div>
                      <div className="flex justify-center">
                        {session.allIn && <Check className="w-5 h-5 text-[#00A8E8]" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-white">
            {landingContent.problem.headline}
          </h2>
          <div className="space-y-6">
            {landingContent.problem.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-lg md:text-xl text-white/60 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00A8E8]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-white">
            {landingContent.solution.headline}
          </h2>
          <div className="space-y-8">
            {landingContent.solution.paragraphs.map((paragraph, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00A8E8]/10 border border-[#00A8E8]/20 flex items-center justify-center">
                  {index === 0 && <Clock className="w-5 h-5 text-[#00A8E8]" />}
                  {index === 1 && <Target className="w-5 h-5 text-[#00A8E8]" />}
                  {index === 2 && <Brain className="w-5 h-5 text-[#00A8E8]" />}
                </div>
                <p className="text-lg text-white/70 leading-relaxed pt-2">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center text-white">
            {landingContent.features.headline}
          </h2>
          <p className="text-center text-[#00A8E8] mb-16">
            {landingContent.features.bonus}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Team Access', desc: 'Unlimited team members on every plan' },
              { icon: Zap, title: 'Quick Sessions', desc: '15-25 min sessions fit any schedule' },
              { icon: TrendingUp, title: 'Track Progress', desc: 'Dashboard to monitor team growth' },
            ].map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#00A8E8]/30 transition-all hover:bg-white/[0.04]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00A8E8]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#00A8E8]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">
            {landingContent.outcomes.headline}
          </h2>
          
          <div className="space-y-4">
            {landingContent.outcomes.items.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-white">
            {landingContent.audience.headline}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {landingContent.audience.items.map((item, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10"
              >
                <p className="text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00A8E8]/5 via-transparent to-[#5B4FD9]/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">
            {landingContent.pricing.headline}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {landingContent.pricing.plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl p-8 border transition-all hover:scale-[1.02] ${
                  plan.highlighted 
                    ? 'bg-gradient-to-b from-[#00A8E8]/10 to-transparent border-[#00A8E8]/40 shadow-[0_0_60px_-15px_rgba(0,168,232,0.3)]' 
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00A8E8] text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-[#00A8E8] mb-4">{plan.sessions}</p>
                <p className="text-white/50 text-sm mb-6">{plan.description}</p>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#00A8E8] flex-shrink-0" />
                      <span className="text-sm text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/register"
                  className={`block text-center py-3 px-6 rounded-full font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-[#00A8E8] hover:bg-[#00A8E8]/90 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-white">
            {landingContent.credibility.headline}
          </h2>
          
          <div className="space-y-6 text-center mb-12">
            {landingContent.credibility.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-lg text-white/60 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          
          <blockquote className="relative p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10">
            <div className="absolute -top-4 left-8 text-6xl text-[#00A8E8]/30">"</div>
            <p className="text-xl md:text-2xl text-white/80 italic mb-4 relative z-10">
              {landingContent.credibility.testimonial.quote}
            </p>
            <cite className="text-[#00A8E8] font-semibold not-italic">
              — {landingContent.credibility.testimonial.author}
            </cite>
          </blockquote>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            {landingContent.guarantee.headline}
          </h2>
          
          {landingContent.guarantee.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-lg text-white/60 mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00A8E8]/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
            {landingContent.finalCta.headline}
          </h2>
          
          <button 
            onClick={scrollToPricing}
            className="group inline-flex items-center gap-2 px-10 py-5 bg-[#00A8E8] hover:bg-[#00A8E8]/90 text-white font-bold text-lg rounded-full transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(0,168,232,0.4)] mb-12"
          >
            {landingContent.finalCta.cta}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            {landingContent.finalCta.ps}
          </p>
        </div>
      </section>

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
            <span className="text-white/20">•</span>
            <Link href="/terms" className="text-white/40 hover:text-white/60 text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

