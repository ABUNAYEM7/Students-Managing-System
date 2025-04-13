import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AxiosSecure from "../AxiosSecure";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (newNotification) => {
    if (Array.isArray(newNotification)) {
      setNotifications((prev) => [...newNotification, ...prev]);
    } else {
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  const clearNotifications = () => setNotifications([]);

  // ✅ NEW: Hook to fetch with React Query
  const useFacultyNotifications = (facultyEmail) => {
    return useQuery({
      queryKey: ["facultyNotifications", facultyEmail],
      queryFn: async () => {
        const axiosInstance = AxiosSecure();
        const res = await axiosInstance.get(
          `/faculty-leave-notifications?facultyEmail=${facultyEmail}`
        );
        return res.data || [];
      },
      enabled: !!facultyEmail, // only fetch if email is available
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        addNotification,
        clearNotifications,
        useFacultyNotifications, // ✅ Export React Query hook
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
