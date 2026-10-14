import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { CUSTOMER_LOCATION, type Place } from '@/data/sample';

import { PricePin, UserDot } from './price-pin';

export type PlacesMapProps = {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/** Real map on iPhone (Apple Maps) and Android (Google Maps). Works in Expo Go. */
export function PlacesMap({ places, selectedId, onSelect }: PlacesMapProps) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{ ...CUSTOMER_LOCATION, latitudeDelta: 0.024, longitudeDelta: 0.024 }}
      showsPointsOfInterests={false}
      toolbarEnabled={false}>
      <Marker coordinate={CUSTOMER_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
        <UserDot />
      </Marker>
      {places.map((place) => (
        <Marker
          key={place.id}
          coordinate={{ latitude: place.latitude, longitude: place.longitude }}
          onPress={() => place.left > 0 && onSelect(place.id)}
          zIndex={place.id === selectedId ? 2 : 1}>
          <PricePin place={place} selected={place.id === selectedId} />
        </Marker>
      ))}
    </MapView>
  );
}
