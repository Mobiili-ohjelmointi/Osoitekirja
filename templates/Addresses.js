import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Keyboard } from 'react-native';
import { TextInput, Button, List, IconButton, Divider } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Addresses({ navigation }) {
    const [address, setAddress] = useState('');
    const [places, setPlaces] = useState([]);
    const [db, setDb] = useState(null);

    useEffect(() => {
        async function initDb() {
            const database = await SQLite.openDatabaseAsync('places.db')
            setDb(database);
            await database.execAsync(`
            CREATE TABLE IF NOT EXISTS places (id INTEGER PRIMARY KEY NOT NULL, address TEXT);`)
            updateList(database);
        }
        initDb();
    }, []);

    const updateList = async (database) => {
        const result = await database.getAllAsync('SELECT * FROM places');
        setPlaces(result);
    };

    const savePlace = async () => {
        if (address.length > 0 && db) {
            await db.runAsync('INSERT INTO places (address) VALUES (?)', [address]);
            setAddress('');
            updateList(db);
            Keyboard.dismiss();
        }
    };

    const deletePlace = async (id) => {
        if (db) {
            await db.runAsync('DELETE FROM places WHERE id = ?', [id]);
            updateList(db);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <View style={styles.inputContainer}>
                <TextInput
                    label="Type address"
                    mode="outlined"
                    value={address}
                    onChangeText={setAddress}
                    style={styles.input}
                />
                <Button mode="contained" icon="map-marker-plus" onPress={savePlace} style={styles.button}>
                    Save Place
                </Button>
            </View>

            <FlatList
                data={places}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <Divider />}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.address}
                        description="Tap to show on map, long press to delete"
                        onPress={() => navigation.navigate('Map', { address: item.address })}
                        onLongPress={() => {
                            Alert.alert('Delete', 'Delete this place?', [
                                { text: 'Cancel' },
                                { text: 'OK', onPress: () => deletePlace(item.id) }
                            ]);
                        }}
                        left={props => <List.Icon {...props} icon="map-marker" />}
                        right={props => <IconButton {...props} icon="chevron-right" />}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    inputContainer: {
        padding: 15
    },
    input: {
        marginBottom: 10
    },
    button: {
        borderRadius: 20
    }
});

