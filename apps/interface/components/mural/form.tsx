"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "./field";
import { randHex } from "./coords";

const SIZES = [
  "1'x1'",
  "2' x 2'",
  "half a length of wall (3' x 5' ish)",
  "length of wall (3' x 10' ish, floor to ceiling)",
  "BIGGER",
];

const DATES = [
  "weekend of 5/16 and 5/17",
  "weekend of 5/23 and 5/24",
  "memorial day 5/25",
  "other",
];

const HARVARD_RE = /@([a-z]+\.)?harvard\.edu$/i;

type State = "idle" | "submitting" | "success" | "error";

export function MuralForm() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [sketchName, setSketchName] = useState<string>("");
  const [sketchSize, setSketchSize] = useState<number>(0);
  const [size, setSize] = useState<string>(SIZES[2]);
  const [dates, setDates] = useState<Set<string>>(new Set([DATES[0]]));
  const [submissionId, setSubmissionId] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSubmissionId(randHex(10));
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "submitting") return;
    setErrorMsg("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    // basic checks
    const email = String(fd.get("email") ?? "").trim();
    if (!HARVARD_RE.test(email)) {
      setErrorMsg("EMAIL_VALIDATION_FAIL :: must end in @*.harvard.edu");
      return;
    }
    if (!fd.get("name")) {
      setErrorMsg("NAME_VALIDATION_FAIL :: name required");
      return;
    }
    if (!fd.get("idea")) {
      setErrorMsg("IDEA_VALIDATION_FAIL :: idea required");
      return;
    }
    if (dates.size === 0) {
      setErrorMsg("DATE_VALIDATION_FAIL :: pick at least one date");
      return;
    }

    fd.set("size", size);
    fd.delete("dates");
    for (const d of dates) fd.append("dates", d);

    setState("submitting");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      setState("success");
      form.reset();
      setSketchName("");
      setSketchSize(0);
      setDates(new Set([DATES[0]]));
      setSize(SIZES[2]);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? `TRANSMIT_FAIL :: ${err.message}`
          : "TRANSMIT_FAIL :: unknown",
      );
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="mt-12 border border-ink p-6 sm:p-10 bg-bg">
        <div className="flex items-center gap-3 font-bit text-[14px] tracking-widest text-red">
          <span className="pulse-dot" />
          TRANSMIT_OK
        </div>
        <h3 className="mt-3 font-bit uppercase text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]">
          <span className="glitch" data-text="MARK RECEIVED.">
            MARK RECEIVED.
          </span>
        </h3>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.55]">
          Your fragment is in the queue. I&apos;ll be in touch about supplies, scheduling,
          and where on the wall it wants to live. In a hundred years, someone will walk
          through those tunnels, slow down, and wonder who you were.
        </p>
        <p className="mt-3 font-bit text-[12px] text-ink/60">
          SESSION_ID :: 0x{submissionId} / archived to base.adams_2026
        </p>
        <button
          type="button"
          className="term-button mt-6"
          onClick={() => setState("idle")}
        >
          ◂ submit another
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mt-10 space-y-12"
      noValidate
    >
      {/* form header / packet metadata */}
      <div className="border border-ink">
        <div className="flex justify-between items-center bg-ink px-3 py-1 font-bit text-[12px] text-bg tracking-widest">
          <span>PACKET // SUBMISSION_FORM</span>
          <span>0x{submissionId}</span>
        </div>
        <div className="px-3 py-2 text-[11px] font-bit text-ink/70 tabular flex flex-wrap gap-x-6 gap-y-1">
          <span>SCHEMA_v=1.0</span>
          <span>FIELDS=8</span>
          <span>ENCODING=multipart/form-data</span>
          <span>DESTINATION=airtable.adams_2026</span>
        </div>
      </div>

      <Field
        index="2.0"
        label="who"
        required
        hint="for the record. ten people will read this. you, me, future seniors."
      >
        <input
          name="name"
          required
          placeholder="full name"
          className="term-input"
          autoComplete="name"
        />
      </Field>

      <Field
        index="2.0a"
        label="harvard email"
        required
        hint="must end in harvard.edu — i'll route updates here."
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@college.harvard.edu"
          className="term-input"
          autoComplete="email"
        />
      </Field>

      <Field
        index="2.1"
        label="what would you like to paint?"
        required
        hint="quotes; landscapes; hieroglyphs; curses to ancient gods; “yo mamma” jokes; Act 5, Scene 1, line 221 of As You Like It; etc."
      >
        <textarea
          name="idea"
          required
          rows={4}
          className="term-textarea"
          placeholder="describe your vision."
        />
      </Field>

      <Field
        index="2.2"
        label="drop a sketch"
        hint="napkin drawing / phone photo / render / nothing yet — all fine. (optional, max 5MB)"
      >
        <label className="block cursor-pointer">
          <input
            type="file"
            name="sketch"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (f) {
                setSketchName(f.name);
                setSketchSize(f.size);
              } else {
                setSketchName("");
                setSketchSize(0);
              }
            }}
          />
          <div className="border border-dashed border-ink p-4 hover:border-red transition-colors">
            <div className="font-bit text-[14px] tracking-widest text-ink/70">
              ▸ DRAG OR CLICK TO ATTACH
            </div>
            <div className="mt-1 font-bit text-[18px] text-ink truncate">
              {sketchName || "no_file_attached"}
            </div>
            {sketchSize > 0 && (
              <div className="mt-0.5 text-[12px] font-bit text-ink/60">
                {(sketchSize / 1024).toFixed(1)} KB ::{" "}
                {sketchSize > 5 * 1024 * 1024 ? (
                  <span className="text-red">EXCEEDS_5MB_LIMIT</span>
                ) : (
                  "OK"
                )}
              </div>
            )}
          </div>
        </label>
      </Field>

      <Field index="2.3" label="how big y'gonna make it?" required>
        <div className="space-y-2">
          {SIZES.map((s) => (
            <label
              key={s}
              className="flex items-center cursor-pointer text-[15px]"
            >
              <input
                type="radio"
                name="size"
                value={s}
                checked={size === s}
                onChange={() => setSize(s)}
                className="term-radio"
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </Field>

      {size === "BIGGER" && (
        <Field
          index="2.3a"
          label="(optional) how / why so big?"
          hint="explain the maximalism."
        >
          <textarea
            name="why_so_big"
            rows={3}
            className="term-textarea"
            placeholder="floor to ceiling because ___"
          />
        </Field>
      )}

      <Field
        index="2.4"
        label="what paint colors do you need?"
        required
        hint="list as many or few as your vision asks for."
      >
        <textarea
          name="paint_colors"
          required
          rows={3}
          className="term-textarea"
          placeholder="warm gold; ivory; deep umber; ..."
        />
      </Field>

      <Field
        index="2.5"
        label="any other materials?"
        hint='sharpies, "gold" leaf, glitter, modge-podge, button eyes, unicorn hair, the NYT Sunday crossword, etc.'
      >
        <textarea
          name="other_materials"
          rows={3}
          className="term-textarea"
          placeholder="(optional)"
        />
      </Field>

      <Field
        index="2.6"
        label="when can you paint?"
        required
        hint="check all that work."
      >
        <div className="space-y-2">
          {DATES.map((d) => (
            <label
              key={d}
              className="flex items-center cursor-pointer text-[15px]"
            >
              <input
                type="checkbox"
                checked={dates.has(d)}
                onChange={() => {
                  setDates((prev) => {
                    const next = new Set(prev);
                    if (next.has(d)) next.delete(d);
                    else next.add(d);
                    return next;
                  });
                }}
                className="term-checkbox"
              />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </Field>

      {dates.has("other") && (
        <Field
          index="2.6a"
          label="other date notes"
          hint="when else, what windows."
        >
          <textarea
            name="other_date_notes"
            rows={2}
            className="term-textarea"
            placeholder="weekday afternoons after the 12th, etc."
          />
        </Field>
      )}

      {/* submit */}
      <div className="border-t border-ink pt-6">
        {errorMsg && (
          <div className="mb-4 border border-red p-2 font-bit text-[12px] text-red">
            ⚠ {errorMsg}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="term-button"
            disabled={state === "submitting"}
          >
            {state === "submitting" ? "▸ TRANSMITTING…" : "▸ TRANSMIT"}
          </button>
          <span className="font-bit text-[12px] text-ink/60 tabular">
            payload → airtable.adams_2026 ▸ encrypted at rest
          </span>
        </div>
      </div>
    </form>
  );
}
