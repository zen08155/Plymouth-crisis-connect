const API_BASE_URL = "http://localhost:8000";
import {
  LoginRequest,
  RegisterRequest,
  UserSkill,
  VolunteerRequest,
} from "./types/user";


export const login = async (data: LoginRequest) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return response.json();
};

export const setSkills = async (skills: UserSkill) => {
  const response = await fetch(`${API_BASE_URL}/skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(skills),
  });

  if (!response.ok) {
    throw new Error("Failed to save skills");
  }

  return response.json();
};

export const volunteerForIncident = async (
  data: VolunteerRequest
) => {
  const response = await fetch(`${API_BASE_URL}/volunteer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to volunteer");
  }

  return response.json();
};