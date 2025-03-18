import { Link } from "react-router-dom";
import { useState, MouseEvent } from 'react'; // Import MouseEvent from React
import Button from "./ui/Button";
import LogoRed from "./ui/LogoRed";
import Navbar from "../components/Sidebar/Navbar";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle smooth scrolling for mobile menu items
  const handleMobileScroll = (e: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Account for header height
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      // Smooth scroll to the section
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    
    // Close mobile menu after clicking
    setIsOpen(false);
  };

  return (
    <header className="relative z-50">
      <div className="fixed top-0 left-0 right-0 bg-white flex justify-between items-center w-full px-10 py-4 md:py-2 shadow-lg">
        <div className="flex-shrink-0">
          <Link to="/">
            <LogoRed/>
          </Link>
        </div>
        <div className="flex-grow flex justify-center">
          <Navbar />
        </div>
        <div className="flex-shrink-0">
          <Link to="/login">
            <Button 
              text={'Get Started'} 
              className="px-6 py-2 bg-white text-[#ed3f25] rounded-full border-2 border-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 hidden md:block"
            />
          </Link>
        </div>

        <div className="md:hidden flex-shrink-0">
          <button onClick={() => setIsOpen(true)} className="text-gray-700 text-2xl focus:outline-none">
              ☰
          </button>
        </div>
      </div>

      {/* Backdrop Overlay (Closes menu when clicked) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-30 transition-opacity duration-300 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden z-20`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex flex-col items-center py-6 space-y-6">
          {/* Updated mobile navigation with scroll functionality */}
          <a 
            href="#home" 
            className="text-base font-[600] text-[#ed3f25]"
            onClick={(e) => handleMobileScroll(e, "home")}
          >
            Home
          </a>
          <a 
            href="#about" 
            className="text-base font-[600] text-[#ed3f25]"
            onClick={(e) => handleMobileScroll(e, "about")}
          >
            About
          </a>
          <a 
            href="#services" 
            className="text-base font-[600] text-[#ed3f25]"
            onClick={(e) => handleMobileScroll(e, "services")}
          >
            Services
          </a>
          <a 
            href="#team" 
            className="text-base font-[600] text-[#ed3f25]"
            onClick={(e) => handleMobileScroll(e, "team")}
          >
            Team
          </a>

          <Link to="/login" onClick={() => setIsOpen(false)}>
            <Button 
              text={'Get Started'} 
              className="px-6 py-2 bg-[#ed3f25] text-white rounded-full hover:bg-red-600 transition-all duration-300"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;