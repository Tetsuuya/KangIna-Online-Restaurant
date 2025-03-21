import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  targetValue: number;
  label: string;
  delay: number;
}

const AnimatedCounter = ({ targetValue, label, delay }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const duration = 2000; // Duration in milliseconds
  
  useEffect(() => {
    let startTime: number | undefined;
    let animationFrame: number | undefined;
    
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        // Calculate the current count based on progress
        const nextCount = Math.floor((progress / duration) * targetValue);
        setCount(nextCount);
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        // Ensure we reach exactly the target value
        setCount(targetValue);
      }
    };
    
    // Delay the start of counting
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateCount);
    }, delay);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      clearTimeout(timer);
    };
  }, [targetValue, delay, duration]);
  
  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
    >
      <span className="text-3xl font-bold text-[#32347C]">
        {count}{targetValue > 999 ? 'k' : ''}
      </span>
      <span className="block text-sm font-light">{label}</span>
    </motion.div>
  );
};

export default AnimatedCounter;