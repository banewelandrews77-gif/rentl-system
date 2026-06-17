'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface LogoProps {
  showText?: boolean;
  scrolled?: boolean;
  isHomePage?: boolean;
  size?: number;
  className?: string;
}

export function Logo({
  showText = true,
  scrolled = false,
  isHomePage = false,
  size = 36,
  className = '',
}: LogoProps) {
  // Determine color theme based on header scrolled state or page context
  const textDarkTheme = scrolled || !isHomePage;
  
  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* SVG Icon Emblem */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          whileHover="scale(1.05)"
          whileTap="scale(0.95)"
          className="cursor-pointer drop-shadow-md"
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {/* Definitions for gorgeous premium gradients */}
          <defs>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="charcoalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#292524" />
              <stop offset="100%" stopColor="#0c0a09" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background structural shield */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#charcoalGrad)"
            className="transition-all duration-300"
          />

          {/* Ambient Glow behind the connector nodes */}
          <circle cx="50" cy="50" r="28" fill="url(#glowGrad)" className="opacity-40 animate-pulse" />

          {/* Left House Pillar / Vertical Support */}
          <motion.path
            d="M28 72 V38 C28 34 31 30 35 30 H42 C44 30 46 32 46 34 V72"
            stroke="white"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Right House Pillar / Vertical Support */}
          <motion.path
            d="M72 72 V48 C72 44 69 40 65 40 H58 C56 40 54 42 54 44 V72"
            stroke="url(#amberGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
          />

          {/* Interlocking Roof / Gable Canopy (Forming an abstract 'H' & House structure) */}
          <motion.path
            d="M22 42 L46 22 C48 20 52 20 54 22 L78 42"
            stroke="url(#amberGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          />

          {/* Dynamic "Connect" Bridge Line (Linking both pillars) */}
          <motion.line
            x1="46"
            y1="56"
            x2="54"
            y2="56"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />

          {/* Core Hub / Glowing Network Connector Node */}
          <motion.circle
            cx="50"
            cy="56"
            r="7"
            fill="#fbbf24"
            stroke="white"
            strokeWidth="2.5"
            whileHover={{ scale: 1.3 }}
            animate={{ 
              scale: [1, 1.15, 1],
              filter: ["drop-shadow(0px 0px 2px #f59e0b)", "drop-shadow(0px 0px 6px #f59e0b)", "drop-shadow(0px 0px 2px #f59e0b)"]
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />

          {/* Additional Satellite Connector Node (Top apex) */}
          <motion.circle
            cx="50"
            cy="22"
            r="4.5"
            fill="white"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </motion.svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span 
          className={`text-xl font-black tracking-tighter transition-all duration-300 ${
            textDarkTheme ? 'text-stone-950' : 'text-stone-900'
          }`}
        >
          HostelConnect
          <span className="text-amber-500 font-extrabold ml-0.5 tracking-tight relative">
            GH
            <span className="absolute -bottom-0.5 left-0.5 right-0 h-[2.5px] bg-amber-500 rounded-full scale-x-75 origin-left group-hover:scale-x-100 transition-transform duration-300" />
          </span>
        </span>
      )}
    </div>
  );
}
