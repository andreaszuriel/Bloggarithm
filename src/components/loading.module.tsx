"use client";

import React, { useEffect, useState } from "react";

export default function AtomicLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-800 ease-in-out ${
        !isVisible ? "opacity-0 invisible" : ""
      } bg-[var(--background-color)]`}
    >
      <div className="relative w-48 h-48">
        {/* Nucleus */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full animate-nucleus shadow-[0_0_40px_rgba(14,165,233,0.3)] bg-[var(--gradient-primary)]" />
        </div>

        {/* Orbital Rings */}
        <div className="absolute w-full h-full border-2 border-[rgba(14,165,233,0.3)] rounded-full animate-spin-orbit">
          <div className="absolute w-4 h-4 bg-[var(--secondary-color)] rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5),0_0_30px_rgba(255,107,107,0.3)] top-1/2 left-0 animate-electron" />
        </div>

        <div className="absolute w-2/3 h-2/3 border-2 border-[rgba(255,107,107,0.3)] rounded-full animate-spin-orbit-reverse">
          <div className="absolute w-4 h-4 bg-[var(--accent-color)] rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5),0_0_30px_rgba(255,107,107,0.3)] top-0 right-1/2 animate-electron-alt" />
        </div>

        <div className="absolute w-1/3 h-1/3 border-2 border-[rgba(6,57,112,0.3)] rounded-full animate-spin-orbit">
          <div className="absolute w-4 h-4 bg-[var(--primary-color)] rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5),0_0_30px_rgba(255,107,107,0.3)] bottom-0 left-1/2 animate-electron-fast" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="absolute bottom-20 text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] bg-clip-text text-transparent animate-gradient-pulse">
          BLOG<span className="text-[var(--accent-color)]">ARI</span>THM
        </h2>
        <p className="text-sm mt-2 text-[var(--text-color)] animate-pulse">
          Initializing Knowledge Matrix...
        </p>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes spin-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-orbit-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes nucleus {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes electron {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(10px) translateY(-10px); }
        }

        @keyframes electron-alt {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-10px) translateY(10px); }
        }

        @keyframes electron-fast {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(5px) translateY(-5px); }
        }

        @keyframes gradient-pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }

        .animate-spin-orbit {
          animation: spin-orbit 3s linear infinite;
        }

        .animate-spin-orbit-reverse {
          animation: spin-orbit-reverse 4s linear infinite;
        }

        .animate-electron {
          animation: electron 1.5s ease-in-out infinite alternate;
        }

        .animate-electron-alt {
          animation: electron-alt 2s ease-in-out infinite alternate;
        }

        .animate-electron-fast {
          animation: electron-fast 1s ease-in-out infinite alternate;
        }

        .animate-nucleus {
          animation: nucleus 2s ease-in-out infinite;
        }

        .animate-gradient-pulse {
          animation: gradient-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
