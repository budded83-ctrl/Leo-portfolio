"use client";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section id="hero" className="min-h-screen flex items-center justify-center px-8 pt-24 pb-16 relative overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        {/* Blobs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500,height:500,background:"#8b5cf6",top:-100,right:-100,filter:"blur(100px)",opacity:0.15 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400,height:400,background:"#06b6d4",bottom:-50,left:-100,filter:"blur(100px)",opacity:0.15 }} />

        <div className="relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full text-xs font-mono"
            style={{ border:"1px solid rgba(139,92,246,0.3)", color:"#a78bfa", background:"rgba(139,92,246,0.08)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Available for opportunities
          </div>

          <h1 className="font-[family-name:var(--font-display)] font-bold tracking-tight mb-4"
            style={{ fontSize:"clamp(3rem,10vw,6rem)", lineHeight:1.05,
              background:"linear-gradient(135deg,#e2e8f0 0%,#a78bfa 55%,#06b6d4 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Leo Lee
          </h1>

          <p className="font-mono mb-6" style={{ fontSize:"clamp(1rem,3vw,1.35rem)", color:"#06b6d4" }}>
            <span style={{ color:"#64748b" }}>&gt; </span>Backend Developer
          </p>

          <p className="text-lg mb-10 leading-relaxed mx-auto max-w-md" style={{ color:"#94a3b8" }}>
            안정적이고 확장 가능한 서버 아키텍처를 설계합니다.<br />
            클린 코드와 성능 최적화에 집중하는 백엔드 개발자입니다.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] focus:outline-none"
              style={{ background:"linear-gradient(135deg,#8b5cf6,#7c3aed)", boxShadow:"0 4px 24px rgba(139,92,246,0.38)" }}>
              Contact Me
            </a>
            <a href="#skills"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-150 hover:scale-[1.03] active:scale-[0.97] focus:outline-none"
              style={{ border:"1px solid rgba(226,232,240,0.18)", color:"#e2e8f0" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#a78bfa"; e.currentTarget.style.color="#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(226,232,240,0.18)"; e.currentTarget.style.color="#e2e8f0"; }}>
              View Skills ↓
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs tracking-widest uppercase" style={{ color:"#64748b" }}>
          scroll
          <div className="w-px h-10 animate-pulse" style={{ background:"linear-gradient(to bottom,#8b5cf6,transparent)" }} />
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-28 px-8" style={{ background:"var(--surface)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color:"#a78bfa" }}>// about me</p>
            <h2 className="font-[family-name:var(--font-display)] font-bold tracking-tight mb-3" style={{ fontSize:"clamp(1.8rem,5vw,2.6rem)" }}>
              안녕하세요,<br />Leo Lee입니다.
            </h2>
            <div className="w-12 h-0.5 mb-8 rounded" style={{ background:"linear-gradient(90deg,#8b5cf6,#06b6d4)" }} />
            <p className="leading-relaxed mb-4" style={{ color:"#94a3b8" }}>
              <strong className="text-white">백엔드 개발</strong>을 중심으로 안정적이고 확장 가능한 시스템을 만드는 것을 즐깁니다. 서버 아키텍처 설계부터 데이터베이스 최적화까지 폭넓게 다룹니다.
            </p>
            <p className="leading-relaxed" style={{ color:"#94a3b8" }}>
              새로운 기술을 빠르게 습득하고 문제를 깔끔하게 해결하는 코드를 작성하는 데 집중합니다. 팀과의 협업을 중요하게 생각합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              { value: "Node.js", label: "Primary Runtime" },
              { value: "Python", label: "Secondary Language" },
              { value: "AWS", label: "Cloud Platform" },
              { value: "Docker", label: "Containerization" },
            ].map(s => (
              <div key={s.value} className="rounded-2xl p-6 text-center"
                style={{ background:"var(--card)", border:"1px solid var(--card-border)" }}>
                <div className="font-mono text-base font-medium mb-1"
                  style={{ background:"linear-gradient(135deg,#a78bfa,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  {s.value}
                </div>
                <div className="text-xs" style={{ color:"#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-28 px-8 max-w-5xl mx-auto">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color:"#a78bfa" }}>// tech stack</p>
        <h2 className="font-[family-name:var(--font-display)] font-bold tracking-tight mb-3" style={{ fontSize:"clamp(1.8rem,5vw,2.6rem)" }}>기술 스택</h2>
        <div className="w-12 h-0.5 mb-10 rounded" style={{ background:"linear-gradient(90deg,#8b5cf6,#06b6d4)" }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "⚙️", name: "Backend", tags: ["Node.js","Python","Express","FastAPI","REST API"] },
            { icon: "🗄️", name: "Database", tags: ["PostgreSQL","MongoDB","Redis","SQL"] },
            { icon: "☁️", name: "DevOps & Cloud", tags: ["AWS","Docker","CI/CD","Linux"] },
            { icon: "🎨", name: "Frontend", tags: ["React","TypeScript","HTML/CSS"] },
          ].map(cat => (
            <div key={cat.name}
              className="rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 cursor-default"
              style={{ background:"var(--card)", border:"1px solid var(--card-border)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(139,92,246,0.3)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.4),0 0 40px rgba(139,92,246,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--card-border)"; e.currentTarget.style.boxShadow="none"; }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(6,182,212,0.12))" }}>
                {cat.icon}
              </div>
              <p className="font-[family-name:var(--font-display)] font-semibold mb-4">{cat.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md text-xs font-mono"
                    style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", color:"#a78bfa" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-28 px-8" style={{ background:"var(--surface)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color:"#a78bfa" }}>// contact</p>
          <h2 className="font-[family-name:var(--font-display)] font-bold tracking-tight mb-3" style={{ fontSize:"clamp(1.8rem,5vw,2.6rem)" }}>연락하기</h2>
          <div className="w-12 h-0.5 mb-10 mx-auto rounded" style={{ background:"linear-gradient(90deg,#8b5cf6,#06b6d4)" }} />
          <p className="mb-10 leading-relaxed" style={{ color:"#94a3b8" }}>
            새로운 기회나 협업 제안이 있으시면 언제든지 연락해주세요.<br />빠른 시간 내에 회신드리겠습니다.
          </p>
          <a href="mailto:budded83@gmail.com"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-mono text-base transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
            style={{ border:"1px solid rgba(139,92,246,0.25)", color:"#a78bfa", background:"rgba(139,92,246,0.06)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(139,92,246,0.5)"; e.currentTarget.style.background="rgba(139,92,246,0.12)"; e.currentTarget.style.boxShadow="0 4px 28px rgba(139,92,246,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(139,92,246,0.25)"; e.currentTarget.style.background="rgba(139,92,246,0.06)"; e.currentTarget.style.boxShadow="none"; }}>
            📧 budded83@gmail.com
          </a>
        </div>
      </section>

      <footer className="py-6 text-center text-xs" style={{ borderTop:"1px solid rgba(255,255,255,0.05)", color:"#64748b" }}>
        © 2026 <span style={{ color:"#a78bfa" }}>Leo Lee</span>. All rights reserved.
      </footer>
    </>
  );
}
