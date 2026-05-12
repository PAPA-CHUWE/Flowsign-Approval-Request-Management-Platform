"use client";

import {
  GitBranch, ShieldCheck, Bell, BarChart3,
  CheckCircle2, CircleCheckBig, Inbox, TriangleAlert,
} from "lucide-react";

interface FeaturePoint { text: string }
interface Feature {
  tag: string; tagColor: string; tagBg: string;
  Icon: React.ElementType; iconColor: string; iconBg: string;
  headline: string; body: string; points: FeaturePoint[];
  visual: React.ReactNode; reverse?: boolean;
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function Tag({ children, color, bg }: { children: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.07em] uppercase px-3 py-1 rounded-full font-dm-sans"
      style={{ color, background: bg }}
    >
      {children}
    </span>
  );
}

function Check({ color, bg }: { color: string; bg: string }) {
  return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg }}>
      <CheckCircle2 size={13} color={color} strokeWidth={2.5} />
    </div>
  );
}

// ─── Feature visuals ──────────────────────────────────────────────────────────
function WorkflowVisual() {
  const steps = [
    { initials: "LM", label: "Line Manager",       time: "14 min",   status: "done"    },
    { initials: "FC", label: "Finance Controller", time: "2h 10m",   status: "done"    },
    { initials: "CF", label: "CFO",                time: "Waiting…", status: "waiting" },
  ];
  return (
    <div className="bg-brand-neutral-pale rounded-[16px] p-6">
      <p className="text-[11px] font-bold text-brand-neutral-mid uppercase tracking-[0.07em] mb-5 font-dm-sans">
        Funds request · $12,500
      </p>
      {steps.map((s, i) => (
        <div key={s.initials} className="flex items-start gap-3.5">
          <div className="flex flex-col items-center">
            <div className={["w-9 h-9 rounded-full shrink-0 flex items-center justify-center", s.status === "done" ? "bg-brand-teal" : "bg-brand-amber-pale"].join(" ")}>
              {s.status === "done"
                ? <CheckCircle2 size={16} color="#ffffff" strokeWidth={2.5} />
                : <span className="text-[11px] font-bold text-brand-amber font-dm-sans">{s.initials}</span>
              }
            </div>
            {i < steps.length - 1 && (
              <div className={["w-0.5 h-7 my-1", s.status === "done" ? "bg-brand-teal-light" : "bg-brand-neutral-light"].join(" ")} />
            )}
          </div>
          <div className="flex-1 pt-1.5">
            <div className={["flex justify-between items-center", i < steps.length - 1 ? "mb-6" : ""].join(" ")}>
              <div>
                <p className="text-[13px] font-semibold text-brand-neutral-dark mb-0.5 font-dm-sans">{s.label}</p>
                <p className={["text-[11px] font-dm-sans", s.status === "done" ? "text-brand-teal-mid" : "text-brand-neutral-mid"].join(" ")}>{s.time}</p>
              </div>
              <span className={["text-[10px] px-2.5 py-[3px] rounded-full font-bold font-dm-sans", s.status === "done" ? "bg-brand-success-bg text-brand-success-text" : "bg-brand-amber-pale text-brand-amber"].join(" ")}>
                {s.status === "done" ? "Signed off" : "In review"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditVisual() {
  const events = [
    { initials: "AY", name: "Amina Yusuf",   action: "Submitted request",       time: "09:14", bg: "#E6F1FB", tc: "#185FA5" },
    { initials: "JK", name: "James Kamau",   action: "Approved — Line Manager", time: "09:28", bg: "#EAF3DE", tc: "#27500A" },
    { initials: "FC", name: "Finance Ctrl.", action: "Approved — Finance",      time: "11:40", bg: "#EAF3DE", tc: "#27500A" },
    { initials: "CF", name: "CFO Office",    action: "Signed & approved",       time: "14:05", bg: "#E1F5EE", tc: "#0F6E56" },
  ];
  return (
    <div className="bg-brand-neutral-pale rounded-[16px] p-5">
      <p className="text-[11px] font-bold text-brand-neutral-mid uppercase tracking-[0.07em] mb-4 font-dm-sans">
        Immutable audit trail
      </p>
      {events.map((e) => (
        <div key={e.initials + e.time} className="flex gap-3 items-center mb-3">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 font-dm-sans" style={{ background: e.bg, color: e.tc }}>
            {e.initials}
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-brand-neutral-dark mb-0.5 font-dm-sans">{e.name}</p>
            <p className="text-[11px] text-brand-neutral-mid font-dm-sans">{e.action}</p>
          </div>
          <span className="text-[10px] text-brand-neutral-mid shrink-0 font-dm-sans">{e.time}</span>
        </div>
      ))}
    </div>
  );
}

function NotifVisual() {
  const notifs = [
    { Icon: Inbox,         iconBg: "#E6F1FB", iconColor: "#185FA5", title: "New request awaiting you",   sub: "Funds · $12,500 · Amina Y.",    time: "Just now",  unread: true  },
    { Icon: CircleCheckBig,iconBg: "#EAF3DE", iconColor: "#27500A", title: "Your request was approved",  sub: "Travel to Nairobi · $3,450",    time: "2h ago",    unread: false },
    { Icon: TriangleAlert, iconBg: "#FAEEDA", iconColor: "#854F0B", title: "Escalation · action required",sub: "Asset request overdue 1d",     time: "Yesterday", unread: true  },
  ];
  return (
    <div className="bg-white rounded-[16px] border border-brand-neutral-light overflow-hidden">
      <div className="bg-brand-teal px-4 py-3">
        <p className="text-white text-[13px] font-bold font-dm-sans">Notifications</p>
      </div>
      {notifs.map((n) => (
        <div key={n.title} className={["flex gap-3 px-4 py-3 border-b border-brand-neutral-pale", n.unread ? "bg-brand-teal-pale" : "bg-white"].join(" ")}>
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: n.iconBg }}>
            <n.Icon size={17} color={n.iconColor} strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-brand-neutral-dark mb-0.5 font-dm-sans">{n.title}</p>
            <p className="text-[11px] text-brand-neutral-mid font-dm-sans">{n.sub}</p>
          </div>
          <span className="text-[10px] text-brand-neutral-mid shrink-0 font-dm-sans">{n.time}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [
    { day: "Mon", h: 65 }, { day: "Tue", h: 80 }, { day: "Wed", h: 55 },
    { day: "Thu", h: 90 }, { day: "Fri", h: 70 }, { day: "Sat", h: 85 }, { day: "Sun", h: 95 },
  ];
  return (
    <div className="bg-brand-neutral-pale rounded-[16px] p-[22px]">
      <p className="text-[11px] font-bold text-brand-neutral-mid uppercase tracking-[0.07em] mb-1 font-dm-sans">
        Approval volume this week
      </p>
      <p className="text-[26px] font-bold text-brand-teal mb-5 font-dm-sans">
        247 <span className="text-[12px] font-medium text-brand-success-text">↑ 18% vs last week</span>
      </p>
      <div className="flex items-end gap-2 h-[72px]">
        {bars.map((b) => (
          <div key={b.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-[4px]"
              style={{ height: `${b.h}%`, background: b.day === "Sun" ? "#0F6E56" : "#9FE1CB" }}
            />
            <span className="text-[9px] text-brand-neutral-mid font-dm-sans">{b.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <div className="text-center mb-[72px]" data-aos="fade-up">
      <Tag color="#0F6E56" bg="#E1F5EE">Features</Tag>
      <h2 className="font-dm-serif text-[clamp(32px,3.5vw,48px)] font-normal text-brand-neutral-dark leading-[1.1] tracking-[-0.02em] mt-4 mb-4">
        Built for the whole approval lifecycle.
      </h2>
      <p className="text-[17px] text-brand-neutral-mid leading-[1.65] max-w-[520px] mx-auto font-dm-sans">
        Not just a form tool. Flowsign handles routing, signing, notifications, and reporting — end to end.
      </p>
    </div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ feature }: { feature: Feature }) {
  const { tag, tagColor, tagBg, Icon, iconColor, iconBg, headline, body, points, visual, reverse } = feature;

  const copyBlock = (
    <div data-aos={reverse ? "fade-left" : "fade-right"}>
      <Tag color={tagColor} bg={tagBg}>{tag}</Tag>
      <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center my-5" style={{ background: iconBg }}>
        <Icon size={24} color={iconColor} strokeWidth={1.8} />
      </div>
      <h3 className="font-dm-serif text-[clamp(24px,2.4vw,32px)] font-normal text-brand-neutral-dark leading-[1.15] tracking-[-0.02em] mb-3.5">
        {headline}
      </h3>
      <p className="text-[15px] text-brand-neutral-mid leading-[1.65] mb-[22px] font-dm-sans">
        {body}
      </p>
      <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
        {points.map((p) => (
          <li key={p.text} className="flex items-start gap-2.5">
            <Check color={tagColor} bg={tagBg} />
            <span className="text-[14px] text-brand-neutral-dark leading-[1.5] font-dm-sans">{p.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const visualBlock = <div data-aos={reverse ? "fade-right" : "fade-left"} data-aos-delay="100">{visual}</div>;

  return (
    <div className="grid grid-cols-2 gap-16 items-center mb-24">
      {reverse ? <>{visualBlock}{copyBlock}</> : <>{copyBlock}{visualBlock}</>}
    </div>
  );
}

// ─── ProductSection ───────────────────────────────────────────────────────────
const ProductSection = () => {
  const features: Feature[] = [
    {
      tag: "Smart routing", tagColor: "#0F6E56", tagBg: "#E1F5EE",
      Icon: GitBranch, iconColor: "#0F6E56", iconBg: "#E1F5EE",
      headline: "Rules-based workflow engine. Zero manual forwarding.",
      body: "Configure approval chains once using IF/THEN rules — amount thresholds, request types, departments. Flowsign routes every request to the right people, in the right order, automatically. Escalates when approvers go quiet.",
      points: [
        { text: "IF amount > $5,000 → route to CFO automatically" },
        { text: "Parallel or sequential approval steps per workflow" },
        { text: "Auto-escalate after a custom inactivity window" },
        { text: "Delegation when an approver is out of office" },
      ],
      visual: <WorkflowVisual />, reverse: false,
    },
    {
      tag: "Audit trail", tagColor: "#185FA5", tagBg: "#E6F1FB",
      Icon: ShieldCheck, iconColor: "#185FA5", iconBg: "#E6F1FB",
      headline: "Every action, timestamped and tamper-proof.",
      body: "Every approval, rejection, comment, and escalation is logged with a UTC timestamp and actor identity. Exportable to CSV. Meets audit requirements for finance, healthcare, and public sector. You cannot delete a log entry.",
      points: [
        { text: "Who did what and exactly when — no exceptions" },
        { text: "Exportable CSV for compliance and external auditors" },
        { text: "Filter by date, user, request type, or outcome" },
        { text: "Retained for the full life of your account" },
      ],
      visual: <AuditVisual />, reverse: true,
    },
    {
      tag: "Notifications", tagColor: "#534AB7", tagBg: "#EEEDFE",
      Icon: Bell, iconColor: "#534AB7", iconBg: "#EEEDFE",
      headline: "Approvers act fast when they know instantly.",
      body: "The moment a request lands in someone's queue, they're notified — by email, in-app, or Slack. Requesters get real-time updates at every stage. No one needs to chase anyone.",
      points: [
        { text: "Email + in-app + Slack notifications out of the box" },
        { text: "Requester notified at every status change" },
        { text: "Escalation alerts automatically for overdue items" },
        { text: "Weekly digest summaries for busy approvers" },
      ],
      visual: <NotifVisual />, reverse: false,
    },
    {
      tag: "Analytics", tagColor: "#854F0B", tagBg: "#FAEEDA",
      Icon: BarChart3, iconColor: "#854F0B", iconBg: "#FAEEDA",
      headline: "See exactly where approvals are slowing down.",
      body: "Manager and admin dashboards show approval volume, average resolution time, rejection rates, and bottleneck approvers — so you can fix the process, not just the symptom.",
      points: [
        { text: "Approval volume by day, week, and month" },
        { text: "Average resolution time per request type" },
        { text: "Rejection rate and top rejection reasons" },
        { text: "Per-approver performance and queue depth" },
      ],
      visual: <AnalyticsVisual />, reverse: true,
    },
  ];

  return (
    <section id="features" className="bg-white py-[100px] px-[clamp(24px,6vw,100px)]">
      <div className="max-w-[1140px] mx-auto">
        <SectionHeader />
        {features.map((f) => <FeatureRow key={f.tag} feature={f} />)}
      </div>
    </section>
  );
};

export default ProductSection;
