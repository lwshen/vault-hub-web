import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { yaml } from '@codemirror/lang-yaml';
import { javascript } from '@codemirror/lang-javascript';
import type { Extension } from '@codemirror/state';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
  className?: string;
}

// Language extension mapping for CodeMirror
const LANGUAGE_EXTENSIONS: Record<string, Extension[]> = {
  json: [json()],
  yaml: [yaml()],
  javascript: [javascript()],
  typescript: [javascript({ typescript: true })],
  bash: [], // Use generic mode for bash
  sql: [sql()],
  xml: [xml()],
  python: [python()],
  plaintext: [],
};

export function CodeEditor({
  value,
  onChange,
  language = 'plaintext',
  placeholder,
  minHeight = '200px',
  maxHeight = '600px',
  readOnly = false,
  className,
}: CodeEditorProps) {
  const { theme } = useTheme();

  // Get language extensions based on detected/selected language
  const extensions = useMemo(() => {
    return LANGUAGE_EXTENSIONS[language] || [];
  }, [language]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={theme === 'dark' ? 'dark' : 'light'}
      placeholder={placeholder}
      readOnly={readOnly}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightActiveLine: true,
        foldGutter: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: false, // Keep simple for vault editing
        syntaxHighlighting: true,
      }}
      height="auto"
      minHeight={minHeight}
      maxHeight={maxHeight}
      className={cn(
        'overflow-hidden rounded-md border border-input text-sm',
        className,
      )}
    />
  );
}
