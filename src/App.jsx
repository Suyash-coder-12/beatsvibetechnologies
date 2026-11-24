import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays,
  Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp, ClipboardList,
  CreditCard, Crown, Database, FileText, FlaskConical, FolderKanban, GraduationCap,
  LayoutDashboard, LockKeyhole, Mail, Megaphone, Menu, MoreHorizontal, Plus,
  Search, Settings, ShieldCheck, Sparkles, Users, X, Zap,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { navigation } from "./data.js";
import { LoginScreen } from "./AuthScreens.jsx";
import { OutlookPage } from "./OutlookPage.jsx";
import { ActionModal } from "./Modals.jsx";
import { DeviceSecurityGuard } from "./DeviceSecurityGuard.jsx";
import { IntroSplash } from "./IntroSplash.jsx";
import {
  AuditLogsPage, CalendarPage, CompanyOverviewPage, CompanySettingsPage, DirectoryPage,
  DivisionCard, DivisionPage, formatRole, MeetingsPage, pageForDivision, ProfilePage,
  ResourceListPage, RolesPermissionsPage, WorkTablePage, AnalyticsPage,
} from "./WorkspaceModules.jsx";
import {
  authenticateLocalUser, createAuditEntry, initialsFromName, loadActiveSession,
  loadWorkspaceState, resetWorkspaceState, saveActiveSession, saveWorkspaceState,
} from "./workspaceStore.js";
import {
  canDeleteTargetEmployee,
  canDo,
  canModifyTargetEmployee,
  canViewPage,
  getPermittedCapabilityCount,
  getRoleTier,
  isFounder,
} from "./permissions.js";

const iconMap = {
  Dashboard: LayoutDashboard,
  "Company Overview": BriefcaseBusiness,
  Divisions: Database,
  Employees: Users,
  Projects: FolderKanban,
  Tasks: ClipboardList,
  "BeatsVibe R&D": FlaskConical,
  "DBM System": BriefcaseBusiness,
  "Career & Internships": GraduationCap,
  "BeatsVibe Payments": CreditCard,
  "VedaIQ – Veda": Sparkles,
  Outlook: Mail,
  Calendar: CalendarDays,
  Announcements: Megaphone,
  Meetings: Users,
  Documents: FileText,
  Reports: Activity,
  "Project Analytics": FolderKanban,
  "Employee Analytics": Users,
  "Division Performance": Database,
  "User Management": Users,
  "Roles & Permissions": ShieldCheck,
  "Company Settings": Settings,
  "Security & Audit Logs": LockKeyhole,
};

function App() {
  const [workspace, setWorkspace] = useState(() => loadWorkspaceState());
  const [user, setUser] = useState(() => loadActiveSession());
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [toast, setToast] = useState("");
  const [authError, setAuthError] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const searchInputRef = useRef(null);

  useEffect(() => {
    saveWorkspaceState(workspace);
  }, [workspace]);

  useEffect(() => {
    saveActiveSession(user);
  }, [user]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  const navigate = (page) => {
    if (user && !canViewPage(user, page, workspace)) {
      notify(`"${page}" requires higher role clearance.`);
      return;
    }
    setActivePage(page);
    setSidebarOpen(false);
    setSearch("");
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  const updateWorkspace = (updater, auditAction, auditDetail, tone = "info") => {
    setWorkspace((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (auditAction && prev.settings.auditLogging) {
        return {
          ...next,
          auditLogs: [createAuditEntry(user, auditAction, auditDetail, tone), ...next.auditLogs].slice(0, 120),
        };
      }
      return next;
    });
  };

  const handleLogin = ({ email, password }) => {
    setAuthError("");
    const result = authenticateLocalUser(workspace.employees, email, password);
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }
    setUser(result.user);
    setActivePage("Dashboard");
    setWorkspace((prev) => ({
      ...prev,
      auditLogs: [
        createAuditEntry(result.user, "auth.login", `${result.user.displayName} (${formatRole(result.user.role)}) signed in`, "success"),
        ...prev.auditLogs,
      ].slice(0, 120),
    }));
    notify(`Signed in as ${result.user.displayName} (${formatRole(result.user.role)}).`);
  };

  const handleSignOut = () => {
    if (user) {
      updateWorkspace((prev) => prev, "auth.logout", `${user.displayName} signed out`, "neutral");
    }
    setUser(null);
    setProfileOpen(false);
    setActivePage("Dashboard");
  };

  // Notifications computed from announcements + upcoming events + unread emails
  const myEmail = user?.email?.toLowerCase() || "";
  const unreadMails = useMemo(
    () => workspace.emails.filter((m) => {
      const to = m.toEmail?.toLowerCase() || "";
      return m.folder === "inbox" && m.unread && (to === myEmail || to === "all@beatsvibe.com" || to === "");
    }),
    [workspace.emails, myEmail],
  );
  const notifications = useMemo(() => {
    const list = [
      ...unreadMails.slice(0, 2).map((m) => ({
        id: `notif-mail-${m.id}`,
        title: `New Outlook mail from ${m.fromName}`,
        text: m.subject,
        time: m.time,
        page: "Outlook",
        tone: "blue",
      })),
      ...workspace.announcements.slice(0, 2).map((a) => ({
        id: `notif-ann-${a.id}`,
        title: a.title,
        text: a.description.slice(0, 80),
        time: a.time,
        page: "Announcements",
        tone: "green",
      })),
    ];
    return list;
  }, [unreadMails, workspace.announcements]);

  const hasUnreadNotifs = notifications.some((n) => !workspace.readNotificationIds.includes(n.id));
  const openTasksCount = workspace.tasks.filter((t) => t.status !== "Done").length;

  // Workspace mutations (enforced by 7-tier RBAC)
  const handleAddEmployee = (emp) => {
    if (!canDo(user, "add_employee", workspace) && !canDo(user, "manage_users", workspace)) {
      notify("Only HR, Admin, CTO, or Founder can add employees.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, employees: [emp, ...prev.employees] }),
      "employee.created",
      `Added ${emp.name} (${emp.email}) as ${formatRole(emp.role)}`,
      "success",
    );
    notify(`Employee ${emp.name} added with login ID ${emp.email}.`);
  };

  const handleUpdateEmployee = (id, patch, isSelfProfile = false) => {
    const target = workspace.employees.find((e) => e.id === id);
    if (!isSelfProfile && (!target || !canModifyTargetEmployee(user, target, workspace))) {
      notify("You do not have clearance to modify this team member.");
      return;
    }
    updateWorkspace(
      (prev) => ({
        ...prev,
        employees: prev.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }),
      "employee.updated",
      `Updated employee profile (${Object.keys(patch).join(", ")})`,
    );
    if (user?.id === id) {
      setUser((prev) => ({ ...prev, ...patch }));
    }
    notify("Employee record updated.");
  };

  const handleDeleteEmployee = (id) => {
    const target = workspace.employees.find((e) => e.id === id);
    if (!target || !canDeleteTargetEmployee(user, target, workspace)) {
      notify("Restricted: insufficient role clearance to remove this account.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, employees: prev.employees.filter((e) => e.id !== id) }),
      "employee.removed",
      `Removed ${target?.name || id} from directory`,
      "neutral",
    );
    notify("Employee removed.");
  };

  const handleCreateProject = (proj) => {
    if (!canDo(user, "create_project", workspace, proj)) {
      notify("You do not have permission to create projects in this division.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, projects: [proj, ...prev.projects] }),
      "project.created",
      `Created project "${proj.name}" in ${proj.division}`,
      "success",
    );
    notify(`Project "${proj.name}" created.`);
  };

  const handleUpdateProject = (id, patch) => {
    const target = workspace.projects.find((p) => p.id === id);
    if (!target || !canDo(user, "edit_project", workspace, target)) {
      notify("Project updates are restricted for your tier.");
      return;
    }
    updateWorkspace(
      (prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }),
      "project.updated",
      `Updated project fields (${Object.keys(patch).join(", ")})`,
    );
    if (modal?.item?.id === id) {
      setModal((prev) => ({ ...prev, item: { ...prev.item, ...patch } }));
    }
  };

  const handleDeleteProject = (id) => {
    const target = workspace.projects.find((p) => p.id === id);
    if (!target || !canDo(user, "delete_project", workspace, target)) {
      notify("Only Founder or CTO can delete projects.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }),
      "project.deleted",
      `Deleted project "${target?.name || id}"`,
      "neutral",
    );
    notify("Project deleted.");
  };

  const handleAssignTask = (task) => {
    if (!canDo(user, "assign_task", workspace)) {
      notify("Task assignment requires Team Leader or higher clearance.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, tasks: [task, ...prev.tasks] }),
      "task.assigned",
      `Assigned "${task.name}" to ${task.assignee}`,
      "success",
    );
    notify(`Task "${task.name}" assigned to ${task.assignee}.`);
  };

  const handleUpdateTask = (id, patch) => {
    const target = workspace.tasks.find((t) => t.id === id);
    if (!target || !canDo(user, "update_task", workspace, target)) {
      notify("You can only update tasks assigned to you.");
      return;
    }
    updateWorkspace(
      (prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      }),
      "task.updated",
      `Updated task (${patch.status || Object.keys(patch).join(", ")})`,
      patch.status === "Done" ? "success" : "info",
    );
    if (modal?.item?.id === id) {
      setModal((prev) => ({ ...prev, item: { ...prev.item, ...patch } }));
    }
    if (patch.status) notify(`Task moved to "${patch.status}".`);
  };

  const handleDeleteTask = (id) => {
    const target = workspace.tasks.find((t) => t.id === id);
    if (!target || !canDo(user, "delete_task", workspace, target)) {
      notify("Task deletion requires Admin, CTO, or Founder clearance.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }),
      "task.deleted",
      `Deleted task ${id}`,
      "neutral",
    );
    notify("Task deleted.");
  };

  const handleCreateEvent = (ev) => {
    if (!canDo(user, "schedule_event", workspace)) {
      notify("Scheduling events requires Lead, HR, Admin, CTO, or Founder clearance.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, events: [...prev.events, ev] }),
      "event.scheduled",
      `Scheduled "${ev.title}" on ${ev.day} ${ev.month}`,
      "success",
    );
    notify(`Scheduled "${ev.title}".`);
  };

  const handleRsvpEvent = (id, rsvpStatus) => {
    const key = user?.email?.toLowerCase();
    if (!key) return;
    updateWorkspace(
      (prev) => ({
        ...prev,
        events: prev.events.map((ev) =>
          ev.id === id ? { ...ev, rsvps: { ...(ev.rsvps || {}), [key]: rsvpStatus } } : ev,
        ),
      }),
      "event.rsvp",
      `Marked RSVP as ${rsvpStatus}`,
    );
    if (modal?.item?.id === id) {
      setModal((prev) => ({
        ...prev,
        item: { ...prev.item, rsvps: { ...(prev.item.rsvps || {}), [key]: rsvpStatus } },
      }));
    }
    notify(`RSVP updated: ${rsvpStatus}`);
  };

  const handleDeleteEvent = (id) => {
    const target = workspace.events.find((ev) => ev.id === id);
    if (!target || !canDo(user, "delete_event", workspace, target)) {
      notify("You cannot cancel this event.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, events: prev.events.filter((ev) => ev.id !== id) }),
      "event.cancelled",
      `Cancelled event ${id}`,
      "neutral",
    );
    notify("Event removed from calendar.");
  };

  const handlePublishAnnouncement = (ann) => {
    if (!canDo(user, "publish_announcement", workspace)) {
      notify("Publishing announcements is restricted to HR, Admin, CTO, and Founder.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, announcements: [ann, ...prev.announcements] }),
      "announcement.published",
      `Published "${ann.title}"`,
      "success",
    );
    notify("Announcement published to all teams.");
  };

  const handleAckAnnouncement = (id) => {
    const email = user?.email?.toLowerCase();
    if (!email) return;
    updateWorkspace(
      (prev) => ({
        ...prev,
        announcements: prev.announcements.map((a) => {
          if (a.id !== id) return a;
          const list = a.acknowledgedBy || [];
          const nextList = list.includes(email) ? list : [...list, email];
          return { ...a, acknowledgedBy: nextList };
        }),
      }),
      "announcement.acknowledged",
      `Acknowledged company announcement`,
    );
    if (modal?.item?.id === id) {
      setModal((prev) => {
        const list = prev.item.acknowledgedBy || [];
        return {
          ...prev,
          item: { ...prev.item, acknowledgedBy: list.includes(email) ? list : [...list, email] },
        };
      });
    }
    notify("Announcement acknowledged.");
  };

  const handleDeleteAnnouncement = (id) => {
    const target = workspace.announcements.find((a) => a.id === id);
    if (!target || !canDo(user, "delete_announcement", workspace, target)) {
      notify("Removing company announcements is restricted to Founder & CTO.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, announcements: prev.announcements.filter((a) => a.id !== id) }),
      "announcement.deleted",
      `Removed announcement`,
      "neutral",
    );
    notify("Announcement removed.");
  };

  const handleCreateDocument = (doc) => {
    if (!canDo(user, "create_document", workspace)) {
      notify("Document creation is disabled for your tier.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, documents: [doc, ...prev.documents] }),
      "document.created",
      `Created document "${doc.title}"`,
      "success",
    );
    notify(`Document "${doc.title}" saved.`);
  };

  const handleDeleteDocument = (id) => {
    const target = workspace.documents.find((d) => d.id === id);
    if (!target || !canDo(user, "delete_document", workspace, target)) {
      notify("Document deletion is restricted to Admin, CTO, or Founder.");
      return;
    }
    updateWorkspace(
      (prev) => ({ ...prev, documents: prev.documents.filter((d) => d.id !== id) }),
      "document.deleted",
      `Deleted document`,
      "neutral",
    );
    notify("Document deleted.");
  };

  const handleSendEmail = ({ toEmail, subject, body, tag, asDraft, silentSentOnly }) => {
    const nowTime = "Just now";
    const baseMail = {
      fromName: user?.displayName || user?.email,
      fromEmail: user?.email,
      toEmail,
      subject,
      preview: body.slice(0, 90),
      body,
      time: nowTime,
      tag: tag || "General",
      replies: [],
    };
    const itemsToAdd = [];
    if (asDraft) {
      itemsToAdd.push({ ...baseMail, id: `mail-draft-${Date.now()}`, folder: "drafts", unread: false, starred: false });
      notify("Saved email to Drafts.");
    } else {
      itemsToAdd.push({ ...baseMail, id: `mail-sent-${Date.now()}`, folder: "sent", unread: false, starred: false });
      if (!silentSentOnly) {
        itemsToAdd.push({ ...baseMail, id: `mail-in-${Date.now() + 1}`, folder: "inbox", unread: true, starred: false });
        notify(`Email sent to ${toEmail} via Outlook.`);
      }
    }
    updateWorkspace(
      (prev) => ({ ...prev, emails: [...itemsToAdd, ...prev.emails] }),
      asDraft ? "outlook.draft" : "outlook.sent",
      `${asDraft ? "Saved draft" : "Sent email"} "${subject}" to ${toEmail}`,
      "success",
    );
  };

  const handleUpdateEmail = (id, patch) => {
    setWorkspace((prev) => ({
      ...prev,
      emails: prev.emails.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  const handleDeleteEmail = (id) => {
    setWorkspace((prev) => ({
      ...prev,
      emails: prev.emails.filter((m) => m.id !== id),
    }));
  };

  const handleUpdateProfile = (patch) => {
    if (!user) return;
    const updatedEmp = {
      name: patch.name ?? user.displayName,
      jobTitle: patch.jobTitle ?? user.jobTitle,
      phone: patch.phone ?? user.phone,
      location: patch.location ?? user.location,
      availability: patch.availability ?? user.availability,
      bio: patch.bio ?? user.bio,
      initials: initialsFromName(patch.name ?? user.displayName),
      ...(patch.password ? { password: patch.password } : {}),
    };
    handleUpdateEmployee(user.id, updatedEmp, true);
    setUser((prev) => ({
      ...prev,
      displayName: updatedEmp.name,
      jobTitle: updatedEmp.jobTitle,
      phone: updatedEmp.phone,
      location: updatedEmp.location,
      availability: updatedEmp.availability,
      bio: updatedEmp.bio,
      initials: updatedEmp.initials,
    }));
  };

  if (showSplash) {
    return (
      <DeviceSecurityGuard>
        <IntroSplash onFinish={() => setShowSplash(false)} />
      </DeviceSecurityGuard>
    );
  }

  if (!user) {
    return (
      <DeviceSecurityGuard>
        <div className="app-reveal">
          <LoginScreen
            onLogin={handleLogin}
            error={authError}
            busy={false}
          />
        </div>
      </DeviceSecurityGuard>
    );
  }

  const roleTier = getRoleTier(user.role);
  const visibleNavGroups = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canViewPage(user, item, workspace)),
    }))
    .filter((group) => group.items.length > 0);
  const capCount = getPermittedCapabilityCount(user, workspace);
  const canViewActivePage = canViewPage(user, activePage, workspace);

  return (
    <DeviceSecurityGuard>
      <div className="app-shell app-reveal">
      {sidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img className="brand-logo" src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" />
          <span className="brand-one-badge">ONE</span>
          <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <button className="workspace-switch" onClick={() => setProfileOpen(!profileOpen)}>
          <span className="workspace-logo">B</span>
          <span className="workspace-copy">
            <strong>{formatRole(user.role)} workspace</strong>
            <small>{workspace.settings.companyName}</small>
          </span>
          <ChevronDown size={15} />
        </button>

        <nav className="side-nav" aria-label="Main navigation">
          {visibleNavGroups.map((group) => (
            <section className="nav-group" key={group.group}>
              <button
                className="nav-heading"
                onClick={() => setCollapsedGroups({ ...collapsedGroups, [group.group]: !collapsedGroups[group.group] })}
              >
                <span>{group.group}</span>
                <ChevronDown size={13} className={collapsedGroups[group.group] ? "rotated" : ""} />
              </button>
              {!collapsedGroups[group.group] && group.items.map((item) => {
                const Icon = iconMap[item] || LayoutDashboard;
                const badge = item === "Tasks" ? openTasksCount : item === "Outlook" ? unreadMails.length : 0;
                return (
                  <button
                    className={`nav-item ${activePage === item ? "active" : ""}`}
                    key={item}
                    onClick={() => navigate(item)}
                  >
                    <Icon size={16} strokeWidth={1.85} />
                    <span>{item}</span>
                    {badge > 0 && <span className="nav-count">{badge}</span>}
                  </button>
                );
              })}
            </section>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className={`sidebar-clearance tier-${roleTier.tone}`}>
            <div className="sidebar-clearance-head">
              <span>{isFounder(user) ? <Crown size={12} /> : <ShieldCheck size={12} />} {roleTier.shortLabel}</span>
              <strong>{capCount}/16</strong>
            </div>
            <div className="tier-meter"><span style={{ width: `${roleTier.rank}%` }} /></div>
          </div>

          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Need a hand?</strong>
            <span>Guides &amp; shortcuts</span>
            <button onClick={() => setModal({ type: "Help Center" })}>
              Open help center <ArrowRight size={13} />
            </button>
          </div>

          <button className="profile-switch" onClick={() => setProfileOpen(!profileOpen)}>
            <span className={`avatar avatar-${user.color || "owner"}`}>{user.initials}</span>
            <span className="profile-text">
              <strong>{user.displayName}</strong>
              <small>{formatRole(user.role)} · {user.availability || "Available"}</small>
            </span>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>

      <main className="main-shell">
        <header className={`topbar ${activePage === "Dashboard" ? "dashboard-topbar" : ""}`}>
          <div className="topbar-left">
            <button className="icon-button menu-button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span>{workspace.settings.platformName}</span>
              <ChevronRight size={14} />
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-wrapper">
              <label className="global-search">
                <Search size={16} />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search authorized pages, tasks, emails…"
                />
                <kbd>⌘ K</kbd>
              </label>
              {search && <SearchResults query={search} workspace={workspace} user={user} onSelect={navigate} />}
            </div>

            <button
              className={`topbar-tier-pill tier-${roleTier.tone}`}
              onClick={() => navigate(canViewPage(user, "Roles & Permissions", workspace) ? "Roles & Permissions" : "My Profile")}
              title={roleTier.summary}
            >
              {isFounder(user) ? <Crown size={13} /> : <ShieldCheck size={13} />}
              <span>{roleTier.shortLabel}</span>
            </button>

            <button
              className={`icon-button notification-button ${notificationsOpen ? "selected" : ""}`}
              aria-label="Notifications"
              onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
            >
              <Bell size={18} />
              {hasUnreadNotifs && <i className="notif-dot" />}
            </button>

            <button
              className="top-profile"
              onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
            >
              <span className={`avatar avatar-${user.color || "owner"}`}>{user.initials}</span>
              <span>{user.displayName}</span>
              <span className="role-chip">{formatRole(user.role)}</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {notificationsOpen && (
            <div className="popover notification-popover">
              <div className="popover-head">
                <strong>Notifications</strong>
                <button
                  onClick={() => {
                    setWorkspace((prev) => ({
                      ...prev,
                      readNotificationIds: notifications.map((n) => n.id),
                    }));
                    notify("All notifications marked as read.");
                  }}
                >
                  Mark all read
                </button>
              </div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className="notification-row"
                  onClick={() => {
                    setWorkspace((prev) => ({
                      ...prev,
                      readNotificationIds: [...new Set([...prev.readNotificationIds, n.id])],
                    }));
                    navigate(n.page);
                  }}
                >
                  <span className={`notice-dot ${n.tone === "green" ? "notice-green" : ""}`} />
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.text}</p>
                    <small>{n.time}</small>
                  </div>
                </button>
              ))}
              <button className="popover-footer" onClick={() => navigate("Announcements")}>
                View all announcements <ArrowRight size={14} />
              </button>
            </div>
          )}

          {profileOpen && (
            <div className="popover profile-popover">
              <div className="profile-popover-title">
                <span className={`avatar avatar-${user.color || "owner"}`}>{user.initials}</span>
                <div>
                  <strong>{user.displayName}</strong>
                  <small>{formatRole(user.role)} · {user.division}</small>
                </div>
              </div>
              <button onClick={() => navigate("My Profile")}><Users size={15} /> My profile &amp; availability</button>
              <button onClick={() => navigate("Outlook")}><Mail size={15} /> Outlook Mail ({unreadMails.length})</button>
              {canViewPage(user, "Roles & Permissions", workspace) && (
                <button onClick={() => navigate("Roles & Permissions")}><ShieldCheck size={15} /> Access matrix</button>
              )}
              {canViewPage(user, "Company Settings", workspace) && (
                <button onClick={() => navigate("Company Settings")}><Settings size={15} /> Founder settings</button>
              )}

              <button onClick={handleSignOut} style={{ marginTop: 6, borderTop: "1px solid #eef2f6", paddingTop: 10, color: "#b91c1c" }}>
                <LockKeyhole size={15} /> Sign out
              </button>
            </div>
          )}
        </header>

        <div className="page-content">
          {!canViewActivePage ? (
            <div className="card permission-alert" style={{ padding: 28, marginTop: 18 }}>
              <LockKeyhole size={22} />
              <div style={{ flex: 1 }}>
                <strong>Restricted Module · Clearance Required</strong>
                <p>Your current role (<b>{formatRole(user.role)}</b> · {roleTier.shortLabel}) does not include access to <b>{activePage}</b>.</p>
                <button className="button button-primary" style={{ marginTop: 12 }} onClick={() => setActivePage("Dashboard")}>
                  Return to Dashboard <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {activePage === "Dashboard" && (
                <Dashboard
                  workspace={workspace}
                  user={user}
                  onOpenModal={setModal}
                  onNavigate={navigate}
                  onUpdateTask={handleUpdateTask}
                />
              )}
              {activePage === "Company Overview" && (
                <CompanyOverviewPage workspace={workspace} user={user} onNavigate={navigate} />
              )}
              {(activePage === "Divisions" || ["BeatsVibe R&D", "DBM System", "Career & Internships", "BeatsVibe Payments", "VedaIQ – Veda"].includes(activePage)) && (
                <DivisionPage
                  page={activePage}
                  workspace={workspace}
                  user={user}
                  onOpenModal={setModal}
                  onNavigate={navigate}
                  onToggleInternCert={(id) => {
                    if (!canDo(user, "verify_intern_cert", workspace)) {
                      notify("Only Founder or HR Lead can verify intern certificates.");
                      return;
                    }
                    updateWorkspace(
                      (prev) => ({
                        ...prev,
                        internCohorts: prev.internCohorts.map((c) =>
                          c.id === id ? { ...c, certStatus: c.certStatus === "Verified" ? "In training" : "Verified" } : c,
                        ),
                      }),
                      "intern.certificate_updated",
                      `Updated internship certificate status`,
                      "success",
                    );
                    notify("Intern certificate status updated.");
                  }}
                  onToggleDbmStatus={(id) => {
                    if (!canDo(user, "manage_dbm_clients", workspace)) {
                      notify("Only DBM Lead, Admin, CTO, or Founder can update DBM clients.");
                      return;
                    }
                    updateWorkspace(
                      (prev) => ({
                        ...prev,
                        dbmClients: prev.dbmClients.map((c) =>
                          c.id === id ? { ...c, status: c.status === "Healthy" ? "In setup" : "Healthy", emailService: c.status === "Healthy" ? "DNS Verifying" : "Active (10 mailboxes)" } : c,
                        ),
                      }),
                      "dbm.client_updated",
                      `Updated DBM client provisioning status`,
                    );
                    notify("DBM client service status updated.");
                  }}
                />
              )}
              {(activePage === "Employees" || activePage === "User Management") && (
                <DirectoryPage
                  page={activePage}
                  workspace={workspace}
                  user={user}
                  search={search}
                  onOpenModal={setModal}
                  onUpdateEmployee={handleUpdateEmployee}
                />
              )}
              {(activePage === "Projects" || activePage === "Tasks") && (
                <WorkTablePage
                  page={activePage}
                  workspace={workspace}
                  user={user}
                  search={search}
                  onOpenModal={setModal}
                  onUpdateTask={handleUpdateTask}
                />
              )}
              {activePage === "Outlook" && (
                <OutlookPage
                  user={user}
                  workspace={workspace}
                  employees={workspace.employees}
                  emails={workspace.emails}
                  onSendEmail={handleSendEmail}
                  onUpdateEmail={handleUpdateEmail}
                  onDeleteEmail={handleDeleteEmail}
                  onNotify={notify}
                />
              )}
              {activePage === "Calendar" && (
                <CalendarPage workspace={workspace} user={user} onOpenModal={setModal} />
              )}
              {activePage === "Meetings" && (
                <MeetingsPage
                  workspace={workspace}
                  user={user}
                  onOpenModal={setModal}
                  onRsvpEvent={handleRsvpEvent}
                  onNotify={notify}
                />
              )}
              {(activePage === "Announcements" || activePage === "Documents") && (
                <ResourceListPage
                  page={activePage}
                  workspace={workspace}
                  user={user}
                  search={search}
                  onOpenModal={setModal}
                  onAckAnnouncement={handleAckAnnouncement}
                />
              )}
              {["Reports", "Project Analytics", "Employee Analytics", "Division Performance"].includes(activePage) && (
                <AnalyticsPage page={activePage} workspace={workspace} user={user} onNotify={notify} />
              )}
              {activePage === "Roles & Permissions" && (
                <RolesPermissionsPage
                  workspace={workspace}
                  user={user}
                  onTogglePermission={(roleKey, perm) => {
                    if (!canDo(user, "edit_role_matrix", workspace)) {
                      notify("Only Founder Suyash Rathod can modify global RBAC permissions.");
                      return;
                    }
                    updateWorkspace(
                      (prev) => ({
                        ...prev,
                        roleMatrix: {
                          ...prev.roleMatrix,
                          [roleKey]: { ...prev.roleMatrix[roleKey], [perm]: !prev.roleMatrix[roleKey][perm] },
                        },
                      }),
                      "rbac.updated",
                      `Toggled ${perm} for ${roleKey}`,
                    );
                    notify("Role permission updated.");
                  }}
                />
              )}
              {activePage === "Company Settings" && (
                <CompanySettingsPage
                  workspace={workspace}
                  onSaveSettings={(nextSettings) => {
                    if (!canDo(user, "manage_settings", workspace)) {
                      notify("Company settings are restricted to Founder.");
                      return;
                    }
                    updateWorkspace(
                      (prev) => ({ ...prev, settings: nextSettings }),
                      "settings.saved",
                      "Updated BeatsVibe workspace settings",
                      "success",
                    );
                    notify("Company settings saved.");
                  }}
                  onResetWorkspace={() => {
                    if (!canDo(user, "reset_workspace", workspace)) {
                      notify("Workspace reset requires Founder authorization.");
                      return;
                    }
                    const fresh = resetWorkspaceState();
                    setWorkspace(fresh);
                    notify("Workspace restored to initial sample state.");
                  }}
                  onNotify={notify}
                />
              )}
              {activePage === "Security & Audit Logs" && (
                <AuditLogsPage
                  workspace={workspace}
                  user={user}
                  search={search}
                  onNotify={notify}
                  onClearAuditLogs={() => {
                    if (!canDo(user, "clear_audit", workspace)) {
                      notify("Trimming audit trail requires Founder authorization.");
                      return;
                    }
                    updateWorkspace(
                      (prev) => ({
                        ...prev,
                        auditLogs: [
                          createAuditEntry(user, "audit.trimmed", "Founder trimmed older audit history", "info"),
                          ...prev.auditLogs.slice(0, 10),
                        ],
                      }),
                    );
                    notify("Audit trail trimmed by Founder.");
                  }}
                />
              )}
              {activePage === "My Profile" && (
                <ProfilePage key={user.id} user={user} onUpdateProfile={handleUpdateProfile} onNotify={notify} />
              )}
            </>
          )}

          <footer className="page-footer">
            <span>{workspace.settings.platformName} <b>·</b> {user.displayName} ({formatRole(user.role)})</span>
            <span><i className="demo-dot" /> Live Interactive Multi-Employee Workspace</span>
          </footer>
        </div>
      </main>

      {modal && (
        <ActionModal
          key={`${modal.type}-${modal.item?.id || modal.defaultDivision || modal.defaultDate || "new"}`}
          modal={modal}
          workspace={workspace}
          user={user}
          onClose={() => setModal(null)}
          onNotify={notify}
          onOpenModal={setModal}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onAssignTask={handleAssignTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onCreateEvent={handleCreateEvent}
          onRsvpEvent={handleRsvpEvent}
          onDeleteEvent={handleDeleteEvent}
          onPublishAnnouncement={handlePublishAnnouncement}
          onAckAnnouncement={handleAckAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
          onCreateDocument={handleCreateDocument}
          onDeleteDocument={handleDeleteDocument}
          onAddDivision={(div) => {
            if (!canDo(user, "create_division", workspace)) {
              notify("Adding new divisions is restricted to Founder.");
              return;
            }
            updateWorkspace(
              (prev) => ({ ...prev, divisions: [...prev.divisions, div] }),
              "division.created",
              `Created division ${div.name}`,
              "success",
            );
            notify(`Division "${div.name}" added.`);
          }}
          onAddDbmClient={(client) => {
            if (!canDo(user, "manage_dbm_clients", workspace)) {
              notify("Adding DBM clients requires DBM Lead, Admin, CTO, or Founder clearance.");
              return;
            }
            updateWorkspace(
              (prev) => ({ ...prev, dbmClients: [client, ...prev.dbmClients] }),
              "dbm.client_added",
              `Added DBM client ${client.client} (${client.domain})`,
              "success",
            );
            notify(`Client "${client.client}" added to DBM System.`);
          }}
        />
      )}

      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
    </DeviceSecurityGuard>
  );
}

function Dashboard({ workspace, user, onOpenModal, onNavigate, onUpdateTask }) {
  const myTasks = workspace.tasks.filter(
    (t) => t.assigneeEmail?.toLowerCase() === user.email?.toLowerCase() || t.assignee === user.displayName,
  );
  const completedTasks = workspace.tasks.filter((t) => t.status === "Done").length;
  const activeProjects = workspace.projects.filter((p) => p.status !== "Completed").length;
  const roleTier = getRoleTier(user.role);
  const founderMode = isFounder(user);
  const visibleDivisions = workspace.divisions.filter((division) =>
    canViewPage(user, pageForDivision(division.name), workspace),
  );
  const visibleActivity = ["owner", "cto", "admin"].includes(user.role)
    ? workspace.auditLogs
    : workspace.auditLogs.filter(
      (log) => log.actorEmail?.toLowerCase() === user.email?.toLowerCase() || log.action === "workspace.initialized",
    );

  const quickButtons = [
    canDo(user, "create_project", workspace)
      ? { label: "New project", icon: FolderKanban, onClick: () => onOpenModal({ type: "Create Project" }) }
      : { label: "My tasks", icon: ClipboardList, onClick: () => onNavigate("Tasks") },
    canDo(user, "add_employee", workspace)
      ? { label: "Add employee", icon: Users, onClick: () => onOpenModal({ type: "Add Employee" }) }
      : { label: "Outlook mail", icon: Mail, onClick: () => onNavigate("Outlook") },
    canDo(user, "schedule_event", workspace)
      ? { label: "Meeting", icon: CalendarDays, onClick: () => onOpenModal({ type: "Schedule Meeting" }) }
      : { label: "Meetings", icon: Users, onClick: () => onNavigate("Meetings") },
    founderMode
      ? { label: "New division", icon: Database, onClick: () => onOpenModal({ type: "Add Division" }) }
      : canDo(user, "publish_announcement", workspace)
        ? { label: "Announce", icon: Megaphone, onClick: () => onOpenModal({ type: "Publish Announcement" }) }
        : { label: "My profile", icon: ShieldCheck, onClick: () => onNavigate("My Profile") },
  ];

  const statusBreakdown = [
    { name: "Completed", value: workspace.projects.filter((p) => ["Completed", "In review"].includes(p.status)).length || 2, color: "#0b66c3" },
    { name: "In progress", value: workspace.projects.filter((p) => p.status === "In progress").length || 2, color: "#10b981" },
    { name: "Planning", value: workspace.projects.filter((p) => ["Planning", "On hold"].includes(p.status)).length || 1, color: "#f59e0b" },
  ];
  const totalProjCount = statusBreakdown.reduce((s, i) => s + i.value, 0) || 1;
  const donePct = Math.round((statusBreakdown[0].value / totalProjCount) * 100);

  const weeklyData = [
    { week: "Week 1", projects: 4, tasks: 12 },
    { week: "Week 2", projects: 5, tasks: 18 },
    { week: "Week 3", projects: 6, tasks: 22 },
    { week: "Week 4", projects: workspace.projects.length, tasks: workspace.tasks.length * 3 },
  ];

  return (
    <>
      <div className="welcome-strip">
        <img className="hero-building" src="/office-building.svg" alt="" />
        <div className="welcome-content">
          <div className="eyebrow">
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "2-digit", year: "numeric" }).format(new Date()).toUpperCase()}
            <span className="live-pill"><i /> {roleTier.shortLabel.toUpperCase()}</span>
          </div>
          <h1>Welcome back, {user.displayName} <span className="wave">👋</span></h1>
          <p>{user.jobTitle} · {user.division} — {roleTier.summary}</p>
          <div className="hero-actions">
            <button className="button button-primary hero-explore" onClick={() => onNavigate("Outlook")}>
              <Mail size={14} /> Open Outlook Mail
            </button>
            <button className="button button-white hero-explore" onClick={() => onNavigate("Tasks")}>
              My Queue ({myTasks.filter((t) => t.status !== "Done").length}) <ArrowRight size={14} />
            </button>
            {founderMode && (
              <button className="button button-white hero-explore" onClick={() => onNavigate("Roles & Permissions")}>
                <Crown size={14} color="#0a3d91" /> Governance Matrix
              </button>
            )}
          </div>
        </div>
        <div className="hero-demo-pill"><i /> {user.availability || "Available"}</div>
      </div>

      {founderMode && (
        <section className="card founder-command-strip">
          <div className="founder-command-left">
            <span className="founder-crown-badge"><Crown size={15} /> Founder Supreme Governance</span>
            <p>Exclusive controls unlocked only for Suyash Rathod: RBAC editing, Company Settings, Payments &amp; Audit Export.</p>
          </div>
          <div className="founder-command-actions">
            <button className="button button-outline btn-xs" onClick={() => onNavigate("Roles & Permissions")}>
              <ShieldCheck size={13} /> Edit 7-Tier RBAC
            </button>
            <button className="button button-outline btn-xs" onClick={() => onNavigate("Company Settings")}>
              <Settings size={13} /> System &amp; Reset
            </button>
            <button className="button button-outline btn-xs" onClick={() => onNavigate("BeatsVibe Payments")}>
              <CreditCard size={13} /> Payments Spec
            </button>
            <button className="button button-primary btn-xs" onClick={() => onNavigate("Security & Audit Logs")}>
              <LockKeyhole size={13} /> Export Audit Trail
            </button>
          </div>
        </section>
      )}

      <div className="dashboard-summary-row">
        <div className="stat-grid">
          {user.role === "intern" ? (
            <>
              <StatCard title="My assigned tasks" value={myTasks.length} change={`${myTasks.filter((t) => t.status === "Done").length} completed`} positive icon={ClipboardList} tone="blue" points="2,28 16,23 27,26 39,20 51,24 63,15 75,19 88,9 101,12 115,3" />
              <StatCard title="Cohort projects" value={workspace.projects.filter((p) => p.division === "BeatsVibe Career" || p.division === "VedaIQ – Veda").length} change="Career & AI track" positive icon={FolderKanban} tone="purple" points="2,27 14,21 27,24 39,14 51,19 64,10 77,15 90,5 102,9 115,1" />
              <StatCard title="Unread emails" value={workspace.emails.filter((m) => m.unread && m.folder === "inbox").length} change="Outlook inbox" positive icon={Mail} tone="green" points="2,27 14,25 27,18 39,22 51,12 64,16 77,8 90,13 103,5 115,2" />
              <StatCard title="Upcoming sessions" value={workspace.events.length} change={workspace.events[0] ? `Next: ${workspace.events[0].day} ${workspace.events[0].month}` : ""} positive={false} icon={CalendarDays} tone="orange" points="2,29 14,25 27,27 39,20 51,23 64,16 77,18 90,10 103,12 115,3" />
            </>
          ) : (
            <>
              <StatCard title="Employees" value={workspace.employees.length} change={`${workspace.employees.filter((e) => e.status === "Active").length} active`} positive icon={Users} tone="blue" points="2,28 16,23 27,26 39,20 51,24 63,15 75,19 88,9 101,12 115,3" />
              <StatCard title="Active projects" value={activeProjects} change={`${visibleDivisions.length} divisions`} positive icon={FolderKanban} tone="purple" points="2,27 14,21 27,24 39,14 51,19 64,10 77,15 90,5 102,9 115,1" />
              <StatCard title="Completed tasks" value={completedTasks} change={`of ${workspace.tasks.length} total`} positive icon={CheckCheck} tone="green" points="2,27 14,25 27,18 39,22 51,12 64,16 77,8 90,13 103,5 115,2" />
              <StatCard title="Upcoming events" value={workspace.events.length} change={workspace.events[0] ? `Next: ${workspace.events[0].day} ${workspace.events[0].month}` : ""} positive={false} icon={CalendarDays} tone="orange" points="2,29 14,25 27,27 39,20 51,23 64,16 77,18 90,10 103,12 115,3" />
            </>
          )}
        </div>

        <section className="card dashboard-quick-card">
          <div className="quick-card-heading">
            <span><Zap size={15} fill="currentColor" /> Role Actions ({roleTier.badge})</span>
            <button onClick={() => onOpenModal({ type: "More Quick Actions" })}>View all <ArrowRight size={12} /></button>
          </div>
          <div className="quick-grid">
            {quickButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button key={btn.label} className="quick-action" onClick={btn.onClick}>
                  <span><Icon size={16} /></span>
                  <strong>{btn.label}</strong>
                </button>
              );
            })}
          </div>
          <div className="quick-extra-actions">
            {canDo(user, "assign_task", workspace) && (
              <button onClick={() => onOpenModal({ type: "Assign Task" })}><ClipboardList size={13} /> Assign task</button>
            )}
            <button onClick={() => onNavigate("Outlook")}><Mail size={13} /> Send Outlook mail</button>
          </div>
        </section>
      </div>

      <div className="dashboard-middle-grid">
        <section className="card dashboard-divisions">
          <div className="compact-card-heading">
            <div><h2>{user.role === "intern" ? "Your Division Track" : "Our Divisions"}</h2><p>Authorized BeatsVibe teams &amp; operations</p></div>
            {canViewPage(user, "Divisions", workspace) && (
              <button className="text-link" onClick={() => onNavigate("Divisions")}>Explore <ArrowRight size={13} /></button>
            )}
          </div>
          <div className="division-mini-grid">
            {visibleDivisions.map((division) => (
              <DivisionCard
                key={division.slug || division.name}
                division={division}
                projectCount={workspace.projects.filter((p) => p.division === division.name).length}
                onOpen={() => onNavigate(pageForDivision(division.name))}
              />
            ))}
          </div>
        </section>

        <section className="card company-analytics-card">
          <div className="compact-card-heading">
            <div><h2>Project Health</h2><p>Overall delivery status</p></div>
            {canViewPage(user, "Reports", workspace) && (
              <button className="select-button" onClick={() => onNavigate("Reports")}>Reports <ChevronDown size={12} /></button>
            )}
          </div>
          <div className="analytics-summary">
            <div className="compact-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" innerRadius={34} outerRadius={47} paddingAngle={3} stroke="none">
                    {statusBreakdown.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="compact-donut-label"><strong>{donePct}%</strong></div>
            </div>
            <div className="compact-status-list">
              {statusBreakdown.map((item) => (
                <div key={item.name}>
                  <span><i style={{ background: item.color }} />{item.name}</span>
                  <strong>{Math.round((item.value / totalProjCount) * 100)}%</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="analytics-sparkline">
            <Sparkline points="0,27 22,20 43,24 64,13 85,18 107,10 128,18 149,7 171,11 193,2" color="#2689df" fill="#d9efff" />
          </div>
        </section>

        <section className="card company-calendar-card">
          <div className="compact-card-heading">
            <div><h2>Company Calendar</h2><p>Upcoming events &amp; syncs</p></div>
            <button className="text-link" onClick={() => onNavigate("Calendar")}>View all <ArrowRight size={12} /></button>
          </div>
          <div className="compact-event-list">
            {workspace.events.slice(0, 3).map((ev) => (
              <button className="compact-event" key={ev.id} onClick={() => onOpenModal({ type: "View Event", item: ev })}>
                <span className={`compact-event-date ${ev.color}`}>
                  <strong>{ev.day || ev.date}</strong><small>{ev.month}</small>
                </span>
                <span className="compact-event-copy">
                  <strong>{ev.title}</strong>
                  <small>{ev.time}</small>
                </span>
                <i className={`event-marker ${ev.color}`} />
              </button>
            ))}
          </div>
          <button className="calendar-more-event" onClick={() => onNavigate("Meetings")}>
            <Sparkles size={15} />
            <span><strong>Meetings Hub</strong><small>RSVP &amp; join team rooms</small></span>
            <ArrowRight size={13} />
          </button>
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="card my-tasks-card">
          <div className="compact-card-heading">
            <div><h2>My Assigned Tasks</h2><p>Update your progress directly here</p></div>
            <button className="text-link" onClick={() => onNavigate("Tasks")}>All tasks <ArrowRight size={12} /></button>
          </div>
          <div className="my-task-list">
            {(myTasks.length ? myTasks : workspace.tasks.slice(0, 3)).slice(0, 4).map((t) => (
              <div className="my-task-row" key={t.id}>
                <div className="my-task-info">
                  <button onClick={() => onOpenModal({ type: "View Task", item: t })}>{t.name}</button>
                  <small>{t.project} · Due {t.due}</small>
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
          </div>
        </section>

        <section className="card ecosystem-banner">
          <div className="ecosystem-label"><Sparkles size={13} /> BeatsVibe One Ecosystem</div>
          <div className="ecosystem-copy">
            <img src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" className="ecosystem-brand-logo" />
            <strong>One corporate platform.<br />Every division aligned.</strong>
            <p>Outlook · Projects · Divisions · 7-Tier RBAC</p>
            <button className="button button-primary" onClick={() => onNavigate(canViewPage(user, "Company Overview", workspace) ? "Company Overview" : "Career & Internships")}>
              Explore our ecosystem <ArrowRight size={13} />
            </button>
          </div>
          <div className="ecosystem-art" aria-hidden="true">
            <div className="ecosystem-orbit" />
            <div className="ecosystem-card-stack">
              <div className="eco-mini-pill"><FolderKanban size={14} /> 6 Divisions</div>
              <div className="eco-mini-pill"><Mail size={14} /> Outlook Live</div>
              <div className="eco-mini-pill"><ShieldCheck size={14} /> 7-Tier RBAC</div>
            </div>
          </div>
        </section>

        <section className="card dashboard-activity-card">
          <div className="compact-card-heading">
            <div><h2>Recent Activity</h2><p>{["owner", "cto", "admin"].includes(user.role) ? "Live audit feed" : "Your recent activity"}</p></div>
            {canViewPage(user, "Security & Audit Logs", workspace) && (
              <button className="text-link" onClick={() => onNavigate("Security & Audit Logs")}>Audit log <ArrowRight size={12} /></button>
            )}
          </div>
          <div className="activity-list">
            {visibleActivity.slice(0, 4).map((log) => (
              <div className="activity-item" key={log.id}>
                <span className="avatar avatar-blue">{initialsFromName(log.actorName || log.actorEmail)}</span>
                <div>
                  <p><strong>{log.actorName || log.actorEmail}</strong> — {log.detail}</p>
                  <small>{new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} <i /> {log.action}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 13 }}>
        <div className="compact-card-heading">
          <div><h2>Company Performance</h2><p>Weekly project &amp; task throughput</p></div>
          <div className="performance-legend">
            <span><i className="legend-blue" /> Projects</span>
            <span><i className="legend-purple" /> Tasks</span>
          </div>
        </div>
        <div className="performance-bars">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 6, right: 8, left: -20, bottom: 0 }} barGap={6}>
              <CartesianGrid stroke="#edf1f6" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#74849a", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#74849a", fontSize: 11 }} />
              <Tooltip contentStyle={{ border: "1px solid #e4ebf4", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="projects" name="Projects" fill="#2589df" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" name="Tasks" fill="#9b8df2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}

function StatCard({ title, value, change, positive, icon: Icon, tone, points }) {
  return (
    <div className={`card stat-card stat-${tone}`}>
      <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
      <div className={`stat-trend ${positive ? "" : "warm"}`}>
        {positive && <ArrowUpRight size={12} />}{change}
      </div>
      <div className="stat-number">{value}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-spark">
        <Sparkline points={points} color={`var(--spark-${tone})`} fill={`var(--spark-fill-${tone})`} />
      </div>
    </div>
  );
}

function Sparkline({ points, color, fill }) {
  return (
    <svg viewBox="0 0 118 34" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={`0,34 ${points} 118,34`} fill={fill} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx="115" cy={points.split(" ").at(-1)?.split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

function SearchResults({ query, workspace, user, onSelect }) {
  const matches = useMemo(() => {
    const records = [
      ...navigation.flatMap((group) => group.items.map((item) => ({ title: item, detail: group.group, page: item }))),
      ...workspace.employees.map((item) => ({ title: item.name, detail: `${item.jobTitle} · ${item.division}`, page: "Employees" })),
      ...workspace.projects.map((item) => ({ title: item.name, detail: `${item.division} · ${item.status}`, page: "Projects" })),
      ...workspace.tasks.map((item) => ({ title: item.name, detail: `${item.project} · ${item.status}`, page: "Tasks" })),
      ...workspace.announcements.map((item) => ({ title: item.title, detail: "Announcement", page: "Announcements" })),
      ...workspace.documents.map((item) => ({ title: item.title, detail: "Document", page: "Documents" })),
      ...workspace.emails.map((item) => ({ title: item.subject, detail: `Outlook · ${item.fromName}`, page: "Outlook" })),
    ].filter((rec) => canViewPage(user, rec.page, workspace));
    const normalized = query.trim().toLowerCase();
    return records.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [query, workspace, user]);

  return (
    <div className="search-results">
      {matches.length ? matches.map((item, idx) => (
        <button key={`${item.page}-${item.title}-${idx}`} onClick={() => onSelect(item.page)}>
          <span className="search-result-icon"><Search size={13} /></span>
          <span><strong>{item.title}</strong><small>{item.detail}</small></span>
          <ArrowUpRight size={14} />
        </button>
      )) : (
        <div className="search-empty">No workspace results for &ldquo;{query}&rdquo;</div>
      )}
    </div>
  );
}

export default App;
