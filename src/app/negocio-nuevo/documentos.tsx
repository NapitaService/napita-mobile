import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { BagStep, StepTitle } from '@/components/bag-step';
import { Warning } from '@/components/form';
import { CheckIcon, FileIcon, InfoIcon } from '@/components/icons';
import { Segmented } from '@/components/segmented';
import { Text } from '@/components/text';
import { pickDocument } from '@/lib/pick-document';
import { useAccount, type BusinessDocuments, type DocumentFile, type LegalType } from '@/settings/account';
import { colors } from '@/theme';

type DocKey = 'bankCertificate' | 'rut' | 'legalRepId' | 'chamberOfCommerce';

/**
 * Business sign-up, step 3 of 3: the documents the team checks before the
 * business can sell (decision 0016). Each one is a PDF or a photo.
 * Design: napita-docs/design/canvas/ShopOnboardDocs.dc.html
 */
export default function BusinessDocumentsScreen() {
  const { t } = useTranslation();
  const { account, signOut, submitDocuments } = useAccount();
  const saved = account?.documents;
  const [legalType, setLegalType] = useState<LegalType>(saved?.legalType ?? 'natural');
  const [files, setFiles] = useState<Partial<Record<DocKey, DocumentFile>>>({
    bankCertificate: saved?.bankCertificate,
    rut: saved?.rut,
    legalRepId: saved?.legalRepId,
    chamberOfCommerce: saved?.chamberOfCommerce,
  });
  const [tried, setTried] = useState(false);

  // Cámara de Comercio only for a persona jurídica.
  const needed: DocKey[] =
    legalType === 'juridica'
      ? ['bankCertificate', 'rut', 'legalRepId', 'chamberOfCommerce']
      : ['bankCertificate', 'rut', 'legalRepId'];
  const missing = needed.filter((key) => !files[key]);

  const choose = async (key: DocKey) => {
    const file = await pickDocument();
    if (file) setFiles((all) => ({ ...all, [key]: file }));
  };

  const send = () => {
    setTried(true);
    if (missing.length > 0 || !files.bankCertificate || !files.rut || !files.legalRepId) return;
    const documents: BusinessDocuments = {
      legalType,
      bankCertificate: files.bankCertificate,
      rut: files.rut,
      legalRepId: files.legalRepId,
      ...(legalType === 'juridica' ? { chamberOfCommerce: files.chamberOfCommerce } : {}),
    };
    submitDocuments(documents);
    router.dismissAll();
    router.replace('/negocio-revision');
  };

  // Coming back to this step after logging in again: there's nothing to go back to, so log out.
  const back = () => {
    if (router.canGoBack()) return router.back();
    signOut();
    router.replace('/');
  };

  return (
    <BagStep
      step={3}
      total={3}
      heading={t('signup.heading')}
      onBack={back}
      buttonLabel={t('documents.send')}
      onNext={send}>
      <StepTitle title={t('documents.title')} subtitle={t('documents.subtitle')} />

      <View style={{ gap: 8 }}>
        <Text font="bold" style={{ fontSize: 14 }}>
          {t('documents.legalType')}
        </Text>
        <Segmented
          accessibilityLabel={t('documents.legalType')}
          options={[
            { value: 'natural', label: t('documents.natural') },
            { value: 'juridica', label: t('documents.juridica') },
          ]}
          value={legalType}
          onChange={setLegalType}
          height={44}
        />
        <Text style={styles.hint}>
          {legalType === 'natural' ? t('documents.naturalHint') : t('documents.juridicaHint')}
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {needed.map((key) => {
          const file = files[key];
          return (
            <View key={key} style={{ gap: 6 }}>
              <View style={[styles.doc, file && styles.docDone, tried && !file && styles.docMissing]}>
                <View style={[styles.docIcon, file && { backgroundColor: colors.green }]}>
                  {file ? <CheckIcon size={18} color={colors.white} /> : <FileIcon size={20} color={colors.green} />}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text font="bold" style={{ fontSize: 15 }}>
                    {t(`documents.${key}`)}
                  </Text>
                  <Text style={styles.hint} numberOfLines={file ? 1 : undefined}>
                    {file ? file.name : t(`documents.${key}Hint`)}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${file ? t('documents.change') : t('documents.upload')}: ${t(`documents.${key}`)}`}
                  onPress={() => choose(key)}
                  style={styles.upload}>
                  <Text font="bold" style={{ fontSize: 14, color: colors.green }}>
                    {file ? t('documents.change') : t('documents.upload')}
                  </Text>
                </Pressable>
              </View>
              {tried && !file && <Warning text={t('documents.missing')} />}
            </View>
          );
        })}
      </View>

      <View style={styles.info}>
        <InfoIcon size={22} color={colors.green} />
        <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.segmentText }}>{t('documents.info')}</Text>
      </View>
    </BagStep>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, lineHeight: 18, color: colors.grey },
  doc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    padding: 12,
  },
  docDone: { borderColor: colors.green, backgroundColor: colors.selectedTint },
  docMissing: { borderColor: colors.orange, borderWidth: 2 },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upload: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.greenTint,
    justifyContent: 'center',
  },
  info: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 14,
  },
});
