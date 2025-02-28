import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit, Save, X } from 'lucide-react';
import { PromptEditor } from './PromptEditor';

interface WebsiteFormProps {
  onSubmit: (formData: {
    websiteType: string;
    features: string[];
    description: string;
    additionalInfo: string;
    customPrompt?: string;
  }) => void;
  isLoading: boolean;
  promptTemplate: string;
  onUpdatePromptTemplate: (newTemplate: string) => void;
}

export const WebsiteForm: React.FC<WebsiteFormProps> = ({ 
  onSubmit, 
  isLoading, 
  promptTemplate,
  onUpdatePromptTemplate
}) => {
  const [websiteType, setWebsiteType] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  const websiteTypes = [
    'Portfolio',
    'E-commerce',
    'Blog',
    'Landing Page',
    'Business Website',
    'Personal Website',
    'Dashboard',
    'Documentation',
    'Social Media',
    'Educational',
    'Event',
    'Restaurant',
    'Real Estate',
    'Travel',
    'Other'
  ];

  const featureOptions = [
    'Contact Form',
    'Image Gallery',
    'Responsive Design',
    'Dark Mode',
    'Newsletter Signup',
    'Social Media Integration',
    'Search Functionality',
    'User Authentication',
    'Interactive Elements',
    'Animations',
    'Blog Section',
    'Product Showcase',
    'Testimonials',
    'FAQ Section',
    'Pricing Table',
    'Team Members',
    'Services Section',
    'Portfolio Gallery',
    'Video Background',
    'Parallax Scrolling'
  ];

  const handleFeatureToggle = (feature: string) => {
    if (features.includes(feature)) {
      setFeatures(features.filter(f => f !== feature));
    } else {
      setFeatures([...features, feature]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      websiteType,
      features,
      description,
      additionalInfo,
      customPrompt: useCustomPrompt ? customPrompt : undefined
    });
  };

  const handleSavePromptTemplate = () => {
    onUpdatePromptTemplate(customPrompt);
    setEditingPrompt(false);
  };

  const handleCancelEditPrompt = () => {
    setCustomPrompt(promptTemplate);
    setEditingPrompt(false);
  };

  const handleEditPrompt = () => {
    setCustomPrompt(promptTemplate);
    setEditingPrompt(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-gray-700 font-semibold mb-2">
            Website Type
          </label>
          <select
            value={websiteType}
            onChange={(e) => setWebsiteType(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a website type</option>
            {websiteTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-gray-700 font-semibold mb-2">
            Features (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {featureOptions.map((feature) => (
              <motion.div 
                key={feature} 
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  checked={features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`feature-${feature}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {feature}
                </label>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-gray-700 font-semibold mb-2">
            Description (What is your website about?)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the purpose and content of your website..."
          ></textarea>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-gray-700 font-semibold mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any specific requirements, color preferences, or other details..."
          ></textarea>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Advanced Options
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Advanced Options
              </>
            )}
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Prompt Template</h3>
                {editingPrompt ? (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleSavePromptTemplate}
                      className="flex items-center text-green-600 hover:text-green-800"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditPrompt}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleEditPrompt}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Template
                  </button>
                )}
              </div>

              {editingPrompt ? (
                <PromptEditor
                  value={customPrompt}
                  onChange={setCustomPrompt}
                />
              ) : (
                <div className="bg-white p-3 rounded border border-gray-300 text-sm font-mono whitespace-pre-wrap h-40 overflow-y-auto">
                  {promptTemplate}
                </div>
              )}

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="use-custom-prompt"
                  checked={useCustomPrompt}
                  onChange={(e) => setUseCustomPrompt(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="use-custom-prompt"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Use custom prompt instead of template
                </label>
              </div>

              {useCustomPrompt && (
                <div className="mt-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Custom Prompt
                  </label>
                  <PromptEditor
                    value={customPrompt}
                    onChange={setCustomPrompt}
                  />
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`
              px-6 py-3 rounded-md text-white font-medium text-lg
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }
              transition-colors duration-200
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </div>
            ) : (
              'Generate Website'
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};