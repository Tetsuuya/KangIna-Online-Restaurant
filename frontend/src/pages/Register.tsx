import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodBlue from '../assets/FoodBlue.png';
import LogoBlue from '../components/ui/LogoBlue';
import useAuthStore from '../store/AuthStore';


const Register = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { register, error, isLoading } = useAuthStore();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        username,
        email,
        password,
        full_name: fullName
      });
     
      setIsExiting(true);
      setTimeout(() => {
        navigate('/login');
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
        className="md:h-screen justify-start items-center flex p-10 md:p-32 max-w-[1600px] mx-auto"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          className="w-[500px] ml-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isExiting ? "exit" : "visible"}
        >
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
            className="text-lg text-gray-600 mb-10"
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
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
                required
              />
            </motion.div>
           
            <motion.div variants={itemVariants}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
                required
              />
            </motion.div>
           
            <motion.div variants={itemVariants}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
                required
              />
            </motion.div>
           
            <motion.div className="relative" variants={itemVariants}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-5 top-6 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
              </button>
            </motion.div>
           
            {error && (
              <motion.p
                className="text-red-500"
                variants={itemVariants}
              >
                {error}
              </motion.p>
            )}
           
            <motion.button
              type="submit"
              className="w-full py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-800 transition"
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
        </motion.div>
       
        <motion.div
          className="absolute left-0 top-0 bottom-0 hidden md:block"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: isExiting ? 0 : 1, x: isExiting ? -100 : 0 }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            delay: isExiting ? 0 : 0.3
          }}
        >
          <img src={FoodBlue} alt="Food Blue" className="w-full h-full object-cover" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


export default Register;

