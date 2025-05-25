import { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input) return;

    setMessages((prev) => [
      ...prev,
      { user: "You", text: input, type: "user" },
    ]);

    const query = input.replace(/\s+/g, "+");
    setInput("");

    try {
      const response = await fetch(`http://127.0.0.1:5000/query/${query}`);
      const data = await response.json();
      console.log("Full response data:", data); // Debug log

      const botMessage = data.response; // Access 'response' key (not 'top.res')

      setMessages((prev) => [
        ...prev,
        { user: "Chatbot", text: botMessage, type: "bot" },
      ]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          user: "Chatbot",
          text: "Sorry, something went wrong. Please try again.",
          type: "bot",
        },
      ]);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-start" : "flex-end",
              margin: "5px",
            }}
          >
            <div
              style={{
                background: msg.type === "user" ? "#444654" : "#202123",
                padding: "15px",
                borderRadius: "10px",
                maxWidth: "60%",
                color: "white",
              }}
            >
              <strong>{msg.user}:</strong> <span>{msg.text}</span>
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
      </form>
    </div>
  );
};

export default Chatbot;
