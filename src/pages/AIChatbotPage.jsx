import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageCircle } from 'lucide-react';
import { SALONS } from '../data/salons.js';
import { getChatbotResponse, simulateStreaming } from '../ai/matchSalons.js';

const SUGGESTED_PROMPTS = [
  'I need bridal hair and makeup for a wedding',
  'Looking for keratin treatment for frizzy hair',
  'Curly hair styling in Madhapur',
  'Affordable salon under ₹1,000',
];

export default function AIChatbotPage() {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: 'Hi! I am LushLife AI. Tell me what you need and I will suggest the best salons for you.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const container = document.getElementById('chat-scroll-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages]);

  const addMessage = (message) => setChatMessages(prev => [...prev, message]);

  const handleChat = async (event) => {
    event.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    addMessage({ role: 'user', text: userMsg });
    setIsChatting(true);

    await new Promise(r => setTimeout(r, 300));

    try {
      const responseText = getChatbotResponse(userMsg, null);
      let streamed = '';
      addMessage({ role: 'ai', text: '' });

      simulateStreaming(
        responseText,
        (chunk) => {
          streamed += chunk;
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'ai', text: streamed };
            return updated;
          });
        },
        () => setIsChatting(false)
      );
    } catch (error) {
      console.error(error);
      setIsChatting(false);
    }
  };

  const handlePrompt = (prompt) => {
    setChatInput(prompt);
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow">Salon AI Match</div>
        <h1 className="section-title" style={{ textAlign: 'left' }}>Tell LushLife what you need</h1>
        <p className="section-subtitle" style={{ maxWidth: 640, margin: 0, textAlign: 'left' }}>
          Use the chatbot below to describe your salon needs and get personalised recommendations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: 24, height: '65vh', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }} id="chat-scroll-container">
            {chatMessages.map((msg, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
                <div style={{
                  maxWidth: '78%',
                  background: msg.role === 'user' ? 'var(--rose-pale)' : 'var(--bg-secondary)',
                  color: msg.role === 'user' ? 'var(--text)' : 'var(--text)',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: msg.role === 'user' ? '0 6px 20px rgba(236, 72, 153, 0.08)' : '0 6px 20px rgba(15, 23, 42, 0.04)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChat} style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Tell me your salon needs..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatting}
              style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--border)', outline: 'none', fontSize: 14 }}
            />
            <button
              type="submit"
              disabled={isChatting}
              className="btn-primary"
              style={{ padding: '14px 18px', flexShrink: 0 }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Try these prompts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePrompt(prompt)}
                  className="filter-chip"
                  style={{ textAlign: 'left', padding: '12px 14px', fontSize: 13 }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>How it works</div>
            <ul style={{ paddingLeft: 18, color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 14 }}>
              <li>Describe your salon need in your own words.</li>
              <li>Ask about hair type, budget, occasion or location.</li>
              <li>Get tailored salon suggestions in real time.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
