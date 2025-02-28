import React from 'react';
import Editor from '@monaco-editor/react';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ value, onChange }) => {
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden h-60">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={(value) => onChange(value || '')}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          wrappingIndent: 'same',
          lineNumbers: 'off',
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
        }}
        theme="vs-light"
      />
    </div>
  );
};