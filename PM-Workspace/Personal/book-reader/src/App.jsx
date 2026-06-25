import { useState, useEffect, useMemo } from "react";
import {
  BookOpen, NotebookPen, Brain, Plus, Check, X, Volume2,
  Trash2, Languages, Loader2, ArrowLeft, Bookmark, RotateCcw, Wand2,
} from "lucide-react";

/* ---------- palette: technical blue ---------- */
const C = {
  canvas: "#F4F7FB", panel: "#FFFFFF",
  ink: "#0F172A", inkSoft: "#475569", inkFaint: "#94A3B8",
  line: "#E2E8F0", lineStrong: "#CBD5E1",
  blue: "#2563EB", blueDark: "#1D4ED8", blue500: "#3B82F6",
  blueFaint: "#EFF4FF", blue100: "#DBEAFE", blue900: "#1E3A8A",
  danger: "#DC2626",
};

const SAMPLE =
  "Reading in another language feels slow at first. Your eyes move across the page, but the meaning arrives a few seconds late. That delay is normal. Every unfamiliar word is a small door, and tapping it here opens the room behind it.\n\nThe more doors you open, the faster the next page becomes. Keep a gentle pace, save the words that surprise you, and come back to them tomorrow.";

/* ---------- storage (localStorage, falls back to in-memory) ---------- */
const mem = {};
async function sget(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return key in mem ? mem[key] : null; }
}
async function sset(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { mem[key] = value; }
}

/* ---------- Claude API (via serverless proxy /api/claude) ---------- */
async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json().catch(() => ({ error: "Phản hồi không hợp lệ" }));
  if (data && data.error) throw new Error(data.error.message || data.error || "API error");
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  if (!text.trim()) throw new Error("empty response");
  return text;
}
function parseJSON(text) {
  let t = text.replace(/```json|```/g, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s !== -1 && e !== -1) t = t.slice(s, e + 1);
  return JSON.parse(t);
}

/* ---------- text helpers ---------- */
function tokenize(text) {
  return text.split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p) => ({
    text: p,
    tokens: (p.match(/[A-Za-z]+(?:['’\-][A-Za-z]+)*|[^A-Za-z]+/g) || []).map((t) => ({
      text: t, isWord: /[A-Za-z]/.test(t),
    })),
  }));
}
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function chunkText(t, max) {
  const out = []; let i = 0;
  while (i < t.length) {
    let end = Math.min(i + max, t.length);
    if (end < t.length) { const sp = t.lastIndexOf(" ", end); if (sp > i) end = sp; }
    out.push(t.slice(i, end)); i = end;
  }
  return out;
}
function normalizeWrapped(text) {
  let t = (text || "").replace(/\r\n?/g, "\n");
  t = t.replace(/([A-Za-z])-\n(?=[a-z])/g, "$1");
  t = t.replace(/\n[ \t]*\n+/g, "\u0001");
  t = t.replace(/\n+/g, " ");
  t = t.replace(/\u0001/g, "\n\n");
  t = t.replace(/[ \t]{2,}/g, " ");
  return t.trim();
}
function sentenceOf(paragraph, word) {
  const parts = paragraph.split(/(?<=[.!?])\s+/);
  const hit = parts.find((s) => new RegExp(`\\b${escapeRe(word)}\\b`, "i").test(s));
  return hit || paragraph;
}
function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

export default function App() {
  const [tab, setTab] = useState("read");
  const [raw, setRaw] = useState("");
  const [editing, setEditing] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [fixErr, setFixErr] = useState("");
  const [draft, setDraft] = useState(SAMPLE);
  const [vocab, setVocab] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [sel, setSel] = useState(null);
  const [look, setLook] = useState({ loading: false, error: "", data: null });
  const [trans, setTrans] = useState({});
  const [bulk, setBulk] = useState({ running: false, done: 0, total: 0 });

  const [queue, setQueue] = useState([]);
  const [ri, setRi] = useState(0);
  const [showAns, setShowAns] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await sget("engreader:vocab");
      const t = await sget("engreader:text");
      if (v) setVocab(v);
      if (t) { setRaw(t); setDraft(t); setEditing(false); }
      setLoaded(true);
    })();
  }, []);
  useEffect(() => { if (loaded) sset("engreader:vocab", vocab); }, [vocab, loaded]);

  const paragraphs = useMemo(() => tokenize(raw), [raw]);
  const savedSet = useMemo(() => new Set(vocab.map((v) => v.word.toLowerCase())), [vocab]);
  const mastered = vocab.filter((v) => (v.box || 0) >= 5).length;

  function loadText() {
    const t = normalizeWrapped(draft);
    if (!t) return;
    setDraft(t);
    setRaw(t); setEditing(false); setTrans({}); setSel(null);
    sset("engreader:text", t);
  }

  async function fixSpacing() {
    const base = normalizeWrapped(draft);
    if (!base) return;
    setDraft(base);
    setFixing(true); setFixErr("");
    try {
      const chunks = chunkText(base, 1500);
      const out = [];
      for (const c of chunks) {
        const r = await callClaude(
          `Văn bản tiếng Anh dưới đây được copy từ PDF nên một số từ bị dính nhau (thiếu dấu cách). Hãy chèn dấu cách đúng chỗ giữa các từ bị dính. TUYỆT ĐỐI không dịch, không thêm hay bớt nội dung, giữ nguyên tiếng Anh gốc và các dấu xuống dòng đoạn. Chỉ trả về văn bản đã sửa, không thêm lời dẫn.\n\n"""${c}"""`);
        const cleaned = r.trim();
        if (!cleaned) throw new Error("empty chunk");
        out.push(cleaned);
      }
      const result = normalizeWrapped(out.join("\n\n"));
      if (result) setDraft(result);
    } catch {
      setFixErr("Đã gộp dòng xong. Phần ghép từ dính nhau chưa chạy được nên giữ nguyên — bạn có thể đọc luôn hoặc thử lại.");
    }
    setFixing(false);
  }

  async function onWord(word, sentence) {
    setSel({ word, sentence });
    setLook({ loading: true, error: "", data: null });
    try {
      const txt = await callClaude(
        `Bạn là từ điển Anh-Việt. Cho một từ tiếng Anh và câu chứa nó, trả về DUY NHẤT một object JSON (không markdown, không backtick) với các khóa:
"word" (dạng nguyên thể của từ), "ipa" (phiên âm IPA, đặt trong //), "pos" (loại từ bằng tiếng Việt, vd "danh từ"), "meaning" (nghĩa tiếng Việt đúng theo ngữ cảnh, ngắn gọn), "definition_en" (định nghĩa tiếng Anh đơn giản), "example_en" (một câu ví dụ tiếng Anh mới), "example_vi" (dịch câu ví dụ sang tiếng Việt).
Từ: "${word}"
Câu: "${sentence}"`);
      setLook({ loading: false, error: "", data: parseJSON(txt) });
    } catch {
      setLook({ loading: false, error: "Không tra được từ này. Thử lại nhé.", data: null });
    }
  }

  function saveWord() {
    const d = look.data; if (!d) return;
    const key = (d.word || sel.word).toLowerCase();
    if (savedSet.has(key)) { setSel(null); return; }
    setVocab((v) => [
      { id: Date.now() + "", word: d.word || sel.word, ipa: d.ipa || "", pos: d.pos || "",
        meaning: d.meaning || "", definition_en: d.definition_en || "",
        example_en: d.example_en || "", example_vi: d.example_vi || "", box: 0, addedAt: Date.now() },
      ...v,
    ]);
    setSel(null);
  }

  async function translatePara(i, text) {
    if (trans[i]?.text) { setTrans((p) => ({ ...p, [i]: { ...p[i], show: !p[i].show } })); return; }
    setTrans((p) => ({ ...p, [i]: { loading: true, text: "", show: true } }));
    try {
      const out = await callClaude(
        `Dịch đoạn văn tiếng Anh sau sang tiếng Việt tự nhiên, dễ đọc. Chỉ trả về bản dịch, không thêm lời dẫn.\n\n"""${text}"""`);
      setTrans((p) => ({ ...p, [i]: { loading: false, text: out.trim(), show: true } }));
    } catch {
      setTrans((p) => ({ ...p, [i]: { loading: false, text: "Không dịch được đoạn này.", show: true } }));
    }
  }

  async function translateAll() {
    const size = 2, groups = [];
    for (let i = 0; i < paragraphs.length; i += size)
      groups.push(paragraphs.slice(i, i + size).map((p, k) => ({ idx: i + k, text: p.text })));
    setBulk({ running: true, done: 0, total: paragraphs.length });
    let done = 0;
    for (const g of groups) {
      try {
        const out = await callClaude(
          `Dịch từng đoạn văn tiếng Anh sau sang tiếng Việt tự nhiên, dễ đọc. Trả về DUY NHẤT một mảng JSON gồm ${g.length} chuỗi bản dịch, đúng thứ tự, không thêm gì khác.\n\n` +
          JSON.stringify(g.map((x) => x.text)));
        let arr;
        try { arr = JSON.parse(out.replace(/```json|```/g, "").trim()); }
        catch { const s = out.indexOf("["), e = out.lastIndexOf("]"); arr = JSON.parse(out.slice(s, e + 1)); }
        setTrans((prev) => {
          const next = { ...prev };
          g.forEach((x, k) => { next[x.idx] = { loading: false, text: (arr[k] || "").trim(), show: true }; });
          return next;
        });
      } catch {
        setTrans((prev) => {
          const next = { ...prev };
          g.forEach((x) => { next[x.idx] = { loading: false, text: "Không dịch được đoạn này.", show: true }; });
          return next;
        });
      }
      done += g.length;
      setBulk({ running: true, done, total: paragraphs.length });
    }
    setBulk({ running: false, done: paragraphs.length, total: paragraphs.length });
  }

  function startReview() {
    const q = [...vocab].sort((a, b) => (a.box || 0) - (b.box || 0) || b.addedAt - a.addedAt);
    setQueue(q); setRi(0); setShowAns(false);
  }
  function grade(remember) {
    const cur = queue[ri]; if (!cur) return;
    setVocab((v) => v.map((x) => x.id === cur.id
      ? { ...x, box: remember ? Math.min((x.box || 0) + 1, 5) : 0 } : x));
    if (ri + 1 < queue.length) { setRi(ri + 1); setShowAns(false); } else { setQueue([]); setRi(0); }
  }

  const isSaved = look.data && savedSet.has((look.data.word || sel?.word || "").toLowerCase());

  return (
    <div style={{ background: C.canvas, color: C.ink, minHeight: "100%", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <style>{css}</style>
      <div className="topline" />

      <div className="wrap">
        <header className="hd">
          <div className="brand">
            <span className="logo">EN</span>
            <div>
              <h1 className="title">Reader</h1>
              <p className="sub">đọc · tra · ghi nhớ</p>
            </div>
          </div>
          <nav className="tabs">
            {[["read", "Đọc", BookOpen], ["vocab", "Sổ từ", NotebookPen], ["review", "Ôn tập", Brain]].map(
              ([id, label, Icon]) => (
                <button key={id} className={"tab " + (tab === id ? "on" : "")}
                  onClick={() => { setTab(id); if (id === "review") startReview(); }}>
                  <Icon size={15} /> {label}
                  {id === "vocab" && vocab.length > 0 && <span className="badge">{vocab.length}</span>}
                </button>
              )
            )}
          </nav>
        </header>

        {/* READ */}
        {tab === "read" && (
          <div>
            {editing ? (
              <div className="paste">
                <span className="seclabel">Nguồn văn bản · EN</span>
                <textarea className="ta" value={draft} onChange={(e) => setDraft(e.target.value)}
                  placeholder="Paste a paragraph, a chapter, an article…" rows={9} />
                <p className="phint">Xuống dòng kiểu PDF sẽ tự gộp khi bấm “Bắt đầu đọc”. Nếu chữ còn dính nhau (thiếu dấu cách), bấm “Chuẩn hóa văn bản”.</p>
                <div className="pasterow">
                  <button className="secondary" onClick={fixSpacing} disabled={fixing}>
                    {fixing ? <><Loader2 size={15} className="spin" /> Đang xử lý…</> : <><Wand2 size={15} /> Chuẩn hóa văn bản</>}
                  </button>
                  <button className="primary" onClick={loadText}><BookOpen size={15} /> Bắt đầu đọc</button>
                </div>
                {fixErr && <p className="fixerr">{fixErr}</p>}
              </div>
            ) : (
              <div className="page">
                <div className="toolbar">
                  <div className="tleft">
                    <button className="back" onClick={() => setEditing(true)}>
                      <ArrowLeft size={14} /> Đổi văn bản
                    </button>
                    <span className="meta">{paragraphs.length} đoạn</span>
                  </div>
                  <button className="bulkbtn" onClick={translateAll} disabled={bulk.running}>
                    {bulk.running
                      ? <><Loader2 size={14} className="spin" /> Đang dịch {bulk.done}/{bulk.total}</>
                      : <><Languages size={14} /> Dịch tất cả</>}
                  </button>
                </div>

                {paragraphs.map((p, i) => (
                  <div key={i} className="para">
                    <span className="pidx">{String(i + 1).padStart(2, "0")}</span>
                    <div className="pbody">
                      <p className="reading">
                        {p.tokens.map((tk, j) =>
                          tk.isWord ? (
                            <span key={j}
                              className={"word " + (savedSet.has(tk.text.toLowerCase()) ? "saved" : "")}
                              tabIndex={0}
                              onClick={() => onWord(tk.text, sentenceOf(p.text, tk.text))}
                              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onWord(tk.text, sentenceOf(p.text, tk.text))}
                            >{tk.text}</span>
                          ) : <span key={j}>{tk.text}</span>
                        )}
                      </p>
                      <button className="translate" onClick={() => translatePara(i, p.text)}>
                        {trans[i]?.loading ? <Loader2 size={12} className="spin" /> : <Languages size={12} />}
                        {trans[i]?.show && trans[i]?.text ? "Ẩn bản dịch" : "Dịch đoạn"}
                      </button>
                      {trans[i]?.show && trans[i]?.text && (
                        <div className="vi"><span className="vitag">VI</span><p>{trans[i].text}</p></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VOCAB */}
        {tab === "vocab" && (
          vocab.length === 0 ? (
            <Empty icon={Bookmark} title="Sổ từ trống"
              text="Khi đọc, chạm vào một từ rồi bấm Lưu. Từ sẽ xuất hiện ở đây và được gạch chân xanh trong trang đọc." />
          ) : (
            <div className="vgrid">
              {vocab.map((v) => (
                <div key={v.id} className="vcard">
                  <div className="vtop">
                    <div className="vhead">
                      <span className="vword">{v.word}</span>
                      {v.ipa && <span className="vipa">{v.ipa}</span>}
                    </div>
                    <div className="vact">
                      <button className="icon" onClick={() => speak(v.word)} title="Phát âm"><Volume2 size={14} /></button>
                      <button className="icon" onClick={() => setVocab((x) => x.filter((w) => w.id !== v.id))} title="Xoá"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {v.pos && <span className="vpos">{v.pos}</span>}
                  <p className="vmean">{v.meaning}</p>
                  {v.example_en && <p className="vex">{v.example_en}</p>}
                  <div className="vbar"><span style={{ width: ((v.box || 0) / 5) * 100 + "%" }} /></div>
                </div>
              ))}
            </div>
          )
        )}

        {/* REVIEW */}
        {tab === "review" && (
          vocab.length === 0 ? (
            <Empty icon={Brain} title="Chưa có gì để ôn"
              text="Lưu vài từ trong lúc đọc, rồi quay lại đây ôn bằng flashcard." />
          ) : queue.length === 0 ? (
            <div className="done">
              <p className="dnum">{mastered}<span>/{vocab.length}</span></p>
              <p className="dlabel">từ đã thuộc</p>
              <button className="primary" onClick={startReview}><RotateCcw size={15} /> Ôn lại</button>
            </div>
          ) : (
            <div className="rwrap">
              <div className="rprog">
                <span className="rcount">{ri + 1} / {queue.length}</span>
                <div className="rtrack"><span style={{ width: ((ri) / queue.length) * 100 + "%" }} /></div>
              </div>
              <div className="flash" onClick={() => setShowAns(true)}>
                <div className="ftop">
                  <span className="fword">{queue[ri].word}</span>
                  <button className="icon" onClick={(e) => { e.stopPropagation(); speak(queue[ri].word); }}><Volume2 size={17} /></button>
                </div>
                {queue[ri].ipa && <span className="fipa">{queue[ri].ipa}</span>}
                {showAns ? (
                  <div className="fans">
                    {queue[ri].pos && <span className="vpos">{queue[ri].pos}</span>}
                    <p className="fmean">{queue[ri].meaning}</p>
                    {queue[ri].example_en && <p className="vex">{queue[ri].example_en}</p>}
                  </div>
                ) : <p className="ftip">chạm để xem nghĩa</p>}
              </div>
              {showAns && (
                <div className="grade">
                  <button className="g no" onClick={() => grade(false)}><X size={15} /> Chưa thuộc</button>
                  <button className="g yes" onClick={() => grade(true)}><Check size={15} /> Nhớ rồi</button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* lookup sheet */}
      {sel && (
        <div className="overlay" onClick={() => setSel(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSel(null)}><X size={17} /></button>
            {look.loading ? (
              <div className="lload"><Loader2 size={20} className="spin" /> Đang tra “{sel.word}”…</div>
            ) : look.error ? (
              <div className="lerr">{look.error}</div>
            ) : look.data ? (
              <div>
                <span className="seclabel">Tra cứu</span>
                <div className="lhead">
                  <span className="lword">{look.data.word}</span>
                  {look.data.ipa && <span className="lipa">{look.data.ipa}</span>}
                  <button className="icon" onClick={() => speak(look.data.example_en || look.data.word)}><Volume2 size={17} /></button>
                </div>
                {look.data.pos && <span className="vpos">{look.data.pos}</span>}
                <p className="lmean">{look.data.meaning}</p>
                {look.data.definition_en && <p className="ldef">{look.data.definition_en}</p>}
                {look.data.example_en && (
                  <div className="lex">
                    <p>{look.data.example_en}</p>
                    {look.data.example_vi && <p className="lexvi">{look.data.example_vi}</p>}
                  </div>
                )}
                <button className={"primary save " + (isSaved ? "issaved" : "")} onClick={saveWord} disabled={isSaved}>
                  {isSaved ? <><Check size={15} /> Đã lưu</> : <><Plus size={15} /> Lưu vào sổ từ</>}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ icon: Icon, title, text }) {
  return (
    <div className="empty">
      <Icon size={30} strokeWidth={1.5} />
      <p className="etitle">{title}</p>
      <p className="etext">{text}</p>
    </div>
  );
}

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const css = `
*{box-sizing:border-box}
.topline{height:3px;background:${C.blue}}
.wrap{max-width:760px;margin:0 auto;padding:24px 18px 120px}

.hd{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;
  padding-bottom:18px;margin-bottom:22px;border-bottom:1px solid ${C.line}}
.brand{display:flex;align-items:center;gap:12px}
.logo{font-family:${mono};font-size:14px;font-weight:700;letter-spacing:.04em;color:#fff;background:${C.blue};
  width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:8px}
.title{font-size:21px;font-weight:700;margin:0;letter-spacing:-.01em}
.sub{margin:1px 0 0;font-family:${mono};font-size:11px;letter-spacing:.06em;color:${C.inkFaint};text-transform:uppercase}
.tabs{display:flex;gap:4px;background:${C.panel};border:1px solid ${C.line};padding:4px;border-radius:10px}
.tab{display:flex;align-items:center;gap:6px;border:0;background:transparent;color:${C.inkSoft};
  font-family:${mono};font-size:12px;font-weight:600;letter-spacing:.02em;padding:8px 12px;border-radius:7px;cursor:pointer;transition:.15s}
.tab:hover{color:${C.ink};background:${C.canvas}}
.tab.on{background:${C.blue};color:#fff}
.badge{background:rgba(255,255,255,.25);border-radius:20px;font-size:10.5px;padding:1px 6px;font-weight:700}
.tab:not(.on) .badge{background:${C.blue100};color:${C.blue900}}

.seclabel{display:block;font-family:${mono};font-size:11px;letter-spacing:.08em;text-transform:uppercase;
  color:${C.inkFaint};margin-bottom:9px}

.paste{background:${C.panel};border:1px solid ${C.line};border-radius:12px;padding:18px}
.ta{width:100%;border:1px solid ${C.lineStrong};background:${C.canvas};border-radius:8px;padding:14px;
  font-size:15px;line-height:1.7;color:${C.ink};resize:vertical;outline:none;transition:.15s}
.ta:focus{border-color:${C.blue};background:#fff;box-shadow:0 0 0 3px ${C.blueFaint}}
.phint{margin:12px 0 0;color:${C.inkSoft};font-size:12.5px;line-height:1.55}
.pasterow{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.primary{display:inline-flex;align-items:center;gap:8px;border:0;background:${C.blue};color:#fff;
  font-size:13.5px;font-weight:600;padding:10px 16px;border-radius:8px;cursor:pointer;transition:.15s}
.primary:hover{background:${C.blueDark}}
.primary:disabled{cursor:default;opacity:.6}
.secondary{display:inline-flex;align-items:center;gap:8px;border:1px solid ${C.lineStrong};background:${C.panel};
  color:${C.blue};font-size:13.5px;font-weight:600;padding:10px 16px;border-radius:8px;cursor:pointer;transition:.15s}
.secondary:hover{border-color:${C.blue};background:${C.blueFaint}}
.secondary:disabled{opacity:.6;cursor:default}
.fixerr{margin:10px 0 0;color:${C.danger};font-size:12.5px;line-height:1.5}

.page{background:${C.panel};border:1px solid ${C.line};border-radius:12px;padding:8px 26px 22px}
.toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;
  padding:14px 0;margin-bottom:6px;border-bottom:1px solid ${C.line}}
.tleft{display:flex;align-items:center;gap:14px}
.back{display:inline-flex;align-items:center;gap:6px;border:0;background:transparent;color:${C.inkSoft};
  font-size:13px;font-weight:600;cursor:pointer;padding:0}
.back:hover{color:${C.blue}}
.meta{font-family:${mono};font-size:11px;letter-spacing:.05em;color:${C.inkFaint};text-transform:uppercase}
.bulkbtn{display:inline-flex;align-items:center;gap:7px;border:0;background:${C.blue};color:#fff;
  font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:7px;cursor:pointer;transition:.15s}
.bulkbtn:hover{background:${C.blueDark}}
.bulkbtn:disabled{opacity:.7;cursor:default}

.para{display:grid;grid-template-columns:32px 1fr;gap:14px;padding:18px 0;border-top:1px solid ${C.line}}
.para:first-of-type{border-top:0}
.pidx{font-family:${mono};font-size:11px;color:${C.blue500};padding-top:6px;user-select:none;text-align:right}
.reading{font-size:17.5px;line-height:1.85;color:${C.ink};margin:0;letter-spacing:-.002em}
.word{cursor:pointer;border-radius:3px;padding:0 1px;transition:background .12s;outline:none}
.word:hover{background:${C.blueFaint}}
.word:focus-visible{box-shadow:0 0 0 2px ${C.blue}}
.word.saved{background:${C.blueFaint};box-shadow:inset 0 -2px 0 ${C.blue500}}
.word.saved:hover{background:${C.blue100}}
.translate{display:inline-flex;align-items:center;gap:6px;margin-top:11px;border:0;background:transparent;
  color:${C.blue};font-family:${mono};font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;padding:0}
.translate:hover{color:${C.blueDark}}
.vi{display:flex;gap:10px;margin-top:11px;padding:11px 13px;background:${C.blueFaint};
  border-left:2px solid ${C.blue};border-radius:0 6px 6px 0}
.vitag{font-family:${mono};font-size:10px;font-weight:700;letter-spacing:.05em;color:${C.blue};padding-top:2px}
.vi p{margin:0;color:${C.ink};font-size:14.5px;line-height:1.65}

.vgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(238px,1fr));gap:12px}
.vcard{background:${C.panel};border:1px solid ${C.line};border-radius:10px;padding:15px}
.vtop{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.vhead{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.vword{font-size:18px;font-weight:700}
.vipa{font-family:${mono};font-size:12px;color:${C.inkSoft}}
.vact{display:flex;gap:1px}
.icon{border:0;background:transparent;color:${C.inkFaint};cursor:pointer;padding:5px;border-radius:6px;display:inline-flex;transition:.15s}
.icon:hover{background:${C.blueFaint};color:${C.blue}}
.vpos{display:inline-block;font-family:${mono};font-size:10.5px;font-weight:600;letter-spacing:.03em;
  text-transform:uppercase;background:${C.blueFaint};color:${C.blue900};border:1px solid ${C.blue100};
  padding:2px 8px;border-radius:5px;margin:8px 0 0}
.vmean{margin:8px 0 0;font-size:14.5px;line-height:1.55;color:${C.ink}}
.vex{margin:7px 0 0;color:${C.inkSoft};font-size:13px;line-height:1.55;font-style:italic}
.vbar{height:3px;background:${C.line};border-radius:4px;margin-top:12px;overflow:hidden}
.vbar span{display:block;height:100%;background:${C.blue};border-radius:4px;transition:width .3s}

.empty{text-align:center;color:${C.inkSoft};padding:62px 20px;background:${C.panel};
  border:1px dashed ${C.lineStrong};border-radius:12px}
.empty svg{color:${C.blue};margin-bottom:14px}
.etitle{font-size:18px;font-weight:700;color:${C.ink};margin:0 0 7px}
.etext{font-size:13.5px;max-width:400px;margin:0 auto;line-height:1.6}

.done{text-align:center;padding:54px 20px;background:${C.panel};border:1px solid ${C.line};border-radius:12px}
.dnum{font-size:46px;font-weight:800;margin:0;color:${C.blue};letter-spacing:-.02em}
.dnum span{color:${C.inkFaint};font-weight:600;font-size:26px}
.dlabel{font-family:${mono};font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${C.inkFaint};margin:4px 0 22px}
.rwrap{max-width:470px;margin:0 auto}
.rprog{margin:4px 0 16px}
.rcount{font-family:${mono};font-size:11px;letter-spacing:.05em;color:${C.inkFaint}}
.rtrack{height:3px;background:${C.line};border-radius:4px;margin-top:7px;overflow:hidden}
.rtrack span{display:block;height:100%;background:${C.blue};transition:width .25s}
.flash{background:${C.panel};border:1px solid ${C.line};border-radius:12px;padding:36px 26px;min-height:230px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:0 12px 36px -24px rgba(15,23,42,.35)}
.ftop{display:flex;align-items:center;gap:10px}
.fword{font-size:32px;font-weight:700;letter-spacing:-.01em}
.fipa{font-family:${mono};color:${C.inkSoft};margin-top:7px;font-size:14px}
.ftip{font-family:${mono};font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:${C.inkFaint};margin-top:18px}
.fans{margin-top:16px;text-align:center}
.fmean{font-size:18px;font-weight:500;margin:4px 0 0}
.grade{display:flex;gap:10px;margin-top:14px}
.g{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid ${C.line};
  font-size:13.5px;font-weight:600;padding:13px;border-radius:9px;cursor:pointer;transition:.15s;background:${C.panel}}
.g.no{color:${C.inkSoft}}
.g.no:hover{border-color:${C.lineStrong};color:${C.ink}}
.g.yes{background:${C.blue};border-color:${C.blue};color:#fff}
.g.yes:hover{background:${C.blueDark}}

.overlay{position:fixed;inset:0;background:rgba(15,23,42,.4);display:flex;align-items:flex-end;
  justify-content:center;z-index:50;backdrop-filter:blur(2px)}
.sheet{background:${C.panel};width:100%;max-width:560px;border-radius:14px 14px 0 0;border-top:3px solid ${C.blue};
  padding:22px 24px 28px;position:relative;animation:rise .2s ease}
@keyframes rise{from{transform:translateY(36px);opacity:0}to{transform:translateY(0);opacity:1}}
.close{position:absolute;top:16px;right:16px;border:0;background:transparent;color:${C.inkFaint};cursor:pointer;padding:4px}
.close:hover{color:${C.ink}}
.lload{display:flex;align-items:center;gap:10px;color:${C.inkSoft};font-size:14.5px;padding:10px 0}
.lerr{color:${C.danger};font-size:14.5px;padding:10px 0}
.lhead{display:flex;align-items:center;gap:12px;margin-top:2px}
.lword{font-size:28px;font-weight:700;letter-spacing:-.01em}
.lipa{font-family:${mono};color:${C.inkSoft};font-size:14px}
.lmean{font-size:17px;font-weight:600;margin:8px 0 0}
.ldef{color:${C.inkSoft};font-size:13.5px;line-height:1.6;margin:8px 0 0}
.lex{margin-top:14px;padding:13px 14px;background:${C.canvas};border:1px solid ${C.line};border-radius:8px}
.lex p{margin:0;font-size:14.5px;line-height:1.6}
.lexvi{margin-top:6px!important;color:${C.inkSoft};font-size:13.5px!important}
.save{width:100%;justify-content:center;margin-top:18px;padding:12px}
.save.issaved{background:${C.blue900}}

.spin{animation:sp 1s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.sheet{animation:none}.spin{animation:none}}
@media (max-width:560px){.page{padding:8px 16px 20px}.reading{font-size:16.5px}.para{grid-template-columns:24px 1fr;gap:10px}.title{font-size:19px}}
`;
