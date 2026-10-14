import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon, FlashlightIcon } from '@/components/icons';
import { Text } from '@/components/text';
import { readPickupCode } from '@/data/business';
import { useHandOver } from '@/lib/use-hand-over';
import { colors, MIN_TOUCH } from '@/theme';

const FRAME = 250;

/** Scan the customer's QR. Design: napita-docs/design/canvas/PickupScan.dc.html */
export default function PickupScan() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [cameraFailed, setCameraFailed] = useState(false);
  const checkCode = useHandOver();
  // The camera reports the same QR many times a second; act on the first one only.
  const handled = useRef(false);

  const onScanned = ({ data }: BarcodeScanningResult) => {
    if (handled.current) return;
    handled.current = true;
    checkCode(readPickupCode(data), { fromScanner: true });
  };

  const granted = permission?.granted && !cameraFailed;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('business.scanner.close')}
          onPress={() => router.back()}
          style={styles.round}>
          <CloseIcon size={18} color={colors.white} />
        </Pressable>
        {granted && (
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={t('business.scanner.torch')}
            accessibilityState={{ checked: torch }}
            onPress={() => setTorch((on) => !on)}
            style={[styles.round, torch && { backgroundColor: colors.yellow }]}>
            <FlashlightIcon size={20} color={torch ? colors.ink : colors.white} />
          </Pressable>
        )}
      </View>

      <View style={styles.middle}>
        <Text font="display" style={styles.title} accessibilityRole="header">
          {t('business.scanner.title')}
        </Text>

        <View style={styles.frame}>
          {granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torch}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onScanned}
              onMountError={() => setCameraFailed(true)}
            />
          ) : (
            <View style={styles.permission}>
              {permission && !cameraFailed && (
                <>
                  <Text font="bold" style={{ fontSize: 16, color: colors.white, textAlign: 'center' }}>
                    {t('business.scanner.permissionTitle')}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.white, opacity: 0.8, textAlign: 'center' }}>
                    {t('business.scanner.permissionBody')}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    // Once someone says no, the phone only lets them change it in Settings.
                    onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
                    style={styles.allow}>
                    <Text font="bold" style={{ fontSize: 15, color: colors.ink }}>
                      {permission.canAskAgain ? t('business.scanner.allow') : t('business.scanner.openSettings')}
                    </Text>
                  </Pressable>
                </>
              )}
              {cameraFailed && (
                <Text style={{ fontSize: 14, color: colors.white, textAlign: 'center' }}>
                  {t('business.scanner.noCamera')}
                </Text>
              )}
            </View>
          )}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <Text style={styles.hint}>{t('business.scanner.hint')}</Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.typeCode}>
          <Text font="bold" style={{ fontSize: 16, color: colors.white }}>
            {t('business.scanner.typeInstead')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const CORNER = { position: 'absolute' as const, width: 44, height: 44, borderColor: colors.yellow };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.scannerBg },
  top: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' },
  round: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: 24 },
  title: { fontSize: 26, lineHeight: 32, color: colors.white, textAlign: 'center' },
  frame: {
    width: FRAME,
    height: FRAME,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 },
  allow: {
    marginTop: 6,
    minHeight: MIN_TOUCH,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.yellow,
    justifyContent: 'center',
  },
  corner: CORNER,
  topLeft: { left: 0, top: 0, borderLeftWidth: 5, borderTopWidth: 5, borderTopLeftRadius: 24 },
  topRight: { right: 0, top: 0, borderRightWidth: 5, borderTopWidth: 5, borderTopRightRadius: 24 },
  bottomLeft: { left: 0, bottom: 0, borderLeftWidth: 5, borderBottomWidth: 5, borderBottomLeftRadius: 24 },
  bottomRight: { right: 0, bottom: 0, borderRightWidth: 5, borderBottomWidth: 5, borderBottomRightRadius: 24 },
  hint: { fontSize: 15, lineHeight: 22, textAlign: 'center', color: colors.white, opacity: 0.85, maxWidth: 290 },
  bottom: { paddingHorizontal: 20 },
  typeCode: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
