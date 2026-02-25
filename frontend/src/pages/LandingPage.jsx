import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Landing() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  const [activeModal, setActiveModal] = useState(null);

  const modalContent = {
    help: {
      title: "Help Center",
      content: (
        <div className="space-y-4 text-left">
          <div>
            <h4 className="font-bold text-lg mb-1">How do I get started?</h4>
            <p>Create an account, then upload your study materials in the Library to generate flashcards and quizzes.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">Is StudyTa free?</h4>
            <p>Yes, our core features are free for all students to help them study smarter.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">How do I contact support?</h4>
            <p>You can reach us at support@studyta.com for any issues or feedback.</p>
          </div>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-4 text-left">
          <p className="text-sm opacity-70">Last updated: December 2025</p>
          <p>At StudyTa, we take your privacy seriously. This policy describes how we collect and use your data.</p>
          <div>
            <h4 className="font-bold mb-1">Information We Collect</h4>
            <p>We collect information you provide directly to us, such as when you create an account, upload documents, or contact us.</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">How We Use Your Information</h4>
            <p>We use your documents solely to generate study materials (flashcards, summaries, quizzes) for your personal use.</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">Data Security</h4>
            <p>We implement appropriate security measures to protect your personal information and uploaded content.</p>
          </div>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      content: (
        <div className="space-y-4 text-left">
          <p>Welcome to StudyTa. By using our website, you agree to these terms.</p>
          <div>
            <h4 className="font-bold mb-1">User Conduct</h4>
            <p>You agree not to misuse our services or help anyone else do so. You are responsible for the content you upload.</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">Content Ownership</h4>
            <p>You retain all rights to the documents you upload. By uploading, you grant us permission to process them to provide our services.</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">Disclaimer</h4>
            <p>StudyTa is provided "as is" without warranties of any kind. We are not responsible for any errors in generated study materials.</p>
          </div>
        </div>
      )
    }
  };

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

  const primaryColor = '#6F422B';

  const icons = {
    flashcards: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-12 h-12 mx-auto" aria-hidden>
        <path fill="#6F422B" d="m21.47 4.35l-1.34-.56v9.03l2.43-5.86c.41-1.02-.06-2.19-1.09-2.61m-19.5 3.7L6.93 20a2.01 2.01 0 0 0 1.81 1.26c.26 0 .53-.05.79-.16l7.37-3.05c.75-.31 1.21-1.05 1.23-1.79c.01-.26-.04-.55-.13-.81L13 3.5a1.954 1.954 0 0 0-1.81-1.25c-.26 0-.52.06-.77.15L3.06 5.45a1.994 1.994 0 0 0-1.09 2.6m16.15-3.8a2 2 0 0 0-2-2h-1.45l3.45 8.34" />
      </svg>
    ),
    summarize: (
      <svg viewBox="0 0 80 80" className="w-12 h-12 mx-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M54.0746 58.0042C54.7746 57.4602 55.4106 56.8242 56.6786 55.5562L72.5066 39.7242C72.8906 39.3442 72.7146 38.6842 72.2066 38.5042C69.7278 37.645 67.4785 36.2303 65.6306 34.3682C63.7684 32.5203 62.3537 30.2709 61.4946 27.7922C61.3146 27.2842 60.6546 27.1082 60.2746 27.4922L44.4386 43.3202C43.1706 44.5882 42.5346 45.2242 41.9906 45.9242C41.3426 46.7535 40.7932 47.6415 40.3426 48.5882C39.9626 49.3882 39.6786 50.2442 39.1106 51.9482L38.3746 54.1482L37.2066 57.6482L36.1146 60.9282C35.9784 61.3393 35.9592 61.7801 36.0591 62.2015C36.159 62.6229 36.3741 63.0082 36.6803 63.3144C36.9865 63.6206 37.3718 63.8357 37.7932 63.9356C38.2146 64.0355 38.6555 64.0163 39.0666 63.8802L42.3466 62.7882L45.8466 61.6202L48.0466 60.8842C49.7506 60.3162 50.6066 60.0362 51.4066 59.6522C52.3532 59.1988 53.2452 58.6495 54.0746 58.0042ZM77.4666 34.7682C79.0892 33.145 80.0005 30.9438 80.0001 28.6487C79.9998 26.3537 79.0877 24.1527 77.4646 22.5302C75.8414 20.9076 73.6402 19.9962 71.3451 19.9966C69.0501 19.997 66.8492 20.909 65.2266 22.5322L64.7226 23.0442C64.4792 23.2821 64.298 23.5761 64.1948 23.9004C64.0916 24.2247 64.0695 24.5693 64.1306 24.9042C64.2106 25.3322 64.3506 25.9642 64.6106 26.7122C65.1306 28.2122 66.1146 30.1802 67.9666 32.0322C69.8186 33.8842 71.7866 34.8682 73.2866 35.3882C74.0386 35.6482 74.6666 35.7882 75.0946 35.8682C75.4293 35.9257 75.773 35.902 76.0967 35.799C76.4204 35.6959 76.7146 35.5166 76.9546 35.2762L77.4666 34.7682Z" fill="#6F422B" />
        <path fillRule="evenodd" clipRule="evenodd" d="M4.688 4.688C-4.76837e-07 9.372 0 16.916 0 32V48C0 63.084 -4.76837e-07 70.628 4.688 75.312C9.376 79.996 16.916 80 32 80H40C55.084 80 62.628 80 67.312 75.312C71.924 70.704 72 63.328 72 48.72L60.728 59.992C59.648 61.072 58.764 61.956 57.768 62.736C56.5997 63.651 55.3333 64.4332 53.992 65.068C52.7645 65.6203 51.5033 66.0946 50.216 66.488L40.968 69.572C39.4999 70.0616 37.9245 70.1326 36.4183 69.7772C34.9121 69.4218 33.5347 68.6538 32.4404 67.5596C31.3461 66.4653 30.5782 65.0878 30.2228 63.5817C29.8674 62.0755 29.9384 60.5001 30.428 59.032L31.524 55.752L33.424 50.048L33.508 49.784C33.992 48.336 34.388 47.152 34.932 46.008C35.572 44.664 36.3493 43.4067 37.264 42.236C38.044 41.236 38.928 40.356 40.008 39.276L56.032 23.248L60.48 18.8L60.988 18.292C62.3472 16.9286 63.9627 15.8475 65.7413 15.1109C67.52 14.3743 69.4268 13.9968 71.352 14C70.748 9.88 69.576 6.948 67.312 4.688C62.628 -4.76837e-07 55.084 0 40 0H32C16.916 0 9.372 -4.76837e-07 4.688 4.688ZM17 28C17 27.2044 17.3161 26.4413 17.8787 25.8787C18.4413 25.3161 19.2044 25 20 25H46C46.7957 25 47.5587 25.3161 48.1213 25.8787C48.6839 26.4413 49 27.2044 49 28C49 28.7956 48.6839 29.5587 48.1213 30.1213C47.5587 30.6839 46.7957 31 46 31H20C19.2044 31 18.4413 30.6839 17.8787 30.1213C17.3161 29.5587 17 28.7956 17 28ZM17 44C17 43.2043 17.3161 42.4413 17.8787 41.8787C18.4413 41.3161 19.2044 41 20 41H30C30.7956 41 31.5587 41.3161 32.1213 41.8787C32.6839 42.4413 33 43.2043 33 44C33 44.7957 32.6839 45.5587 32.1213 46.1213C31.5587 46.6839 30.7956 47 30 47H20C19.2044 47 18.4413 46.6839 17.8787 46.1213C17.3161 45.5587 17 44.7957 17 44ZM17 60C17 59.2043 17.3161 58.4413 17.8787 57.8787C18.4413 57.3161 19.2044 57 20 57H26C26.7956 57 27.5587 57.3161 28.1213 57.8787C28.6839 58.4413 29 59.2043 29 60C29 60.7957 28.6839 61.5587 28.1213 62.1213C27.5587 62.6839 26.7956 63 26 63H20C19.2044 63 18.4413 62.6839 17.8787 62.1213C17.3161 61.5587 17 60.7957 17 60Z" fill="#6F422B" />
      </svg>
    ),
    quiz: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-6" aria-hidden>
        <path fill="#6F422B" fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10 2a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0V8zm-4 3a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0v-5zm8 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2z" clipRule="evenodd"/>
      </svg>
    ),
    // How It Works icons
    upload: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-12 h-12 mx-auto mb-6" aria-hidden>
        <path fill={primaryColor} fillRule="evenodd" d="M11.78 5.841a.75.75 0 0 1-1.06 0l-1.97-1.97v7.379a.75.75 0 0 1-1.5 0V3.871l-1.97 1.97a.75.75 0 0 1-1.06-1.06l3.25-3.25L8 1l.53.53l3.25 3.25a.75.75 0 0 1 0 1.061ZM2.5 9.75a.75.75 0 0 0-1.5 0V13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.75a.75.75 0 0 0-1.5 0V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V9.75Z" clipRule="evenodd" />
      </svg>
    ),
    ai: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-6" aria-hidden>
        <path fill="none" stroke={primaryColor} strokeLinejoin="round" strokeWidth="2" d="M15 19c1.2-3.678 2.526-5.005 6-6c-3.474-.995-4.8-2.322-6-6c-1.2 3.678-2.526 5.005-6 6c3.474.995 4.8 2.322 6 6Zm-8-9c.6-1.84 1.263-2.503 3-3c-1.737-.497-2.4-1.16-3-3c-.6 1.84-1.263 2.503-3 3c1.737.497 2.4 1.16 3 3Zm1.5 10c.3-.92.631-1.251 1.5-1.5c-.869-.249-1.2-.58-1.5-1.5c-.3.92-.631 1.251-1.5 1.5c.869.249 1.2.58 1.5 1.5Z" />
      </svg>
    ),
    track: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-12 h-12 mx-auto mb-6" aria-hidden>
        <path fill="none" stroke={primaryColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 21h-1c-3.771 0-5.657 0-6.828-1.172S2 16.771 2 13v-3c0-3.771 0-5.657 1.172-6.828S6.229 2 10 2h2c3.771 0 5.657 0 6.828 1.172S20 6.229 20 10v.5m-2.593 3.904a.638.638 0 0 1 1.186 0l.037.093a5.1 5.1 0 0 0 2.873 2.873l.093.037a.638.638 0 0 1 0 1.186l-.093.037a5.1 5.1 0 0 0-2.873 2.873l-.037.093a.638.638 0 0 1-1.186 0l-.037-.093a5.1 5.1 0 0 0-2.873-2.873l-.093-.037a.638.638 0 0 1 0-1.186l.093-.037a5.1 5.1 0 0 0 2.873-2.873zM7 7h8m-8 4.5h8M7 16h4" />
      </svg>
    ),
  };

  return (
    <div
      id="landingPage"
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? "bg-[#1f1b16] text-[#f5e9df]" : "bg-[#F2D9C7] text-[#6F422B]"
      }`}
    >
      {/* TopNav is globally mounted in App.jsx */}
  {/* Hero Section */}
  <section
    id="home"
    className="relative min-h-screen"
    style={{
      backgroundImage: `url('/landing/hero.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <div
      className="absolute inset-0"
      style={{ background: isDark ? 'rgba(31,27,22,0.65)' : 'rgba(242,217,199,0.72)' }}
    />
    <div className="relative z-10 flex flex-col max-w-4xl mx-auto py-30 ml-50">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-6xl md:text-7xl font-extrabold mb-6"
        >
          Study Smarter,<span className="flex text-[#E29B64]"> Together</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className={`max-w-2xl text-base md:text-lg mb-12 ${
            isDark ? "text-[#f5e9df]/90" : "text-[#6F422B]"
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
          className="flex flex-col sm:flex-row gap-4 mt-6"
        >
          <Link
            to="/register"
            className={`font-medium px-8 py-3 rounded-full transition ${
              isDark
                ? "bg-[#6F422B] text-white hover:bg-[#7b513a]"
                : "bg-[#6F422B] text-white hover:bg-[#7b513a]"
            }`}
          >
            Get Started
          </Link>
          <Link to="/login" className={`border-2 font-medium px-8 py-3 rounded-full transition ${isDark ? "border-[#6F422B] text-[#f5e9df] hover:bg-[#6F422B] hover:text-white" : "border-[#6F422B] text-[#6F422B] hover:bg-[#6F422B] hover:text-white"}`}>
            Learn More
          </Link>
        </motion.div>
    </div>
  </section>

      {/* Interactive Learning Section */}
      <section
        id="features"
        className="relative min-h-screen flex items-center text-center px-6 -mt-12 md:-mt-20"
        style={{
          backgroundImage: `url('/landing/features.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: isDark ? 'rgba(31,27,22,0.65)' : 'rgba(242,217,199,0.72)' }}
        />
        <div className="relative z-10 w-full py-20">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl md:text-5xl font-bold mb-3 text-[#6F422B]"
          >
            Interactive Learning Experience
          </motion.h2>
          <p className="text-[#6F422B] mb-16 text-lg max-w-3xl mx-auto">
            Engage with dynamic activities designed to make learning enjoyable and effective
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-6">
            {[
              {
                title: "Auto-Generate Flashcards",
                desc: "Study with digital flashcards that flip and reveal answers. Perfect for memorizing key concepts and terms.",
                btn: "Study now --›",
                mode: 'flashcards'
              },
              {
                title: "Summarize Long Paragraphs",
                desc: "Upload your documents with long texts and make it smaller. Lessen your readings with auto-summarize.",
                btn: "Summarize now --›",
                mode: 'summarize'
              },
              {
                title: "Track Progress",
                desc: "Click mystery boxes to reveal questions and test your knowledge with surprise multiple choice challenges.",
                btn: "Guess now --›",
                mode: 'quiz'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                className={`p-8 rounded-xl shadow-md hover:shadow-lg transition ${
                    isDark
                      ? "bg-[#3a2a20] text-[#f5e9df]" 
                      : "bg-white/90 text-[#6F422B]"
                  } min-h-[22rem] flex flex-col justify-between`}
              >
                <div className="mb-6">
                  {icons[item.mode]}
                </div>
                  <h3 className={`font-semibold text-xl mb-3 ${isDark ? "text-[#6F422B]" : "text-[#6F422B]"}`}>{item.title}</h3>
                  <p className={`${isDark ? "text-[#6F422B]/90" : "text-[#6F422B]"} text-base mb-6`}>{item.desc}</p>
                  <Link
                    to={`/study?mode=${item.mode}`}
                    className="border border-[#6F422B] text-[#6F422B] px-6 py-2 rounded-full transition text-sm hover:bg-[#6F422B] hover:text-white"                  >
                    {item.btn}
                  </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="relative min-h-screen flex items-center text-center px-6"
          style={{
            backgroundImage: `url('/landing/how.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: isDark ? 'rgba(31,27,22,0.65)' : 'rgba(242,217,199,0.72)' }}
          />
          <div className="relative z-10 w-full py-24">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-5xl font-bold mb-3"
        >
          How It Works
        </motion.h2>
        <p className="text-[#5C4333] mb-16 text-lg max-w-3xl mx-auto">
          Transform your learning in three simple steps: generate flashcards, join study groups, and track progress.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-6">
          {[
            {
              title: "Upload Content",
              desc: "Simply upload your textbooks, notes, or any study content to get started.",
              mode: 'upload'
            },
            {
              title: "AI Analysis",
              desc: "Our AI analyzes your content and creates personalized study tools automatically.",
              mode: 'ai'
            },
            {
              title: "Track & Learn",
              desc: "Use generated summaries, flashcards, and track your progress over time.",
              mode: 'track'
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`p-8 rounded-xl transition ${isDark ? "bg-transparent text-[#f5e9df]" : "bg-transparent"} min-h-[22rem] flex flex-col items-center gap-3`}
              >
                <div className="mb-2">{icons[item.mode]}</div>
                <h3 className={`font-semibold mb-1 text-3xl text-[#6F422B]`}>{item.title}</h3>
                <p className={`${isDark ? "text-[#f5e9df]/90" : "text-[#5C4333]"} text-lg`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative min-h-screen flex items-center text-center px-6"
        style={{
          backgroundImage: `url('/landing/about.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: isDark ? 'rgba(31,27,22,0.65)' : 'rgba(242,217,199,0.72)' }}
        />
        <div className="relative z-10 w-full py-24">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-5xl font-bold mb-5"
        >
          About StudyMate
        </motion.h2>
        <p className={`${isDark ? "text-[#f5e9df]/90" : "text-[#6F422B]"} max-w-3xl text-lg mx-auto leading-relaxed`}>
          We're passionate about making learning more effective and enjoyable. Our team of educators and AI experts have created StudyMate to help students of all ages achieve their academic goals through intelligent, personalized study tools.
        </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-10 transition-colors duration-500 ${isDark ? "bg-[#2e2119] text-[#f5e9df]" : "bg-[#E6C8B1] text-[#6F422B]"}`}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 px-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/StudyTa.ico" alt="StudyTa" className="w-8 h-8" />
              <h3 className="font-bold text-lg">StudyTa</h3>
            </div>
            <p className="text-sm">
              Empowering students with AI-driven learning tools.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-1 text-sm">
              <li><button onClick={() => setActiveModal('help')} className="hover:underline text-left">Help Center</button></li>
              <li><button onClick={() => setActiveModal('privacy')} className="hover:underline text-left">Privacy Policy</button></li>
              <li><button onClick={() => setActiveModal('terms')} className="hover:underline text-left">Terms of Services</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="https://web.facebook.com/profile.php?id=61584961109707" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs mt-8 text-[#5C4333]">
          © {new Date().getFullYear()} StudyTa. All rights reserved.
        </div>
      </footer>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-xl shadow-2xl p-6 overflow-hidden ${
                isDark ? "bg-[#2e2119] text-[#f5e9df] border border-[#4a3525]" : "bg-white text-[#6F422B]"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{modalContent[activeModal].title}</h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {modalContent[activeModal].content}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    isDark 
                      ? "bg-[#6F422B] text-white hover:bg-[#7b513a]" 
                      : "bg-[#6F422B] text-white hover:bg-[#7b513a]"
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
