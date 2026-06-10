import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { getChatbotResponse, simulateStreaming } from '../../ai/matchSalons.js';
import { SALONS } from '../../data/salons.js';

export default function FloatingChatbot({ salon = null, isHome = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: salon
        ? `Hi! I'm GlowMap AI for ${salon.name}. Ask me anything about their services, specialties, or availability! 💄`
        : 'Hi! I\'m GlowMap AI. Ask me any questions about beauty salons in Hyderabad! 💇‍♀️'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 400));

    let responseText = '';
    if (salon) {
      responseText = getChatbotResponse(userMsg, salon);
    } else {
      // General salon AI responses
      const q = userMsg.toLowerCase();
      if (q.includes('bridal') || q.includes('wedding')) {
        responseText = 'Looking for a bridal salon? Studio 9 Banjara Hills and Brides of Hyderabad Jubilee Hills are our top recommendations! Both have 4.8+ ratings and specialize in traditional Telugu bridal makeup.';
      } else if (q.includes('keratin') || q.includes('frizz') || q.includes('smoothening')) {
        responseText = 'The Beauty Room SR Nagar is Hyderabad\'s keratin expert with a 6-month guarantee! They use Japanese and Brazilian keratin systems. Perfect for managing frizzy hair.';
      } else if (q.includes('curly') || q.includes('curl')) {
        responseText = 'Curls & Co Madhapur is the ONLY DevaCurl certified curly hair salon in Hyderabad! They specialize in curl patterns 2A to 4C. Rate: 4.9⭐ with 312 reviews.';
      } else if (q.includes('budget') || q.includes('affordable') || q.includes('cheap')) {
        responseText = 'Try Green Trends Ameerpet (₹220 haircuts) or Clipp LB Nagar (₹180 haircuts) for super budget options. Both are chain salons with good ratings!';
      } else if (q.includes('makeup') || q.includes('party')) {
        responseText = 'For party makeup, try Lakme Salon Jubilee Hills (4.6⭐) or The Makeover Studio Kompally (4.5⭐). Both specialize in glam looks that photograph beautifully!';
      } else if (q.includes('nails') || q.includes('nail art')) {
        responseText = 'Nail Republic Gachibowli is our nails-only specialist! 4.7⭐ rating, 4-week lasting gel manicures, and 50+ nail art designs. You\'ll love it!';
      } else if (q.includes('skincare') || q.includes('facial')) {
        responseText = 'For advanced skin treatments, try Her Canvas Salon HiTech City (4.7⭐) with medical-grade facials, or Kaya Skin Clinic Begumpet (4.4⭐) for dermatology services.';
      } else if (q.includes('locality') || q.includes('area') || q.includes('location')) {
        responseText = 'We cover 12 areas in Hyderabad: Banjara Hills, Gachibowli, Jubilee Hills, Madhapur, HiTech City, Ameerpet, Kukatpally, Secunderabad, SR Nagar, Kondapur, Manikonda, and Miyapur. Which area interests you?';
      } else {
        responseText = 'I can help you find the perfect salon! Ask me about bridal services, keratin treatments, curly hair, nail art, skincare, or any salon in Hyderabad. Or just tell me your preferences!';
      }
    }

    let streamed = '';
    setChatMessages(prev => [...prev, { role: 'ai', text: '' }]);

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
  };

  return (
    <>
      {/* Floating Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-chatbot-icon"
        title={salon ? `Chat about ${salon.name}` : 'Chat about salons'}
        id="floating-chatbot-btn"
        style={{
          position: 'fixed',
          bottom: salon ? '100px' : '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #111111 0%, #444444 100%)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 999,
          transition: 'all 0.3s ease',
          fontSize: '24px'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div
          className="floating-chatbot-popup"
          style={{
            position: 'fixed',
            bottom: salon ? '170px' : '90px',
            right: '20px',
            width: '380px',
            maxHeight: '500px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #111111 0%, #444444 100%)',
              color: 'white',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>🤖 GlowMap AI</div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                {salon ? `Salon Expert` : 'Salon Assistant'}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: 4,
                display: 'flex'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minHeight: '200px'
            }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? '#111111' : '#f0f0f0',
                    color: msg.role === 'user' ? 'white' : '#333',
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordWrap: 'break-word'
                  }}
                >
                  {msg.text}
                  {msg.role === 'ai' && i === chatMessages.length - 1 && isChatting && (
                    <span style={{ display: 'inline-block', width: 6, height: 10, background: '#111111', marginLeft: 4, borderRadius: 1, animation: 'blink 1s infinite' }}></span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleChat}
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              borderTop: '1px solid var(--border-light)',
              background: '#fafafa'
            }}
          >
            <input
              type="text"
              placeholder={salon ? 'Ask about services...' : 'Ask anything...'}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatting}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isChatting}
              style={{
                padding: '10px 12px',
                background: '#111111',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isChatting ? 'not-allowed' : 'pointer',
                opacity: isChatting ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>

          <style>{`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
