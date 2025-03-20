import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodBlue1 from '../assets/FoodBlue1.png';
import Food1 from '../assets/Food1.png';
import LogoBlue from '../components/ui/LogoBlue';
import { useAuthStore } from '../hooks/auth/useauth';
import { toast } from 'sonner';

const Register = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!username || !email || !password || !fullName) {
        throw new Error('Please fill in all fields');
      }
      await register({
        username,
        email,
        password,
        full_name: fullName
      });
      
      toast.success('Registration successful! Please login to continue.');
      setIsExiting(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 300);
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      navigate('/login');
    }, 300);
  };
 
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
        {/* Left side with images */}
        <motion.div
          className="w-1/2 relative hidden md:block"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: isExiting ? 0 : 1, x: isExiting ? -100 : 0 }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            delay: isExiting ? 0 : 0.3
          }}
        >
          <img 
            src={FoodBlue1} 
            alt="Food illustration" 
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 50%" }}
          />
          <motion.img
            src={Food1}
            alt="Food overlay"
            className="absolute top-1/2 left-4/5 transform -translate-x-1/4 w-4/5 hidden lg:block"
            style={{ translateX: "-50%", translateY: "-50%" }}
          />
        </motion.div>

        {/* Right Side - Register Form */}
        <motion.div
          className="w-full md:w-1/2 flex items-center justify-center p-10 md:p-32"
          variants={containerVariants}
          initial="hidden"
          animate={isExiting ? "exit" : "visible"}
        >
          <div className="w-[460px]">
            <motion.div variants={itemVariants}>
              <Link to="/">
                <LogoBlue className="cursor-pointer w-8"/>
              </Link>
            </motion.div>
           
            <motion.h2
              className="text-5xl font-extrabold text-[#32347c] mb-4 mt-4"
              variants={itemVariants}
            >
              Create Account.
            </motion.h2>
           
            <motion.p
              className="text-lg text-gray-600 mb-6"
              variants={itemVariants}
            >
              Welcome, please provide your account information
            </motion.p>
           
            <motion.form
              className="space-y-4"
              onSubmit={handleSubmit}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="fullName" className="block text-base font-medium mb-0.5">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </motion.div>
             
              <motion.div variants={itemVariants}>
                <label htmlFor="username" className="block text-base font-medium mb-0.5">Username</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </motion.div>
             
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-base font-medium mb-0.5">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </motion.div>
             
              <motion.div className="relative" variants={itemVariants}>
                <label htmlFor="password" className="block text-base font-medium mb-0.5">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-5 top-12 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
                </button>
              </motion.div>
             
              {error && (
                <motion.p
                  className="mt-2 text-red-500"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {(error as any)?.response?.data?.error || 'Registration failed. Please try again.'}
                </motion.p>
              )}
             
              <motion.button
                type="submit"
                className="w-full py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
                disabled={isLoading}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </motion.button>
            </motion.form>
           
            <motion.p
              className="mt-4 text-base"
              variants={itemVariants}
            >
              Already have an account? {' '}
              <motion.a
                href="/login"
                className="text-blue-800 inline-block"
                onClick={handleLoginClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.a>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Register;

