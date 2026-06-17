'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import CartDrawer from '@/components/shared/cart-drawer';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Clock, Heart, Award, ShieldCheck, HelpCircle, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Product Designer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      comment: 'FOODFLOW completely changed my lunch routine. The delivery is consistently fast, and the packaging is premium!',
      rating: 5,
    },
    {
      name: 'David Chen',
      role: 'Software Engineer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      comment: 'The real-time order tracking is spot on. I know exactly when my cheeseburger is leaving the grill and arriving at my door.',
      rating: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'Operations Lead',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      comment: 'Excellent customer service. When I wanted to change my delivery address at the last minute, it was updated instantly!',
      rating: 5,
    },
  ];

  const steps = [
    {
      title: 'Select Gourmet Dish',
      desc: 'Browse our curated menu featuring the highest quality recipes.',
      icon: Heart,
    },
    {
      title: 'Instant Checkout',
      desc: 'Apply coupons, select your saved address, and pay in one click.',
      icon: ShieldCheck,
    },
    {
      title: 'Live Tracking',
      desc: 'Monitor your food preparation and delivery progress in real-time.',
      icon: Clock,
    },
    {
      title: 'Enjoy Premium Taste',
      desc: 'Receive your food hot, fresh, and beautifully packaged.',
      icon: Award,
    },
  ];

  const faqs = [
    {
      q: 'How does the real-time order tracking work?',
      a: 'Once your order is confirmed, we open a secure WebSockets connection. You will see instant updates for each lifecycle stage: Pending, Confirmed, Preparing, Out for Delivery, and Delivered without refreshing the page.',
    },
    {
      q: 'What is the average delivery time?',
      a: 'Our kitchen prepares dishes instantly. Average delivery time ranges from 15 to 25 minutes depending on your distance from our gourmet kitchen hub.',
    },
    {
      q: 'Are there corporate or bulk discounts?',
      a: 'Yes! Administrators can release active coupons (e.g. FLOW20 or FLOW50) which you can apply directly in the slide-over cart drawer to subtract values from your total.',
    },
    {
      q: 'Can I save multiple delivery addresses?',
      a: 'Absolutely. Customers can create and manage multiple addresses (like Home, Office, or Gym) inside their profile dashboard and pick the preferred one during checkout.',
    },
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartDrawer />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-36 bg-radial from-orange-500/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Hero Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-current" />
                India's Premium Food Ordering Experience
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-outfit text-foreground leading-[1.1]">
                Authentic Indian Flavors
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-red-500 bg-clip-text text-transparent">
                  Delivered Live.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                From fragrant Thalassery Biryani to crispy ghee roast Masala Dosa, order your local favorites. Track your culinary journey in real-time.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/customer/menu"
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all text-sm group"
                >
                  Explore Indian Cuisines
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about-project"
                  className="px-6 py-3.5 border border-border/60 hover:bg-secondary/40 text-foreground font-semibold rounded-xl text-sm transition-all"
                >
                  View Architecture
                </Link>
              </div>

              {/* Stats badges */}
              <div className="pt-6 grid grid-cols-4 gap-4 border-t border-border/40">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-outfit text-foreground">50k+</h3>
                  <p className="text-[10px] text-muted-foreground">Happy Customers</p>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-outfit text-foreground">1M+</h3>
                  <p className="text-[10px] text-muted-foreground">Orders Delivered</p>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-outfit text-foreground">150+</h3>
                  <p className="text-[10px] text-muted-foreground">Premium Partners</p>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-outfit text-foreground">30 min</h3>
                  <p className="text-[10px] text-muted-foreground">Average Delivery</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Right Image / Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square rounded-full bg-gradient-to-tr from-orange-500/10 to-amber-500/10 blur-2xl absolute -z-10" />
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"
                alt="Premium Indian Biryani"
                className="w-full max-w-sm rounded-[2.5rem] object-cover aspect-square shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-2 border-white/5"
              />
              {/* Micro Float badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute top-10 -left-6 glass px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-lg border border-white/10"
              >
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Fast Delivery</h4>
                  <p className="text-[10px] text-muted-foreground">Fresh and warm</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 border-t border-border/40 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-foreground">How FOODFLOW Works</h2>
            <p className="text-muted-foreground">Getting authentic dishes delivered straight to your door is simple and fast.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass p-6 rounded-2xl relative space-y-4 hover:border-orange-500/30 transition-all"
              >
                <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                  0{idx + 1}
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 w-fit">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg font-outfit">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-foreground">Loved by Food Lovers</h2>
            <p className="text-muted-foreground">See what our customers have to say about their spicy delivery journey.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass p-6 rounded-2xl flex flex-col justify-between hover:border-orange-500/30 transition-all"
              >
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex text-yellow-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm italic text-muted-foreground leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
                </div>
                <div className="flex items-center space-x-3 pt-6 border-t border-border/30 mt-6">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-border/40 bg-secondary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-foreground">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Find answers to help you navigate your FOODFLOW experience.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass rounded-xl overflow-hidden transition-all border border-border/40"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground text-sm sm:text-base hover:bg-secondary/20 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-orange-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/20">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit leading-tight">
            Ready to Experience the Flow?
          </h2>
          <p className="text-orange-100 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Register your account, place your order, and watch our gourmet chefs prepare your food live.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3.5 bg-white text-orange-700 font-extrabold rounded-xl shadow-lg hover:bg-orange-50 transition-all text-sm"
            >
              Get Started Now
            </Link>
            <Link
              href="/customer/menu"
              className="px-6 py-3.5 border border-white/20 hover:bg-white/10 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Browse Menu
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-orange-600/10 blur-3xl rounded-full translate-x-1/3 translate-y-1/3" />
      </section>

      <Footer />
    </div>
  );
}
