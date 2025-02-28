import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Groq Bolt</h3>
            <p className="text-gray-400">
              A powerful tool for generating websites using the Qwen 2.5 Coder model via Groq's API.
            </p>
            <div className="mt-4 flex space-x-4">
              <motion.a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#fff" }}
                className="text-gray-400"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#1DA1F2" }}
                className="text-gray-400"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: "#0077B5" }}
                className="text-gray-400"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  Home
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  Examples
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  Documentation
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                >
                  API Reference
                </motion.a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <motion.a 
                  href="https://console.groq.com" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Groq Console
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="https://github.com/groq/groq-sdk-js" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Groq SDK
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="https://github.com/groq/groq-examples" 
                  className="hover:text-white transition-colors"
                  whileHover={{ x: 5 }}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Examples
                </motion.a>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="flex items-center justify-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> using Groq's Qwen 2.5 Coder model
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Groq Bolt. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};