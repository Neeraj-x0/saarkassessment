import { useEffect, useState, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import axios from "axios";

const useApi = () => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");

  const apiClient = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://taskback-d1788b8581c9.herokuapp.com",
    });

    // Interceptor to attach token from cookies before each request.
    instance.interceptors.request.use(
      (config) => {
        const storedToken = Cookies.get("token");
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, []);

  const saveToken = useCallback((newToken) => {
    Cookies.set("token", newToken);
    setToken(newToken);
  }, []);

  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken && storedToken !== token) {
      setToken(storedToken);
    }
  }, [token]);

  const registerUser = async (userData) => {
    const res = await apiClient.post("/auth/register", userData);
    const { token: newToken } = res.data;
    Cookies.set("token", newToken);
    setToken(newToken);
    return res.data;
  };

  const login = async (credentials) => {
    const res = await apiClient.post("/auth/login", credentials);
    const { token: newToken } = res.data;
    Cookies.set("token", newToken);
    Cookies.set("userId", res.data.user._id);
    setToken(newToken);
    return res.data;
  };

  const getUserProfile = async () => {
    const res = await apiClient.get(`/auth/profile`);
    return res.data;
  };

  const getEmployees = async () => {
    const res = await apiClient.get("/auth/employees");
    return res.data.employees;
  };

  const updateUserProfile = async (userId, data) => {
    const res = await apiClient.put(`/auth/profile/${userId}`, data);
    return res.data;
  };

  const deleteUserProfile = async (userId) => {
    const res = await apiClient.delete(`/auth/profile/${userId}`);
    return res.data;
  };

  const createTask = async (taskData) => {
    const res = await apiClient.post("/tasks", taskData);
    return res.data;
  };

  const getTasks = async () => {
    const res = await apiClient.get("/tasks");
    return res.data.tasks || [];
  };

  const getTaskById = async (taskId) => {
    const res = await apiClient.get(`/tasks/${taskId}`);
    return res.data;
  };

  const updateTask = async (taskId, data) => {
    const res = await apiClient.put(`/tasks/${taskId}`, data);
    return res.data;
  };

  const deleteTask = async (taskId) => {
    const res = await apiClient.delete(`/tasks/${taskId}`);
    return res.data;
  };

  const updateTaskStatus = async (taskId, status) => {
    const res = await apiClient.patch(`/tasks/${taskId}/status`, { status });
    return res.data;
  };

  return {
    token,
    saveToken,
    registerUser,
    login,
    getEmployees,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
  };
};

export default useApi;
