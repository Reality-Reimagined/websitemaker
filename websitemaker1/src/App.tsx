import React, { useState } from 'react';
import { WebsiteForm } from './components/WebsiteForm';
import { CodeOutput } from './components/CodeOutput';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState<string>(`
Create a complete website with the following specifications:

Type: {{websiteType}}
Features: {{features}}
Description: {{description}}
Additional Information: {{additionalInfo}}

Please provide all necessary HTML, CSS, and JavaScript code to implement this website.
Include responsive design, modern UI elements, and best practices.
Make sure to include animations and interactive elements.
The design should be professional, beautiful, and unique - worthy for production.
Use modern CSS techniques and ensure the website is fully responsive.
`);

  const handleGenerateWebsite = async (formData: {
    websiteType: string;
    features: string[];
    description: string;
    additionalInfo: string;
    customPrompt?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use custom prompt if provided, otherwise use the template
      let finalPrompt = formData.customPrompt || promptTemplate;
      
      // Replace placeholders in the template
      finalPrompt = finalPrompt
        .replace('{{websiteType}}', formData.websiteType)
        .replace('{{features}}', formData.features.join(', '))
        .replace('{{description}}', formData.description)
        .replace('{{additionalInfo}}', formData.additionalInfo);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedCode(data.completion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePromptTemplate = (newTemplate: string) => {
    setPromptTemplate(newTemplate);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[60vh]"
            >
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating Your Website</h2>
              <p className="text-gray-600 max-w-md text-center">
                Our AI is crafting your custom website. This may take a minute or two depending on the complexity.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <motion.h1 
                className="text-4xl font-bold text-gray-800 mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Generate Your Website with AI
              </motion.h1>
              
              {!generatedCode ? (
                <WebsiteForm 
                  onSubmit={handleGenerateWebsite} 
                  isLoading={isLoading} 
                  promptTemplate={promptTemplate}
                  onUpdatePromptTemplate={handleUpdatePromptTemplate}
                />
              ) : (
                <div className="space-y-6">
                  <motion.button
                    onClick={() => setGeneratedCode(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back to Form
                  </motion.button>
                  <CodeOutput 
                    code={generatedCode} 
                    onCodeChange={setGeneratedCode} 
                  />
                </div>
              )}
              
              {error && (
                <motion.div 
                  className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;