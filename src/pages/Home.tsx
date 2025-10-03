import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, Zap, LogIn } from "lucide-react";
import gsap from "gsap";

export default function HomePage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    // Animate hero section
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
    );

    // Animate feature cards
    gsap.fromTo(
      ".feature-card",
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white">
      {/* Header */}
      <motion.header 
        className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
          <Link to="/">TalentFlow</Link>
        </div>
        <Link to="/login">
          <Button variant="outline" className="bg-transparent border-blue-400 text-blue-400 hover:bg-blue-500/10 hover:text-white">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Button>
        </Link>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="text-center py-40 px-4 sm:px-6 lg:px-8 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/src/assets/login_cover_v1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10">
            <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-300"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
            TalentFlow
            </motion.h1>
            <motion.p 
                className="text-lg md:text-2xl max-w-3xl mx-auto mb-8 text-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
            Your ultimate destination for discovering top-tier talent and finding your dream job.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 150 }}
            >
                <Link to="/jobs">
                    <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg">
                        Explore Opportunities <ArrowRight className="ml-2" />
                    </Button>
                </Link>
            </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">Why Choose TalentFlow?</h2>
          <p className="text-lg text-gray-400 mt-2">Streamline your hiring process and career search.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="feature-card bg-gray-800/50 p-8 rounded-2xl shadow-lg border border-blue-500/30 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/20 mb-6">
              <Briefcase className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">For Job Seekers</h3>
            <p className="text-gray-400">Discover personalized job recommendations and apply with a single click. Let your dream job find you.</p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card bg-gray-800/50 p-8 rounded-2xl shadow-lg border border-teal-500/30 hover:border-teal-500 transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-500/20 mb-6">
              <Users className="h-8 w-8 text-teal-300" />
            </div>
            <h3 className="text-2xl font-bold mb-3">For Employers</h3>
            <p className="text-gray-400">Access a diverse pool of qualified candidates. Our smart filters and Kanban boards make hiring a breeze.</p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card bg-gray-800/50 p-8 rounded-2xl shadow-lg border border-green-500/30 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-6">
              <Zap className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">AI-Powered</h3>
            <p className="text-gray-400">Leverage our AI-driven assessments and candidate matching to make smarter, faster hiring decisions.</p>
          </div>
        </div>
      </section>
    </div>
  );
}