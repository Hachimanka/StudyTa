import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TopNav from "../components/TopNav";

export default function Landing() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onThemeChanged = () => {
      try {
        setIsDark(localStorage.getItem("theme") === "dark");
      } catch {
        setIsDark(false);
      }
    };

    // Listen for TopNav's dispatched event when theme changes
    window.addEventListener("themeChanged", onThemeChanged);
    // Also listen to storage in case another tab changes theme
    window.addEventListener("storage", onThemeChanged);

    return () => {
      window.removeEventListener("themeChanged", onThemeChanged);
      window.removeEventListener("storage", onThemeChanged);
    };
  }, []);

  return (
    <div
      id="landingPage"
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? "bg-[#1f1b16] text-[#f5e9df]" : "bg-[#F2D9C7] text-[#4A2C1E]"
      }`}
    >
      <TopNav />

  {/* Hero Section */}
  <section className="flex flex-col items-center text-center py-28 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-extrabold mb-4"
        >
          Study Smarter,<span className="text-[#E29B64]"> Together</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className={`max-w-2xl text-base md:text-lg mb-10 ${
            isDark ? "text-[#f5e9df]/90" : "text-[#5C4333]"
          }`}
        >
          Collaborative study platform with AI-powered tools for notes,
          flashcards, and group learning.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/register"
            className={`font-medium px-8 py-3 rounded-full transition ${
              isDark
                ? "bg-[#E59C5C] text-[#1f1b16] hover:bg-[#e6b97d]"
                : "bg-[#4A2C1E] text-white hover:bg-[#613C2A]"
            }`}
          >
            Get Started
          </Link>
          <button className={`border-2 font-medium px-8 py-3 rounded-full transition ${isDark ? "border-[#f5e9df] text-[#f5e9df] hover:bg-[#3a2a20]" : "border-[#4A2C1E] text-[#4A2C1E] hover:bg-[#4A2C1E] hover:text-white"}`}>
            Learn More
          </button>
        </motion.div>
      </section>

      {/* Interactive Learning Section */}
      <section className={`py-24 px-6 text-center transition-colors duration-500 ${isDark ? "bg-[#2e2119]" : "bg-[#E6C8B1]"}`}>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          Interactive Learning Experience
        </motion.h2>
        <p className="text-[#5C4333] mb-16 max-w-2xl mx-auto">
          Engage with dynamic activities designed to make learning enjoyable and effective
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Auto-Generate Flashcards",
              desc: "Study with digital flashcards that flip and reveal answers. Perfect for memorizing key concepts and terms.",
              btn: "Study now --›",
            },
            {
              title: "Spin the Wheel Quiz",
              desc: "Spin the colorful wheel to get random questions with multiple choice answers. Fun and unpredictable learning!",
              btn: "Spin now --›",
            },
            {
              title: "Track Progress",
              desc: "Click mystery boxes to reveal questions and test your knowledge with surprise multiple choice challenges.",
              btn: "Guess now --›",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`p-8 rounded-xl shadow-md hover:shadow-lg transition ${isDark ? "bg-[#3a2a20] text-[#f5e9df]" : "bg-white"}`}
            >
              <div className="w-12 h-12 rounded-full bg-[#4A2C1E] mx-auto mb-6"></div>
                <h3 className={`font-semibold mb-3 ${isDark ? "text-[#E59C5C]" : "text-[#4A2C1E]"}`}>{item.title}</h3>
                <p className={`${isDark ? "text-[#f5e9df]/90" : "text-[#5C4333]"} text-sm mb-6`}>{item.desc}</p>
                <button className={`border px-6 py-2 rounded-full transition text-sm ${isDark ? "border-[#f5e9df] text-[#f5e9df] hover:bg-[#4A2C1E] hover:text-white" : "border-[#4A2C1E] text-[#4A2C1E] hover:bg-[#4A2C1E] hover:text-white"}`}>
                {item.btn}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
  <section className={`py-24 px-6 text-center transition-colors duration-500 ${isDark ? "bg-[#1f1b16]" : "bg-[#F2D9C7]"}`}>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          How It Works
        </motion.h2>
        <p className="text-[#5C4333] mb-16 max-w-2xl mx-auto">
          Transform your learning in three simple steps: generate flashcards, join study groups, and track progress.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Upload Content",
              desc: "Simply upload your textbooks, notes, or any study content to get started.",
            },
            {
              title: "AI Analysis",
              desc: "Our AI analyzes your content and creates personalized study tools automatically.",
            },
            {
              title: "Track & Learn",
              desc: "Use generated summaries, flashcards, and track your progress over time.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`p-8 rounded-xl shadow-md hover:shadow-lg transition ${isDark ? "bg-[#3a2a20] text-[#f5e9df]" : "bg-[#E6C8B1]"}`}
              >
                <div className={`w-12 h-12 rounded-full mx-auto mb-6 ${isDark ? "bg-[#E59C5C]" : "bg-[#4A2C1E]"}`}></div>
                <h3 className={`font-semibold mb-3 ${isDark ? "text-[#E59C5C]" : "text-[#4A2C1E]"}`}>{item.title}</h3>
                <p className={`${isDark ? "text-[#f5e9df]/90" : "text-[#5C4333]"} text-sm`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className={`py-24 px-6 text-center transition-colors duration-500 ${isDark ? "bg-[#1f1b16]" : "bg-[#F2D9C7]"}`}>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          About StudyMate
        </motion.h2>
        <p className={`${isDark ? "text-[#f5e9df]/90" : "text-[#5C4333]"} max-w-3xl mx-auto leading-relaxed`}>
          We're passionate about making learning more effective and enjoyable. Our team of educators and AI experts have created StudyMate to help students of all ages achieve their academic goals through intelligent, personalized study tools.
        </p>
      </section>

      {/* Footer */}
      <footer className={`py-10 transition-colors duration-500 ${isDark ? "bg-[#2e2119] text-[#f5e9df]" : "bg-[#E6C8B1] text-[#4A2C1E]"}`}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 px-6">
          <div>
            <h3 className="font-bold text-lg mb-3">StudyTa</h3>
            <p className="text-sm">
              Empowering students with AI-driven learning tools.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-1 text-sm">
              <li>hello@toonity.com</li>
              <li>hello@toonity.com</li>
              <li>hello@toonity.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <ul className="space-y-1 text-sm">
              <li>Facebook</li>
              <li>Youtube</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs mt-8 text-[#5C4333]">
          © {new Date().getFullYear()} StudyTa. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
