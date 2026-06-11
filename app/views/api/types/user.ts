export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  surname: string;
  password: string;
  email: string;
  phone_nr: string;
  birthday: string; // YYYY-MM-DD
  role?: string;
}

export interface UserSkill {
  user_id: number;
  title: string;
  description: string;
  skill_type: string;

  skill_description?: string;
  proof_of_certificate?: string;
  name_of_certificate?: string;
  expiration_date_certificate?: string;
  course_taken_at?: string;
}

export interface VolunteerRequest {
  user_id: number;
  incident_id: number;
}