import { createContext, useContext, useState } from "react";
import AxiosSecure from "../AxiosSecure";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // add notifications
  const addNotification = (newNotification) => {
    console.log(newNotification);
    if (Array.isArray(newNotification)) {
      setNotifications((prev) => [...newNotification, ...prev]);
    } else {
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  const fetchLeaveNotifications = async (facultyEmail) => {
    try {
      const axiosInstance = AxiosSecure();

      const courseRes = await axiosInstance.get(
        `/faculty-assign/courses/${facultyEmail}`
      );
      const assignedCourses = courseRes?.data || [];

      let allLeaves = [];

      // Step 2: For each course, fetch leave applications
      for (const course of assignedCourses) {
        const leaveRes = await axiosInstance.get(
          `/faculty-leaves?facultyEmail=${facultyEmail}&courseId=${course.courseId}`
        );

        if (Array.isArray(leaveRes.data)) {
          allLeaves = [...allLeaves, ...leaveRes.data];
        }
      }

      // Step 3: Add all to notifications
      if (allLeaves.length > 0) {
        addNotification(allLeaves);
      }
    } catch (error) {
      console.error("❌ Failed to fetch initial notifications:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, fetchLeaveNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
