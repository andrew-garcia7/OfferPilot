import { Router } from "express";
import { prisma } from "../db";

const router = Router();

/* ===============================
   SAVE / UPDATE DRAFT
================================ */
router.post("/draft", async (req, res) => {
  try {
    const { id, title, payload, templateKey, atsScore, userId } = req.body || {};
    if (!payload) {
      return res.status(400).json({ success: false, error: "payload is required" });
    }

    const data = {
      title: title || "Untitled Resume",
      payload: typeof payload === "string" ? payload : JSON.stringify(payload),
      templateKey: templateKey || "software_engineer",
      atsScore: typeof atsScore === "number" ? atsScore : null,
      userId: userId ?? null,
    };

    if (id) {
      const updated = await prisma.resumeDraft.update({
        where: { id: Number(id) },
        data,
      });
      return res.json({ success: true, draft: updated });
    }

    const created = await prisma.resumeDraft.create({ data });
    return res.json({ success: true, draft: created });
  } catch (err: any) {
    console.error("RESUME DRAFT SAVE ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   GET DRAFT BY ID
================================ */
router.get("/draft/:id", async (req, res) => {
  try {
    const draft = await prisma.resumeDraft.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!draft) return res.status(404).json({ success: false, error: "Draft not found" });
    return res.json({ success: true, draft });
  } catch (err: any) {
    console.error("RESUME DRAFT GET ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   SAVE A NAMED VERSION
================================ */
router.post("/version", async (req, res) => {
  try {
    const { draftId, label, payload, atsScore } = req.body || {};
    if (!draftId || !payload) {
      return res.status(400).json({ success: false, error: "draftId and payload are required." });
    }

    const version = await prisma.resumeVersion.create({
      data: {
        draftId: Number(draftId),
        label: label || new Date().toLocaleString(),
        payload: typeof payload === "string" ? payload : JSON.stringify(payload),
        atsScore: typeof atsScore === "number" ? atsScore : null,
      },
    });

    return res.json({ success: true, version });
  } catch (err: any) {
    console.error("VERSION SAVE ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   LIST VERSIONS FOR DRAFT
================================ */
router.get("/versions/:draftId", async (req, res) => {
  try {
    const versions = await prisma.resumeVersion.findMany({
      where: { draftId: Number(req.params.draftId) },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true, atsScore: true, createdAt: true },
    });
    return res.json({ success: true, versions });
  } catch (err: any) {
    console.error("VERSIONS LIST ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   GET SPECIFIC VERSION PAYLOAD
================================ */
router.get("/version/:id", async (req, res) => {
  try {
    const version = await prisma.resumeVersion.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!version) return res.status(404).json({ success: false, error: "Version not found" });
    return res.json({ success: true, version });
  } catch (err: any) {
    console.error("VERSION GET ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

