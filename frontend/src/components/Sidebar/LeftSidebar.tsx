import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { useAuthStore } from '../../hooks/auth/useauth';
import useAppStore from '../../store/HomeUserStore';
import LogoBlue from '../../components/ui/LogoBlue';
import { X, Menu } from 'lucide-react';

const LeftSidebar: React.FC = () => {
    const navigate = useNavigate(); // For navigation after logout
    const { logout } = useAuthStore();
    const [activeButton, setActiveButton] = useState<'home' | 'profile'>('home');
    
    // Use Zustand store
    const { setActiveSection, isMobileMenuOpen, setIsMobileMenuOpen } = useAppStore();

    const handleButtonClick = (section: 'home' | 'profile') => {
        setActiveSection(section);
        setActiveButton(section);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            // Close mobile menu if open
            setIsMobileMenuOpen(false);
            // Navigate to landing page first
            navigate('/', { replace: true });
            // Then perform logout
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            {/* Hamburger Button (Mobile) - on right side */}
            <button
                className={`lg:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded-md shadow-md transition-opacity duration-300 ${
                    isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <Menu size={24} className="text-[#32347C]" />
            </button>

            {/* Sidebar (Desktop & Mobile) */}
            <div
                className={`fixed lg:relative top-0 left-0 h-full bg-white shadow-lg p-4 flex flex-col w-64 transition-transform duration-300 ${
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 z-40`}
            >
                {/* Close Button (Mobile) */}
                <button
                    className="lg:hidden absolute top-4 right-4 text-[#32347C]"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-start space-y-2">
                    <LogoBlue className="w-10 mb-3" />

                    <button
                        onClick={() => handleButtonClick('home')}
                        className={`w-full py-2 px-4 border rounded-lg ${
                            activeButton === 'home'
                                ? "bg-[#32347C] text-white"
                                : "border-[#32347C] text-[#32347C]"
                        } transition`}
                    >
                        Menu
                    </button>

                    <button
                        onClick={() => handleButtonClick('profile')}
                        className={`w-full py-2 px-4 border rounded-lg ${
                            activeButton === 'profile'
                                ? "bg-[#32347C] text-white"
                                : "border-[#32347C] text-[#32347C]"
                        } transition`}
                    >
                        User Profile
                    </button>
                </div>

                {/* Bottom Logout Button */}
                <button 
                    onClick={handleLogout} 
                    className="w-full py-2 px-4 border border-[#32347C] rounded-full text-[#32347C] hover:bg-[#32347C] hover:text-white transition mt-auto"
                >
                    Log out
                </button>
            </div>

            {/* Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 lg:hidden z-30 bg-black/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default LeftSidebar;