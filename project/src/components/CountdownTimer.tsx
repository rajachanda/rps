import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  onTick?: (remaining: number) => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds,
  onComplete,
  onTick
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        onTick?.(newTime);
        
        if (newTime <= 0) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete, onTick]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / seconds) * circumference;

  return (
    <motion.div 
      className="relative flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-linear ${
            timeLeft <= 3 ? 'text-red-500' : 'text-blue-500'
          }`}
        />
      </svg>
      <motion.span 
        className={`absolute text-2xl font-bold ${
          timeLeft <= 3 ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'
        }`}
        animate={timeLeft <= 3 ? { 
          scale: [1, 1.2, 1],
          transition: { duration: 0.5, repeat: Infinity }
        } : {}}
      >
        {timeLeft}
      </motion.span>
    </motion.div>
  );
};