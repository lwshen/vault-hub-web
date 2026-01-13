import { cn } from '@/lib/utils';
import { CodeEditor } from '@/components/ui/code-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface HighlightedCodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: string;
  className?: string;
  onCopy?: () => void;
}

const LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'xml', label: 'XML' },
  { value: 'python', label: 'Python' },
];

export function HighlightedCodeBlock({
  code,
  language,
  maxHeight = '600px',
  className,
  onCopy,
}: HighlightedCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(
    language,
  );

  // Auto-detect language from content if not provided
  const detectedLanguage = useMemo(() => {
    if (selectedLanguage) return selectedLanguage;
    if (language) return language;

    // Simple heuristic detection
    const trimmed = code.trim();

    // JSON detection
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(code);
        return 'json';
      } catch {
        // Not valid JSON, continue
      }
    }

    // YAML detection - key: value pattern
    if (/^[\w-]+:\s*.+$/m.test(trimmed)) return 'yaml';

    // PEM certificate/key
    if (trimmed.startsWith('-----BEGIN')) return 'plaintext';

    // Shebang - shell scripts
    if (trimmed.startsWith('#!')) return 'bash';

    // SQL keywords
    if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(trimmed)) {
      return 'sql';
    }

    return 'plaintext';
  }, [code, language, selectedLanguage]);

  // Reset selected language when code or language prop changes
  useEffect(() => {
    setSelectedLanguage(language);
  }, [code, language]);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else {
      await navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Header with language selector and copy button */}
      <div className="mb-2 flex items-center justify-between rounded-t-md border border-b-0 bg-muted/50 px-3 py-2">
        {/* Left side: Language selector */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedLanguage || 'auto'}
            onValueChange={(value) =>
              setSelectedLanguage(value === 'auto' ? undefined : value)
            }
          >
            <SelectTrigger className="h-7 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Badge showing actual detected/selected language */}
          <span className="font-mono text-xs text-muted-foreground">
            ({detectedLanguage})
          </span>
        </div>

        {/* Right side: Copy button */}
        <button
          onClick={handleCopy}
          className="text-muted-foreground transition-colors hover:text-foreground"
          title="Copy to clipboard"
          type="button"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Code editor in read-only mode */}
      <CodeEditor
        value={code}
        onChange={() => {}} // No-op for read-only
        language={detectedLanguage}
        readOnly={true}
        maxHeight={maxHeight}
        className="rounded-t-none border-t-0"
      />
    </div>
  );
}
