import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import socket from "../useSocket";
import { useNotification } from "./NotificationProvider";
import AxiosSecure from "../AxiosSecure";

export const useRoleBasedNotifications = (email, role) => {
  const { setNotifications } = useNotification();
  const axiosInstance = AxiosSecure();

  const isFaculty = role === "faculty";
  const isStudent = role === "student";
  const isAdmin = role === "admin";

  let endpoint = null;

  if (isFaculty) {
    endpoint = `/faculties-notifications/${email}`;
  } else if (isStudent) {
    endpoint = `/student-notifications/${email}`;
  } else if (isAdmin) {
    endpoint = `/admin-notifications`;
  }

  const query = useQuery({
    queryKey: ["notifications", email, role],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoint);
      return res.data || [];
    },
    enabled: !!email && (isFaculty || isStudent || isAdmin),
    staleTime: 1000 * 60 * 5,
  });

  // 🧠 Set notifications when data changes
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  // 📡 Listen to faculty socket events only
  useEffect(() => {
    if (!email || !isFaculty) return;

    socket.emit("join-role", "faculty", email);

    const listener = async () => {
      try {
        const res = await axiosInstance.get(`/faculties-notifications/${email}`);
        setNotifications(res.data || []);
      } catch (err) {
        console.error("📡 Socket fetch error (faculty):", err);
      }
    };

    socket.on("faculty-notification", listener);

    return () => socket.off("faculty-notification", listener);
  }, [email, isFaculty, setNotifications]);

  return query;
};
