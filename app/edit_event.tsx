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

  const [nome, setNome] = useState('');
  const [dataParaDB, setDataParaDB] = useState('');
  const [dataParaExibicao, setDataParaExibicao] = useState('');
  const [horario, setHorario] = useState('');
  const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);

  const [locais, setLocais] = useState<{ id: number; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 
  const [showCalendar, setShowCalendar] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false); 

  const formatarDataDoDBParaExibicao = (dateString: string) => {
    if (!dateString) return '';
    try {
      const dateObj = new Date(dateString + 'T12:00:00');
      if (isNaN(dateObj.getTime())) {
        return "Data inválida";
      }
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
      const formattedDate = dateObj.toLocaleDateString('pt-BR', options);
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch (e) {
      console.error("Erro ao formatar data do DB para exibição:", e);
      return dateString;
    }
  };

  useEffect(() => {
    if (!id) return;

    const carregarDados = async () => {
      try {
        setIsLoading(true);
        const [dadosDoEvento, dadosDosLocais] = await Promise.all([
          getEventoById(id),
          getAllLocais()
        ]);

        setNome(dadosDoEvento.nome_evento);
        setDataParaDB(dadosDoEvento.data);
        setDataParaExibicao(formatarDataDoDBParaExibicao(dadosDoEvento.data));
        setHorario(dadosDoEvento.horario);
        setLocalSelecionado(dadosDoEvento.local_id);
        
        setLocais(dadosDosLocais);

      } catch (error) {
        console.error("Erro ao carregar dados do evento:", error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do evento.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, [id]);

  const handleSalvarEdicao = async () => {
    if (!id || !nome || !localSelecionado || !dataParaDB || !horario) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    setIsSaving(true);
    const eventoAtualizado = {
      nome_evento: nome,
      data: dataParaDB,
      horario,
      local_id: localSelecionado,
    };

    try {
      console.log('Enviando para atualização:', eventoAtualizado);
      await updateEvento(id, eventoAtualizado);
      Alert.alert('Sucesso!', 'Evento atualizado.');
      router.back();
    } catch (error: any) {
      console.error("Erro ao salvar edição:", error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o evento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExcluirEvento = () => {
    if (!id) {
        console.warn('ID não encontrado ao tentar excluir.');
        return;
    }
    setConfirmModalVisible(true); 
  };

  const executeDelete = async () => {
    setConfirmModalVisible(false);
    setIsSaving(true); 
    try {
      console.log('Tentando excluir evento com ID:', id);
      await deleteEvento(id);
      console.log('Evento excluído com sucesso!');
      Alert.alert('Sucesso', 'Evento excluído.');
      router.push('/');
    } catch (error: any) {
      console.error("Erro ao excluir evento:", error);
      Alert.alert('Erro', error.message || 'Não foi possível excluir o evento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <View style={[styles.container, styles.loadingContainer]}><ActivityIndicator size="large" color="#000" /></View>;
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
      <TextInput style={styles.input} value={dataParaExibicao} editable={false} />
      <Button title="Escolher Data" onPress={() => setShowCalendar(!showCalendar)} />

      {showCalendar && (
          <Calendar onDayPress={(day: DateData) => {
              const dataSelecionadaParaExibicao = new Date(day.dateString + 'T12:00:00');
              const dataFormatada = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', }).format(dataSelecionadaParaExibicao); 
              const formatadoComInicialMaiuscula = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1); 
              
              setDataParaExibicao(formatadoComInicialMaiuscula);
              setDataParaDB(day.dateString);
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

      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setConfirmModalVisible(false)}>
          <View style={styles.confirmModalOverlay}>
            
            <TouchableWithoutFeedback onPress={() => { /* Evita que o clique no conteúdo feche o modal */ }}>
              <View style={styles.confirmModalContent}>
                <Text style={styles.confirmModalTitle}>Confirmar Exclusão</Text>
                <Text style={styles.confirmModalMessage}>Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.</Text>
                <View style={styles.confirmModalButtons}>
                  <Button title="Cancelar" onPress={() => setConfirmModalVisible(false)} color="#999" />
                  <Button title="Excluir" onPress={executeDelete} color="red" />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf6ec', padding: 20 },
  loadingContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    width: '80%', 
    maxWidth: 350, 
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
