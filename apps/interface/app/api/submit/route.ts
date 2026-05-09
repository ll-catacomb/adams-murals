import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_ENV = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_TABLE_NAME",
];

// Field names map directly to Airtable column names.
// Update these in env if you renamed columns in Airtable.
const FIELD = {
  submittedAt: "Submitted At",
  name: "Name",
  email: "Harvard Email",
  idea: "Idea",
  sketch: "Sketch",
  size: "Size",
  whySoBig: "Why So Big",
  paintColors: "Paint Colors",
  otherMaterials: "Other Materials",
  datesAvailable: "Dates Available",
  otherDateNotes: "Other Date Notes",
  status: "Status",
};

const HARVARD_RE = /@([a-z]+\.)?harvard\.edu$/i;
const MAX_SKETCH_BYTES = 5 * 1024 * 1024; // Airtable upload-attachment endpoint cap

export async function POST(req: Request) {
  // env check
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("Missing env vars:", missing.join(", "));
    return new NextResponse(
      `Server not configured: missing ${missing.join(", ")}`,
      { status: 500 },
    );
  }

  const apiKey = process.env.AIRTABLE_API_KEY!;
  const baseId = process.env.AIRTABLE_BASE_ID!;
  const tableName = process.env.AIRTABLE_TABLE_NAME!;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return new NextResponse("Bad form payload", { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const idea = String(form.get("idea") ?? "").trim();
  const size = String(form.get("size") ?? "").trim();
  const whySoBig = String(form.get("why_so_big") ?? "").trim();
  const paintColors = String(form.get("paint_colors") ?? "").trim();
  const otherMaterials = String(form.get("other_materials") ?? "").trim();
  const otherDateNotes = String(form.get("other_date_notes") ?? "").trim();
  const dates = form.getAll("dates").map((d) => String(d));

  if (!name) return new NextResponse("name required", { status: 400 });
  if (!HARVARD_RE.test(email))
    return new NextResponse("must be a harvard.edu email", { status: 400 });
  if (!idea) return new NextResponse("idea required", { status: 400 });
  if (!size) return new NextResponse("size required", { status: 400 });
  if (!paintColors)
    return new NextResponse("paint colors required", { status: 400 });
  if (dates.length === 0)
    return new NextResponse("pick at least one date", { status: 400 });

  const sketch = form.get("sketch");
  let sketchFile: File | null = null;
  if (sketch instanceof File && sketch.size > 0) {
    if (sketch.size > MAX_SKETCH_BYTES) {
      return new NextResponse(
        `Sketch too large (${(sketch.size / 1024 / 1024).toFixed(2)}MB > 5MB)`,
        { status: 400 },
      );
    }
    sketchFile = sketch;
  }

  // 1) Create the Airtable record. All fields are Long text except Sketch.
  const recordBody = {
    fields: {
      [FIELD.submittedAt]: new Date().toISOString(),
      [FIELD.name]: name,
      [FIELD.email]: email,
      [FIELD.idea]: idea,
      [FIELD.size]: size,
      [FIELD.whySoBig]: whySoBig || "",
      [FIELD.paintColors]: paintColors,
      [FIELD.otherMaterials]: otherMaterials || "",
      [FIELD.datesAvailable]: dates.join("; "),
      [FIELD.otherDateNotes]: otherDateNotes || "",
      [FIELD.status]: "New",
    },
  };

  const createUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const createRes = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recordBody),
  });

  if (!createRes.ok) {
    const txt = await createRes.text();
    console.error("Airtable create failed", createRes.status, txt);
    return new NextResponse(
      `Airtable rejected the record (${createRes.status}): ${txt}`,
      { status: 502 },
    );
  }

  const created = (await createRes.json()) as { id: string };
  const recordId = created.id;

  // 2) Upload the sketch (if any) via Airtable's content-upload endpoint
  if (sketchFile) {
    try {
      const buf = Buffer.from(await sketchFile.arrayBuffer());
      const contentType = sketchFile.type || "application/octet-stream";
      const uploadUrl = `https://content.airtable.com/v0/${baseId}/${recordId}/${encodeURIComponent(
        FIELD.sketch,
      )}/uploadAttachment`;
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType,
          file: buf.toString("base64"),
          filename: sketchFile.name,
        }),
      });
      if (!uploadRes.ok) {
        const txt = await uploadRes.text();
        console.error("Airtable attachment upload failed", uploadRes.status, txt);
        // Record created, attachment failed — surface a soft warning, not a hard failure.
        return NextResponse.json(
          {
            ok: true,
            recordId,
            warning: `attachment_upload_failed: ${uploadRes.status}`,
          },
          { status: 200 },
        );
      }
    } catch (err) {
      console.error("Sketch upload error", err);
      return NextResponse.json(
        { ok: true, recordId, warning: "attachment_upload_exception" },
        { status: 200 },
      );
    }
  }

  return NextResponse.json({ ok: true, recordId }, { status: 200 });
}
