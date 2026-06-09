import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUIZ_QUESTIONS, scoreSalon, generateReason, simulateStreaming } from '../../ai/matchSalons.js';
import { SALONS, getMatchColor } from '../../data/salons.js';
import { Sparkles, ChevronRight, ArrowRight } from 'lucide-react';

export default function AIQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState('quiz'); // quiz | loading | results
  const [results, setResults] = useState([]);
  const [streamedReasons, setStreamedReasons] = useState({});
  const [loadingText, setLoadingText] = useState('');
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const currentQ = QUIZ_QUESTIONS[step];

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (step < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Final answer — start AI matching
      runAIMatch(newAnswers);
    }
  };

  const runAIMatch = (finalAnswers) => {
    setPhase('loading');

    const loadingMessages = [
      'GlowMap AI is analysing your preferences...',
      'Evaluating 20 Hyderabad salons...',
      'Checking specialisations & availability...',
      'Generating personalised match scores...',
    ];

    let msgIndex = 0;
    setLoadingText(loadingMessages[0]);

    const msgInterval = setInterval(() => {
      msgIndex++;
      if (msgIndex < loadingMessages.length) {
        setLoadingText(loadingMessages[msgIndex]);
      } else {
        clearInterval(msgInterval);
      }
    }, 450);

    setTimeout(() => {
      clearInterval(msgInterval);
      // Score all salons
      const scored = SALONS.map(salon => ({
        ...salon,
        computedScore: scoreSalon(salon, finalAnswers),
        computedReason: generateReason(salon, finalAnswers),
      })).sort((a, b) => b.computedScore - a.computedScore).slice(0, 5);

      setResults(scored);
      setPhase('results');

      // Stream reasons one by one
      scored.forEach((salon, i) => {
        setTimeout(() => {
          let streamed = '';
          simulateStreaming(
            salon.computedReason,
            (chunk) => {
              streamed += chunk;
              setStreamedReasons(prev => ({ ...prev, [salon.id]: streamed }));
            },
            null
          );
        }, i * 400);
      });
    }, 2000);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setPhase('quiz');
    setResults([]);
    setStreamedReasons({});
  };

  return (
    <section className="quiz-section">
      <div className="quiz-card">
        {phase === 'quiz' && (
          <>
            {/* Progress */}
            <div className="quiz-progress">
              {QUIZ_QUESTIONS.map((_, i) => (
                <div key={i} className={`quiz-progress-dot ${i <= step ? 'active' : ''}`} />
              ))}
            </div>

            <div className="quiz-step-label">{currentQ.stepLabel}</div>
            <h2 className="quiz-question">{currentQ.question}</h2>

            <div className="quiz-options">
              {currentQ.options.map(opt => (
                <button
                  key={opt.value}
                  className={`quiz-option ${answers[currentQ.id] === opt.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  id={`quiz-opt-${currentQ.id}-${opt.value}`}
                >
                  <span className="quiz-option-emoji">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
              <Sparkles size={14} color="var(--rose)" />
              <span>Powered by GlowMap AI · Analysing 20 Hyderabad salons</span>
            </div>
          </>
        )}

        {phase === 'loading' && (
          <div className="ai-loading">
            <div className="ai-spinner">
              <div className="ai-spinner-ring"></div>
              <div className="ai-spinner-ring"></div>
              <div className="ai-spinner-ring"></div>
            </div>
            <div className="ai-loading-text">{loadingText}</div>
            <div className="ai-loading-sub">Matching your preferences against expert salon profiles...</div>
          </div>
        )}

        {phase === 'results' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div className="quiz-step-label" style={{ marginBottom: 4 }}>🎉 Your AI Matches</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: 'var(--text)' }}>
                  Top {results.length} Salons For You
                </h3>
              </div>
              <div className="ai-badge">
                ⚡ AI Matched
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((salon, i) => (
                <div
                  key={salon.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  <div
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '14px 16px', background: 'var(--bg)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onClick={() => navigate(`/salon/${salon.id}`)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--rose)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                  >
                    {/* Rank */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? 'var(--gradient-gold)' : 'var(--gradient-rose)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: i === 0 ? '#1A1A1A' : 'white', fontWeight: 700, fontSize: 13,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      #{i + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
                          {salon.name}
                        </span>
                        <span className={`ai-badge ${getMatchColor(salon.computedScore)}`} style={{ fontSize: 12, padding: '3px 10px' }}>
                          {salon.computedScore}% Match
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                        📍 {salon.locality} · ⭐ {salon.rating} · From ₹{salon.priceFrom.toLocaleString('en-IN')}
                      </div>
                      {streamedReasons[salon.id] && (
                        <div style={{ fontSize: 13, color: 'var(--rose-dark)', fontStyle: 'italic' }}>
                          "{streamedReasons[salon.id]}<span style={{ animation: 'blink 1s infinite' }}>|</span>"
                        </div>
                      )}
                    </div>

                    <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={handleReset} className="btn-secondary" style={{ flex: 1 }}>
                ↩ Retake Quiz
              </button>
              <button onClick={() => navigate('/search')} className="btn-primary" style={{ flex: 1 }}>
                See All 20 Salons <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
