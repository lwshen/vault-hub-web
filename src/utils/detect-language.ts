export const detectLanguage = (code: string) => {
  const trimmed = code.trim();

  if (!trimmed) return 'plaintext';

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
};
