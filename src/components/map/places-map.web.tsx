import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CUSTOMER_LOCATION } from '@/data/sample';
import { colors } from '@/theme';

import type { PlacesMapProps } from './places-map';
import { PricePin, UserDot } from './price-pin';

const SPAN = 0.024; // degrees shown, same as the phone map

/**
 * Web stand-in (react-native-maps doesn't run in a browser): a drawn map like
 * the one in design/canvas/CustomerMap.dc.html, with the same pins.
 */
export function PlacesMap({ places, selectedId, onSelect }: PlacesMapProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const position = (latitude: number, longitude: number) => ({
    left: ((longitude - CUSTOMER_LOCATION.longitude) / SPAN + 0.5) * size.width,
    top: ((CUSTOMER_LOCATION.latitude - latitude) / SPAN + 0.5) * size.height,
  });

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.land]}
      onLayout={(e) => setSize(e.nativeEvent.layout)}>
      <View style={[styles.road, { top: '27%', height: 14, transform: [{ rotate: '-8deg' }] }]} />
      <View style={[styles.road, { top: '58%', height: 10, transform: [{ rotate: '4deg' }] }]} />
      <View style={[styles.avenue, { left: '31%', width: 12, transform: [{ rotate: '6deg' }] }]} />
      <View style={[styles.avenue, { left: '74%', width: 10, transform: [{ rotate: '-3deg' }] }]} />
      <View style={styles.park} />
      {size.width > 0 && (
        <>
          <View style={[styles.marker, position(CUSTOMER_LOCATION.latitude, CUSTOMER_LOCATION.longitude)]}>
            <UserDot />
          </View>
          {places.map((place) => (
            <Pressable
              key={place.id}
              onPress={() => place.left > 0 && onSelect(place.id)}
              style={[
                styles.marker,
                position(place.latitude, place.longitude),
                { zIndex: place.id === selectedId ? 2 : 1 },
              ]}>
              <PricePin place={place} selected={place.id === selectedId} />
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  land: { backgroundColor: colors.mapLand, overflow: 'hidden' },
  road: { position: 'absolute', left: -20, right: -20, backgroundColor: colors.white },
  avenue: { position: 'absolute', top: -20, bottom: -20, backgroundColor: colors.white },
  park: {
    position: 'absolute',
    left: '46%',
    top: '42%',
    width: 90,
    height: 120,
    borderRadius: 20,
    backgroundColor: colors.mapPark,
  },
  marker: { position: 'absolute', transform: [{ translateX: '-50%' }, { translateY: '-50%' }] },
});
