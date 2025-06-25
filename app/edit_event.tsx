import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Button, ActivityIndicator, Modal, FlatList, TouchableWithoutFeedback, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { getEventoById, updateEvento, deleteEvento, getAllLocais } from '../scr/services/api';

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
  const { id } = useLocalSearchParams<{ id: string }>();

  // States para os dados do formulário
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);
  
  // States de controle da UI
  const [locais, setLocais] = useState<{ id: number; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Busca os dados do evento e a lista de locais ao carregar a tela
  useEffect(() => {
    if (!id) return;

    const carregarDados = async () => {
      try {
        setIsLoading(true);
        // Busca os dados do evento específico E a lista de todos os locais em paralelo
        const [dadosDoEvento, dadosDosLocais] = await Promise.all([
          getEventoById(id),
          getAllLocais()
        ]);
        
        // Preenche os campos com os dados do evento que vieram da API
        setNome(dadosDoEvento.nome_evento);
        setData(dadosDoEvento.data);
        setHorario(dadosDoEvento.horario);
        setLocalSelecionado(dadosDoEvento.local_id);
        
        // Armazena a lista de locais para o seletor
        setLocais(dadosDosLocais);

      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do evento.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, [id]);

  // Função para salvar as alterações
  const handleSalvarEdicao = async () => {
    if (!id || !nome || !localSelecionado || !data || !horario) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    setIsSaving(true);
    const eventoAtualizado = {
      nome_evento: nome,
      data,
      horario,
      local_id: localSelecionado,
    };

    try {
      await updateEvento(id, eventoAtualizado);
      Alert.alert('Sucesso!', 'Evento atualizado.');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para excluir o evento
  const handleExcluirEvento = async () => {
    if(!id) return;

    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
          setIsSaving(true);
          try {
            await deleteEvento(id);
            Alert.alert('Sucesso', 'Evento excluído.');
            router.push('/'); // Volta para a home
          } catch (error: any) {
            Alert.alert('Erro', error.message);
          } finally {
            setIsSaving(false);
          }
        }}
      ]
    );
  };

  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Evento</Text>
      
       <Text style={styles.label}>Nome do Evento</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome}/>

        <Text style={styles.label}>Local do Evento</Text>
        <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
            <Text style={styles.inputText}>
                {localSelecionado ? locais.find(l => l.id === localSelecionado)?.nome : 'Selecione um local'}
            </Text>
        </TouchableOpacity>
        
        {/* Modal para seleção de local */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <FlatList
              data={locais}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setLocalSelecionado(item.id); setModalVisible(false); }}>
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

        <Text style={styles.label}>Data</Text>
        <TextInput style={styles.input} value={data} editable={false} />
        <Button title="Escolher Data" onPress={() => setShowCalendar(!showCalendar)} />

        {showCalendar && (
            <Calendar onDayPress={(day: DateData) => {
                const dataSelecionada = new Date(day.dateString + 'T12:00:00');
                const dataFormatada = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', }).format(dataSelecionada); 
                const formatadoComInicialMaiuscula = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1); 
                setData(formatadoComInicialMaiuscula);
                setShowCalendar(false);
            }} />
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
        />

      <TouchableOpacity style={[styles.editButton, isSaving && styles.saveButtonDisabled]} onPress={handleSalvarEdicao} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar Alterações</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.deleteButton, isSaving && styles.saveButtonDisabled]} onPress={handleExcluirEvento} disabled={isSaving}>
        <Text style={styles.buttonText}>Excluir Evento</Text>
      </TouchableOpacity>
    </ScrollView>
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
  inputText: { 
    color: '#000', fontSize: 16 
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
  saveButtonDisabled: { 
    backgroundColor: '#999' 
  },
  modalOverlay: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' 

  },
  modalContent: { 
    backgroundColor: '#fff', padding: 20, margin: 40, borderRadius: 10, maxHeight: '50%' 
  },
  modalItem: { 
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' 
  },
  modalItemText: { 
    fontSize: 16, color: '#000' 
  },
});
