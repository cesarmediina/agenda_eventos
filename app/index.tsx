
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { getAllEventos } from '../scr/services/api'; 


interface EventoDaAPI {
  id: string;
  nome_evento: string;
  nome_local: string;
  data: string;
  horario: string;
}

export default function HomeScreen() {
  const [eventos, setEventos] = useState<EventoDaAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const carregarEventosDaAPI = async () => {
        setIsLoading(true);
        const eventosSalvos = await getAllEventos();
        setEventos(eventosSalvos);
        setIsLoading(false);
      };
      carregarEventosDaAPI();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ROCK IT</Text>
      <Text style={styles.subtitle}>próximos eventos</Text>

      {/* Se não houver eventos, mostra a mensagem de boas-vindas */}
      {eventos.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.welcomeMessage}>Nenhum evento? Vamos mudar isso!</Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <View style={styles.cardContent}>
                {/* Usamos os nomes dos campos que vêm da API */}
                <Text style={styles.eventTitle}>{item.nome_evento}</Text>
                <Text style={styles.eventInfo}>{item.nome_local}</Text>
                <Text style={styles.eventInfo}>{item.data}</Text>
                <Text style={styles.eventInfo}>{item.horario}</Text>
              </View>
              <Link href={{ pathname: '/edit_event', params: { id: item.id } }}>
                <Feather name="edit" size={24} color="#333" />
              </Link>
            </View>
          )}
        />
      )}

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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
