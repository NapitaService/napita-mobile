import * as DocumentPicker from 'expo-document-picker';

import type { DocumentFile } from '@/settings/account';

/**
 * Lets the business pick a PDF or a photo from the phone (sign-up documents,
 * decision 0016). Returns null if the person cancels. Until napita-backend
 * storage exists the file only lives on this phone.
 */
export async function pickDocument(): Promise<DocumentFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  const file = result.assets[0];
  return file ? { name: file.name, uri: file.uri } : null;
}
