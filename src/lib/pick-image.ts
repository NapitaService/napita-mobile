import * as ImagePicker from 'expo-image-picker';

/**
 * Opens the phone's photo library and returns the chosen picture's local URI,
 * or null if the person cancels. Until napita-backend storage exists the
 * picture only lives on this phone.
 */
export async function pickImage(aspect: [number, number]) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.7,
  });
  return result.canceled ? null : (result.assets[0]?.uri ?? null);
}
