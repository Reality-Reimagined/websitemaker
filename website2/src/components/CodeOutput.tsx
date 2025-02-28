import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Download, Copy, Check, Edit, Save, X, RefreshCw, Code, Eye, FileText, Send, MessageSquare, Zap, Layout, PaintBucket, Plus, Undo, Redo, Bookmark } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface CodeOutputProps {
  code: string;
  onCodeChange: (newCode: string) => void;
}

export const CodeOutput: React.FC<CodeOutputProps> = ({ code, onCodeChange }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [extractedFiles, setExtractedFiles] = useState<{[key: string]: string}>({});
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editedFileContent, setEditedFileContent] = useState('');
  
  // Improvement panel states
  const [showImprovementPanel, setShowImprovementPanel] = useState(false);
  const [improvementInput, setImprovementInput] = useState('');
  const [isProcessingImprovement, setIsProcessingImprovement] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [savedVersions, setSavedVersions] = useState<{name: string, code: string, timestamp: Date}[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditedCode(code);
    }
    extractFilesFromMarkdown(code);
  }, [code, isEditing]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(isEditing ? editedCode : code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onCodeChange(editedCode);
    setIsEditing(false);
    extractFilesFromMarkdown(editedCode);
  };

  const handleCancelEdit = () => {
    setEditedCode(code);
    setIsEditing(false);
  };

  const handleEditFile = (filename: string) => {
    setEditingFile(filename);
    setEditedFileContent(extractedFiles[filename]);
  };

  const handleSaveFile = () => {
    if (editingFile) {
      const newFiles = { ...extractedFiles, [editingFile]: editedFileContent };
      setExtractedFiles(newFiles);
      
      // Update the markdown code with the new file content
      let newCode = code;
      
      if (editingFile === 'index.html') {
        newCode = newCode.replace(/```html\n([\s\S]*?)```/, `\`\`\`html\n${editedFileContent}\n\`\`\``);
      } else if (editingFile === 'styles.css') {
        newCode = newCode.replace(/```css\n([\s\S]*?)```/, `\`\`\`css\n${editedFileContent}\n\`\`\``);
      } else if (editingFile === 'script.js') {
        newCode = newCode.replace(/```(?:javascript|js)\n([\s\S]*?)```/, `\`\`\`javascript\n${editedFileContent}\n\`\`\``);
      }
      
      onCodeChange(newCode);
      setEditingFile(null);
    }
  };

  const handleCancelFileEdit = () => {
    setEditingFile(null);
  };

  const extractFilesFromMarkdown = (markdown: string) => {
    try {
      const files: {[key: string]: string} = {};
      
      // Extract HTML
      const htmlRegex = /```html\n([\s\S]*?)```/;
      const htmlMatch = htmlRegex.exec(markdown);
      if (htmlMatch && htmlMatch[1]) {
        files['index.html'] = htmlMatch[1];
      }
      
      // Extract CSS
      const cssRegex = /```css\n([\s\S]*?)```/;
      const cssMatch = cssRegex.exec(markdown);
      if (cssMatch && cssMatch[1]) {
        files['styles.css'] = cssMatch[1];
      }
      
      // Extract JavaScript
      const jsRegex = /```(?:javascript|js)\n([\s\S]*?)```/;
      const jsMatch = jsRegex.exec(markdown);
      if (jsMatch && jsMatch[1]) {
        files['script.js'] = jsMatch[1];
      }
      
      setExtractedFiles(files);
      setPreviewError(null);
    } catch (error) {
      console.error('Error extracting files:', error);
      setPreviewError('Error extracting files from the generated code');
    }
  };

  const downloadZip = async () => {
    try {
      const zip = new JSZip();
      
      // Add files to zip
      Object.entries(extractedFiles).forEach(([filename, content]) => {
        zip.file(filename, content);
      });
      
      // Add README
      zip.file('README.md', `# Generated Website

This website was generated using Groq Bolt with the Qwen 2.5 Coder model.

## Files
${Object.keys(extractedFiles).map(filename => `- ${filename}`).join('\n')}

## Setup
1. Extract all files to a folder
2. Open index.html in your browser

## Customization
Feel free to modify the HTML, CSS, and JavaScript files to suit your needs.
`);
      
      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'website.zip');
    } catch (error) {
      console.error('Error creating zip file:', error);
    }
  };

  // Create a preview of HTML content
  const createPreview = () => {
    try {
      const html = extractedFiles['index.html'] || '';
      const css = extractedFiles['styles.css'] || '';
      const js = extractedFiles['script.js'] || '';
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
        </html>
      `;
    } catch (error) {
      setPreviewError('Error creating preview');
      return '<div class="p-4 text-red-500">Error rendering preview</div>';
    }
  };

  const getLanguageForFile = (filename: string) => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    return 'text';
  };

  // Improvement panel functions
  const handleImprovementSubmit = async () => {
    if (!improvementInput.trim()) return;
    
    // Add user message to chat history
    const userMessage = { role: 'user', content: improvementInput };
    setChatHistory([...chatHistory, userMessage]);
    setImprovementInput('');
    setIsProcessingImprovement(true);
    
    try {
      // Create a prompt that includes the current website code and the improvement request
      const filesContext = Object.entries(extractedFiles)
        .map(([filename, content]) => `${filename}:\n\`\`\`${getLanguageForFile(filename)}\n${content}\n\`\`\``)
        .join('\n\n');
      
      const prompt = `I have a website with the following files:\n\n${filesContext}\n\nI want to make the following improvement: ${improvementInput}\n\nPlease provide the updated code for all files with the requested changes.`;
      
      // Send the improvement request to the API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add AI response to chat history
      const aiMessage = { role: 'assistant', content: data.completion };
      setChatHistory([...chatHistory, userMessage, aiMessage]);
      
      // Update the code with the improved version
      onCodeChange(data.completion);
      
    } catch (error) {
      console.error('Error improving website:', error);
      // Add error message to chat history
      setChatHistory([
        ...chatHistory, 
        userMessage, 
        { 
          role: 'assistant', 
          content: `Sorry, I encountered an error while processing your improvement request: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }
      ]);
    } finally {
      setIsProcessingImprovement(false);
    }
  };

  const handleQuickImprovement = (improvement: string) => {
    setImprovementInput(improvement);
  };

  const saveCurrentVersion = () => {
    const versionName = `Version ${savedVersions.length + 1}`;
    setSavedVersions([
      ...savedVersions,
      {
        name: versionName,
        code,
        timestamp: new Date()
      }
    ]);
  };

  const loadVersion = (versionCode: string) => {
    onCodeChange(versionCode);
  };

  const tabVariants = {
    active: { 
      backgroundColor: '#EBF5FF', 
      color: '#2563EB',
      borderBottomWidth: '2px',
      borderBottomColor: '#2563EB'
    },
    inactive: { 
      backgroundColor: 'transparent', 
      color: '#4B5563',
      borderBottomWidth: '0px'
    }
  };

  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex border-b">
        <motion.button
          className="px-4 py-3 font-medium"
          variants={tabVariants}
          animate={activeTab === 'preview' ? 'active' : 'inactive'}
          onClick={() => setActiveTab('preview')}
          whileHover={{ backgroundColor: activeTab === 'preview' ? '#EBF5FF' : '#F3F4F6' }}
        >
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </div>
        </motion.button>
        <motion.button
          className="px-4 py-3 font-medium"
          variants={tabVariants}
          animate={activeTab === 'code' ? 'active' : 'inactive'}
          onClick={() => setActiveTab('code')}
          whileHover={{ backgroundColor: activeTab === 'code' ? '#EBF5FF' : '#F3F4F6' }}
        >
          <div className="flex items-center">
            <Code className="w-4 h-4 mr-2" />
            Code
          </div>
        </motion.button>
        <motion.button
          className="px-4 py-3 font-medium"
          variants={tabVariants}
          animate={activeTab === 'files' ? 'active' : 'inactive'}
          onClick={() => setActiveTab('files')}
          whileHover={{ backgroundColor: activeTab === 'files' ? '#EBF5FF' : '#F3F4F6' }}
        >
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Files
          </div>
        </motion.button>
        <motion.button
          className="px-4 py-3 font-medium"
          variants={tabVariants}
          animate={activeTab === 'improve' ? 'active' : 'inactive'}
          onClick={() => setActiveTab('improve')}
          whileHover={{ backgroundColor: activeTab === 'improve' ? '#EBF5FF' : '#F3F4F6' }}
        >
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Improve
          </div>
        </motion.button>
      </div>

      <div className="relative">
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          {isEditing ? (
            <>
              <motion.button
                onClick={handleSaveEdit}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </motion.button>
              <motion.button
                onClick={handleCancelEdit}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={handleCopyCode}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </motion.button>
              <motion.button
                onClick={downloadZip}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </motion.button>
            </>
          )}
        </div>

        {activeTab === 'preview' && (
          <div className="p-4 h-[600px] overflow-auto pt-16">
            {previewError ? (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {previewError}
                <button
                  onClick={() => extractFilesFromMarkdown(code)}
                  className="ml-2 text-red-700 hover:text-red-900 underline flex items-center"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Try again
                </button>
              </div>
            ) : (
              <div className="border rounded">
                <iframe
                  srcDoc={createPreview()}
                  title="Website Preview"
                  className="w-full h-[550px]"
                  sandbox="allow-scripts"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="p-4 h-[600px] overflow-auto pt-16">
            {isEditing ? (
              <Editor
                height="550px"
                defaultLanguage="markdown"
                value={editedCode}
                onChange={(value) => setEditedCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
                theme="vs-dark"
              />
            ) : (
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {code}
              </ReactMarkdown>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="p-4 h-[600px] overflow-auto pt-16">
            {editingFile ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Editing {editingFile}</h3>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={handleSaveFile}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded inline-flex items-center text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </motion.button>
                    <motion.button
                      onClick={handleCancelFileEdit}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded inline-flex items-center text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </motion.button>
                  </div>
                </div>
                <Editor
                  height="500px"
                  defaultLanguage={getLanguageForFile(editingFile)}
                  value={editedFileContent}
                  onChange={(value) => setEditedFileContent(value || '')}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                  theme="vs-dark"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(extractedFiles).map(([filename, content]) => (
                  <motion.div
                    key={filename}
                    className="border rounded-lg overflow-hidden shadow-sm"
                    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b">
                      <h3 className="font-medium">{filename}</h3>
                      <motion.button
                        onClick={() => handleEditFile(filename)}
                        className="text-blue-600 hover:text-blue-800"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="p-4 max-h-60 overflow-auto bg-gray-50">
                      <SyntaxHighlighter
                        language={getLanguageForFile(filename)}
                        style={tomorrow}
                        customStyle={{ margin: 0, borderRadius: '0.25rem' }}
                      >
                        {content}
                      </SyntaxHighlighter>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'improve' && (
          <div className="p-4 h-[600px] pt-16 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Website Improvement Chat</h3>
              <div className="flex space-x-2">
                <motion.button
                  onClick={saveCurrentVersion}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-1 px-3 rounded inline-flex items-center text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bookmark className="w-3 h-3 mr-1" />
                  Save Version
                </motion.button>
              </div>
            </div>

            {/* Quick improvement buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <motion.button
                onClick={() => handleQuickImprovement("Change the color scheme to be more vibrant")}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-1 px-3 rounded inline-flex items-center text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PaintBucket className="w-3 h-3 mr-1" />
                Change Colors
              </motion.button>
              <motion.button
                onClick={() => handleQuickImprovement("Improve the layout and spacing")}
                className="bg-green-100 hover:bg-green-200 text-green-800 font-medium py-1 px-3 rounded inline-flex items-center text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Layout className="w-3 h-3 mr-1" />
                Adjust Layout
              </motion.button>
              <motion.button
                onClick={() => handleQuickImprovement("Add a new section for testimonials")}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium py-1 px-3 rounded inline-flex items-center text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Section
              </motion.button>
              <motion.button
                onClick={() => handleQuickImprovement("Add more animations and interactive elements")}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-1 px-3 rounded inline-flex items-center text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-3 h-3 mr-1" />
                Add Animations
              </motion.button>
            </div>

            {/* Saved versions */}
            {savedVersions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Versions:</h4>
                <div className="flex flex-wrap gap-2">
                  {savedVersions.map((version, index) => (
                    <motion.button
                      key={index}
                      onClick={() => loadVersion(version.code)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded inline-flex items-center text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {version.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat history */}
            <div 
              ref={chatContainerRef}
              className="flex-grow overflow-auto border rounded-lg bg-gray-50 p-4 mb-4"
            >
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No improvement requests yet. Start by typing a request below.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div 
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            components={{
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={tomorrow}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                    customStyle={{ fontSize: '0.8rem' }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isProcessingImprovement && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 text-gray-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          </div>
                          <span className="text-sm text-gray-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={improvementInput}
                onChange={(e) => setImprovementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleImprovementSubmit()}
                placeholder="Describe how you want to improve the website..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessingImprovement}
              />
              <motion.button
                onClick={handleImprovementSubmit}
                disabled={isProcessingImprovement || !improvementInput.trim()}
                className={`
                  p-2 rounded-md text-white
                  ${isProcessingImprovement || !improvementInput.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'}
                `}
                whileHover={isProcessingImprovement || !improvementInput.trim() ? {} : { scale: 1.05 }}
                whileTap={isProcessingImprovement || !improvementInput.trim() ? {} : { scale: 0.95 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 border-t">
        <h3 className="font-semibold text-gray-700 mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside text-gray-600 space-y-1">
          <li>Review the generated website in the Preview tab</li>
          <li>Edit individual files in the Files tab if needed</li>
          <li>Use the Improve tab to request AI-powered changes</li>
          <li>Download the complete website as a ZIP file</li>
          <li>Deploy to your preferred hosting provider</li>
        </ol>
      </div>
    </motion.div>
  );
};