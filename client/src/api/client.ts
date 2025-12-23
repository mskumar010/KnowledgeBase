import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const runWorkflow = async (
  workflow: any,
  userQuery: string,
  signal?: AbortSignal
) => {
  const response = await apiClient.post(
    "/run_workflow",
    {
      workflow,
      user_query: userQuery,
    },
    { signal }
  );
  return response.data;
};

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Stack API
export const getStacks = async () => {
  const response = await apiClient.get("/stacks/");
  return response.data;
};

export const createStack = async (name: string, description: string) => {
  const response = await apiClient.post("/stacks/", { name, description });
  return response.data;
};

export const getStack = async (id: string) => {
  const response = await apiClient.get(`/stacks/${id}`);
  return response.data;
};

export const updateStack = async (id: string, data: any) => {
  const response = await apiClient.put(`/stacks/${id}`, data);
  return response.data;
};

export const deleteStack = async (id: string) => {
  const response = await apiClient.delete(`/stacks/${id}`);
  return response.data;
};
