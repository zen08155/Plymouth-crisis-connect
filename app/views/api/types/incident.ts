export interface Incident {
  coordinator_id: number;
  title: string;
  description: string;
  incident_type: string;
  important_data: string;
  important_data_extra: string;
  latitude: number;
  longitude: number;
  priority: string;
  status?: boolean;
  created_at?: string;
  created_by?: number;
  ended_at?: string;
  ended_by?: number;
}

export interface UpdateDescription {
  description: string;
}

export interface UpdatePriority {
  priority: string;
}