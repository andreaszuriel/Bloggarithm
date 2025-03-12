"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import dynamic from "next/dynamic";

const FeatureCard = dynamic(() => import("../components/featureCard.module"));
const StatsSection = dynamic(() => import("../components/statsSections.module"));

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Head>
        <title>Amplify Your Voice - Create Impactful Content</title>
        <meta 
          name="description" 
          content="Where algorithms meet artistry. Craft compelling content that resonates with readers and ranks higher." 
        />
      </Head>
      <div className="min-h-screen overflow-x-hidden bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Amplify Your Voice
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 mx-auto max-w-2xl">
              Where algorithms meet artistry. Craft compelling content that resonates with readers and ranks higher.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                className="bg-blue-500 text-white px-8 py-4 rounded-full hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200 hover:scale-105"
                onClick={() => router.push("/auth/signup")}
              >
                Start Writing Free
              </button>
              <button 
                className="border-2 border-blue-500 text-blue-500 px-8 py-4 rounded-full hover:bg-blue-50 transition-all"
                onClick={() => router.push("/blog")}
              >
                Explore Blogs
              </button>
            </div>
          </div>
        </section>

        {/* Featured Blogs Preview */}
        <section className="py-16 bg-gray-50 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Trending Insights</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Add actual blog previews here */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse" />
                  <h3 className="font-semibold mb-2">The Future of AI Writing</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Discover how machine learning is transforming content creation...
                  </p>
                  <button className="text-blue-500 text-sm hover:underline">
                    Read More →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              title="Smart Editor"
              description="Real-time AI suggestions & grammar perfection"
              icon="✨"
              onClick={() => router.push("/blog")}
            />
            <FeatureCard 
              title="Deep Analytics"
              description="Audience engagement insights & SEO scoring"
              icon="📈"
              onClick={() => router.push("/blog")}
            />
            <FeatureCard 
              title="Templates"
              description="Professionally designed writing frameworks"
              icon="📑"
              onClick={() => router.push("/blog")}
            />
            <FeatureCard 
              title="Collaboration"
              description="Real-time co-writing & feedback system"
              icon="👥"
              onClick={() => router.push("/blog")}
            />
          </div>
        </section>

        <StatsSection />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-4xl font-bold mb-8">Join 50,000+ Writers Today</h2>
            <p className="text-xl mb-12 opacity-90">Start creating content that matters. No credit card required.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                className="bg-white text-blue-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
                onClick={() => router.push("/auth/signup")}
              >
                Try Free for 14 Days
              </button>
              <button 
                className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white/10 transition-all"
                onClick={() => router.push("/blog")}
              >
                Watch Demo Video
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
