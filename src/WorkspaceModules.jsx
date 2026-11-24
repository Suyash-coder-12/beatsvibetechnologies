import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, Check, CheckCheck,
  ChevronLeft, ChevronRight, CreditCard, Download, Filter, FlaskConical, FolderKanban,
  GraduationCap, ListFilter, LockKeyhole, MoreHorizontal, Plus, RotateCcw, Settings,
  ShieldCheck, Sparkles, Users, Video,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { moduleCopy } from "./data.js";
import { downloadFile, initialsFromName } from "./workspaceStore.js";

export function PageTitle({ eyebrow, title, description, actions }) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="title-actions">{actions}</div>
    </div>
  );
}

export function formatRole(role = "owner") {
  if (role.toLowerCase() === "cto") return "CTO";
  if (role.toLowerCase() === "hr") return "HR";
  return role.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function pageForDivision(name) {
  if (name === "BeatsVibe Career") return "Career & Internships";
  if (name === "BeatsVibe Employees") return "Employees";
  return name;
}

export function divisionIconKey(division) {
  if (division.icon) return division.icon;
  return {
    "beatsvibe-rd": "flask",
    "beatsvibe-career": "graduation",
    "beatsvibe-payments": "credit",
    "beatsvibe-employees": "users",
    "dbm-system": "briefcase",
    "vedaiq-veda": "sparkles",
  }[division.slug] || "briefcase";
}

function divisionIconComponent(icon) {
  const Icon = {
    flask: FlaskConical,
    credit: CreditCard,
    graduation: GraduationCap,
    sparkles: Sparkles,
    users: Users,
  }[icon] || BriefcaseBusiness;
  return <Icon />;
}

export function DivisionCard({ division, onOpen, projectCount }) {
  const Icon = {
    flask: FlaskConical,
    graduation: GraduationCap,
    credit: CreditCard,
    users: Users,
    briefcase: BriefcaseBusiness,
    sparkles: Sparkles,
  }[divisionIconKey(division)] || BriefcaseBusiness;
  const count = projectCount ?? division.projects ?? 0;
  return (
    <button className="card division-tile" onClick={onOpen}>
      <div className={`division-icon ${division.color || "blue"}`}><Icon size={18} /></div>
      <span className="tile-arrow"><ArrowUpRight size={15} /></span>
      <h3>{division.name}</h3>
      <p>{division.detail || division.description}</p>
      <div className="tile-meta">
        <span>{count} active projects</span>
        <span>{division.progress}%</span>
      </div>
      <div className="progress-track">
        <span className={division.color || "blue"} style={{ width: `${division.progress}%` }} />
      </div>
    </button>
  );
}

export function CompanyOverviewPage({ workspace, onNavigate }) {
  return (
    <>
      <PageTitle
        eyebrow="YOUR COMPANY"
        title="Company Overview"
        description="A central operational view of BeatsVibe Technologies, all 6 divisions, and active employees."
      />
      <div className="company-hero card">
        <div className="company-logo-frame">
          <img src="/beatsvibe-logo.png" alt="BeatsVibe Technologies" />
        </div>
        <div>
          <div className="eyebrow">COMPANY WORKSPACE · FOUNDER: SUYASH RATHOD · CTO: PAVAN LONDHE</div>
          <h2>{workspace.settings.companyName}</h2>
          <p>One unified corporate workspace connecting R&amp;D, VedaIQ, DBM System, Career Cohorts, and Outlook collaboration.</p>
          <span className="company-status">
            <i /> Active Workspace · {workspace.employees.length} Team Members · {workspace.projects.length} Projects
          </span>
        </div>
        <button className="button button-primary" onClick={() => onNavigate("Employees")}>
          View team directory <ArrowRight size={14} />
        </button>
      </div>

      <div className="division-cards">
        {workspace.divisions.map((division) => {
          const count = workspace.projects.filter((p) => p.division === division.name).length;
          return (
            <DivisionCard
              key={division.slug || division.name}
              division={division}
              projectCount={count}
              onOpen={() => onNavigate(pageForDivision(division.name))}
            />
          );
        })}
      </div>

      <div className="content-grid two-col">
        <InfoCard
          title="Employee Workflow Principles"
          items={[
            "Every team member signs in with role-scoped credentials",
            "Tasks support inline status tracking (To do → In progress → Done)",
            "Internal Outlook delivers emails directly across employee accounts",
            "All workspace changes record into Security & Audit Logs",
          ]}
          icon={ShieldCheck}
        />
        <InfoCard
          title="Architecture & Data Status"
          items={[
            "Frontend: React 18, Vite 6, Tailwind CSS, Recharts, Lucide",
            "Backend API: Node.js + Express 5 + Zod + Helmet + Firebase Admin",
            "Local Workspace Store syncs state smoothly across refreshes",
            "BeatsVibe Payments remains a non-transactional roadmap module",
          ]}
          icon={Activity}
        />
      </div>
    </>
  );
}

const divisionFocus = {
  "BeatsVibe R&D": [
    "AI development and OpenLLM experimentation",
    "Industrial predictive AI discovery",
    "AI integration for web & enterprise apps",
    "Research documentation & architecture reviews",
  ],
  "DBM System": [
    "Startup and client record onboarding",
    "Custom domain DNS & SSL provisioning",
    "Business email (SPF/DKIM) diagnostics",
    "Client service request tracking",
  ],
  "Career & Internships": [
    "Internship cohort onboarding & mentor pairing",
    "Training tasks and weekly progress reviews",
    "Verifiable certificate issuance & lookup",
    "Campus & cohort planning",
  ],
  "BeatsVibe Payments": [
    "Independent payment gateway architecture",
    "Compliance & PCI-DSS readiness roadmap",
    "Sandbox webhook specification",
    "No live money movement enabled in workspace",
  ],
  "VedaIQ – Veda": [
    "Veda AI product roadmap & sprint delivery",
    "Prompt benchmark & safety evaluation suites",
    "Latency & structured JSON reliability checks",
    "Responsible AI release milestones",
  ],
};

export function DivisionPage({
  page,
  workspace,
  onOpenModal,
  onNavigate,
  onToggleInternCert,
  onToggleDbmStatus,
}) {
  const [tab, setTab] = useState("overview");
  const isAll = page === "Divisions";
  const targetName = page === "Career & Internships" ? "BeatsVibe Career" : page;
  const division = workspace.divisions.find((d) => d.name === targetName) || workspace.divisions[0];

  if (isAll) {
    return (
      <>
        <PageTitle
          eyebrow="WORKSPACE"
          title="Divisions"
          description="Independent BeatsVibe teams and products connected through one shared workspace."
          actions={
            <button className="button button-primary" onClick={() => onOpenModal({ type: "Add Division" })}>
              <Plus size={16} /> Add division
            </button>
          }
        />
        <div className="division-cards">
          {workspace.divisions.map((item) => (
            <DivisionCard
              key={item.slug || item.name}
              division={item}
              projectCount={workspace.projects.filter((p) => p.division === item.name).length}
              onOpen={() => onNavigate(pageForDivision(item.name))}
            />
          ))}
        </div>
      </>
    );
  }

  const divisionProjects = workspace.projects.filter((p) => p.division === division.name);
  const divisionMembers = workspace.employees.filter((e) => e.division === division.name);

  return (
    <>
      <PageTitle
        eyebrow="DIVISION WORKSPACE"
        title={page}
        description={moduleCopy[page] || division.detail}
        actions={
          <>
            {page === "DBM System" && (
              <button
                className="button button-outline"
                onClick={() => onOpenModal({ type: "Add DBM Client" })}
              >
                <Plus size={15} /> Add client
              </button>
            )}
            <button
              className="button button-primary"
              onClick={() => onOpenModal({ type: "Create Project", defaultDivision: division.name })}
            >
              <Plus size={16} /> New initiative
            </button>
          </>
        }
      />

      <div className="module-banner">
        <span className={`division-icon large ${division.color}`}>{divisionIconComponent(division.icon)}</span>
        <div>
          <div className="eyebrow">ACTIVE DIVISION · LEAD: {division.lead || "Team Lead"}</div>
          <h2>{division.name}</h2>
          <p>{moduleCopy[page] || division.detail}</p>
        </div>
        <div className="module-metric">
          <strong>{divisionProjects.length}</strong>
          <span>Projects</span>
        </div>
        <div className="module-metric">
          <strong>{divisionMembers.length}</strong>
          <span>Members</span>
        </div>
        <div className="module-metric">
          <strong>{division.progress}%</strong>
          <span>Progress</span>
        </div>
      </div>

      <div className="workspace-tabs">
        {[
          ["overview", "Overview & Workstreams"],
          ["team", `Team Members (${divisionMembers.length})`],
          ["ops", page === "DBM System" ? "Client Domains & Mail" : page === "Career & Internships" ? "Intern Cohorts & Certs" : "Division Focus"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`tab-pill ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="content-grid two-col">
          <section className="card">
            <div className="card-heading">
              <div>
                <h2>Workstreams &amp; Projects</h2>
                <p>Click any project to update progress or inspect tasks</p>
              </div>
              <button
                className="text-link"
                onClick={() => onOpenModal({ type: "Create Project", defaultDivision: division.name })}
              >
                + Add
              </button>
            </div>
            <div className="workstream-list">
              {divisionProjects.map((proj) => (
                <button
                  key={proj.id || proj.name}
                  className="project-mini"
                  onClick={() => onOpenModal({ type: "View Project", item: proj })}
                >
                  <span className="project-mini-icon"><FolderKanban size={16} /></span>
                  <div>
                    <strong>{proj.name}</strong>
                    <span>{proj.status} <i /> Due {proj.due}</span>
                  </div>
                  <div className="mini-progress">
                    {proj.progress}%
                    <div className="progress-track"><span style={{ width: `${proj.progress}%` }} /></div>
                  </div>
                </button>
              ))}
              {divisionProjects.length === 0 && (
                <div className="empty-state">No projects in this division yet. Click &ldquo;New initiative&rdquo; above.</div>
              )}
            </div>
          </section>

          <InfoCard
            title="Division Focus & Milestones"
            items={divisionFocus[page] || ["Product roadmap", "Team execution", "Quality reviews"]}
            icon={Sparkles}
          />
        </div>
      )}

      {tab === "team" && (
        <div className="card table-card">
          <div className="table-toolbar">
            <div className="table-count"><strong>{divisionMembers.length}</strong> employees in {division.name}</div>
            <button
              className="button button-primary"
              onClick={() => onOpenModal({ type: "Add Employee", defaultDivision: division.name })}
            >
              <Plus size={14} /> Add member
            </button>
          </div>
          <div className="responsive-table">
            <table>
              <thead><tr><th>EMPLOYEE</th><th>JOB TITLE</th><th>ROLE</th><th>AVAILABILITY</th><th>STATUS</th></tr></thead>
              <tbody>
                {divisionMembers.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <button className="person-cell" onClick={() => onOpenModal({ type: "View Employee", item: person })}>
                        <span className={`avatar avatar-${person.color}`}>{person.initials}</span>
                        <span><strong>{person.name}</strong><small>{person.email}</small></span>
                      </button>
                    </td>
                    <td>{person.jobTitle}</td>
                    <td><span className="role-chip">{formatRole(person.role)}</span></td>
                    <td>{person.availability || "Available"}</td>
                    <td><span className={`status-pill ${person.status === "Active" ? "success" : "warning"}`}><i />{person.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {divisionMembers.length === 0 && <div className="empty-state">No team members assigned to this division yet.</div>}
          </div>
        </div>
      )}

      {tab === "ops" && page === "DBM System" && (
        <div className="card table-card">
          <div className="table-toolbar">
            <div className="table-count"><strong>{workspace.dbmClients.length}</strong> managed startup &amp; client workspaces</div>
            <button className="button button-primary" onClick={() => onOpenModal({ type: "Add DBM Client" })}>
              <Plus size={14} /> Provision client
            </button>
          </div>
          <div className="responsive-table">
            <table>
              <thead><tr><th>CLIENT</th><th>CUSTOM DOMAIN</th><th>BUSINESS EMAIL</th><th>PLAN</th><th>STATUS</th></tr></thead>
              <tbody>
                {workspace.dbmClients.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.client}</strong></td>
                    <td><code>{c.domain}</code></td>
                    <td>{c.emailService}</td>
                    <td>{c.plan}</td>
                    <td>
                      <button
                        className={`status-pill ${c.status === "Healthy" ? "success" : "warning"}`}
                        style={{ border: 0 }}
                        onClick={() => onToggleDbmStatus(c.id)}
                        title="Click to toggle status"
                      >
                        <i /> {c.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "ops" && page === "Career & Internships" && (
        <div className="card table-card">
          <div className="table-toolbar">
            <div className="table-count"><strong>{workspace.internCohorts.length}</strong> active cohort interns</div>
          </div>
          <div className="responsive-table">
            <table>
              <thead><tr><th>INTERN</th><th>TRACK</th><th>MENTOR</th><th>PROGRESS</th><th>CERTIFICATE</th></tr></thead>
              <tbody>
                {workspace.internCohorts.map((intern) => (
                  <tr key={intern.id}>
                    <td><strong>{intern.name}</strong><br /><small style={{ color: "#7a899e" }}>{intern.email}</small></td>
                    <td>{intern.track}</td>
                    <td>{intern.mentor}</td>
                    <td>
                      <div className="table-progress">
                        <div className="progress-track"><span style={{ width: `${intern.progress}%` }} /></div>
                        <span>{intern.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`status-pill ${intern.certStatus === "Verified" ? "success" : "info"}`}
                        style={{ border: 0 }}
                        onClick={() => onToggleInternCert(intern.id)}
                        title="Click to issue/verify certificate"
                      >
                        <i /> {intern.certStatus} · {intern.certCode}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "ops" && page !== "DBM System" && page !== "Career & Internships" && (
        <InfoCard
          title={`${page} Operational Checklist`}
          items={divisionFocus[page] || ["Roadmap tracking", "Weekly engineering review"]}
          icon={ShieldCheck}
        />
      )}
    </>
  );
}

export function DirectoryPage({
  page,
  workspace,
  search,
  onOpenModal,
  onUpdateEmployee,
}) {
  const [filter, setFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [sortAscending, setSortAscending] = useState(true);
  const usersPage = page === "User Management";

  const filtered = workspace.employees
    .filter((person) =>
      `${person.name} ${person.email} ${person.jobTitle} ${person.role} ${person.division}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((person) => filter === "All" || person.status === filter)
    .filter((person) => divisionFilter === "All" || person.division === divisionFilter);

  const sorted = sortAscending ? filtered : [...filtered].reverse();

  return (
    <>
      <PageTitle
        eyebrow={usersPage ? "ADMINISTRATION" : "PEOPLE"}
        title={usersPage ? "User management" : "Employee directory"}
        description={
          usersPage
            ? "Manage login credentials, role assignments, and active workspace access for every employee."
            : "Central employee directory across all BeatsVibe divisions. Click any employee to view tasks or update status."
        }
        actions={
          <button
            className="button button-primary"
            onClick={() => onOpenModal({ type: usersPage ? "Invite User" : "Add Employee" })}
          >
            <Plus size={16} /> {usersPage ? "Invite user" : "Add employee"}
          </button>
        }
      />

      <div className="content-grid three-col" style={{ marginBottom: 13, marginTop: 0 }}>
        <MetricCard icon={Users} label="Total employees" value={workspace.employees.length} detail="Active workspace accounts" />
        <MetricCard icon={CheckCheck} label="Active today" value={workspace.employees.filter((e) => e.status === "Active").length} detail="Available & collaborating" />
        <MetricCard icon={CalendarDays} label="On leave" value={workspace.employees.filter((e) => e.status === "On leave").length} detail="Scheduled absence" />
      </div>

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="table-count">
            <strong>{sorted.length}</strong> {usersPage ? "workspace accounts" : "employees"}
          </div>
          <div className="toolbar-actions">
            <div className="filter-select">
              <Filter size={14} />
              <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)}>
                <option value="All">All divisions</option>
                {workspace.divisions.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="filter-select">
              <Filter size={14} />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option>All</option>
                <option>Active</option>
                <option>On leave</option>
                <option>Inactive</option>
              </select>
            </div>
            <button className="button button-outline" onClick={() => setSortAscending(!sortAscending)}>
              <ListFilter size={15} /> Sort {sortAscending ? "A–Z" : "Z–A"}
            </button>
          </div>
        </div>

        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>JOB TITLE</th>
                <th>DIVISION</th>
                <th>{usersPage ? "CREDENTIAL STATUS" : "AVAILABILITY"}</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((person) => (
                <tr key={person.id}>
                  <td>
                    <button className="person-cell" onClick={() => onOpenModal({ type: "View Employee", item: person })}>
                      <span className={`avatar avatar-${person.color || "blue"}`}>{person.initials}</span>
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.email}</small>
                      </span>
                    </button>
                  </td>
                  <td>{person.jobTitle}</td>
                  <td>{person.division}</td>
                  <td>
                    {usersPage ? (
                      <span style={{ color: "#64748b", fontSize: 12 }}>Protected (••••••••)</span>
                    ) : (
                      person.availability || "Available"
                    )}
                  </td>
                  <td>
                    {usersPage ? (
                      <select
                        className="inline-status-select"
                        value={person.role}
                        disabled={person.role === "owner"}
                        onChange={(e) => onUpdateEmployee(person.id, { role: e.target.value })}
                      >
                        <option value="owner">Owner</option>
                        <option value="cto">CTO</option>
                        <option value="admin">Admin</option>
                        <option value="hr">HR</option>
                        <option value="team_leader">Team Leader</option>
                        <option value="employee">Employee</option>
                        <option value="intern">Intern</option>
                      </select>
                    ) : (
                      <span className="role-chip">{formatRole(person.role)}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${person.status === "Active" ? "success" : person.status === "Inactive" ? "neutral" : "warning"}`}>
                      <i />{person.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-button subtle-button"
                      aria-label="Inspect employee"
                      onClick={() => onOpenModal({ type: "View Employee", item: person })}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && <div className="empty-state">No employees match your filters.</div>}
        </div>
      </div>
    </>
  );
}

export function WorkTablePage({
  page,
  workspace,
  user,
  search,
  onOpenModal,
  onUpdateTask,
}) {
  const [filter, setFilter] = useState("All");
  const [onlyMine, setOnlyMine] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);
  const isProjects = page === "Projects";

  const baseRows = isProjects ? workspace.projects : workspace.tasks;
  const rows = baseRows
    .filter((item) => {
      if (!isProjects && onlyMine) {
        return (
          item.assigneeEmail?.toLowerCase() === user?.email?.toLowerCase()
          || item.assignee === user?.displayName
        );
      }
      return true;
    })
    .filter((item) => Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase()))
    .filter((item) => filter === "All" || item.status === filter);

  const sorted = sortAscending ? rows : [...rows].reverse();
  const statuses = isProjects
    ? ["All", "In progress", "In review", "Planning", "Completed", "On hold"]
    : ["All", "To do", "In progress", "In review", "Done"];

  return (
    <>
      <PageTitle
        eyebrow="WORKSPACE"
        title={page}
        description={
          isProjects
            ? "Track project progress, owners, and due dates across BeatsVibe divisions. Click any project to edit progress."
            : "Update task progress inline or click any task to post work updates and comments."
        }
        actions={
          <button
            className="button button-primary"
            onClick={() => onOpenModal({ type: isProjects ? "Create Project" : "Assign Task" })}
          >
            <Plus size={16} /> {isProjects ? "Create project" : "Assign task"}
          </button>
        }
      />

      <div className="content-grid four-col" style={{ marginBottom: 13, marginTop: 0 }}>
        {isProjects ? (
          <>
            <MetricCard icon={FolderKanban} label="Total projects" value={workspace.projects.length} detail="Across 6 divisions" />
            <MetricCard icon={Activity} label="In progress" value={workspace.projects.filter((p) => p.status === "In progress").length} detail="Active execution" />
            <MetricCard icon={CheckCheck} label="In review / Done" value={workspace.projects.filter((p) => ["In review", "Completed"].includes(p.status)).length} detail="Ready or shipped" />
            <MetricCard icon={Users} label="Planning" value={workspace.projects.filter((p) => p.status === "Planning").length} detail="Upcoming initiatives" />
          </>
        ) : (
          <>
            <MetricCard icon={Activity} label="Total tasks" value={workspace.tasks.length} detail="Team backlog" />
            <MetricCard icon={Users} label="My assigned tasks" value={workspace.tasks.filter((t) => t.assigneeEmail?.toLowerCase() === user?.email?.toLowerCase()).length} detail={user?.displayName || "Current user"} />
            <MetricCard icon={FolderKanban} label="In progress" value={workspace.tasks.filter((t) => t.status === "In progress").length} detail="Active today" />
            <MetricCard icon={CheckCheck} label="Completed" value={workspace.tasks.filter((t) => t.status === "Done").length} detail="Marked done" />
          </>
        )}
      </div>

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="table-count">
            <strong>{sorted.length}</strong> {isProjects ? "projects" : "tasks"}
          </div>
          <div className="toolbar-actions">
            {!isProjects && (
              <button
                className={`button ${onlyMine ? "button-primary" : "button-outline"}`}
                onClick={() => setOnlyMine(!onlyMine)}
              >
                {onlyMine ? "Showing: My tasks" : "My tasks only"}
              </button>
            )}
            <div className="filter-select">
              <Filter size={14} />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="button button-outline" onClick={() => setSortAscending(!sortAscending)}>
              <ListFilter size={15} /> Sort {sortAscending ? "A–Z" : "Z–A"}
            </button>
          </div>
        </div>

        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                {isProjects ? (
                  <><th>PROJECT</th><th>DIVISION</th><th>OWNER</th><th>PROGRESS</th><th>STATUS</th><th>DUE DATE</th></>
                ) : (
                  <><th>TASK</th><th>PROJECT</th><th>ASSIGNEE</th><th>PRIORITY</th><th>STATUS</th><th>DUE</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id || row.name}>
                  <td>
                    <button
                      className="table-link"
                      onClick={() => onOpenModal({ type: isProjects ? "View Project" : "View Task", item: row })}
                    >
                      {row.name}
                    </button>
                  </td>
                  {isProjects ? (
                    <>
                      <td>{row.division}</td>
                      <td>{row.owner}</td>
                      <td>
                        <div className="table-progress">
                          <div className="progress-track"><span style={{ width: `${row.progress}%` }} /></div>
                          <span>{row.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${row.status === "In progress" ? "info" : row.status === "Planning" ? "warning" : "success"}`}>
                          <i />{row.status}
                        </span>
                      </td>
                      <td>{row.due}</td>
                    </>
                  ) : (
                    <>
                      <td>{row.project}</td>
                      <td>{row.assignee}</td>
                      <td><span className={`priority ${(row.priority || "medium").toLowerCase()}`}>{row.priority}</span></td>
                      <td>
                        <select
                          className="inline-status-select"
                          value={row.status}
                          onChange={(e) => onUpdateTask(row.id, { status: e.target.value })}
                        >
                          <option>To do</option>
                          <option>In progress</option>
                          <option>In review</option>
                          <option>Done</option>
                        </select>
                      </td>
                      <td>{row.due}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && <div className="empty-state">No records match your filters.</div>}
        </div>
      </div>
    </>
  );
}

export function CalendarPage({ workspace, onOpenModal }) {
  const [month, setMonth] = useState(() => new Date(2026, 10, 1));
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from(
    { length: Math.ceil((startOfMonth.getDay() + daysInMonth) / 7) * 7 },
    (_, index) => new Date(month.getFullYear(), month.getMonth(), index - startOfMonth.getDay() + 1),
  );
  const today = new Date();

  const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return (
    <>
      <PageTitle
        eyebrow="COMMUNICATION"
        title="Calendar"
        description="Company events, sprint reviews, and team syncs. Click any event to RSVP or click a day to add."
        actions={
          <>
            <button className="button button-outline" onClick={() => onOpenModal({ type: "Schedule Meeting" })}>
              <Plus size={15} /> Schedule meeting
            </button>
            <button className="button button-primary" onClick={() => onOpenModal({ type: "Add Company Event" })}>
              <CalendarDays size={15} /> Add event
            </button>
          </>
        }
      />

      <div className="calendar-layout">
        <section className="card calendar-card">
          <div className="calendar-toolbar">
            <button className="icon-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">
              <ChevronLeft size={17} />
            </button>
            <h2>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
            <button className="icon-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">
              <ChevronRight size={17} />
            </button>
            <button className="button button-outline today-button" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
              Today
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekday-row">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="days-grid">
              {calendarDays.map((date) => {
                const key = dateKey(date);
                const dayEvents = workspace.events.filter((ev) => (ev.startAt ? ev.startAt.slice(0, 10) : "") === key);
                const isToday = key === dateKey(today);
                return (
                  <div
                    className={`calendar-day ${date.getMonth() !== month.getMonth() ? "outside" : ""} ${isToday ? "today" : ""}`}
                    key={key}
                    onDoubleClick={() => onOpenModal({ type: "Add Company Event", defaultDate: key })}
                  >
                    <span>{date.getDate()}</span>
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        className={`calendar-event ${ev.color || "blue"}`}
                        onClick={() => onOpenModal({ type: "View Event", item: ev })}
                      >
                        {ev.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="calendar-foot">
            <span><i style={{ background: "#4a80d6" }} /> Company events</span>
            <span><i style={{ background: "#896fd1" }} /> Team meetings</span>
            <span className="demo-inline">Double-click any day to add an event</span>
          </div>
        </section>

        <aside className="card agenda-card">
          <div className="card-heading">
            <div><h2>Upcoming Agenda</h2><p>{workspace.events.length} scheduled items</p></div>
          </div>
          {workspace.events.map((event) => (
            <button
              className="agenda-event"
              key={event.id}
              onClick={() => onOpenModal({ type: "View Event", item: event })}
            >
              <div className={`event-date ${event.color}`}>
                <strong>{event.day || event.date}</strong>
                <span>{event.month}</span>
              </div>
              <div>
                <strong>{event.title}</strong>
                <span>{event.time}</span>
              </div>
            </button>
          ))}
          <button className="button button-outline agenda-add" onClick={() => onOpenModal({ type: "Add Company Event" })}>
            <Plus size={14} /> Add event
          </button>
        </aside>
      </div>
    </>
  );
}

export function MeetingsPage({ workspace, user, onOpenModal, onRsvpEvent, onNotify }) {
  const meetings = workspace.events.filter((e) => e.type === "meeting" || e.title.toLowerCase().includes("sync") || e.title.toLowerCase().includes("review"));
  const myEmail = user?.email?.toLowerCase() || "";

  return (
    <>
      <PageTitle
        eyebrow="COMMUNICATION"
        title="Meetings Hub"
        description="Join active video rooms, review agendas, and update your meeting RSVP status."
        actions={
          <button className="button button-primary" onClick={() => onOpenModal({ type: "Schedule Meeting" })}>
            <Plus size={16} /> Schedule meeting
          </button>
        }
      />

      <div className="resource-grid">
        {meetings.map((m) => {
          const myRsvp = m.rsvps?.[myEmail] || "Pending";
          return (
            <article className="card resource-card" key={m.id}>
              <div className="resource-card-top">
                <span className="resource-icon resource-1"><Video size={18} /></span>
                <span className={`status-pill ${myRsvp === "Accepted" ? "success" : myRsvp === "Declined" ? "neutral" : "warning"}`}>
                  <i /> RSVP: {myRsvp}
                </span>
              </div>
              <span className="resource-label">{m.day || m.date} {m.month} · {m.time}</span>
              <h2>{m.title}</h2>
              <p>{m.details || "Scheduled BeatsVibe team sync."}</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {["Accepted", "Tentative", "Declined"].map((status) => (
                  <button
                    key={status}
                    className={`button btn-xs ${myRsvp === status ? "button-primary" : "button-outline"}`}
                    onClick={() => onRsvpEvent(m.id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="resource-card-footer">
                <span><strong>Organizer: {m.organizer || "Team Lead"}</strong><small>{m.location || "Online"}</small></span>
                <button
                  className="button button-primary btn-xs"
                  onClick={() => onNotify(`Joined "${m.title}" (${m.location || "BeatsVibe Meet"}).`)}
                >
                  Join <ArrowRight size={12} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export function ResourceListPage({ page, workspace, user, search, onOpenModal, onAckAnnouncement }) {
  const isAnnouncements = page === "Announcements";
  const [catFilter, setCatFilter] = useState("All");
  const source = isAnnouncements ? workspace.announcements : workspace.documents;
  const categories = ["All", ...new Set(source.map((s) => s.label))];

  const rows = source
    .filter((item) => catFilter === "All" || item.label === catFilter)
    .filter((item) => `${item.title} ${item.description} ${item.label}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageTitle
        eyebrow="COMMUNICATION"
        title={page}
        description={
          isAnnouncements
            ? "Company updates and team notices. Employees can acknowledge updates directly."
            : "Shared knowledge base, research notes, and SOP documents. Click any card to read or export."
        }
        actions={
          <button
            className="button button-primary"
            onClick={() => onOpenModal({ type: isAnnouncements ? "Publish Announcement" : "Add Document" })}
          >
            <Plus size={16} /> {isAnnouncements ? "New announcement" : "Add document"}
          </button>
        }
      />

      <div className="workspace-tabs">
        {categories.map((cat) => (
          <button key={cat} className={`tab-pill ${catFilter === cat ? "active" : ""}`} onClick={() => setCatFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="resource-grid">
        {rows.map((item, index) => {
          const acks = item.acknowledgedBy || [];
          const hasAcked = acks.includes(user?.email?.toLowerCase());
          return (
            <article className="card resource-card" key={item.id || item.title}>
              <div className="resource-card-top">
                <span className={`resource-icon resource-${index % 3}`}>
                  {isAnnouncements ? <Activity size={18} /> : <Settings size={18} />}
                </span>
                {isAnnouncements && (
                  <button
                    className={`button btn-xs ${hasAcked ? "button-outline" : "button-primary"}`}
                    onClick={() => onAckAnnouncement(item.id)}
                  >
                    <Check size={12} /> {acks.length}
                  </button>
                )}
              </div>
              <span className="resource-label">{item.label}</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="resource-card-footer">
                <span className="avatar avatar-blue">{initialsFromName(item.author)}</span>
                <span>
                  <strong>{item.author}</strong>
                  <small>{item.time}</small>
                </span>
                <button
                  className="text-link"
                  onClick={() => onOpenModal({ type: isAnnouncements ? "View Announcement" : "View Document", item })}
                >
                  Open <ArrowRight size={13} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export function AnalyticsPage({ page, workspace, onNotify }) {
  const [range, setRange] = useState("30 Days");
  const multiplier = range === "7 Days" ? 0.5 : range === "Quarter" ? 2 : range === "YTD" ? 3 : 1;

  const doneTasks = workspace.tasks.filter((t) => t.status === "Done").length;
  const taskCompletionPct = workspace.tasks.length ? Math.round((doneTasks / workspace.tasks.length) * 100) : 0;
  const avgDivProgress = workspace.divisions.length
    ? Math.round(workspace.divisions.reduce((sum, d) => sum + d.progress, 0) / workspace.divisions.length)
    : 0;

  const trendData = useMemo(() => {
    const base = [
      { month: "Jun", projects: 4, tasks: 18 },
      { month: "Jul", projects: 5, tasks: 24 },
      { month: "Aug", projects: 4, tasks: 29 },
      { month: "Sep", projects: 6, tasks: 35 },
      { month: "Oct", projects: 7, tasks: 42 },
      { month: "Nov", projects: workspace.projects.length, tasks: workspace.tasks.length * 5 },
    ];
    return base.map((b) => ({
      ...b,
      projects: Math.round(b.projects * multiplier),
      tasks: Math.round(b.tasks * multiplier),
    }));
  }, [multiplier, workspace.projects.length, workspace.tasks.length]);

  const leaderboard = workspace.employees.map((emp) => {
    const assigned = workspace.tasks.filter((t) => t.assigneeEmail?.toLowerCase() === emp.email?.toLowerCase());
    const completed = assigned.filter((t) => t.status === "Done").length;
    return { ...emp, assignedCount: assigned.length, completedCount: completed };
  });

  const handleExport = () => {
    const csvRows = [
      ["Metric", "Value", "Range"],
      ["Total Employees", workspace.employees.length, range],
      ["Total Projects", workspace.projects.length, range],
      ["Total Tasks", workspace.tasks.length, range],
      ["Completed Tasks", doneTasks, range],
      ["Avg Division Progress", `${avgDivProgress}%`, range],
    ];
    downloadFile(
      `beatsvibe-${page.toLowerCase().replace(/\s+/g, "-")}.csv`,
      csvRows.map((r) => r.join(",")).join("\n"),
      "text/csv",
    );
    onNotify(`Exported ${page} (${range}) as CSV.`);
  };

  return (
    <>
      <PageTitle
        eyebrow="INSIGHTS & REPORTS"
        title={page}
        description="Live operational metrics computed from your workspace employees, divisions, projects, and tasks."
        actions={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div className="filter-select">
              <select value={range} onChange={(e) => setRange(e.target.value)}>
                <option>7 Days</option>
                <option>30 Days</option>
                <option>Quarter</option>
                <option>YTD</option>
              </select>
            </div>
            <button className="button button-primary" onClick={handleExport}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        }
      />

      <div className="content-grid four-col" style={{ marginTop: 0 }}>
        <MetricCard icon={FolderKanban} label="Active projects" value={workspace.projects.length} detail={`${range} scope`} />
        <MetricCard icon={CheckCheck} label="Task completion" value={`${taskCompletionPct}%`} detail={`${doneTasks} of ${workspace.tasks.length} done`} />
        <MetricCard icon={Users} label="Active team" value={workspace.employees.filter((e) => e.status === "Active").length} detail={`${workspace.employees.length} total members`} />
        <MetricCard icon={Activity} label="Avg division progress" value={`${avgDivProgress}%`} detail={`Across ${workspace.divisions.length} divisions`} />
      </div>

      <div className="content-grid two-col">
        <section className="card">
          <div className="card-heading">
            <div><h2>Workspace Delivery Velocity</h2><p>Projects vs tasks ({range})</p></div>
          </div>
          <div className="performance-chart chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid stroke="#edf1f6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#74849a", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#74849a", fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="tasks" name="Tasks" stroke="#89b8ee" fill="#89b8ee" fillOpacity={0.22} />
                <Area type="monotone" dataKey="projects" name="Projects" stroke="#2e6fd1" fill="#2e6fd1" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <div className="card-heading">
            <div><h2>Division Performance</h2><p>Completion across BeatsVibe teams</p></div>
          </div>
          <div className="division-list">
            {workspace.divisions.map((division) => {
              const Icon = { flask: FlaskConical, graduation: GraduationCap, credit: CreditCard, users: Users, briefcase: BriefcaseBusiness, sparkles: Sparkles }[divisionIconKey(division)] || BriefcaseBusiness;
              return (
                <div className="division-row" key={division.name}>
                  <div className={`division-icon ${division.color}`}><Icon size={17} /></div>
                  <div className="division-name">
                    <strong>{division.name}</strong>
                    <span>Lead: {division.lead || "Team"}</span>
                  </div>
                  <div className="division-progress">
                    <div className="progress-track"><span className={division.color} style={{ width: `${division.progress}%` }} /></div>
                    <span>{division.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="card table-card">
        <div className="card-heading inside">
          <div><h2>Employee Task Contributions</h2><p>Live task workload and completion across employees</p></div>
        </div>
        <div className="responsive-table">
          <table>
            <thead><tr><th>EMPLOYEE</th><th>DIVISION</th><th>ASSIGNED TASKS</th><th>COMPLETED</th><th>AVAILABILITY</th></tr></thead>
            <tbody>
              {leaderboard.map((emp) => (
                <tr key={emp.id}>
                  <td><strong>{emp.name}</strong> <small style={{ color: "#7a899e" }}>({formatRole(emp.role)})</small></td>
                  <td>{emp.division}</td>
                  <td>{emp.assignedCount}</td>
                  <td><span className="status-pill success"><i />{emp.completedCount} done</span></td>
                  <td>{emp.availability || "Available"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function RolesPermissionsPage({ workspace, user, onTogglePermission }) {
  const canEdit = ["owner", "cto", "admin"].includes(user?.role);
  const roles = Object.entries(workspace.roleMatrix);

  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRATION"
        title="Roles & Permissions"
        description="Role-based access matrix enforced across backend Express routes and workspace workflows."
      />
      <div className="permission-alert">
        <ShieldCheck size={18} />
        <div>
          <strong>Role-Based Access Control Active</strong>
          <p>You are signed in as <b>{formatRole(user?.role)}</b>. {canEdit ? "As Owner/Admin, you can toggle capability switches below." : "Switch to an Owner or Admin account to modify matrix switches."}</p>
        </div>
      </div>

      <div className="card table-card">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>ROLE</th>
                <th>WORKSPACE SCOPE</th>
                <th>MANAGE USERS</th>
                <th>EDIT SETTINGS</th>
                <th>EDIT PROJECTS</th>
                <th>EDIT EMPLOYEES</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(([roleKey, info]) => (
                <tr key={roleKey}>
                  <td><strong>{info.label}</strong></td>
                  <td>{info.workspace}</td>
                  {["canManageUsers", "canManageSettings", "canEditProjects", "canEditEmployees"].map((perm) => (
                    <td key={perm}>
                      <input
                        type="checkbox"
                        checked={Boolean(info[perm])}
                        disabled={!canEdit || roleKey === "owner"}
                        onChange={() => onTogglePermission(roleKey, perm)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function CompanySettingsPage({ workspace, onSaveSettings, onResetWorkspace, onNotify }) {
  const [tab, setTab] = useState("General");
  const [form, setForm] = useState(workspace.settings);

  useEffect(() => {
    setForm(workspace.settings);
  }, [workspace.settings]);

  const submit = (e) => {
    e.preventDefault();
    onSaveSettings(form);
  };

  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRATION"
        title="Company Settings"
        description="Manage workspace configuration, Outlook preferences, security policies, and data backups."
      />
      <div className="settings-layout">
        <div className="settings-nav card">
          {["General", "Workspace", "Integrations", "Security", "Data & backup"].map((item) => (
            <button key={item} className={tab === item ? "chosen" : ""} onClick={() => setTab(item)}>
              {item}<ChevronRight size={14} />
            </button>
          ))}
        </div>

        <form className="card settings-panel" onSubmit={submit}>
          <div className="card-heading">
            <div><h2>{tab} Settings</h2><p>Saved directly to your active BeatsVibe workspace</p></div>
          </div>

          {tab === "General" && (
            <div className="settings-form-grid">
              <label>Company name<input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></label>
              <label>Platform name<input value={form.platformName} onChange={(e) => setForm({ ...form, platformName: e.target.value })} /></label>
              <label>Support email<input value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} /></label>
              <label>Default timezone
                <select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                  <option>Asia/Kolkata (UTC+05:30)</option>
                  <option>Pacific Time (UTC-08:00)</option>
                  <option>UTC (UTC+00:00)</option>
                </select>
              </label>
            </div>
          )}

          {tab === "Workspace" && (
            <div className="settings-form-grid">
              <label>Standard working hours<input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} /></label>
              <label>Internal Outlook enabled
                <select value={form.outlookEnabled ? "yes" : "no"} onChange={(e) => setForm({ ...form, outlookEnabled: e.target.value === "yes" })}>
                  <option value="yes">Enabled for all employees</option>
                  <option value="no">Disabled</option>
                </select>
              </label>
            </div>
          )}

          {tab === "Integrations" && (
            <div style={{ padding: 16 }}>
              <InfoCard
                title="Connected Workspace Services"
                items={[
                  "BeatsVibe Internal Outlook Webmail: Active",
                  "Firebase Authentication & Realtime Database Schema: Ready",
                  "Express 5 RBAC API Server: Configured",
                ]}
                icon={Sparkles}
              />
            </div>
          )}

          {tab === "Security" && (
            <div className="settings-form-grid">
              <label>Audit event logging
                <select value={form.auditLogging ? "yes" : "no"} onChange={(e) => setForm({ ...form, auditLogging: e.target.value === "yes" })}>
                  <option value="yes">Enabled (record every change)</option>
                  <option value="no">Paused</option>
                </select>
              </label>
              <label>Strong password policy (12+ chars in Firebase)
                <select value={form.requireStrongPasswords ? "yes" : "no"} onChange={(e) => setForm({ ...form, requireStrongPasswords: e.target.value === "yes" })}>
                  <option value="yes">Enforced</option>
                  <option value="no">Optional (Local demo)</option>
                </select>
              </label>
            </div>
          )}

          {tab === "Data & backup" && (
            <div style={{ padding: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  downloadFile("beatsvibe-workspace-backup.json", JSON.stringify(workspace, null, 2));
                  onNotify("Workspace JSON backup downloaded.");
                }}
              >
                <Download size={14} /> Export Workspace Backup
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={onResetWorkspace}
              >
                <RotateCcw size={14} /> Reset Demo Data to Defaults
              </button>
            </div>
          )}

          {tab !== "Data & backup" && tab !== "Integrations" && (
            <div className="settings-panel-footer">
              <button type="submit" className="button button-primary">Save settings</button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

export function AuditLogsPage({ workspace, search, onNotify }) {
  const rows = workspace.auditLogs.filter((row) =>
    `${row.action} ${row.actorEmail} ${row.detail}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRATION"
        title="Security & Audit Logs"
        description="Live operational audit trail recording logins, task updates, employee onboarding, and Outlook messages."
        actions={
          <button
            className="button button-outline"
            onClick={() => {
              downloadFile("beatsvibe-audit-logs.json", JSON.stringify(rows, null, 2));
              onNotify("Audit logs exported.");
            }}
          >
            <Download size={15} /> Export JSON
          </button>
        }
      />
      <div className="card table-card">
        <div className="card-heading inside">
          <div><h2>Recent Audit Events ({rows.length})</h2><p>Automatically recorded across all employee actions</p></div>
        </div>
        <div className="audit-list">
          {rows.map((row) => (
            <div className="audit-row" key={row.id}>
              <span className={`audit-symbol ${row.tone || "info"}`}><ShieldCheck size={15} /></span>
              <strong>{row.action}</strong>
              <span>{row.actorEmail} · {row.detail}</span>
              <small>{new Date(row.createdAt).toLocaleString()}</small>
            </div>
          ))}
          {rows.length === 0 && <div className="empty-state">No audit logs match this search.</div>}
        </div>
      </div>
    </>
  );
}

export function ProfilePage({ user, onUpdateProfile, onNotify }) {
  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    jobTitle: user?.jobTitle || "",
    phone: user?.phone || "",
    location: user?.location || "",
    availability: user?.availability || "Available",
    bio: user?.bio || "",
    newPassword: "",
  });

  const submit = (e) => {
    e.preventDefault();
    onUpdateProfile({
      name: form.displayName,
      jobTitle: form.jobTitle,
      phone: form.phone,
      location: form.location,
      availability: form.availability,
      bio: form.bio,
      ...(form.newPassword.trim() ? { password: form.newPassword.trim() } : {}),
    });
    setForm((prev) => ({ ...prev, newPassword: "" }));
    onNotify("Your profile and availability were saved.");
  };

  return (
    <>
      <PageTitle
        eyebrow="MY ACCOUNT"
        title="My profile"
        description="Update your BeatsVibe employee details, live availability status, and password."
      />
      <div className="card profile-panel">
        <form className="profile-form" onSubmit={submit}>
          <div className="profile-identity">
            <span className="avatar avatar-owner">{user?.initials || initialsFromName(user?.email)}</span>
            <div>
              <strong>{form.displayName || user?.email}</strong>
              <span>{formatRole(user?.role)} · {user?.division} · {form.availability}</span>
            </div>
          </div>

          <div className="profile-fields">
            <label>Work email (Login ID)<input value={user?.email || ""} readOnly /></label>
            <label>Workspace role<input value={formatRole(user?.role)} readOnly /></label>
            <label>Display name<input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></label>
            <label>Job title<input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
            <label>Availability status
              <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                <option>Available</option>
                <option>Focus mode</option>
                <option>In a meeting</option>
                <option>On leave</option>
              </select>
            </label>
            <label>Update login password<input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="Leave blank to keep current" /></label>
            <label className="full-span">Bio / Role focus<textarea rows="2" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
          </div>

          <div className="profile-form-footer">
            <span>Changes sync immediately across Employee Directory and Outlook.</span>
            <button type="submit" className="button button-primary">Save profile</button>
          </div>
        </form>
      </div>
    </>
  );
}

export function InfoCard({ title, items, icon: Icon }) {
  return (
    <section className="card info-card">
      <div className="card-heading">
        <div><h2>{title}</h2><p>BeatsVibe One workspace</p></div>
        <span className="info-card-icon"><Icon size={17} /></span>
      </div>
      <div className="info-list">
        {items.map((item) => (
          <div key={item}><span className="info-check"><Check size={13} /></span>{item}</div>
        ))}
      </div>
    </section>
  );
}

export function MetricCard({ icon: Icon = Activity, label, value, detail }) {
  return (
    <div className="card metric-card">
      <div className="metric-label">{Icon && <Icon size={15} />}{label}</div>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}
