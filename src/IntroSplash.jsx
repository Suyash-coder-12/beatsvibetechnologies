import { useEffect, useRef, useState } from "react";

export function IntroSplash({ onFinish }) {
  const [phase, setPhase] = useState("enter");
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const flashTimer = window.setTimeout(() => setPhase("flash"), 1650);
    const exitTimer = window.setTimeout(() => setPhase("exit"), 2250);
    const doneTimer = window.setTimeout(() => onFinishRef.current?.(), 2700);
    return () => {
      window.clearTimeout(flashTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`splash-screen splash-${phase}`} aria-label="Loading BeatsVibe One">
      <div className="splash-grid-bg" aria-hidden="true" />
      <div className="splash-ambient-orb orb-1" aria-hidden="true" />
      <div className="splash-ambient-orb orb-2" aria-hidden="true" />
      <div className={`splash-flash-burst ${phase === "flash" || phase === "exit" ? "active" : ""}`} />

      <div className="splash-center">
        <div className="splash-logo-stage">
          <div className="splash-slide-mask">
            <div className="splash-logo-lockup">
              <img
                src="/beatsvibe-logo.png"
                alt="BeatsVibe Technologies"
                className="splash-brand-img"
              />
              <span className="splash-light-sweep" />
            </div>
          </div>

          <div className="splash-subtitle-row">
            <span className="splash-one-pill">ONE</span>
            <span className="splash-sub-copy">ENTERPRISE WORKSPACE</span>
          </div>
        </div>

        <div className="splash-progress-wrap">
          <div className="splash-progress-track">
            <div className="splash-progress-bar" />
          </div>
          <div className="splash-status-text">
            {phase === "enter" ? "Verifying workstation & loading workspace…" : "Ready"}
          </div>
        </div>
      </div>
    </div>
  );
}
