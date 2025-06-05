"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getSocket, initiateSocket, disconnectSocket } from "@/socket";
import useApi from "@/hooks/useApiClient";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const { getTasks, updateTaskStatus, getUserProfile } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, taskData] = await Promise.all([
          getUserProfile(),
          getTasks(),
        ]);

        setUserProfile(user);
        setTasks(taskData || []);

        if (user?._id) {
          const socket = initiateSocket(user._id);

          socket.on("task:assigned", (task) => {
            setTasks((prev) => [...prev, task]);
            toast.success(`New task: ${task.title}`);
          });

          socket.on("task:updated", (data) => {
            setTasks((prev) =>
              prev.map((task) =>
                task._id === data.taskId ? { ...task, ...data.updates } : task
              )
            );
            toast.success(`Updated: ${data.title}`);
          });

          socket.on("task:completed", (data) => {
            setTasks((prev) =>
              prev.map((task) =>
                task._id === data.taskId
                  ? { ...task, status: "completed" }
                  : task
              )
            );
            toast.success(`Completed: ${data.title}`);
          });

          socket.on("disconnect", () => {
            toast.error("Connection lost. Reconnecting...");
          });

          return () => {
            socket.off("task:assigned");
            socket.off("task:updated");
            socket.off("task:completed");
            socket.off("disconnect");
            disconnectSocket();
          };
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tasks");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleTaskAssigned = (e) => {
      const task = e.detail;
      setTasks((prev) => [...prev, task]);
      toast.success(`New task: ${task.title}`);
    };

    window.addEventListener("taskAssigned", handleTaskAssigned);
    return () => window.removeEventListener("taskAssigned", handleTaskAssigned);
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, status: updated.task.status } : task
        )
      );
      toast.success(`Status: ${newStatus}`);
    } catch {
      toast.error("Status update failed");
    }
  };

  return (
    <div className="p-5">
      <Toaster />
      <h1 className="mb-5 text-2xl font-bold">Tasks</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="border border-gray-300 rounded-lg p-4 shadow"
            >
              <h2 className="mb-2 text-xl font-semibold">{task.title}</h2>
              <p className="mb-3">{task.description}</p>
              <div className="mb-3">
                <label className="block">
                  <span className="font-medium">Status:</span>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
              </div>
              <p className="mb-1">
                <span className="font-medium">Due:</span>{" "}
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">By:</span>{" "}
                {task.assignedBy || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
