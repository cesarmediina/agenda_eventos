const API_URL = 'https://agendaeventos-production.up.railway.app';

export const getAllLocais = async () => {
  try {
    const response = await fetch(`${API_URL}/locais`);
    if (!response.ok) {
      throw new Error('Falha ao buscar os locais do servidor.');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro em getAllLocais:', error);
    return [];
  }
};
export const createEvento = async (eventoData: { nome_evento: string; data: string; horario: string; local_id: number; }) => {
  const response = await fetch(`${API_URL}/eventos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventoData),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || 'Falha ao criar o evento no servidor.');
  }

  return await response.json();
};
export const getEventoById = async (id: string) => {
  const response = await fetch(`${API_URL}/eventos/${id}`);
  if (!response.ok) throw new Error('Falha ao buscar detalhes do evento.');
  return await response.json();
};

export const updateEvento = async (id: string, eventoData: any) => {
  const response = await fetch(`${API_URL}/eventos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventoData),
  });
  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || 'Falha ao atualizar o evento.');
  }
  return await response.json();
};

export const deleteEvento = async (id: string) => {
  const response = await fetch(`${API_URL}/eventos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || 'Falha ao deletar o evento.');
  }
};

export const getAllEventos = async () => {
  try {
    const response = await fetch(`${API_URL}/eventos`);
    if (!response.ok) throw new Error('Falha ao buscar a lista de eventos.');
    return await response.json();
  } catch (error) {
    console.error('Erro em getAllEventos:', error);
    return [];
  }
};
