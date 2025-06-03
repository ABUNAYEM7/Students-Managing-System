import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import AxiosSecure from "../../Components/Hooks/AxiosSecure";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const StudentIdCard = () => {
  const { email } = useParams();
  const axiosInstance = AxiosSecure();
  const [student, setStudent] = useState(null);
  const cardRef = useRef();

  useEffect(() => {
    if (!email) return;

    const fetchStudent = async () => {
      try {
        const res = await axiosInstance.get(`/student/${email}`);
        setStudent(res.data);
      } catch (err) {
        console.error("Error fetching student info:", err);
      }
    };

    fetchStudent();
  }, [email, axiosInstance]);

  const handleDownload = () => {
    if (!cardRef.current) return;

    html2canvas(cardRef.current, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [340, 215], // close to 3.375" x 2.125" in points (1 inch = 72pt)
      });
      pdf.addImage(imgData, "PNG", 0, 0, 340, 215);
      pdf.save(`${student.name}_ID_Card.pdf`);
    });
  };

  if (!student)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading student ID card...</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center py-10 bg-gray-50 min-h-screen">
      <div
        ref={cardRef}
        className="w-[340px] h-[350px] bg-white shadow-lg rounded-xl p-4 relative flex flex-col"
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {/* University logo and name */}
        <div className="flex flex-row gap-2 items-center justify-center mb-2">
          <img
            src="https://i.ibb.co/Kp4jTptL/image-copy-18.png"
            alt="University Logo"
            className="w-14 mb-1"
          />
          <h2 className="text-blue-900 font-bold text-lg select-none">
            Lordland University
          </h2>
        </div>

        {/* Student info section */}
        <div className="flex flex-col gap-4 items-center flex-grow">
          {/* Student Photo */}
          <div className="w-20 h-20 rounded-full overflow-hidden  flex-shrink-0">
            <img
              src={
                student.photo || "https://i.ibb.co/2K2tkj1/default-avatar.png"
              }
              alt="Student"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Student Details */}
          <div className="flex flex-col justify-center space-y-1 max-w-[95%] text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="font-semibold ">Student ID:</span>
              <span className="truncate ml-2" title={student.studentId}>
                {student.studentId || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold ">Name:</span>
              <span className="truncate ml-2" title={student.name}>
                {student.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold ">Email:</span>
              <span className="truncate ml-2" title={student.email}>
                {student.email}
              </span>
            </div>
            <div className="flex justify-between ">
              <span className="font-semibold ">Department:</span>
              {/* Remove truncate here and add break-words */}
              <span
                className="ml-2 break-words"
                title={student.department}
                style={{ maxWidth: "70%" }}
              >
                {student.department}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-xs text-gray-500 select-none">
            This is the official student identification card. Please carry this
            card on campus.
          </p>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="mt-6 px-6 py-2 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800 transition"
      >
        Download ID Card
      </button>
    </div>
  );
};

export default StudentIdCard;
