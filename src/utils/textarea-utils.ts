/**
 * Utility functions for textarea content analysis and sizing
 */

export interface ContentAnalysis {
  characterCount: number;
  lineCount: number;
  isLong: boolean;
  isLongByCharacters: boolean;
  isLongByLines: boolean;
  hasVeryLongLines: boolean;
}

export interface TextareaProps {
  rows: number;
  minHeight: string;
  maxHeight: string;
  analysis: ContentAnalysis;
}

/**
 * Analyzes content to determine its characteristics for sizing decisions
 */
export function analyzeContent(content: string): ContentAnalysis {
  const lines = content.split('\n');
  const characterCount = content.length;
  const lineCount = lines.length;

  // Determine if content is "long" based on multiple criteria
  const isLongByCharacters = characterCount > 500;
  const isLongByLines = lineCount > 10;
  const hasVeryLongLines = lines.some(line => line.length > 100);

  const isLong = isLongByCharacters || isLongByLines || hasVeryLongLines;

  return {
    characterCount,
    lineCount,
    isLong,
    isLongByCharacters,
    isLongByLines,
    hasVeryLongLines,
  };
}

/**
 * Calculates optimal textarea properties based on content and mode
 */
export function calculateTextareaProps(content: string, isEditMode: boolean): TextareaProps {
  const analysis = analyzeContent(content);

  // Base configuration for short content
  let rows = 6;
  let minHeight = isEditMode ? '200px' : '150px';
  let maxHeight = '600px';

  if (analysis.isLong) {
    // For long content, provide significantly more space
    const baseRows = Math.min(Math.max(analysis.lineCount + 2, 12), 25);
    rows = baseRows;

    // Responsive height based on content and mode
    if (analysis.isLongByCharacters && analysis.characterCount > 2000) {
      // Very long content gets even more space
      minHeight = isEditMode ? '500px' : '400px';
      maxHeight = '85vh';
    } else {
      // Regular long content
      minHeight = isEditMode ? '400px' : '300px';
      maxHeight = '75vh';
    }
  }

  return {
    rows,
    minHeight,
    maxHeight,
    analysis,
  };
}
