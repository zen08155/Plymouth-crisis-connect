const API_BASE_URL = "http://localhost:8000"; // Change to your FastAPI URL
import { Incident, UpdateDescription, UpdatePriority } from "./types/incident";

// Create Incident
export const createIncident = async (incidentData : Incident) => {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incidentData),
  });

  if (!response.ok) {
    throw new Error("Failed to create incident");
  }

  return response.json();
};

// Update Description
export const updateIncidentDescription = async (
  incidentId : number,
  description : UpdateDescription
) => {
  const response = await fetch(
    `${API_BASE_URL}/incidents/${incidentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update description");
  }

  return response.json();
};

// Update Priority
export const updateIncidentPriority = async (
  incidentId : number,
  priority : UpdatePriority
) => {
  const response = await fetch(
    `${API_BASE_URL}/incidents/${incidentId}/priority`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priority }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update priority");
  }

  return response.json();
};