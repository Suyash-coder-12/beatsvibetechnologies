import { useEffect, useState } from "react";
import { Check, CircleHelp, Download, FileText, KeyRound, LockKeyhole, Trash2, X } from "lucide-react";
import { initialFaqs } from "./data.js";
import { downloadFile, initialsFromName } from "./workspaceStore.js";
import { canDeleteTargetEmployee, canDo, canModifyTargetEmployee, getAssignableRoles, isFounder } from "./permissions.js";

export function ActionModal({
  modal,
  workspace,
  user,
  onClose,
  onNotify,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onAssignTask,
  onUpdateTask,
  onDeleteTask,
  onCreateEvent,
  onRsvpEvent,
  onDeleteEvent,
  onPublishAnnouncement,
  onAckAnnouncement,
  onDeleteAnnouncement,
  onCreateDocument,
  onDeleteDocument,
  onAddDivision,
  onAddDbmClient,
  onOpenModal,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    jobTitle: "",
    division: modal.defaultDivision || workspace.divisions[0]?.name || "BeatsVibe R&D",
    date: modal.defaultDate || "2026-11-28",
    time: "11:00 AM",
    location: "BeatsVibe Meet",
    priority: "Medium",
    description: "",
    project: workspace.projects[0]?.name || "",
    category: "COMPANY UPDATE",
    domain: "",
    plan: "Growth",
  });
  const [error, setError] = useState("");
  const [faqQuery, setFaqQuery] = useState("");
  const [commentText, setCommentText] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    setError("");
    setCommentText("");
    setResetPassword("");
  }, [modal]);

  if (!modal || !modal.type) return null;

  const { type, item } = modal;

  // 1. Help Center Modal
  if (type === "Help Center") {
    const filteredFaqs = initialFaqs.filter(
      (f) => `${f.q} ${f.a}`.toLowerCase().includes(faqQuery.toLowerCase()),
    );
    return (
      <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-wide">
          <div className="modal-header">
            <div>
              <div className="eyebrow">BEATSVIBE SUPPORT</div>
              <h2>Workspace Help Center</h2>
              <p>Quick guides for employees, leads, HR, and workspace admins.</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-view-body">
            <input
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Search help topics…"
              style={{ height: 36, padding: "0 11px", borderRadius: 8, border: "1px solid #dbe3ee" }}
            />
            <div className="comment-thread">
              {filteredFaqs.map((faq) => (
                <div className="comment-bubble" key={faq.q}>
                  <strong>{faq.q}</strong>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="note-panel">
              <CircleHelp size={16} />
              <p><strong>Keyboard Shortcut:</strong> Press <code>Ctrl + K</code> (or <code>⌘ + K</code>) anytime to jump directly to any page, employee, project, or task.</p>
            </div>
          </div>
          <div className="modal-footer">
            <span>Signed in as {user?.displayName || user?.email}</span>
            <button className="button button-primary" type="button" onClick={onClose}>Got it</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Quick Actions Launcher
  if (type === "More Quick Actions") {
    const allActions = [
      ["Create Project", "Start a new division project", canDo(user, "create_project", workspace)],
      ["Assign Task", "Delegate work to a team member", canDo(user, "assign_task", workspace)],
      ["Add Employee", "Onboard an employee with credentials", canDo(user, "add_employee", workspace)],
      ["Add Division", "Launch a new BeatsVibe division (Founder Only)", canDo(user, "create_division", workspace)],
      ["Schedule Meeting", "Book a team sync on Calendar", canDo(user, "schedule_event", workspace)],
      ["Add Company Event", "Post a company-wide milestone", canDo(user, "schedule_event", workspace)],
      ["Publish Announcement", "Notify all BeatsVibe members", canDo(user, "publish_announcement", workspace)],
      ["Add Document", "Create an SOP or research note", canDo(user, "create_document", workspace)],
    ].filter(([, , allowed]) => allowed);
    return (
      <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-header">
            <div>
              <div className="eyebrow">QUICK LAUNCHER</div>
              <h2>Workspace Actions</h2>
              <p>Authorized actions available for your BeatsVibe access tier.</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-view-body">
            {allActions.map(([actionName, desc]) => (
              <button
                key={actionName}
                className="my-task-row"
                style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
                onClick={() => onOpenModal({ type: actionName })}
              >
                <div className="my-task-info">
                  <strong style={{ fontSize: 13, color: "#1e314d" }}>{actionName}</strong>
                  <small>{desc}</small>
                </div>
              </button>
            ))}
            {allActions.length === 0 && (
              <div className="empty-state">Use Tasks, Outlook, Calendar, and Documents from the navigation rail for your daily workflow.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. View Employee Modal
  if (type === "View Employee" && item) {
    const empTasks = workspace.tasks.filter(
      (t) => t.assigneeEmail?.toLowerCase() === item.email?.toLowerCase() || t.assignee === item.name,
    );
    const canEditEmp = canModifyTargetEmployee(user, item, workspace);
    const canDelEmp = canDeleteTargetEmployee(user, item, workspace);
    const canResetPwd = isFounder(user) && item.id !== user?.id;

    return (
      <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-wide">
          <div className="modal-header">
            <div>
              <div className="eyebrow">EMPLOYEE DOSSIER</div>
              <h2>{item.name}</h2>
              <p>{item.jobTitle || "Team Member"} · {item.division}</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-view-body">
            <div className="detail-grid">
              <div className="detail-item"><small>Work Email (Login ID)</small><strong>{item.email}</strong></div>
              <div className="detail-item"><small>Workspace Role</small><strong>{item.role}</strong></div>
              <div className="detail-item"><small>Location</small><strong>{item.location || "Remote / India"}</strong></div>
              <div className="detail-item"><small>Joined</small><strong>{item.joined || "2026"}</strong></div>
              <div className="detail-item"><small>Phone</small><strong>{item.phone || "—"}</strong></div>
              <div className="detail-item">
                <small>Status</small>
                {canEditEmp && item.id !== user?.id ? (
                  <select
                    className="inline-status-select"
                    value={item.status}
                    onChange={(e) => onUpdateEmployee(item.id, { status: e.target.value })}
                    style={{ marginTop: 4 }}
                  >
                    <option>Active</option>
                    <option>On leave</option>
                    <option>Inactive</option>
                  </select>
                ) : (
                  <strong>{item.status}</strong>
                )}
              </div>
            </div>

            {canResetPwd && (
              <div className="founder-dossier-box">
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0a3d91" }}>
                  <KeyRound size={14} /> Founder Credential Override
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    type="text"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Set new login password…"
                    style={{ flex: 1, height: 34, padding: "0 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12 }}
                  />
                  <button
                    type="button"
                    className="button button-primary btn-xs"
                    onClick={() => {
                      if (!resetPassword.trim()) return;
                      onUpdateEmployee(item.id, { password: resetPassword.trim() });
                      setResetPassword("");
                      onNotify(`Password updated for ${item.name}.`);
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            <div>
              <strong style={{ fontSize: 12.5, color: "#22354f" }}>Assigned Tasks ({empTasks.length})</strong>
              <div className="comment-thread" style={{ marginTop: 8 }}>
                {empTasks.map((t) => (
                  <div className="my-task-row" key={t.id}>
                    <div className="my-task-info">
                      <strong>{t.name}</strong>
                      <small>{t.project} · Due {t.due}</small>
                    </div>
                    <span className={`status-pill ${t.status === "Done" ? "success" : t.status === "In progress" ? "info" : "warning"}`}>
                      <i /> {t.status}
                    </span>
                  </div>
                ))}
                {empTasks.length === 0 && <div className="empty-state">No tasks assigned yet.</div>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            {canDelEmp ? (
              <button
                type="button"
                className="button button-danger"
                onClick={() => {
                  onDeleteEmployee(item.id);
                  onClose();
                }}
              >
                <Trash2 size={14} /> Remove employee
              </button>
            ) : (
              <span><LockKeyhole size={13} /> Read-only clearance</span>
            )}
            <span />
            <button type="button" className="button button-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // 4. View Project Modal
  if (type === "View Project" && item) {
    const linkedTasks = workspace.tasks.filter((t) => t.project === item.name);
    const canEditProj = canDo(user, "edit_project", workspace, item);
    const canDelProj = canDo(user, "delete_project", workspace, item);
    return (
      <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-wide">
          <div className="modal-header">
            <div>
              <div className="eyebrow">PROJECT WORKSPACE · {item.division}</div>
              <h2>{item.name}</h2>
              <p>Lead: {item.owner} · Due {item.due}</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-view-body">
            <p style={{ margin: 0, color: "#43536b", fontSize: 13, lineHeight: 1.55 }}>{item.description || "Division initiative tracked in BeatsVibe One."}</p>
            <div className="detail-grid">
              <div className="detail-item">
                <small>Project Status</small>
                {canEditProj ? (
                  <select
                    className="inline-status-select"
                    value={item.status}
                    onChange={(e) => onUpdateProject(item.id, { status: e.target.value })}
                    style={{ marginTop: 4 }}
                  >
                    <option>Planning</option>
                    <option>In progress</option>
                    <option>In review</option>
                    <option>Completed</option>
                    <option>On hold</option>
                  </select>
                ) : (
                  <strong>{item.status}</strong>
                )}
              </div>
              <div className="detail-item">
                <small>Completion Progress: {item.progress}%</small>
                {canEditProj ? (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.progress}
                    onChange={(e) => onUpdateProject(item.id, { progress: Number(e.target.value) })}
                    style={{ width: "100%", marginTop: 6 }}
                  />
                ) : (
                  <div className="progress-track" style={{ marginTop: 8 }}><span style={{ width: `${item.progress}%` }} /></div>
                )}
              </div>
            </div>
            <div>
              <strong style={{ fontSize: 12.5, color: "#22354f" }}>Linked Tasks ({linkedTasks.length})</strong>
              <div className="comment-thread" style={{ marginTop: 8 }}>
                {linkedTasks.map((t) => (
                  <div className="my-task-row" key={t.id}>
                    <div className="my-task-info">
                      <strong>{t.name}</strong>
                      <small>{t.assignee} · {t.priority} priority</small>
                    </div>
                    {canDo(user, "update_task", workspace, t) ? (
                      <select
                        className="inline-status-select"
                        value={t.status}
                        onChange={(e) => onUpdateTask(t.id, { status: e.target.value })}
                      >
                        <option>To do</option>
                        <option>In progress</option>
                        <option>In review</option>
                        <option>Done</option>
                      </select>
                    ) : (
                      <span className="status-pill neutral"><i /> {t.status}</span>
                    )}
                  </div>
                ))}
                {linkedTasks.length === 0 && <div className="empty-state">No tasks linked yet.</div>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            {canDelProj ? (
              <button
                type="button"
                className="button button-danger"
                onClick={() => {
                  onDeleteProject(item.id);
                  onClose();
                }}
              >
                <Trash2 size={14} /> Delete project
              </button>
            ) : (
              <span><LockKeyhole size={13} /> {canEditProj ? "Project deletion restricted to Founder & CTO" : "Read-only project view"}</span>
            )}
            <span />
            <button type="button" className="button button-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // 5. View Task Modal
  if (type === "View Task" && item) {
    const canEditTask = canDo(user, "update_task", workspace, item);
    const canDelTask = canDo(user, "delete_task", workspace, item);
    const submitComment = (e) => {
      e.preventDefault();
      if (!canEditTask || !commentText.trim()) return;
      onUpdateTask(item.id, {
        comments: [
          ...(item.comments || []),
          { author: user?.displayName || user?.email, time: "Just now", text: commentText.trim() },
        ],
      });
      setCommentText("");
    };
    return (
      <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-wide">
          <div className="modal-header">
            <div>
              <div className="eyebrow">TASK DETAILS · {item.project}</div>
              <h2>{item.name}</h2>
              <p>Assigned to {item.assignee} · Due {item.due}</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-view-body">
            <p style={{ margin: 0, color: "#43536b", fontSize: 13 }}>{item.description || "Track task execution and progress notes here."}</p>
            <div className="detail-grid">
              <div className="detail-item">
                <small>Status</small>
                {canEditTask ? (
                  <select
                    className="inline-status-select"
                    value={item.status}
                    onChange={(e) => onUpdateTask(item.id, { status: e.target.value })}
                    style={{ marginTop: 4 }}
                  >
                    <option>To do</option>
                    <option>In progress</option>
                    <option>In review</option>
                    <option>Done</option>
                  </select>
                ) : (
                  <strong>{item.status}</strong>
                )}
              </div>
              <div className="detail-item">
                <small>Priority</small>
                {canEditTask && canDo(user, "assign_task", workspace) ? (
                  <select
                    className="inline-status-select"
                    value={item.priority}
                    onChange={(e) => onUpdateTask(item.id, { priority: e.target.value })}
                    style={{ marginTop: 4 }}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                ) : (
                  <strong>{item.priority}</strong>
                )}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: 12.5, color: "#22354f" }}>Work Updates &amp; Comments</strong>
              <div className="comment-thread" style={{ marginTop: 8 }}>
                {(item.comments || []).map((c, idx) => (
                  <div className="comment-bubble" key={idx}>
                    <strong>{c.author}</strong><small>{c.time}</small>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
              {canEditTask && (
                <form onSubmit={submitComment} style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a work note or blocker update…"
                    style={{ flex: 1, height: 36, padding: "0 10px", borderRadius: 8, border: "1px solid #dbe3ee" }}
                  />
                  <button type="submit" className="button button-primary">Post update</button>
                </form>
              )}
            </div>
          </div>
          <div className="modal-footer">
            {canDelTask ? (
              <button
                type="button"
                className="button button-danger"
                onClick={() => {
                  onDeleteTask(item.id);
                  onClose();
                }}
              >
                <Trash2 size={14} /> Delete task
              </button>
            ) : (
              <span><LockKeyhole size={13} /> {canEditTask ? "Task deletion restricted to Admin/CTO/Founder" : "View-only task"}</span>
            )}
            <span />
            <button type="button" className="button button-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // 6. View Event / Meeting Modal
  if (type === "View Event" && item) {
    const myRsvp = item.rsvps?.[user?.email?.toLowerCase()] || "Pending";
    const canDelEvent = canDo(user, "delete_event", workspace, item);
    return (
      <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-header">
            <div>
              <div className="eyebrow">{item.type === "meeting" ? "TEAM MEETING" : "COMPANY EVENT"}</div>
              <h2>{item.title}</h2>
              <p>{item.day || item.date} {item.month} · {item.time}</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-view-body">
            <div className="detail-grid">
              <div className="detail-item"><small>Organizer</small><strong>{item.organizer || "Workspace Team"}</strong></div>
              <div className="detail-item"><small>Location / Room</small><strong>{item.location || "Online"}</strong></div>
            </div>
            <p style={{ margin: 0, color: "#43536b", fontSize: 13 }}>{item.details || "Scheduled in BeatsVibe One Calendar."}</p>
            <div>
              <small style={{ color: "#64748b", fontWeight: 600 }}>Your RSVP ({myRsvp})</small>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {["Accepted", "Tentative", "Declined"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`button btn-xs ${myRsvp === status ? "button-primary" : "button-outline"}`}
                    onClick={() => onRsvpEvent(item.id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            {canDelEvent && (
              <button
                type="button"
                className="button button-danger"
                onClick={() => {
                  onDeleteEvent(item.id);
                  onClose();
                }}
              >
                <Trash2 size={14} /> Cancel event
              </button>
            )}
            <span />
            <button type="button" className="button button-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // 7. View Announcement Modal
  if (type === "View Announcement" && item) {
    const acks = item.acknowledgedBy || [];
    const hasAcked = acks.includes(user?.email?.toLowerCase());
    const canDelAnn = canDo(user, "delete_announcement", workspace, item);
    return (
      <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-wide">
          <div className="modal-header">
            <div>
              <div className="eyebrow">{item.label}</div>
              <h2>{item.title}</h2>
              <p>Posted by {item.author} · {item.time}</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-view-body">
            <div className="doc-reader-box">{item.description}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Acknowledged by {acks.length} team member(s)</span>
              <button
                type="button"
                className={`button ${hasAcked ? "button-outline" : "button-primary"}`}
                onClick={() => onAckAnnouncement(item.id)}
              >
                <Check size={14} /> {hasAcked ? "Acknowledged" : "Acknowledge update"}
              </button>
            </div>
          </div>
          <div className="modal-footer">
            {canDelAnn && (
              <button
                type="button"
                className="button button-danger"
                onClick={() => {
                  onDeleteAnnouncement(item.id);
                  onClose();
                }}
              >
                <Trash2 size={14} /> Remove
              </button>
            )}
            <span />
            <button type="button" className="button button-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  // 8. View Document Modal
  if (type === "View Document" && item) {
    const canDelDoc = canDo(user, "delete_document", workspace, item);
    const canDownloadDoc = canDo(user, "download_document", workspace, item);
    return (
      <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-wide">
          <div className="modal-header">
            <div>
              <div className="eyebrow">{item.label} · {item.division || "Workspace"}</div>
              <h2>{item.title}</h2>
              <p>Author: {item.author} · {item.time}</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-view-body">
            <div className="doc-reader-box">{item.content || item.description}</div>
          </div>
          <div className="modal-footer">
            {canDelDoc ? (
              <button
                type="button"
                className="button button-danger"
                onClick={() => {
                  onDeleteDocument(item.id);
                  onClose();
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : (
              <span><LockKeyhole size={13} /> Protected corporate doc</span>
            )}
            <span />
            {canDownloadDoc && (
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  downloadFile(`${item.title.toLowerCase().replace(/\s+/g, "-")}.md`, `# ${item.title}\n\n${item.content || item.description}`, "text/markdown");
                  onNotify("Document downloaded.");
                }}
              >
                <Download size={14} /> Download .md
              </button>
            )}
            <button type="button" className="button button-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const assignableRoles = getAssignableRoles(user);
  const allowedDivisions = workspace.divisions.filter((d) => {
    if (isFounder(user)) return true;
    if (d.name === "BeatsVibe Payments") return false;
    if (user?.role === "team_leader") return d.name === user.division;
    if (user?.role === "hr") return ["BeatsVibe Career", "BeatsVibe Employees"].includes(d.name);
    return true;
  });

  // Creation Forms
  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    if (type === "Add Employee" || type === "Invite User") {
      if (!form.name.trim() || !form.email.trim()) {
        setError("Name and work email are required.");
        return;
      }
      if (workspace.employees.some((e) => e.email.toLowerCase() === form.email.trim().toLowerCase())) {
        setError("An employee with this email already exists.");
        return;
      }
      const chosenRole = assignableRoles.some((r) => r.value === form.role)
        ? form.role
        : (assignableRoles[assignableRoles.length - 1]?.value || "employee");
      onAddEmployee({
        id: `emp-${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim() || "Welcome@123",
        role: chosenRole,
        jobTitle: form.jobTitle.trim() || "Team Member",
        division: form.division,
        status: "Active",
        availability: "Available",
        initials: initialsFromName(form.name.trim()),
        color: ["blue", "lavender", "mint", "peach"][workspace.employees.length % 4],
        phone: "+91 98230 11999",
        location: "India / Remote",
        joined: "Nov 2026",
        isActive: true,
      });
      onClose();
      return;
    }

    if (type === "Create Project") {
      if (!form.name.trim()) {
        setError("Project name is required.");
        return;
      }
      const targetDivision = allowedDivisions.some((d) => d.name === form.division)
        ? form.division
        : (allowedDivisions[0]?.name || form.division);
      onCreateProject({
        id: `proj-${Date.now()}`,
        name: form.name.trim(),
        division: targetDivision,
        owner: user?.displayName || user?.email || "Owner",
        ownerEmail: user?.email,
        progress: 10,
        status: "Planning",
        dueAt: form.date,
        due: new Date(`${form.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        description: form.description.trim() || "New BeatsVibe workspace project.",
      });
      onClose();
      return;
    }

    if (type === "Assign Task") {
      if (!form.name.trim()) {
        setError("Task title is required.");
        return;
      }
      const chosenEmp = workspace.employees.find((e) => e.email === form.email) || workspace.employees[0];
      onAssignTask({
        id: `task-${Date.now()}`,
        name: form.name.trim(),
        project: form.project || workspace.projects[0]?.name || "General",
        assignee: chosenEmp?.name || "Team Member",
        assigneeEmail: chosenEmp?.email || "",
        priority: form.priority,
        status: "To do",
        dueAt: form.date,
        due: new Date(`${form.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        description: form.description.trim(),
        comments: [],
      });
      onClose();
      return;
    }

    if (type === "Schedule Meeting" || type === "Add Company Event") {
      if (!form.name.trim() || !form.date) {
        setError("Event title and date are required.");
        return;
      }
      const d = new Date(`${form.date}T12:00:00`);
      onCreateEvent({
        id: `evt-${Date.now()}`,
        title: form.name.trim(),
        startAt: `${form.date}T10:00:00.000Z`,
        day: String(d.getDate()).padStart(2, "0"),
        date: String(d.getDate()).padStart(2, "0"),
        month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        time: `${form.time || "11:00 AM"} · ${form.location || "Online"}`,
        location: form.location || "Online",
        type: type === "Schedule Meeting" ? "meeting" : "event",
        organizer: user?.displayName || user?.email,
        color: type === "Schedule Meeting" ? "purple" : "blue",
        details: form.description.trim() || "Workspace calendar item.",
        rsvps: { [user?.email?.toLowerCase() || ""]: "Accepted" },
      });
      onClose();
      return;
    }

    if (type === "Publish Announcement") {
      if (!form.name.trim() || !form.description.trim()) {
        setError("Announcement title and message are required.");
        return;
      }
      onPublishAnnouncement({
        id: `ann-${Date.now()}`,
        label: form.category,
        title: form.name.trim(),
        description: form.description.trim(),
        author: user?.displayName || user?.email,
        authorEmail: user?.email,
        time: "Just now",
        acknowledgedBy: [user?.email?.toLowerCase()].filter(Boolean),
      });
      onClose();
      return;
    }

    if (type === "Add Document") {
      if (!form.name.trim()) {
        setError("Document title is required.");
        return;
      }
      onCreateDocument({
        id: `doc-${Date.now()}`,
        label: form.category === "COMPANY UPDATE" ? "GENERAL" : form.category,
        title: form.name.trim(),
        description: form.description.slice(0, 120) || "Workspace document",
        content: form.description.trim() || `# ${form.name.trim()}\n\nCreated in BeatsVibe One.`,
        author: user?.displayName || user?.email,
        time: "Just now",
        division: form.division,
      });
      onClose();
      return;
    }

    if (type === "Add Division") {
      if (!form.name.trim()) {
        setError("Division name is required.");
        return;
      }
      onAddDivision({
        slug: form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: form.name.trim(),
        detail: form.description.trim() || "BeatsVibe team & operations",
        icon: "sparkles",
        progress: 20,
        color: "blue",
        projects: 0,
        lead: user?.displayName || "Team Lead",
      });
      onClose();
      return;
    }

    if (type === "Add DBM Client") {
      if (!form.name.trim() || !form.domain.trim()) {
        setError("Client name and domain are required.");
        return;
      }
      onAddDbmClient({
        id: `dbm-${Date.now()}`,
        client: form.name.trim(),
        domain: form.domain.trim(),
        emailService: "Provisioning",
        plan: form.plan,
        status: "In setup",
      });
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">BEATSVIBE ONE WORKSPACE</div>
            <h2>{type}</h2>
            <p>Changes save directly to your workspace and update team views.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="modal-fields">
          {(type === "Add Employee" || type === "Invite User") && (
            <>
              <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Siddharth Rao" /></label>
              <label>Work email (Login ID)<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@beatsvibe.com" /></label>
              <label>Login password<input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="e.g. Emp@2026" /></label>
              <label>Job title<input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="e.g. Backend Engineer" /></label>
              <label>Workspace role
                <select
                  value={assignableRoles.some((r) => r.value === form.role) ? form.role : (assignableRoles[assignableRoles.length - 1]?.value || "employee")}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {assignableRoles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </label>
              <label>Division
                <select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })}>
                  {workspace.divisions.map((d) => <option key={d.name}>{d.name}</option>)}
                </select>
              </label>
            </>
          )}

          {type === "Create Project" && (
            <>
              <label>Project name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project title" /></label>
              <label>Division
                <select
                  value={allowedDivisions.some((d) => d.name === form.division) ? form.division : (allowedDivisions[0]?.name || form.division)}
                  onChange={(e) => setForm({ ...form, division: e.target.value })}
                >
                  {allowedDivisions.map((d) => <option key={d.name}>{d.name}</option>)}
                </select>
              </label>
              <label>Target due date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label>Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Scope and goals…" /></label>
            </>
          )}

          {type === "Assign Task" && (
            <>
              <label>Task title<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="What needs to be completed?" /></label>
              <label>Project
                <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                  {workspace.projects.map((p) => <option key={p.id || p.name}>{p.name}</option>)}
                </select>
              </label>
              <label>Assign to employee
                <select value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}>
                  <option value="">Choose team member…</option>
                  {workspace.employees.map((emp) => (
                    <option key={emp.id} value={emp.email}>{emp.name} ({emp.jobTitle})</option>
                  ))}
                </select>
              </label>
              <label>Priority
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label>Due date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label>Task instructions<textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional instructions…" /></label>
            </>
          )}

          {(type === "Schedule Meeting" || type === "Add Company Event") && (
            <>
              <label>Title<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Meeting or event title" /></label>
              <label>Date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label>Time<input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 2:00 PM" /></label>
              <label>Location / Meeting link<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. BeatsVibe Meet / Room B" /></label>
              <label>Agenda / Details<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Agenda notes…" /></label>
            </>
          )}

          {type === "Publish Announcement" && (
            <>
              <label>Title<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Announcement headline" /></label>
              <label>Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>COMPANY UPDATE</option>
                  <option>PRODUCT</option>
                  <option>PEOPLE</option>
                  <option>OPERATIONS</option>
                </select>
              </label>
              <label>Message<textarea required rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write update for all employees…" /></label>
            </>
          )}

          {type === "Add Document" && (
            <>
              <label>Document title<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Q4 Engineering SOP" /></label>
              <label>Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>RESEARCH</option>
                  <option>OPERATIONS</option>
                  <option>PEOPLE</option>
                  <option>ARCHITECTURE</option>
                </select>
              </label>
              <label>Division
                <select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })}>
                  {workspace.divisions.map((d) => <option key={d.name}>{d.name}</option>)}
                </select>
              </label>
              <label>Content (Markdown / Text)<textarea required rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write documentation…" /></label>
            </>
          )}

          {type === "Add Division" && (
            <>
              <label>Division name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. BeatsVibe Cloud" /></label>
              <label>Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Focus area and mission…" /></label>
            </>
          )}

          {type === "Add DBM Client" && (
            <>
              <label>Client / Startup name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Acme Startup" /></label>
              <label>Domain<input required value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="e.g. acme.in" /></label>
              <label>Plan
                <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                  <option>Starter</option>
                  <option>Growth</option>
                  <option>Enterprise</option>
                </select>
              </label>
            </>
          )}
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-footer">
          <span><FileText size={13} /> Saved to BeatsVibe One</span>
          <button className="button button-outline" type="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
