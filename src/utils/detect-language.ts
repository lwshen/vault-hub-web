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

  // SQL statement patterns
  if (
    /\bSELECT\b[\s\S]*\bFROM\b/i.test(trimmed) ||
    /\bINSERT\b\s+INTO\b/i.test(trimmed) ||
    /\bUPDATE\b[\s\S]*\bSET\b/i.test(trimmed) ||
    /\bDELETE\b\s+FROM\b/i.test(trimmed) ||
    /\bCREATE\b\s+TABLE\b/i.test(trimmed) ||
    /\bALTER\b\s+TABLE\b/i.test(trimmed) ||
    /\bDROP\b\s+TABLE\b/i.test(trimmed)
  ) {
    return 'sql';
  }

  return 'plaintext';
};
