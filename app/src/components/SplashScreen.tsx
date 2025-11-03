import { useEffect } from 'react';
import { motion } from 'motion/react';
import logoImage from 'figma:asset/4d469f59699cac6a9a15d8811eae70e226ad746b.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#f4f3e8]">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1]
          }}
        >
          {/* Logo with animation */}
          <motion.div
            className="mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.6,
              delay: 0.2 
            }}
          >
            <motion.img
              src={logoImage}
              alt="صِلّ Logo"
              className="mx-auto"
              style={{ width: '280px', height: '280px', objectFit: 'contain' }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Subtitle with fade in */}
          <motion.p
            className="text-[#24582a] opacity-80"
            style={{ fontSize: '20px', fontWeight: '500' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.8 }}
          >
            مجتمعك الرقمي
          </motion.p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          className="mt-16 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-[#24582a] rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
