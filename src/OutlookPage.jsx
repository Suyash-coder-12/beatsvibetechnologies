import { useMemo, useState } from "react";
import {
  Archive, CheckCheck, Inbox, Mail, MailOpen, Plus, Reply, Search, Send, Star, Trash2, X,
} from "lucide-react";
import { initialsFromName } from "./workspaceStore.js";

export function OutlookPage({ user, employees, emails, onSendEmail, onUpdateEmail, onDeleteEmail, onNotify }) {
  const [folder, setFolder] = useState("inbox");
  const [query, setQuery] = useState("");
  const [mailFilter, setMailFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [composing, setComposing] = useState(false);
  const [composeForm, setComposeForm] = useState({ toEmail: "", subject: "", body: "", tag: "General" });

  const myEmail = user?.email?.toLowerCase() || "";

  const isInboxRecipient = (mail) => {
    const to = mail.toEmail?.toLowerCase() || "";
    return mail.folder === "inbox" && (to === myEmail || to === "all@beatsvibe.com" || to === "");
  };

  const visibleInFolder = useMemo(() => {
    return emails.filter((mail) => {
      if (folder === "starred") return mail.starred && mail.folder !== "trash" && (isInboxRecipient(mail) || mail.fromEmail?.toLowerCase() === myEmail);
      if (folder === "sent") return mail.folder === "sent" && mail.fromEmail?.toLowerCase() === myEmail;
      if (folder === "drafts") return mail.folder === "drafts" && mail.fromEmail?.toLowerCase() === myEmail;
      if (folder === "archive") return mail.folder === "archive" && (isInboxRecipient({ ...mail, folder: "inbox" }) || mail.fromEmail?.toLowerCase() === myEmail);
      if (folder === "trash") return mail.folder === "trash";
      return isInboxRecipient(mail);
    });
  }, [emails, folder, myEmail]);

  const filteredEmails = useMemo(() => {
    return visibleInFolder.filter((mail) => {
      if (mailFilter === "unread" && !mail.unread) return false;
      if (mailFilter === "starred" && !mail.starred) return false;
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return `${mail.fromName} ${mail.fromEmail} ${mail.subject} ${mail.body}`.toLowerCase().includes(needle);
    });
  }, [visibleInFolder, mailFilter, query]);

  const activeMail = useMemo(
    () => filteredEmails.find((m) => m.id === selectedId) || filteredEmails[0] || null,
    [filteredEmails, selectedId],
  );

  const unreadInboxCount = useMemo(
    () => emails.filter((m) => isInboxRecipient(m) && m.unread).length,
    [emails, myEmail],
  );

  const selectMail = (mail) => {
    setSelectedId(mail.id);
    if (mail.unread) {
      onUpdateEmail(mail.id, { unread: false });
    }
  };

  const handleComposeSubmit = (event, asDraft = false) => {
    event.preventDefault();
    if (!composeForm.toEmail.trim() || !composeForm.subject.trim()) {
      onNotify("Enter a recipient email and subject.");
      return;
    }
    onSendEmail({
      toEmail: composeForm.toEmail.trim(),
      subject: composeForm.subject.trim(),
      body: composeForm.body.trim(),
      tag: composeForm.tag,
      asDraft,
    });
    setComposing(false);
    setComposeForm({ toEmail: "", subject: "", body: "", tag: "General" });
  };

  const handleQuickReply = (event) => {
    event.preventDefault();
    if (!activeMail || !replyText.trim()) return;
    const reply = {
      id: `rep-${Date.now()}`,
      authorName: user?.displayName || user?.email,
      authorEmail: user?.email,
      time: "Just now",
      text: replyText.trim(),
    };
    onUpdateEmail(activeMail.id, {
      replies: [...(activeMail.replies || []), reply],
    });
    onSendEmail({
      toEmail: activeMail.fromEmail === myEmail ? activeMail.toEmail : activeMail.fromEmail,
      subject: activeMail.subject.startsWith("Re:") ? activeMail.subject : `Re: ${activeMail.subject}`,
      body: replyText.trim(),
      tag: activeMail.tag || "Reply",
      silentSentOnly: true,
    });
    setReplyText("");
    onNotify("Reply sent via Outlook.");
  };

  const folderItems = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: unreadInboxCount },
    { id: "starred", label: "Starred", icon: Star, count: emails.filter((m) => m.starred && m.folder !== "trash").length },
    { id: "sent", label: "Sent", icon: Send, count: 0 },
    { id: "drafts", label: "Drafts", icon: Mail, count: emails.filter((m) => m.folder === "drafts").length },
    { id: "archive", label: "Archive", icon: Archive, count: 0 },
    { id: "trash", label: "Trash", icon: Trash2, count: 0 },
  ];

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">COMMUNICATION · BEATSVIBE OUTLOOK</div>
          <h1>Outlook Mail</h1>
          <p>Internal messaging across all BeatsVibe employees, division leads, and announcements.</p>
        </div>
        <div className="title-actions">
          <button
            className="button button-primary"
            onClick={() => {
              setComposeForm({ toEmail: "", subject: "", body: "", tag: "General" });
              setComposing(true);
            }}
          >
            <Plus size={16} /> New mail
          </button>
        </div>
      </div>

      <div className="outlook-shell">
        <aside className="outlook-folders">
          <button
            className="button button-primary outlook-compose-btn"
            onClick={() => {
              setComposeForm({ toEmail: "", subject: "", body: "", tag: "General" });
              setComposing(true);
            }}
          >
            <Plus size={15} /> Compose
          </button>

          <div className="outlook-folder-list">
            {folderItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`outlook-folder-item ${folder === item.id ? "active" : ""}`}
                  onClick={() => {
                    setFolder(item.id);
                    setSelectedId("");
                  }}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                  {item.count > 0 && <span className="outlook-badge">{item.count}</span>}
                </button>
              );
            })}
          </div>

          <div className="outlook-contacts">
            <small>TEAM CONTACTS</small>
            {employees
              .filter((emp) => emp.email?.toLowerCase() !== myEmail)
              .slice(0, 6)
              .map((emp) => (
                <button
                  key={emp.id}
                  className="outlook-contact-btn"
                  onClick={() => {
                    setComposeForm({ toEmail: emp.email, subject: "", body: "", tag: emp.division });
                    setComposing(true);
                  }}
                  title={`Email ${emp.name} (${emp.email})`}
                >
                  <span className={`avatar avatar-${emp.color || "blue"}`}>{emp.initials}</span>
                  <span>{emp.name}</span>
                </button>
              ))}
          </div>
        </aside>

        <section className="outlook-list-pane">
          <div className="outlook-list-head">
            <label className="outlook-search">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${folder}…`}
              />
            </label>
            <div className="outlook-filter-pills">
              {["all", "unread", "starred"].map((mode) => (
                <button
                  key={mode}
                  className={mailFilter === mode ? "active" : ""}
                  onClick={() => setMailFilter(mode)}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="outlook-mail-items">
            {filteredEmails.map((mail) => (
              <button
                key={mail.id}
                className={`outlook-mail-row ${activeMail?.id === mail.id ? "selected" : ""} ${mail.unread ? "unread" : ""}`}
                onClick={() => selectMail(mail)}
              >
                <span className="avatar avatar-blue">{initialsFromName(mail.fromName || mail.fromEmail)}</span>
                <div className="outlook-mail-meta">
                  <div className="outlook-mail-top">
                    <strong>{mail.fromName}</strong>
                    <span>{mail.time}</span>
                  </div>
                  <div className="outlook-mail-subject">{mail.subject}</div>
                  <div className="outlook-mail-preview">{mail.preview || mail.body}</div>
                </div>
              </button>
            ))}
            {filteredEmails.length === 0 && (
              <div className="empty-state">No emails in {folder}.</div>
            )}
          </div>
        </section>

        <section className="outlook-reader">
          {activeMail ? (
            <>
              <div className="outlook-reader-toolbar">
                <button
                  className="button button-outline btn-xs"
                  onClick={() => onUpdateEmail(activeMail.id, { starred: !activeMail.starred })}
                >
                  <Star size={14} fill={activeMail.starred ? "#eab308" : "none"} color={activeMail.starred ? "#eab308" : "currentColor"} />
                  {activeMail.starred ? "Starred" : "Star"}
                </button>
                <button
                  className="button button-outline btn-xs"
                  onClick={() => onUpdateEmail(activeMail.id, { unread: !activeMail.unread })}
                >
                  {activeMail.unread ? <CheckCheck size={14} /> : <MailOpen size={14} />}
                  {activeMail.unread ? "Mark read" : "Mark unread"}
                </button>
                {activeMail.folder !== "archive" && (
                  <button
                    className="button button-outline btn-xs"
                    onClick={() => {
                      onUpdateEmail(activeMail.id, { folder: "archive" });
                      onNotify("Email archived.");
                    }}
                  >
                    <Archive size={14} /> Archive
                  </button>
                )}
                <button
                  className="button button-danger btn-xs"
                  onClick={() => {
                    if (activeMail.folder === "trash") {
                      onDeleteEmail(activeMail.id);
                      onNotify("Email permanently deleted.");
                    } else {
                      onUpdateEmail(activeMail.id, { folder: "trash" });
                      onNotify("Email moved to Trash.");
                    }
                  }}
                >
                  <Trash2 size={14} /> {activeMail.folder === "trash" ? "Delete forever" : "Delete"}
                </button>
              </div>

              <div className="outlook-reader-body">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span className="role-chip">{activeMail.tag || "Mail"}</span>
                  <span style={{ fontSize: 11.5, color: "#74849a" }}>{activeMail.time}</span>
                </div>
                <h2>{activeMail.subject}</h2>
                <div className="outlook-sender-bar">
                  <span className="avatar avatar-owner">{initialsFromName(activeMail.fromName || activeMail.fromEmail)}</span>
                  <div>
                    <strong>{activeMail.fromName} &lt;{activeMail.fromEmail}&gt;</strong>
                    <small>To: {activeMail.toEmail || "all@beatsvibe.com"}</small>
                  </div>
                </div>
                <div className="outlook-message-text">{activeMail.body}</div>

                {activeMail.replies?.length > 0 && (
                  <div className="outlook-replies">
                    {activeMail.replies.map((rep) => (
                      <div className="outlook-reply-card" key={rep.id}>
                        <div>
                          <strong>{rep.authorName}</strong>
                          <small>{rep.time}</small>
                        </div>
                        <p>{rep.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form className="outlook-quick-reply" onSubmit={handleQuickReply}>
                <textarea
                  rows="2"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeMail.fromName}…`}
                />
                <button type="submit" className="button button-primary">
                  <Reply size={14} /> Send reply
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state" style={{ margin: "auto" }}>
              Select an email to read or click <strong>New mail</strong> to send a message.
            </div>
          )}
        </section>
      </div>

      {composing && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setComposing(false)}>
          <form className="modal modal-wide" onSubmit={(e) => handleComposeSubmit(e, false)}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">BEATSVIBE OUTLOOK · NEW MESSAGE</div>
                <h2>Compose Email</h2>
                <p>Send directly to any colleague or broadcast to all@beatsvibe.com.</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setComposing(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="modal-fields">
              <label>
                To (Recipient)
                <input
                  list="beatsvibe-colleagues"
                  required
                  value={composeForm.toEmail}
                  onChange={(e) => setComposeForm({ ...composeForm, toEmail: e.target.value })}
                  placeholder="Select colleague or type email (e.g. employee@beatsvibe.com)"
                />
                <datalist id="beatsvibe-colleagues">
                  <option value="all@beatsvibe.com">All BeatsVibe Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.email}>{emp.name} ({emp.role})</option>
                  ))}
                </datalist>
              </label>
              <label>
                Subject
                <input
                  required
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="Enter email subject"
                />
              </label>
              <label>
                Category / Tag
                <select value={composeForm.tag} onChange={(e) => setComposeForm({ ...composeForm, tag: e.target.value })}>
                  <option>General</option>
                  <option>Engineering</option>
                  <option>BeatsVibe R&amp;D</option>
                  <option>VedaIQ</option>
                  <option>DBM System</option>
                  <option>People &amp; HR</option>
                </select>
              </label>
              <label>
                Message
                <textarea
                  required
                  rows="6"
                  value={composeForm.body}
                  onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                  placeholder="Write your message…"
                />
              </label>
            </div>
            <div className="modal-footer">
              <span><Mail size={14} /> From: {user?.email}</span>
              <button
                type="button"
                className="button button-outline"
                onClick={(e) => handleComposeSubmit(e, true)}
              >
                Save draft
              </button>
              <button type="submit" className="button button-primary">
                <Send size={14} /> Send email
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
