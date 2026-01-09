import { useLanguageDetection } from '@/hooks/use-language-detection';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HighlightedCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
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
  showLineNumbers = false,
  maxHeight = '600px',
  className,
  onCopy,
}: HighlightedCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(
    language,
  );

  const { language: detectedLang, highlightedCode } = useLanguageDetection(
    code,
    selectedLanguage || language,
  );

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
            ({detectedLang})
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

      {/* Code block */}
      <div
        className="overflow-auto rounded-b-md border bg-muted/30"
        style={{ maxHeight }}
      >
        <pre
          className={cn('p-4 text-sm', showLineNumbers && 'line-numbers')}
        >
          <code
            className={`hljs language-${detectedLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
