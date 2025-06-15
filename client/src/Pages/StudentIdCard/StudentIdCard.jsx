import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import AxiosSecure from "../../Components/Hooks/AxiosSecure";
import html2canvas from "html2canvas-pro";
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

  const isProfileComplete = (student) => {
    return (
      student?.name &&
      student?.email &&
      student?.studentId &&
      student?.countryCode &&
      student?.contactNumber &&
      student?.bloodGroup &&
      student?.department &&
      student?.photo
    );
  };

  const handleDownload = async () => {
    const node = cardRef.current;
    if (!node) return;

    const clone = node.cloneNode(true);

    const sanitizeColors = (element) => {
      const computedStyle = window.getComputedStyle(element);
      ["color", "backgroundColor", "borderColor", "boxShadow"].forEach((prop) => {
        const value = computedStyle[prop];
        if (value && value.includes("oklch")) {
          element.style[prop] = "#000";
        }
      });

      if (element.hasAttribute("style")) {
        const clean = element
          .getAttribute("style")
          .replace(/oklch\([^\)]+\)/g, "#000");
        element.setAttribute("style", clean);
      }

      Array.from(element.children).forEach(sanitizeColors);
    };

    sanitizeColors(clone);

    // Stack front and back vertically
    const cardChildren = clone.children;
    if (cardChildren.length === 2) {
      clone.style.display = "flex";
      clone.style.flexDirection = "column";
      clone.style.alignItems = "center";
      clone.style.gap = "12px";
    }

    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.top = "-9999px";
    hiddenContainer.style.left = "-9999px";
    hiddenContainer.style.zIndex = "-9999";
    hiddenContainer.style.backgroundColor = "#fff";
    hiddenContainer.appendChild(clone);
    document.body.appendChild(hiddenContainer);

    try {
      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#fff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", [canvas.width, canvas.height]);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const xOffset = (pageWidth - canvas.width) / 2;
      pdf.addImage(imgData, "PNG", xOffset, 0);
      pdf.save(`${student?.name || "student"}-ID-Card.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      document.body.removeChild(hiddenContainer);
    }
  };

  if (!student)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading student ID card...</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center py-10 bg-white min-h-screen space-y-6">
      <div className="flex flex-col gap-6 items-center" ref={cardRef}>
        {/* FRONT SIDE */}
        <div className="w-[320px] h-[380px] bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-300 relative font-sans">
          <div className="bg-[#baf2d1] text-white flex items-center gap-2 p-2">
            <img
              src="https://i.ibb.co/Kp4jTptL/image-copy-18.png"
              alt="logo"
              className="w-10 h-10 rounded-full border border-white"
            />
            <h1 className="text-lg text-black font-semibold tracking-wide">
              Lordland University
            </h1>
          </div>

          <div className="flex flex-col items-center mt-4 px-3">
            <div className="w-24 h-24 clip-hexagon overflow-hidden shadow-md border-4 border-white">
              <img
                src={student.photo || "https://i.ibb.co/2K2tkj1/default-avatar.png"}
                alt="student"
                className="object-cover w-full h-full"
              />
            </div>
            <h2 className="text-xl font-bold mt-3 text-gray-800 text-center">
              {student?.name || "N/A"}
            </h2>
            <p className="text-sm text-gray-600 font-medium text-center">
              {student?.department || "Department"}
            </p>
          </div>

          <div className="px-5 py-1 mt-2 text-[13px] text-gray-700 space-y-1">
            <p><span className="font-semibold">ID No:</span> {student.studentId}</p>
            <p><span className="font-semibold">Phone:</span> {`${student?.countryCode} ${student?.contactNumber}`}</p>
            <p><span className="font-semibold">Email:</span> {student.email}</p>
            <p><span className="font-semibold">Blood Group:</span> {student.bloodGroup || "N/A"}</p>
          </div>

          <div className="absolute bottom-2 w-full text-center text-[10px] text-gray-500 px-2">
            This ID must be carried at all times on campus premises.
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="w-[320px] h-[380px] bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-300 flex flex-col justify-between font-sans">
          {/* SAME HEADER AS FRONT */}
          <div className="bg-[#baf2d1] text-white flex items-center gap-2 p-2">
            <img
              src="https://i.ibb.co/Kp4jTptL/image-copy-18.png"
              alt="logo"
              className="w-10 h-10 rounded-full border border-white"
            />
            <h1 className="text-lg text-black font-semibold tracking-wide">
              Lordland University
            </h1>
          </div>

          <div className="px-6 py-4">
            <h2 className="font-bold text-center text-lg text-gray-800 mb-2">
              Terms & Conditions
            </h2>
            <ul className="list-disc text-xs text-gray-700 pl-4 space-y-1">
              <li>This card remains the property of Lordland University.</li>
              <li>Non-transferable and must be shown upon request.</li>
              <li>Loss should be reported to the admin office immediately.</li>
              <li>Forgery or misuse will lead to disciplinary action.</li>
            </ul>
          </div>

          <div className="px-6 pb-4 text-xs flex justify-between items-end text-gray-600">
            <div>
              <p><span className="font-semibold">Issue Date:</span> {student?.createdAt || "01/01/2025"}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-500 w-24 mx-auto mb-1"></div>
              <span className="text-[10px]">Authorized Signature</span>
            </div>
          </div>
        </div>

        {/* Custom clip-path for photo */}
        <style>{`
          .clip-hexagon {
            clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
          }
        `}</style>
      </div>

      <button
        onClick={handleDownload}
        disabled={!isProfileComplete(student)}
        className={`mt-6 px-6 py-2 rounded transition-all ${
          isProfileComplete(student)
            ? "bg-blue-700 text-white hover:bg-blue-800"
            : "bg-gray-400 text-white cursor-not-allowed"
        }`}
      >
        Download ID Card
      </button>

      {!isProfileComplete(student) && (
        <p className="text-sm text-red-600 font-medium mt-2">
          Please update your profile to download the Student ID.
        </p>
      )}
    </div>
  );
};

export default StudentIdCard;
