import React from "react";
import Chatbot from "./chatbot";
import "./styles.css";

export default function App() {
  return (
    <div
      className="App"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ marginBottom: "10px" }}>
        <h3>StatBot</h3>
      </header>

      <main
        style={{
          flex: 1,
          padding: "15px",
          border: "3px solid black",
          borderRadius: "8px",
          overflowY: "auto",
        }}
      >
        <Chatbot />
      </main>
    </div>
  );
}
