import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface Message {
  id: number;
  sender: string;
  text: string;
  self: boolean;
}

const INITIAL_MESSAGES: Message[] = [];

export default function Chat() {
  const navigate = useNavigate();
  const { openSidebar } = useApp();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'You', text, self: true }]);
    setDraft('');
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') sendMessage();
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="pf-header">
        <button className="pf-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="pf-tab">CHAT</div>
        <button className="ah-hamburger" onClick={openSidebar} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`chat-bubble-wrap ${msg.self ? 'chat-bubble-wrap--self' : ''}`}
          >
            {!msg.self && <span className="chat-sender">{msg.sender}</span>}
            <div className={`chat-bubble ${msg.self ? 'chat-bubble--self' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder="Type a message…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="chat-send-btn" onClick={sendMessage} aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
