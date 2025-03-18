import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodRed from "../assets/FoodRed.png";
import LogoRed from '../components/ui/LogoRed';
import useAuthStore from '../store/AuthStore'




const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { login, error, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
 
  // This effect will run when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
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
        className="h-screen justify-start items-center flex p-10 md:p-32 max-w-[1600px] mx-auto"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          className="w-[460px]"
          variants={containerVariants}
          initial="hidden"
          animate={isExiting ? "exit" : "visible"}
        >
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
              {isLoading ? 'Loading...' : 'Log in'}
            </motion.button>
          </motion.form>
         
          {error && (
            <motion.p
              className="mt-2 text-red-500"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {error}
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
        </motion.div>
       
        <motion.div
          className="absolute right-0 top-0 bottom-0 hidden md:block"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: isExiting ? 0 : 1, x: isExiting ? 100 : 0 }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            delay: isExiting ? 0 : 0.3
          }}
        >
          <img src={FoodRed} alt="Food illustration" className="w-full h-full object-cover" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};




export default Login;

