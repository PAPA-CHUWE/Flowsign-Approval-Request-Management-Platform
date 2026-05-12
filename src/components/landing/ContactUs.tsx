"use client";

import { useState } from "react";
import {
  Mail, Phone, MapPin, ArrowRight, CheckCircle2,
  MessageSquare, Calendar, Headphones,
} from "lucide-react";

interface FormState {
  name: string; email: string; org: string;
  industry: string; size: string; message: string;
}

const INDUSTRIES = [
  "Financial Services", "NGO / Development", "Healthcare",
  "Technology", "Government / Public Sector", "Education", "Other",
];

const ORG_SIZES = ["1–25 people", "26–100 people", "101–500 people", "500+ people"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-brand-neutral-mid font-dm-sans tracking-[0.02em]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = (focused: boolean) =>
  [
    "w-full px-3.5 py-[11px] rounded-[10px] border-[1.5px] text-[14px] text-brand-neutral-dark font-dm-sans outline-none transition-all duration-[180ms]",
    focused
      ? "border-brand-teal-mid bg-white shadow-[0_0_0_3px_#E1F5EE]"
      : "border-brand-neutral-light bg-brand-neutral-pale",
  ].join(" ");

function ContactItem({ Icon, label, value }: { Icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-10 h-10 rounded-xl bg-white/[0.12] border border-white/[0.16] flex items-center justify-center shrink-0">
        <Icon size={17} color="#9FE1CB" strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[11px] text-white/50 mb-0.5 font-dm-sans font-semibold uppercase tracking-[0.06em]">{label}</p>
        <p className="text-[14px] text-white font-dm-sans font-medium">{value}</p>
      </div>
    </div>
  );
}

function ReasonItem({ Icon, title, desc }: { Icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-[34px] h-[34px] rounded-[10px] bg-white/[0.1] border border-white/[0.14] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} color="#9FE1CB" strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[13px] font-bold text-white mb-0.5 font-dm-sans">{title}</p>
        <p className="text-[12px] text-white/55 font-dm-sans leading-[1.5]">{desc}</p>
      </div>
    </div>
  );
}

const ContactUs = () => {
  const [form, setForm] = useState<FormState>({ name: "", email: "", org: "", industry: "", size: "", message: "" });
  const [focused, setFocused] = useState<keyof FormState | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const valid = form.name.trim() && form.email.includes("@") && form.message.trim();

  return (
    <div className="bg-brand-neutral-pale min-h-screen font-dm-sans">
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-[clamp(20px,5vw,80px)] py-[60px]">
        <div className="w-full max-w-[980px] bg-white rounded-[24px] shadow-[0_8px_48px_rgba(0,0,0,0.08),0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-2" data-aos="fade-up">

          {/* LEFT: Copy + contact info */}
          <div className="bg-gradient-to-br from-brand-teal to-[#085041] px-11 py-[52px] flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-[60px] -right-[60px] w-[220px] h-[220px] rounded-full bg-white/[0.04] pointer-events-none" />
            <div className="absolute -bottom-[80px] -left-[40px] w-[200px] h-[200px] rounded-full bg-white/[0.03] pointer-events-none" />

            <div>
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-brand-teal-light mb-4 font-dm-sans">
                We&apos;re here to help you
              </p>
              <h1 className="font-dm-serif text-[clamp(28px,3vw,38px)] font-normal text-white leading-[1.15] tracking-[-0.02em] mb-4">
                <span className="text-brand-teal-light">Discuss</span> your
                <br />approval workflow
                <br />needs.
              </h1>
              <p className="text-[14px] text-white/65 leading-[1.65] mb-10 font-dm-sans max-w-[300px]">
                Whether you&apos;re evaluating Flowsign, want a custom demo, or have a question — we read and reply to every message within 24 hours.
              </p>
              <div className="flex flex-col gap-[18px] mb-11">
                <ReasonItem Icon={MessageSquare} title="General enquiry" desc="Questions about how Flowsign works" />
                <ReasonItem Icon={Calendar}     title="Book a live demo" desc="See Flowsign set up for your org"   />
                <ReasonItem Icon={Headphones}   title="Early access"     desc="Be one of our first 20 customers"   />
              </div>
            </div>

            <div className="flex flex-col gap-[18px]">
              <ContactItem Icon={Mail}   label="E-mail"       value="hello@flowsign.co.zw" />
              <ContactItem Icon={Phone}  label="Phone"        value="+263 77 788 8888"     />
              <ContactItem Icon={MapPin} label="Headquarters" value="Harare, Zimbabwe"     />
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="px-11 py-[52px] bg-white">
            {!submitted ? (
              <>
                <h2 className="font-dm-serif text-[24px] font-normal text-brand-neutral-dark mb-1.5 tracking-[-0.01em]">
                  Send us a message
                </h2>
                <p className="text-[13px] text-brand-neutral-mid mb-8 font-dm-sans">
                  We&apos;ll get back to you within one business day.
                </p>

                <div className="flex flex-col gap-[18px]">
                  <Field label="Full name *">
                    <input type="text" placeholder="Jane Smith" value={form.name} onChange={set("name")}
                      onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                      className={inputCls(focused === "name")} />
                  </Field>

                  <Field label="Work email *">
                    <input type="email" placeholder="jane@organisation.com" value={form.email} onChange={set("email")}
                      onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                      className={inputCls(focused === "email")} />
                  </Field>

                  <Field label="Organisation name">
                    <input type="text" placeholder="Meridian Capital" value={form.org} onChange={set("org")}
                      onFocus={() => setFocused("org")} onBlur={() => setFocused(null)}
                      className={inputCls(focused === "org")} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Industry">
                      <select value={form.industry} onChange={set("industry")}
                        onFocus={() => setFocused("industry")} onBlur={() => setFocused(null)}
                        className={[inputCls(focused === "industry"), "cursor-pointer appearance-none pr-8"].join(" ")}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235F5E5A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                      >
                        <option value="">Select…</option>
                        {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </Field>

                    <Field label="Team size">
                      <select value={form.size} onChange={set("size")}
                        onFocus={() => setFocused("size")} onBlur={() => setFocused(null)}
                        className={[inputCls(focused === "size"), "cursor-pointer appearance-none pr-8"].join(" ")}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235F5E5A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                      >
                        <option value="">Select…</option>
                        {ORG_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>

                  <Field label="Message *">
                    <textarea placeholder="Tell us what you're trying to solve…" value={form.message} onChange={set("message")}
                      onFocus={() => setFocused("message")} onBlur={() => setFocused(null)} rows={4}
                      className={[inputCls(focused === "message"), "resize-y min-h-[100px] leading-[1.6]"].join(" ")} />
                  </Field>

                  <button
                    onClick={() => { if (valid) setSubmitted(true); }}
                    disabled={!valid}
                    className={[
                      "flex items-center justify-center gap-2.5 px-6 py-[13px] rounded-xl border-none text-[14px] font-bold font-dm-sans transition-all duration-200 self-start",
                      valid
                        ? "bg-gradient-to-br from-brand-teal to-brand-teal-mid text-white cursor-pointer shadow-[0_4px_20px_rgba(15,110,86,0.25)]"
                        : "bg-brand-neutral-light text-brand-neutral-mid cursor-not-allowed",
                    ].join(" ")}
                  >
                    <div className={["w-[26px] h-[26px] rounded-full flex items-center justify-center", valid ? "bg-white/20" : "bg-black/5"].join(" ")}>
                      <ArrowRight size={14} color={valid ? "#ffffff" : "#5F5E5A"} strokeWidth={2.5} />
                    </div>
                    Send message
                  </button>

                  <p className="text-[11px] text-brand-neutral-light font-dm-sans">
                    * Required fields. We never share your data with third parties.
                  </p>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-5">
                <div className="w-16 h-16 rounded-full bg-brand-teal-pale flex items-center justify-center mb-5 border-2 border-brand-teal-light">
                  <CheckCircle2 size={30} color="#0F6E56" strokeWidth={2} />
                </div>
                <h2 className="font-dm-serif text-[26px] font-normal text-brand-neutral-dark mb-2.5 tracking-[-0.01em]">
                  Message received.
                </h2>
                <p className="text-[14px] text-brand-neutral-mid leading-[1.65] font-dm-sans max-w-[280px] mb-8">
                  Thank you, {form.name.split(" ")[0]}. We&apos;ll reply to <strong>{form.email}</strong> within one business day.
                </p>
                <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
                  {[
                    "Message sent to our team",
                    "Reply within 1 business day",
                    "No spam, ever",
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-2">
                      <CheckCircle2 size={14} color="#0F6E56" strokeWidth={2.5} />
                      <span className="text-[13px] text-brand-neutral-mid font-dm-sans">{text}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", org: "", industry: "", size: "", message: "" }); }}
                  className="mt-7 px-[22px] py-2.5 rounded-[10px] border border-brand-teal-light bg-transparent text-brand-teal text-[13px] font-bold font-dm-sans cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
