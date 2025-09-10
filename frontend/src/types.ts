export type Urgency = 'critical' | 'overdue' | 'soon' | 'normal';

export interface Stats {
  total: number;
  pendentes: number;
  atrasadas: number;
  proximas7d: number;
  comAlerta: number;
}

export interface Row {
  id: string;
  status: 'pendente' | 'concluida';
  alert: string | null;
  nextInspection: string | null;
  equipment: { name: string; type: string };
  area: { name: string; latitude: number; longitude: number };
  client: { name: string; address: string };
  urgency: Urgency;
}
