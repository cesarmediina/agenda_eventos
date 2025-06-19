import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};

LocaleConfig.defaultLocale = 'pt-br';

export default function AddEventScreen() {
  const [nome, setNome] = useState('');
  const [locais, setLocais] = useState<{ id: number; nome: string; endereco: string }[]>([]);
  const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetch('http://192.168.0.4:3000/locais')  // Ajuste o IP se estiver testando no celular
      .then(res => res.json())
      .then(data => {
        setLocais(data);
        setLoadingLocais(false);
      })
      .catch(() => {
        setLocais([]);
        setLoadingLocais(false);
      });
  }, []);

  const salvarEvento = async (novoEvento: any) => {
    try {
      const eventosJSON = await AsyncStorage.getItem('eventos');
      const eventos = eventosJSON ? JSON.parse(eventosJSON) : [];
      eventos.push(novoEvento);
      await AsyncStorage.setItem('eventos', JSON.stringify(eventos));
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>ROCK IT</Text>

      <Text style={styles.label}>Nome do Evento</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome do evento"
        placeholderTextColor="#fff"
      />

      <Text style={styles.label}>Local do Evento</Text>
      {loadingLocais ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: '#fff' }}>
              {localSelecionado
                ? locais.find(l => l.id === localSelecionado)?.nome
                : 'Selecione um local'}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.modalContent}>
              <FlatList
                data={locais}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setLocalSelecionado(item.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Modal>
        </>
      )}

      <Text style={styles.label}>Data</Text>
      <TextInput
        style={styles.input}
        value={data}
        onChangeText={setData}
        placeholder="Ex: Segunda-feira, 22/04/2025"
        placeholderTextColor="#aaa"
        editable={false}
      />
      <Button title="Escolher Data" onPress={() => setShowCalendar(!showCalendar)} />

      {showCalendar && (
        <Calendar
          markedDates={{
            [data]: { selected: true, selectedColor: 'blue', selectedTextColor: 'white' },
          }}
          onDayPress={(day: { dateString: string }) => {
            const dataSelecionada = new Date(day.dateString + 'T12:00:00');

            const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(dataSelecionada); 
            const formatadoComInicialMaiuscula = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1); 
            setData(formatadoComInicialMaiuscula);
            setShowCalendar(false);
          }}
        />
      )}

      <Text style={styles.label}>Horário</Text>
      <TextInput
        style={styles.input}
        value={horario}
        onChangeText={(text) => {
          const cleanText = text.replace(/\D/g, ''); 
          let formatted = cleanText;
          if (cleanText.length > 2) {
            formatted = `${cleanText.slice(0, 2)}:${cleanText.slice(2, 4)}`;
          }

          setHorario(formatted);
        }}
        keyboardType="numeric"
        placeholder="Ex: 20:00"
        placeholderTextColor="#fff"
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={async () => {
          if (!nome || !localSelecionado || !data || !horario) {
            alert('Preencha todos os campos!');
            return;
          }

          const local = locais.find(l => l.id === localSelecionado);

          const novoEvento = {
            id: Date.now().toString(),
            nome,
            local: local ? local.nome: '',
            endereco: local ? local.endereco : '',
            data,
            horario,
          };

          await salvarEvento(novoEvento);

          setNome('');
          setLocalSelecionado(null);
          setData('');
          setHorario('');

          router.back();
        }}
      >
        <Text style={styles.saveButtonText}>Adicionar Evento</Text>
      </TouchableOpacity>

    </ScrollView> 

  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fdf6ec',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  input: {
    backgroundColor: '#4682B4',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 50,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 40,
    borderRadius: 10,
    maxHeight: '50%',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
  },
});
