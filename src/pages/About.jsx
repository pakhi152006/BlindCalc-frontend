import React from 'react';
import { Cpu, Users, Eye, HelpCircle, Code } from 'lucide-react';

export const About = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Intro Header */}
      <section className="glass-card" aria-labelledby="about-title">
        <h1 id="about-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          About BlindCalc AI
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: '1.6' }}>
          An accessibility-first mathematical tool engineered for visually impaired students, teachers, and researchers, enabling completely vocal scientific calculation.
        </p>
      </section>

      {/* Grid of details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Core Challenge card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Eye size={24} aria-hidden="true" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>The Accessibility Challenge</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
            Traditional scientific calculators are deeply visual. Screen readers often struggle to interpret complex, multi-line 2D mathematical symbols, superscripts, and integrals. Visual interfaces isolate blind and low-vision individuals from pursuing advanced studies in science, technology, engineering, and mathematics (STEM).
          </p>
        </div>

        {/* Why Voice card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
            <Users size={24} aria-hidden="true" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Why BlindCalc AI?</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
            BlindCalc AI bridges this gap. By removing visual components, it uses plain spoken language as the core input and output vector. Visually impaired users can speak calculations naturally and hear the parsed steps, followed by an mathematically accurate result formatted specifically for voice readers.
          </p>
        </div>
      </div>

      {/* AI Architecture Section */}
      <section className="glass-card" aria-labelledby="arch-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
          <Cpu size={24} aria-hidden="true" />
          <h2 id="arch-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>AI & Calculation Architecture</h2>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Large Language Models are notoriously prone to math hallucinations and logical calculations errors. To guarantee absolute mathematical precision, BlindCalc AI employs a decoupled architectural strategy:
        </p>

        {/* Architecture flow mapping */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            background: 'rgba(0,0,0,0.2)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}
          aria-label="Workflow: Audio input goes to Whisper for speech-to-text. The text transcript goes to Ollama to parse intent and variables. SymPy, NumPy, and SciPy solve the problem. The final output is read back to the user."
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</span>
            <div><strong>Voice Capture:</strong> User speaks into the microphone; speech is processed locally using OpenAI Whisper.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</span>
            <div><strong>Intent Translation:</strong> Ollama NLU (or rule-based compiler fallback) parses user intent into algebraic statements. The LLM <em>never</em> solves the calculations.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
            <div><strong>Symbolic Execution:</strong> SymPy, NumPy, and SciPy process the expressions, extracting symbolic results, determinants, derivatives, or stats.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>4</span>
            <div><strong>Spoken Formatting:</strong> Results are translated into custom voice strings and spoken back to the user via browser Web Speech API.</div>
          </div>
        </div>
      </section>

      {/* Tech Stack card */}
      <section className="glass-card" aria-labelledby="tech-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
          <Code size={24} aria-hidden="true" />
          <h2 id="tech-title" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Open-Source Local Tech Stack</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          This application operates 100% locally and offline to ensure privacy and accessibility, without using external paid endpoints:
        </p>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          <li><strong>React & Vite:</strong> For a high-performance, single-page client interface.</li>
          <li><strong>FastAPI:</strong> Extremely low latency Python asynchronous server framework.</li>
          <li><strong>SymPy:</strong> Symbolic mathematics Python library for algebraic computations, derivatives, integrals, and limits.</li>
          <li><strong>NumPy, SciPy & Pandas:</strong> Array computing and statistical formulas.</li>
          <li><strong>OpenAI Whisper:</strong> Open-source speech recognition model running on localhost.</li>
          <li><strong>Ollama:</strong> Handles local inference of lightweight models (like Llama 3, Phi-3, or Qwen).</li>
          <li><strong>SQLite:</strong> Local SQL database to record calculations for review and recall.</li>
        </ul>
      </section>

    </div>
  );
};
