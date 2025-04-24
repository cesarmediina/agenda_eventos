import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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


export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const carregarEvento = async () => {
      const eventosJSON = await AsyncStorage.getItem('eventos');
      const eventos = eventosJSON ? JSON.parse(eventosJSON) : [];
      const evento = eventos.find((e: any) => e.id === id);

      if (evento) {
        setNome(evento.nome);
        setEndereco(evento.endereco);
        setData(evento.data);
        setHorario(evento.horario);
      }
    };
    carregarEvento();
  }, []);

  const salvarEdicao = async () => {

    if (!nome || !endereco || !data || !horario) {
        Alert.alert('Atenção', 'Preencha todos os campos!');
        return;
      }
        
    const eventosJSON = await AsyncStorage.getItem('eventos');
    let eventos = eventosJSON ? JSON.parse(eventosJSON) : [];

    const eventosAtualizados = eventos.map((e: any) =>
      e.id === id ? { ...e, nome, endereco, data, horario } : e
    );

    await AsyncStorage.setItem('eventos', JSON.stringify(eventosAtualizados));
    Alert.alert('Sucesso', 'Evento atualizado com sucesso!');
    router.push('/');
  };

const excluirEvento = async () => {

  const eventosJSON = await AsyncStorage.getItem('eventos');
  const eventos = eventosJSON ? JSON.parse(eventosJSON) : [];

  const eventosFiltrados = eventos.filter((e: any) => e.id !== id);

  await AsyncStorage.setItem('eventos', JSON.stringify(eventosFiltrados));

  router.push('/');
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Evento</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Endereço</Text>
      <TextInput style={styles.input} value={endereco} onChangeText={setEndereco} />

      <Text style={styles.label}>Data</Text>
      <TextInput style={styles.input} value={data} onChangeText={setData} placeholder="Ex: Segunda-feira, 22/04/2025"/>
      
      <Button title="Escolher Data" onPress={() => setShowCalendar(!showCalendar)} />
      
        {showCalendar && (
            <Calendar
            markedDates={{
                [data]: { selected: true, selectedColor: 'blue', selectedTextColor: 'white' },
            }}
            onDayPress={(day: { dateString: string }) => {
                const dataSelecionada = new Date(day.dateString);
            
                const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
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

      <TouchableOpacity style={styles.editButton} onPress={salvarEdicao}>
        <Text style={styles.buttonText}>Alterar Dados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={excluirEvento}>
        <Text style={styles.buttonText}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf6ec', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    backgroundColor: '#ffe4e1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#000',
  },
  editButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
