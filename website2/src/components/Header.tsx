import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Menu, X, Github, ExternalLink } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            whileHover={{ rotate: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Zap className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl font-bold">Groq Bolt</h1>
        </motion.div>
        
        {/* Desktop Navigation */}
        <motion.nav 
          className="hidden md:block"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ul className="flex space-x-8">
            <motion.li whileHover={{ y: -2 }}>
              <a href="#" className="hover:text-blue-200 transition-colors flex items-center">
                <span>Home</span>
              </a>
            </motion.li>
            <motion.li whileHover={{ y: -2 }}>
              <a href="#" className="hover:text-blue-200 transition-colors flex items-center">
                <span>Examples</span>
              </a>
            </motion.li>
            <motion.li whileHover={{ y: -2 }}>
              <a href="#" className="hover:text-blue-200 transition-colors flex items-center">
                <span>Documentation</span>
              </a>
            </motion.li>
            <motion.li whileHover={{ y: -2 }}>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <Github className="w-4 h-4 mr-1" />
                <span>GitHub</span>
              </a>
            </motion.li>
          </ul>
        </motion.nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatedMobileMenu isOpen={isMenuOpen} />
    </header>
  );
};

const AnimatedMobileMenu: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{ duration: 0.3 }}
      className="md:hidden overflow-hidden"
    >
      {isOpen && (
        <nav className="px-4 py-4 bg-indigo-800">
          <ul className="space-y-4">
            <li>
              <a href="#" className="block py-2 hover:text-blue-200 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 hover:text-blue-200 transition-colors">
                Examples
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 hover:text-blue-200 transition-colors">
                Documentation
              </a>
            </li>
            <li>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block py-2 hover:text-blue-200 transition-colors flex items-center"
              >
                <Github className="w-4 h-4 mr-2" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </li>
          </ul>
        </nav>
      )}
    </motion.div>
  );
};