import { useLanguageDetection } from '@/hooks/use-language-detection';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface HighlightedCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  onCopy?: () => void;
}

export function HighlightedCodeBlock({
  code,
  language,
  showLineNumbers = false,
  maxHeight = '600px',
  className,
  onCopy,
}: HighlightedCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { language: detectedLang, highlightedCode } = useLanguageDetection(
    code,
    language,
  );

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
      {/* Header with language badge and copy button */}
      <div className="mb-2 flex items-center justify-between rounded-t-md border border-b-0 bg-muted/50 px-3 py-2">
        <span className="font-mono text-xs uppercase text-muted-foreground">
          {detectedLang}
        </span>
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
