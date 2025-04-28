import React, { useEffect, useState } from 'react';
import { MdMailOutline, MdPerson, MdSubject, MdDateRange, MdReply } from 'react-icons/md';
import { useNavigate } from 'react-router';
import useAuth from '../../Components/Hooks/useAuth';
import AxiosSecure from '../../Components/Hooks/AxiosSecure';
import useFetchData from '../../Components/Hooks/useFetchData';

const Message = () => {
  const { user } = useAuth();
  const axiosInstance = AxiosSecure();
  const [messages, setMessages] = useState([]);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [replies, setReplies] = useState({});
  const [originalMessages, setOriginalMessages] = useState({});
  const [expandedSendId, setExpandedSendId] = useState(null);
  const navigate = useNavigate();
  const { data: sendMessage = [] } = useFetchData(`${user?.email}`, `/user-send/message/${user?.email}`);

  useEffect(() => {
    if (user?.email) {
      axiosInstance.get(`/messages/${user.email}`)
        .then((res) => {
          const formatted = res.data.map((msg) => ({
            id: msg._id,
            from: msg.email,
            subject: msg.subject,
            message: msg.description,
            date: new Date(msg.createdAt).toLocaleDateString(),
            replyTo: msg.replyTo || null,
          }));
          setMessages(formatted);
        })
        .catch((err) => console.error("Failed to fetch messages:", err));
    }
  }, [user?.email]);

  useEffect(() => {
    if (!expandedMessageId) return;

    axiosInstance.get(`/message/${expandedMessageId}/replies`)
      .then(res => {
        setReplies(prev => ({ ...prev, [expandedMessageId]: res.data }));
      })
      .catch(err => console.error("Failed to fetch replies:", err));

    const currentMsg = messages.find(m => m.id === expandedMessageId);
    if (currentMsg?.replyTo) {
      axiosInstance.get(`/message/${currentMsg.replyTo}`)
        .then(res => {
          setOriginalMessages(prev => ({ ...prev, [expandedMessageId]: res.data }));
        })
        .catch(err => console.error("Failed to fetch original message:", err));
    }
  }, [expandedMessageId, messages]);

  const handleReply = (id) => {
    navigate(`/dashboard/send-message/${id}`);
  };

  const handleSendNew = () => {
    navigate('/dashboard/send-message');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-prime flex items-center gap-2">
            <MdMailOutline className="text-4xl" />
            Inbox
          </h2>
          <span className="text-sm text-gray-500">Logged in as: {user?.email}</span>
          <div>
            <label htmlFor="sendbox-modal" className="btn bg-highlight text-white mt-3">
              Sent Box 📤
            </label>
          </div>
        </div>
        <button
          onClick={handleSendNew}
          className="btn bg-prime text-black shadow-sm hover:shadow-md transition"
        >
          Send New Message
        </button>
      </div>

      {/* Inbox Table */}
      <div className="overflow-x-auto border border-prime rounded-xl">
        <table className="table w-full">
          <thead className="bg-prime text-white text-sm">
            <tr>
              <th className="px-4 py-2 text-left"><MdPerson className="inline mr-1" /> From</th>
              <th className="px-4 py-2 text-left"><MdSubject className="inline mr-1" /> Subject</th>
              <th className="px-4 py-2 text-left"><MdDateRange className="inline mr-1" /> Date</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  No messages found.
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  <tr
                    className="hover:bg-blue-50 cursor-pointer transition"
                    onClick={() =>
                      setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)
                    }
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{msg.from}</td>
                    <td className="px-4 py-3 text-gray-700">{msg.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{msg.date}</td>
                  </tr>
                  {expandedMessageId === msg.id && (
                    <tr className="bg-gray-50 border-t border-prime">
                      <td colSpan="3" className="p-4">
                        {originalMessages[msg.id] && (
                          <div className="mb-4 p-3 border border-yellow-300 rounded bg-yellow-50 text-sm">
                            <strong>Original Message:</strong><br />
                            <div><strong>From:</strong> {originalMessages[msg.id].name} ({originalMessages[msg.id].email})</div>
                            <div><strong>Subject:</strong> {originalMessages[msg.id].subject}</div>
                            <div className="mt-1">{originalMessages[msg.id].description}</div>
                          </div>
                        )}

                        <div className="mb-3 text-gray-800 leading-relaxed">
                          <strong>Message:</strong> {msg.message}
                        </div>

                        {replies[msg.id]?.length > 0 && (
                          <div className="mt-4 border-t border-gray-300 pt-4 text-sm text-gray-700 space-y-2">
                            <strong>Replies:</strong>
                            {replies[msg.id].map((reply) => (
                              <div key={reply._id} className="pl-3 border-l-2 border-blue-300">
                                <p className="text-sm"><b>{reply.name}:</b> {reply.description}</p>
                                <p className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleReply(msg.id)}
                          className="mt-4 btn btn-outline border-prime text-prime hover:bg-prime hover:text-white"
                        >
                          <MdReply className="mr-2" />
                          Reply
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sendbox Modal */}
      <input type="checkbox" id="sendbox-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box max-w-5xl">
          <h3 className="font-bold text-lg mb-4">Sent Messages</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>To</th>
                  <th>Subject</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sendMessage.length > 0 ? (
                  sendMessage.map((msg, i) => (
                    <React.Fragment key={msg._id}>
                      <tr
                        className="hover:bg-base-100 cursor-pointer"
                        onClick={() =>
                          setExpandedSendId(expandedSendId === msg._id ? null : msg._id)
                        }
                      >
                        <td>{Array.isArray(msg.recipients) ? msg.recipients.join(", ") : "No recipients"}</td>
                        <td>{msg.subject}</td>
                        <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                      </tr>
                      {expandedSendId === msg._id && (
                        <tr className="bg-gray-50">
                          <td colSpan="3" className="p-4">
                            <div className="mb-2 text-gray-800">
                              <strong>Description:</strong> {msg.description}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No sent messages.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="modal-action">
            <label htmlFor="sendbox-modal" className="btn">
              Close
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
