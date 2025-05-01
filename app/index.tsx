
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Evento {
  id: string
  nome: string;
  endereco: string;
  data: string;
  horario: string;
}

export default function HomeScreen() {

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showMessage, setShowMessage] = useState(true); // Estado para controlar a exibição da mensagem

  useFocusEffect(
    useCallback(() => {
      const carregarEventos = async () => {
        try {
          const eventosJSON = await AsyncStorage.getItem('eventos');
          const eventosSalvos = eventosJSON ? JSON.parse(eventosJSON) : [];
          setEventos(eventosSalvos);

          // Se já existir algum evento, esconder a mensagem
          if (eventosSalvos.length > 0) {
            setShowMessage(false);
          }
        } catch (error) {
          console.error('Erro ao carregar eventos:', error);
        }
      };
      carregarEventos();
    }, [])
  );

  return (
    <View style={styles.container}>

      <Text style={styles.title}>ROCK IT</Text>
      <Text style={styles.subtitle}>próximos eventos</Text>

      {showMessage && (
        <Text style={styles.welcomeMessage}>Nenhum evento? Vamos mudar isso!</Text> // Frase com emoji
      )}

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <View style={styles.card}>
              <Text style={styles.eventTitle}>{item.nome}</Text>
              <Text style={styles.eventInfo}>{item.endereco}</Text>
              <Text style={styles.eventInfo}>{item.data}</Text>
              <Text style={styles.eventInfo}>{item.horario}</Text>
            </View>
            <Link
              href={{ pathname: '/edit_event', params: { id: item.id }  }} 
              style={styles.editIcon}
            >
              <Feather name="edit" size={24} color="#333" style={styles.editIcon} />
            </Link>
          </View>
        )}
      />

      <Link href="/add_event" style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Adicionar Evento</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6ec', 
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 200,
    fontWeight: '500',
    opacity: 0.8,
  },
  
  eventList: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffe4e1', 
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    elevation: 3, // para Android
    shadowColor: '#000', // para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    paddingRight: 30, 
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  editIcon: {
    position: 'absolute',
    bottom: 20,
    right: 10,
  },
  addButton: {
    backgroundColor: '#000',
    paddingVertical: 20,
    borderRadius: 10,
    marginTop: 50,
    marginBottom: 30,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
