import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AxiosSecure from "../AxiosSecure";
import socket from "../useSocket";
import { useNotification } from "./NotificationProvider";

export const useFacultyNotifications = (facultyEmail) => {
  const { setNotifications } = useNotification();

  const query = useQuery({
    queryKey: ["facultyNotifications", facultyEmail],
    queryFn: async () => {
      const res = await AxiosSecure().get(
        `/faculty-notifications?facultyEmail=${facultyEmail}`
      );
      return res.data || [];
    },
    enabled: !!facultyEmail,
    staleTime: 1000 * 60 * 5,
  });

  // Set context when initial query completes
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  useEffect(() => {
    if (!facultyEmail) return;

    socket.emit("join-role", "faculty", facultyEmail);

    // 🔁 Dynamically update context on socket event
    socket.on("faculty-notification", async () => {
      try {
        const res = await AxiosSecure().get(
          `/faculty-notifications?facultyEmail=${facultyEmail}`
        );
        setNotifications(res.data || []);
      } catch (err) {
        console.error("❌ Failed to update notifications dynamically", err);
      }
    });

    return () => {
      socket.off("faculty-notification");
    };
  }, [facultyEmail, setNotifications]);

  return query;
};
