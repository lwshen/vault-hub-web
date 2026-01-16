import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeEditor } from '@/components/ui/code-editor';
import { HighlightedCodeBlock } from '@/components/ui/highlighted-code-block';
import { Label } from '@/components/ui/label';
import type { UseVaultActionsReturn } from '@/hooks/useVaultData';
import { detectLanguage } from '@/utils/detect-language';
import { calculateTextareaProps } from '@/utils/textarea-utils';
import { AlertCircle, Info } from 'lucide-react';
import { useDeferredValue, useMemo } from 'react';

interface VaultValueEditorProps {
  isEditMode: boolean;
  vaultActions: UseVaultActionsReturn;
  originalValue: string;
}

export function VaultValueEditor({
  isEditMode,
  vaultActions,
  originalValue,
}: VaultValueEditorProps) {
  const { error, setError, hasUnsavedChanges } = vaultActions;

  // Calculate dynamic textarea properties based on content
  const currentValue = isEditMode ? vaultActions.editedValue : originalValue;
  const textareaProps = useMemo(() => calculateTextareaProps(currentValue, isEditMode), [currentValue, isEditMode]);

  const deferredValue = useDeferredValue(currentValue);
  const detectedLang = useMemo(() => detectLanguage(deferredValue), [deferredValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditMode ? 'Edit Value' : 'Vault Value'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vault-value">
                {isEditMode ? 'Encrypted Value *' : 'Decrypted Value'}
              </Label>
              {textareaProps.analysis.isLong && (
                <span className="text-xs text-muted-foreground">
                  {textareaProps.analysis.characterCount} chars, {textareaProps.analysis.lineCount} lines
                </span>
              )}
            </div>
            {isEditMode ? (
              <CodeEditor
                value={currentValue}
                onChange={(value) => {
                  vaultActions.setEditedValue(value);
                  if (error) setError(null);
                }}
                language={detectedLang}
                placeholder="Enter the secret value to be encrypted and stored"
                minHeight={textareaProps.minHeight}
                maxHeight={textareaProps.maxHeight}
              />
            ) : (
              <HighlightedCodeBlock
                code={originalValue}
                maxHeight={textareaProps.maxHeight}
                onCopy={vaultActions.handleCopy}
              />
            )}
          </div>

          {/* Alert Messages */}
          {isEditMode && (
            <Alert variant="warning">
              <AlertCircle />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will replace the current encrypted value. This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {!isEditMode && (
            <Alert variant="info">
              <Info />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>
                This value is decrypted and displayed in plain text. Use the copy button to copy it to clipboard.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {hasUnsavedChanges && (
            <Alert variant="warning">
              <AlertCircle />
              <AlertTitle>Unsaved changes</AlertTitle>
              <AlertDescription>
                You have modified the vault value. Save or cancel to continue.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
