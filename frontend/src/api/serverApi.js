import { apiClient } from "./client.js";

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const transcribeMedia = async (mediaUrl, audioBlob) => {
  // If blob is provided, send it directly (faster - skips Cloudinary download)
  if (audioBlob) {
    const base64Audio = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const { data } = await apiClient.post(
      "/analysis/transcribe",
      { audioData: base64Audio }
    );
    return data;
  }

  // Fallback: use Cloudinary URL
  const { data } = await apiClient.post(
    "/analysis/transcribe",
    { mediaUrl }
  );
  return data;
};

export const getFeedback = async (args) => {
  const { data } = await apiClient.post("/analysis/feedback", args);
  return data;
};

// Sessions

export const fetchSessions = async () => {
  const { data } = await apiClient.get("/sessions");
  return data;
};

export const fetchSessionById = async (id) => {
  const { data } = await apiClient.get(`/sessions/${id}`);
  return data;
};

export const createSession = async (payload) => {
  const { data } = await apiClient.post("/sessions", payload);
  return data;
};

export const removeSessionById = async (id) => {
  await apiClient.delete(`/sessions/${id}`);
};

// Settings

export const fetchSettings = async () => {
  const { data } = await apiClient.get("/settings");
  return data;
};

export const updateSettingsApi = async (settings) => {
  const { data } = await apiClient.put("/settings", settings);
  return data;
};

// Auth

export const signup = async (input) => {
  const { data } = await apiClient.post("/auth/signup", input);
  return data;
};

export const login = async (input) => {
  const { data } = await apiClient.post("/auth/login", input);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data;
};

