import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { IoArrowBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you with the property?", time: "10:30 AM", sender: "landlord" },
    { id: 2, text: "Hi, I have a question about the lease terms.", time: "10:32 AM", sender: "user" },
  ]);

  const sendMessage = () => {
    if (input.trim() === "") return;
    const newMessage = {
      id: messages.length + 1,
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sender: "user",
    };
    setMessages([...messages, newMessage]);
    setInput("");
  };

  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();
  const propertyTitle = state?.title || "Unknown Property";
  const location = useLocation();
  const pathname = location.pathname;

  //   Redirect if no property information is available
  if (!state?.title) {
    return (
      <div className="section-page !py-52 w-full dark:bg-gray-900 dark:text-white">
        <div className="relative w-full pt-24 mx-auto max-w-7xl">
          <div
            onClick={() => navigate(-1)}
            className="absolute top-0 left-0 flex items-center cursor-pointer gap-x-6 hover:scale-95 hover:text-primary"
          >
            <IoArrowBackSharp className="text-4xl" />
            <span className="text-3xl font-medium">Back</span>
          </div>
          <h2 className="mb-4 text-5xl font-bold">Chat</h2>
          <p className="mb-6 text-[1.7rem] normal-case text-secondary">
            {pathname === "/dashboard/landlord-dashboard/chat" ? "Chatting with Tenant" : "Chatting with Landlord"}
          </p>

          <div className="bg-white border rounded-xl shadow-sm p-6 flex flex-col h-[52rem]">
            {/* Messages */}
            <div className="flex-1 space-y-6 overflow-y-auto text-3xl normal-case">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-6 py-4 rounded-xl normal-case max-w-[75%] ${
                      msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 text-xl text-gray-500">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-3 mt-4">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-3 text-[1.7rem] normal-case border border-gray-400 rounded-xl h-[5.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={sendMessage} className="p-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <FiSend className="text-5xl hover:scale-95" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page !py-52 w-full dark:bg-gray-900 dark:text-white">
      <div className="relative w-full pt-24 mx-auto max-w-7xl">
        <div
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 flex items-center cursor-pointer gap-x-6 hover:scale-95 hover:text-primary"
        >
          <IoArrowBackSharp className="text-4xl" />
          <span className="text-3xl font-medium">Back</span>
        </div>

        <h2 className="mb-4 text-5xl font-bold">Chat</h2>
        <p className="mb-6 text-[1.7rem] normal-case text-secondary">
          Chatting with Landlord for <span className="font-bold">{propertyTitle}</span> property
        </p>

        <div className="bg-white border rounded-xl shadow-sm p-6 flex flex-col h-[52rem]">
          {/* Messages */}
          <div className="flex-1 space-y-6 overflow-y-auto text-3xl normal-case">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-6 py-4 rounded-xl normal-case max-w-[75%] ${
                    msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="mt-1 text-xl text-gray-500">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-3 mt-4">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 text-[1.7rem] normal-case border border-gray-400 rounded-xl h-[5.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={sendMessage} className="p-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <FiSend className="text-5xl hover:scale-95" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
