"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import useApi from "@/hooks/useApiClient";
import { initiateSocket, disconnectSocket } from "@/socket";

export default function TaskManager() {
  const { getTasks, getEmployees, createTask, updateTask, deleteTask, getUserProfile } = useApi();

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    assignedEmployee: "",
    dueDate: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const [t, e, u] = await Promise.all([getTasks(), getEmployees(), getUserProfile()]);
        setTasks(t);
        setEmployees(e);

        const socket = initiateSocket(user._id);
        socket.on("task:completed", (data) => {
          setTasks((prev) =>
            prev.map((task) =>
              task._id === data.taskId ? { ...task, status: "completed" } : task
            )
          );
          toast.success(`Completed: ${data.title}`);
        });

        socket.on("disconnect", () => {
          toast.error("Connection lost. Reconnecting...");
        });

        return () => {
          socket.off("task:completed");
          socket.off("disconnect");
          disconnectSocket();
        };
      } catch {
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      description: "",
      assignedEmployee: "",
      dueDate: "",
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTask(form._id, {
          title: form.title,
          description: form.description,
          assignedEmployee: form.assignedEmployee,
          dueDate: form.dueDate,
        });
        toast.success("Updated");
      } else {
        await createTask(form);
        toast.success("Created");
      }

      const updated = await getTasks();
      setTasks(updated);
      resetForm();
    } catch {
      toast.error("Save failed");
    }
  };

  const handleEdit = (task) => {
    setForm({
      ...task,
      assignedEmployee: task.assignedEmployee?._id || "",
      dueDate: task.dueDate?.slice(0, 10) || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        required
        className="w-full border px-3 py-2 rounded"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        required
        className="w-full border px-3 py-2 rounded"
      />
      <select
        name="assignedEmployee"
        value={form.assignedEmployee}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      >
        <option value="" disabled>Select employee</option>
        {employees.map((e) => (
          <option key={e._id} value={e._id}>{e.name}</option>
        ))}
      </select>
      <input
        type="date"
        name="dueDate"
        value={form.dueDate}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <div className="flex gap-3">
        <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded">
          {isEditing ? "Update" : "Create"}
        </button>
        {isEditing && (
          <button type="button" onClick={resetForm} className="flex-1 bg-gray-300 py-2 rounded">
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  const renderTasks = () => {
    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (!tasks.length) return <p className="text-center text-gray-500">No tasks</p>;

    return (
      <ul className="space-y-5">
        {tasks.map((task) => (
          <li key={task._id} className="p-5 border rounded shadow-sm">
            <h3 className="font-bold text-lg">{task.title}</h3>
            <p className="text-sm text-gray-700">{task.description}</p>
            <p className="text-sm mt-1">
              <span className="font-medium">Assigned:</span> {task.assignedEmployee?.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Due:</span> {formatDate(task.dueDate)}
            </p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => handleEdit(task)} className="flex-1 bg-green-500 text-white py-1 rounded">
                Edit
              </button>
              <button onClick={() => handleDelete(task._id)} className="flex-1 bg-red-500 text-white py-1 rounded">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Task Manager</h1>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">{renderForm()}</div>
            <div className="md:w-1/2">{renderTasks()}</div>
          </div>
        </div>
      </div>
    </>
  );
}
