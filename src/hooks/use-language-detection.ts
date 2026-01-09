import { useMemo } from 'react';
import hljs from 'highlight.js/lib/core';

// Import common languages for vault content
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import python from 'highlight.js/lib/languages/python';

// Register languages with highlight.js
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('python', python);

const VAULT_LANGUAGES = [
  'json',
  'yaml',
  'javascript',
  'typescript',
  'bash',
  'sql',
  'xml',
  'python',
];

interface LanguageDetectionResult {
  language: string;
  confidence: number;
  highlightedCode: string;
}

/**
 * Apply heuristic rules to detect language from content patterns
 */
function applyHeuristics(content: string): string | null {
  const trimmed = content.trim();

  // JSON detection - starts/ends with braces or brackets
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // Not valid JSON, continue to other checks
    }
  }

  // YAML detection - contains key: value pattern
  if (/^[\w-]+:\s*.+$/m.test(trimmed)) {
    return 'yaml';
  }

  // PEM certificate/key - common in vaults
  if (trimmed.startsWith('-----BEGIN')) {
    return 'plaintext';
  }

  // Shebang - shell scripts
  if (trimmed.startsWith('#!')) {
    return 'bash';
  }

  // SQL keywords
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(trimmed)) {
    return 'sql';
  }

  return null;
}

/**
 * Hook to auto-detect programming language from vault content and return highlighted code
 *
 * @param content - The vault value content to highlight
 * @param manualLanguage - Optional manual language override
 * @returns Language detection result with highlighted HTML
 */
export function useLanguageDetection(
  content: string,
  manualLanguage?: string,
): LanguageDetectionResult {
  return useMemo(() => {
    if (!content) {
      return {
        language: 'plaintext',
        confidence: 100,
        highlightedCode: content,
      };
    }

    // Manual language takes precedence
    if (manualLanguage) {
      try {
        const result = hljs.highlight(content, { language: manualLanguage });
        return {
          language: manualLanguage,
          confidence: 100,
          highlightedCode: result.value,
        };
      } catch {
        // Fallback to plaintext if manual language fails
        return {
          language: 'plaintext',
          confidence: 0,
          highlightedCode: content,
        };
      }
    }

    // Try heuristics first (higher accuracy for common patterns)
    const heuristicLang = applyHeuristics(content);
    if (heuristicLang) {
      if (heuristicLang === 'plaintext') {
        return {
          language: 'plaintext',
          confidence: 90,
          highlightedCode: content,
        };
      }

      try {
        const result = hljs.highlight(content, { language: heuristicLang });
        return {
          language: heuristicLang,
          confidence: 90,
          highlightedCode: result.value,
        };
      } catch {
        // Fallback to auto-detection if heuristic language fails
      }
    }

    // Fall back to auto-detection
    try {
      const result = hljs.highlightAuto(content, VAULT_LANGUAGES);

      // Low confidence means unclear language, use plaintext
      if (result.relevance < 5) {
        return {
          language: 'plaintext',
          confidence: result.relevance,
          highlightedCode: content,
        };
      }

      return {
        language: result.language || 'plaintext',
        confidence: result.relevance,
        highlightedCode: result.value,
      };
    } catch {
      // Final fallback to plaintext
      return {
        language: 'plaintext',
        confidence: 0,
        highlightedCode: content,
      };
    }
  }, [content, manualLanguage]);
}
