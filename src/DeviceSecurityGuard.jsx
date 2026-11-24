import { useEffect, useState } from "react";
import { Laptop, LockKeyhole, ShieldAlert, Smartphone } from "lucide-react";

function checkIsMobileDevice() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMobileUa = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
  const isSmallViewport = window.innerWidth < 960;
  const isCoarseSmall = window.matchMedia?.("(pointer: coarse)")?.matches && window.innerWidth < 1024;
  return Boolean(isMobileUa || isSmallViewport || isCoarseSmall);
}

function checkDevToolsOpen() {
  if (typeof window === "undefined") return false;
  const widthDelta = Math.abs(window.outerWidth - window.innerWidth);
  const heightDelta = Math.abs(window.outerHeight - window.innerHeight);
  return widthDelta > 220 || heightDelta > 280;
}

export function DeviceSecurityGuard({ children }) {
  const [isMobile, setIsMobile] = useState(() => checkIsMobileDevice());
  const [devToolsBlocked, setDevToolsBlocked] = useState(() => checkDevToolsOpen());
  const [inspectAttemptAlert, setInspectAttemptAlert] = useState(false);

  useEffect(() => {
    const evaluateDevice = () => {
      setIsMobile(checkIsMobileDevice());
      setDevToolsBlocked(checkDevToolsOpen());
    };

    const blockContextMenu = (event) => {
      event.preventDefault();
      return false;
    };

    const blockDrag = (event) => {
      event.preventDefault();
      return false;
    };

    const blockSelect = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select", "option", "code"].includes(tag) || event.target?.closest?.("input, textarea, code")) {
        return true;
      }
      event.preventDefault();
      return false;
    };

    const blockDevToolsKeys = (event) => {
      const key = String(event.key || "").toLowerCase();
      const ctrlOrMeta = event.ctrlKey || event.metaKey;

      const isF12 = event.key === "F12" || event.keyCode === 123;
      const isInspectCombo =
        (ctrlOrMeta && event.shiftKey && ["i", "j", "c", "k", "e"].includes(key))
        || (event.metaKey && event.altKey && ["i", "j", "c", "u"].includes(key))
        || (ctrlOrMeta && ["u", "s"].includes(key));

      if (isF12 || isInspectCombo) {
        event.preventDefault();
        event.stopPropagation();
        setInspectAttemptAlert(true);
        window.setTimeout(() => setInspectAttemptAlert(false), 2600);
        return false;
      }
      return undefined;
    };

    evaluateDevice();
    window.addEventListener("resize", evaluateDevice);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("dragstart", blockDrag);
    document.addEventListener("selectstart", blockSelect);
    window.addEventListener("keydown", blockDevToolsKeys, true);

    const interval = window.setInterval(() => {
      setDevToolsBlocked(checkDevToolsOpen());
    }, 650);

    return () => {
      window.removeEventListener("resize", evaluateDevice);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("dragstart", blockDrag);
      document.removeEventListener("selectstart", blockSelect);
      window.removeEventListener("keydown", blockDevToolsKeys, true);
      window.clearInterval(interval);
    };
  }, []);

  if (isMobile) {
    return (
      <main className="security-gate-page">
        <section className="security-gate-card">
          <img src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" className="security-brand-logo" />
          <div className="security-gate-icon danger">
            <Smartphone size={26} />
          </div>
          <span className="security-pill danger">ACCESS DENIED · DEVICE RESTRICTED</span>
          <h1>Laptop or Desktop Required</h1>
          <p>
            Mobile phones and small-screen devices are restricted from accessing <strong>BeatsVibe One</strong>.
            Please sign in from an authorized laptop or desktop workstation.
          </p>
          <div className="security-meta-box">
            <div><Laptop size={16} /> <span>Required: Laptop / Desktop (&ge; 960px width)</span></div>
            <div><ShieldAlert size={16} /> <span>Detected Viewport: {typeof window !== "undefined" ? `${window.innerWidth} × ${window.innerHeight}px` : "Mobile"}</span></div>
          </div>
          <div className="security-gate-foot">
            <LockKeyhole size={14} /> BeatsVibe Technologies · Founder: Suyash Rathod · CTO: Pavan Londhe
          </div>
        </section>
      </main>
    );
  }

  if (devToolsBlocked) {
    return (
      <main className="security-gate-page">
        <section className="security-gate-card">
          <img src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" className="security-brand-logo" />
          <div className="security-gate-icon warning">
            <ShieldAlert size={26} />
          </div>
          <span className="security-pill warning">INSPECTION BLOCKED</span>
          <h1>Developer Tools Detected</h1>
          <p>
            Inspecting page elements or running browser Developer Tools is disabled on <strong>BeatsVibe One</strong>.
            Close all Developer Tools panels to restore access.
          </p>
          <div className="security-gate-foot">
            <LockKeyhole size={14} /> Protected Corporate Workspace Session
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="protected-surface">{children}</div>
      {inspectAttemptAlert && (
        <div className="security-toast" role="alert">
          <ShieldAlert size={16} />
          Developer inspection shortcuts &amp; right-click are disabled on BeatsVibe One.
        </div>
      )}
    </>
  );
}
