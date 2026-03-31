import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Map({ route }) {
    const { address } = route.params;
    const [region, setRegion] = useState({
        latitude: 60.1699,
        longitude: 24.9384,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
    });

    useEffect(() => {
        if (!address) return;

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

        fetch(url, {
            headers: {
                'User-Agent': 'OsoitekirjaApp/1.0'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Verkkovirhe tai palvelu estetty');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    setRegion({
                        latitude: parseFloat(data[0].lat),
                        longitude: parseFloat(data[0].lon),
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                    });
                } else {
                    console.warn("Osoitetta ei löytynyt");
                }
            })
            .catch(error => {
                console.error("Fetch-virhe:", error);
            });
    }, [address]);

    return (
        <SafeAreaView style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={region}
                region={region}>
                <Marker coordinate={region} title={address} />
            </MapView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        flex: 1,
    },
});