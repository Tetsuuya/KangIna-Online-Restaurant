import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoRed from '../components/ui/LogoRed';
import FoodRed1 from "../assets/FoodRed1.png";
import Food1 from "../assets/Food1.png"
import { useAuthStore } from '../hooks/auth/useauth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }
      await login({ email, password });
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login failed:', error);
    }
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
   
    setTimeout(() => {
      navigate('/register');
    }, 300);
  };

  const Footer = () => {
    return (
      <footer className="w-full text-left py-4 text-sm text-gray-600 border-t mt-12">
        <p>&copy; 2025 — 2026</p>
        <p>
          <a href="#" className="text-gray-600 hover:underline">
            Privacy and Terms
          </a>
        </p>
      </footer>
    );
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="h-screen flex w-full"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Left Side - Login Form */}
        <motion.div
          className="w-full md:w-1/2 flex items-center justify-center p-10 md:p-32"
          variants={containerVariants}
          initial="hidden"
          animate={isExiting ? "exit" : "visible"}
        >
          <div className="w-[460px]">
            <motion.div variants={itemVariants}>
              <Link to="/">
                <LogoRed className="cursor-pointer w-8"/>
              </Link>
            </motion.div>
            
            <motion.h2
              className="text-5xl font-extrabold text-[#ed3f25] mb-4 mt-4"
              variants={itemVariants}
            >
              Log in.
            </motion.h2>
            
            <motion.p
              className="text-lg text-gray-600 mb-6"
              variants={itemVariants}
            >
              Welcome back! Please log in to your account.
            </motion.p>
            
            <motion.form
              className="space-y-4"
              onSubmit={handleSubmit}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-base font-medium mb-0.5">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </motion.div>
             
              <motion.div className="relative" variants={itemVariants}>
                <label htmlFor="password" className="block text-base font-medium mb-0.5">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-12 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
                </button>
              </motion.div>
             
              <motion.button
                type="submit"
                className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                disabled={isLoading}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Signing in...' : 'Log in'}
              </motion.button>
            </motion.form>
           
            {error && (
              <motion.p
                className="mt-2 text-red-500"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                {error?.message || 'Login failed. Please try again.'}
              </motion.p>
            )}
           
            <motion.p
              className="mt-4 text-base"
              variants={itemVariants}
            >
              New User? {' '}
              <motion.a
                href="/register"
                className="text-[#ed3f25] inline-block"
                onClick={handleSignUpClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.a>
            </motion.p>
           
            <motion.div variants={itemVariants}>
              <Footer />
            </motion.div>
          </div>
        </motion.div>

        {/* Right side with image */}
        <motion.div
          className="w-1/2 relative hidden md:block"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: isExiting ? 0 : 1, x: isExiting ? 100 : 0 }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            delay: isExiting ? 0 : 0.3
          }}
        >
          <img 
            src={FoodRed1} 
            alt="Food illustration" 
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 50%" }}
          />
          <motion.img
            src={Food1}
            alt="Food overlay"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/4 w-4/5 hidden lg:block"
            style={{ translateX: "-50%", translateY: "-50%" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Login;

  