import { useState, useEffect, useRef } from "react";
import WORD_BANK from "./words.json";

const CATS = [
  { id:"all",       label:"All Words",       icon:"📚", color:"#ffd77a" },
  { id:"emotions",  label:"Emotions",        icon:"💛", color:"#ffb300" },
  { id:"character", label:"Character",       icon:"⚔️",  color:"#ef6c00" },
  { id:"actions",   label:"Actions",         icon:"🏃", color:"#2196f3" },
  { id:"describing",label:"Describing",      icon:"🎨", color:"#9c27b0" },
  { id:"synonyms",  label:"Syn/Ant Focus",   icon:"🔄", color:"#00897b" },
  { id:"tricky",    label:"My Tricky Words", icon:"⭐", color:"#e91e63" },
];

const LEVELS = [
  {name:"Scout",    minXP:0,   icon:"🗺️"},
  {name:"Explorer", minXP:50,  icon:"⚔️"},
  {name:"Ranger",   minXP:120, icon:"🏹"},
  {name:"Champion", minXP:250, icon:"🏆"},
  {name:"Legend",   minXP:450, icon:"👑"},
];

const PIN = "1234";

const getLevel = xp => { let l=LEVELS[0]; for(const x of LEVELS) if(xp>=x.minXP) l=x; return l; };
const getNext  = xp => LEVELS.find(l=>l.minXP>xp)||null;
const shuffle  = a  => [...a].sort(()=>Math.random()-.5);
const pick     = (a,n) => shuffle(a).slice(0,n);

// Title-case a string e.g. "overjoyed" → "Overjoyed"
const toTitle = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// Build 4 multiple-choice options for fill-in-the-blank.
// Returns { options: string[], close: string } where close is the near-miss distractor.
const buildOptions = (word, quizType, allWords) => {
  const correct = toTitle(quizType==="meaning" ? word.word
    : quizType==="synonym" ? (word.synonyms?.[0]||word.word)
    : (word.antonyms?.[0]||word.word));

  // "Close" distractor — similar meaning, easy to confuse
  let closeRaw = null;
  if(quizType==="meaning") {
    closeRaw = word.synonyms?.[0] || null;          // synonym of the correct word
  } else if(quizType==="synonym") {
    closeRaw = word.synonyms?.[1] || word.synonyms?.[0] || null; // another synonym
  } else {
    closeRaw = word.antonyms?.[1] || word.antonyms?.[0] || null; // another antonym
  }
  const close = closeRaw ? toTitle(closeRaw) : null;

  // Random pool: other words from bank, title-cased, excluding correct & close
  const pool = allWords
    .filter(w=>w.word!==word.word)
    .map(w => toTitle(quizType==="meaning" ? w.word : quizType==="synonym" ? w.synonyms?.[0] : w.antonyms?.[0]))
    .filter(Boolean)
    .filter(v => v!==correct && v!==close);

  const randoms = pick([...new Set(pool)], 2);

  // Assemble 4 unique options, pad if needed
  const raw = [correct, close, randoms[0]||"Peculiar", randoms[1]||"Serene"].filter(Boolean);
  const deduped = [...new Set(raw)];
  while(deduped.length<4){
    const extra=allWords.find(w=>w.word!==word.word&&!deduped.includes(toTitle(w.word)));
    if(extra) deduped.push(toTitle(extra.word)); else break;
  }
  // Return shuffled options AND the close distractor so we can reference it in explanations
  return { options: shuffle(deduped.slice(0,4)), close: close||"" };
};
const ls  = (k,d) => { try{ const v=localStorage.getItem(k); return v!=null?JSON.parse(v):d; }catch{ return d; } };
const lss = (k,v) => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

// ── PALETTE & BASE STYLES ─────────────────────────────────────────────────────
const gold="#ffd77a", muted="#8a7a65", textCol="#f0e6d3", sub="#c0a878";
const cardStyle = { background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,200,100,.22)", borderRadius:20, padding:"20px 18px", backdropFilter:"blur(8px)", boxShadow:"0 8px 32px rgba(0,0,0,.4)" };
const mkBtn = (v="pri") => ({
  display:"block", width:"100%", padding:"13px 18px", borderRadius:13, border:"none",
  cursor:"pointer", fontSize:15, fontWeight:"bold", letterSpacing:.4, marginTop:10,
  fontFamily:"Georgia,serif", transition:"opacity .15s",
  ...(v==="pri" ? {background:"linear-gradient(135deg,#f9a825,#ff6f00)",color:"#1a0a00",boxShadow:"0 4px 16px rgba(249,168,37,.35)"}
    : v==="suc" ? {background:"linear-gradient(135deg,#43a047,#1b5e20)",color:"#fff"}
    : v==="dan" ? {background:"linear-gradient(135deg,#e53935,#7f0000)",color:"#fff"}
    : {background:"rgba(255,255,255,.08)",color:sub,border:"1px solid rgba(255,255,255,.15)"})
});
const inpStyle = { width:"100%", boxSizing:"border-box", padding:"13px 15px", borderRadius:12, border:"1px solid rgba(255,200,100,.22)", background:"rgba(255,255,255,.08)", color:textCol, fontSize:16, outline:"none", marginTop:10, fontFamily:"Georgia,serif" };

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function BottomNav({tab, onTab}) {
  const tabs = [{id:"home",icon:"🗺️",label:"Quest"},{id:"tricky",icon:"⭐",label:"Tricky"},{id:"parent",icon:"👨‍👩‍👧",label:"Parent"}];
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:"rgba(15,12,41,.97)",
      backdropFilter:"blur(16px)",
      borderTop:"1px solid rgba(255,200,100,.2)",
      display:"flex", justifyContent:"center",
      zIndex:1000,
      paddingBottom:"env(safe-area-inset-bottom,6px)",
    }}>
      <div style={{display:"flex", width:"100%", maxWidth:420}}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>onTab(t.id)} style={{flex:1,background:"none",border:"none",padding:"10px 0 6px",
            cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:22}}>{t.icon}</span>
            <span style={{fontSize:11,color:tab===t.id?gold:muted,fontWeight:tab===t.id?"bold":"normal",fontFamily:"Georgia,serif"}}>{t.label}</span>
            {tab===t.id && <div style={{width:20,height:2,borderRadius:2,background:gold,marginTop:2}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

function XPBar({xp}) {
  const lv=getLevel(xp), nx=getNext(xp);
  const pct=nx?Math.min(100,((xp-lv.minXP)/(nx.minXP-lv.minXP))*100):100;
  return (
    <div style={{minWidth:130}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:muted,marginBottom:3}}>
        <span>{lv.icon} {lv.name}</span><span>⭐ {xp} XP</span>
      </div>
      <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.1)",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#f9a825,#ffd54f)",borderRadius:3,transition:"width .6s"}}/>
      </div>
      {nx && <div style={{fontSize:10,color:muted,marginTop:2,textAlign:"right"}}>{nx.minXP-xp} XP to {nx.name}</div>}
    </div>
  );
}

function Dots({answers,idx,total}) {
  return (
    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",margin:"10px 0"}}>
      {Array.from({length:total},(_,i) => (
        <div key={i} style={{width:13,height:13,borderRadius:"50%",
          background:answers[i]==="correct"?"#43a047":answers[i]==="wrong"?"#e53935":"rgba(255,255,255,.12)",
          border:i===idx?"2px solid #ffd77a":"2px solid transparent",transition:"background .3s"}}/>
      ))}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function VocabQuest() {
  const [xp,       setXp]      = useState(()=>ls("vq_xp",0));
  const [streak,   setStreak]  = useState(()=>ls("vq_streak",0));
  const [lastDate, setLastDate]= useState(()=>ls("vq_date",""));
  const [tricky,   setTricky]  = useState(()=>ls("vq_tricky",[]));
  const [history,  setHistory] = useState(()=>ls("vq_history",[]));

  const [nav,        setNav]       = useState("home");
  const [phase,      setPhase]     = useState("menu");
  const [mode,       setMode]      = useState(null);
  const [quizType,   setQuizType]  = useState("meaning");
  const [selCat,     setSelCat]    = useState("all");
  const [words,      setWords]     = useState([]);
  const [idx,        setIdx]       = useState(0);
  const [answers,    setAnswers]   = useState([]);
  const answersRef = useRef([]);  // always in sync, safe to read in callbacks
  const [sessXP,     setSessXP]    = useState(0);
  const [revealed,   setRevealed]  = useState(false);
  const [fillVal,    setFillVal]   = useState("");
  const [fillRes,    setFillRes]   = useState(null);
  const [showHint,   setShowHint]  = useState(false);
  const [pinInput,   setPinInput]  = useState("");
  const [pinError,   setPinError]  = useState(false);
  const [pinUnlocked,setPinUnlocked]=useState(false);
  const [expandedWord,setExpandedWord]=useState(null);
  const [explanation, setExplanation]=useState("");   // AI teaching note
  const [explLoading, setExplLoading]=useState(false);
  const [noteOpen,    setNoteOpen]   =useState(false); // collapsible tutor note
  const APP_MODE = "ai"; // "basic" | "ai" — switch this to "basic" for the Basic version

  useEffect(()=>{
    const today=new Date().toDateString();
    if(lastDate!==today){
      const yesterday=new Date(Date.now()-86400000).toDateString();
      if(lastDate!==yesterday){ lss("vq_streak",0); setStreak(0); }
    }
  },[lastDate]);

  const saveXP    = v=>{setXp(v);      lss("vq_xp",v);};
  const saveStr   = v=>{setStreak(v);  lss("vq_streak",v); const t=new Date().toDateString(); setLastDate(t); lss("vq_date",t);};
  const saveTricky= v=>{setTricky(v);  lss("vq_tricky",v);};
  const saveHist  = v=>{setHistory(v); lss("vq_history",v);};

  const toggleTricky = w => { const n=tricky.includes(w)?tricky.filter(x=>x!==w):[...tricky,w]; saveTricky(n); };

  const buildWords = (cat,qt) => {
    let pool = cat==="tricky" ? WORD_BANK.filter(w=>tricky.includes(w.word))
      : cat==="all" ? WORD_BANK : WORD_BANK.filter(w=>w.cat===cat);
    if(qt==="synonym") pool=pool.filter(w=>w.synonyms?.length);
    if(qt==="antonym") pool=pool.filter(w=>w.antonyms?.length);
    return pick(pool,Math.min(8,pool.length));
  };

  const startSession = m => {
    const wlist=buildWords(selCat,quizType);
    if(!wlist.length){alert("No words available for this selection. Try another category.");return;}
    // Pre-attach shuffled options for fill-in-the-blank multiple choice
    const withOpts = wlist.map(w=>{ const {options,close}=buildOptions(w,quizType,WORD_BANK); return {...w,_options:options,_close:close}; });
    setMode(m); setWords(withOpts); setIdx(0); setAnswers([]); setSessXP(0);
    answersRef.current = [];
    setRevealed(false); setFillVal(""); setFillRes(null); setShowHint(false);
    setExplanation(""); setExplLoading(false); setNoteOpen(false);
    setPhase("play");
  };

  const goNav = t => {
    setNav(t);
    if(t==="home") setPhase("menu");
    if(t==="parent"){ setPinUnlocked(false); setPinInput(""); setPinError(false); }
    if(t==="tricky") setExpandedWord(null);
  };

  const cur = words[idx] || {};
  const getXP  = correct => (mode==="fillin"?8:5) + (quizType!=="meaning"?2:0) - (correct?0: mode==="fillin"?5:3);
  const getXPFor = correct => correct ? (mode==="fillin"?8:5)+(quizType!=="meaning"?2:0) : (mode==="fillin"?3:2);

  const advance = (correct, gained, allAnswers) => {
    if(idx+1<words.length){
      setIdx(idx+1); setRevealed(false); setFillVal(""); setFillRes(null); setShowHint(false);
      setExplanation(""); setExplLoading(false); setNoteOpen(false);
    } else {
      const newXP=xp+gained;
      saveXP(newXP); saveStr(streak+1);
      const rec={date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
        cat:selCat,mode,quizType,correct:allAnswers.filter(a=>a==="correct").length,total:words.length,xp:gained};
      saveHist([...history,rec]);
      setSessXP(gained); setPhase("summary");
    }
  };

  const handleFC = knew => {
    const g=getXPFor(knew), newA=[...answers,knew?"correct":"wrong"];
    setAnswers(newA); advance(knew,sessXP+g,newA); setSessXP(sessXP+g);
  };

  const handleFill = (chosen) => {
    const target = quizType==="meaning"?cur.word:quizType==="synonym"?cur.synonyms[0]:cur.antonyms[0];
    const correct = chosen.toLowerCase()===target.toLowerCase();
    setFillVal(chosen);
    setFillRes(correct?"correct":"wrong");
    const g=getXPFor(correct), newA=[...answers,correct?"correct":"wrong"];
    setSessXP(sessXP+g);
    setAnswers(newA);
    answersRef.current = newA;

    // Fetch AI explanation
    setExplanation(""); setExplLoading(true);
    const closeWord = cur._close || "";
    const correctWord = toTitle(target);
    const quizLabel = quizType==="meaning"
      ? `fill in the blank in the sentence: "${cur.sentence}"`
      : quizType==="synonym" ? `find a synonym for "${cur.word}"`
      : `find an antonym for "${cur.word}"`;
    const prompt = `You are a friendly tutor helping a 10-year-old prepare for the UK 11+ exam.
The child was asked to ${quizLabel}.
The correct answer is "${correctWord}". The tricky near-miss option was "${closeWord}".
The child chose "${chosen}" which was ${correct?"correct":"incorrect"}.

In 2-3 SHORT, friendly sentences (no bullet points, no markdown):
1. Explain the meaning of "${correctWord}" simply.
2. Explain how "${closeWord}" is similar but different, and why "${correctWord}" is the better fit here.
Keep it encouraging and use simple language a 10-year-old will understand.`;

    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
    }).then(r=>r.json()).then(d=>{
      setExplanation(d.content?.[0]?.text||"");
    }).catch(()=>{
      setExplanation("Great effort! Keep practising and it will stick.");
    }).finally(()=>setExplLoading(false));
  };

  const getFillTarget = () => quizType==="meaning"?cur.word:quizType==="synonym"?cur.synonyms?.[0]:cur.antonyms?.[0];

  const hdrStyle = {
    position:"fixed", top:0, left:0, right:0, zIndex:999,
    background:"rgba(15,12,41,.97)", backdropFilter:"blur(12px)",
    borderBottom:"1px solid rgba(255,200,100,.2)",
    padding:"12px 18px 10px",
    display:"flex", alignItems:"center", justifyContent:"space-between",
  };
  const wrap = { width:"100%", maxWidth:420, zIndex:1, padding:"0 16px" };
  const appWrap = {
    minHeight:"100vh",
    background:"linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)",
    fontFamily:"Georgia,serif", color:textCol,
    display:"flex", flexDirection:"column", alignItems:"center",
    paddingTop:64,   // clear the fixed header (~64px tall)
    paddingBottom:80, // clear the fixed bottom nav
  };

  // ══════════════════════════════════════════════════════════════════════════
  // HOME — MENU
  // ══════════════════════════════════════════════════════════════════════════
  if(nav==="home" && phase==="menu") return (
    <div style={appWrap}>
      <div style={hdrStyle}>
        <div>
          <div style={{fontSize:18,fontWeight:"bold",color:gold,letterSpacing:1}}>📖 Vocab Quest</div>
          {/* <div style={{fontSize:11,color:muted}}>Your Vocabulary friend</div>*/}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,color:"#ffb74d"}}>🔥 {streak}</span>
          <XPBar xp={xp}/>
        </div>
      </div>

      <div style={{...wrap,marginTop:0}}>
        <div style={{...cardStyle,textAlign:"center",marginTop:18}}>
          <div style={{fontSize:44}}>{getLevel(xp).icon}</div>
          <div style={{fontSize:20,fontWeight:"bold",color:gold,marginTop:4}}>{getLevel(xp).name}</div>
          <div style={{fontSize:12,color:muted}}>{xp} XP earned so far</div>
        </div>

        {/* Step 1 — Category */}
        <div style={{...cardStyle,marginTop:12}}>
          <div style={{fontSize:13,color:sub,marginBottom:10}}>1️⃣ Choose a word set:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {CATS.map(c=>{
              const count=c.id==="tricky"?tricky.length:c.id==="all"?WORD_BANK.length:WORD_BANK.filter(w=>w.cat===c.id).length;
              return(
                <button key={c.id} onClick={()=>setSelCat(c.id)} style={{
                  background:selCat===c.id?`${c.color}22`:"rgba(255,255,255,.05)",
                  border:`1.5px solid ${selCat===c.id?c.color:"rgba(255,200,100,.22)"}`,
                  borderRadius:12,padding:"10px 8px",cursor:"pointer",
                  display:"flex",alignItems:"center",gap:8,textAlign:"left",transition:"all .2s",
                }}>
                  <span style={{fontSize:20}}>{c.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:"bold",color:selCat===c.id?c.color:textCol,fontFamily:"Georgia,serif"}}>{c.label}</div>
                    <div style={{fontSize:11,color:muted}}>{count} word{count!==1?"s":""}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Quiz type */}
        <div style={{...cardStyle,marginTop:12}}>
          <div style={{fontSize:13,color:sub,marginBottom:10}}>2️⃣ Choose quiz type:</div>
          <div style={{display:"flex",gap:8}}>
            {[["meaning","💡","Meaning"],["synonym","🔄","Synonyms"],["antonym","↔️","Antonyms"]].map(([id,ic,lb])=>(
              <button key={id} onClick={()=>setQuizType(id)} style={{
                flex:1,padding:"10px 4px",borderRadius:12,border:"none",cursor:"pointer",
                background:quizType===id?"linear-gradient(135deg,#f9a825,#ff6f00)":"rgba(255,255,255,.07)",
                color:quizType===id?"#1a0a00":sub,fontWeight:quizType===id?"bold":"normal",
                fontFamily:"Georgia,serif",fontSize:13,display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all .2s",
              }}>
                <span style={{fontSize:20}}>{ic}</span><span>{lb}</span>
                {id!=="meaning"&&<span style={{fontSize:10,color:quizType===id?"#5d3a00":"#f9a825"}}>+2 bonus XP</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 — Mode */}
        <div style={{...cardStyle,marginTop:12}}>
          <div style={{fontSize:13,color:sub,marginBottom:10}}>3️⃣ Choose your quest mode:</div>
          <div style={{display:"flex",gap:10}}>
            {[["flashcard","🃏","Flashcards","5 XP / correct"],["fillin","✍️","Fill the Blank","8 XP / correct"]].map(([id,ic,lb,xplb])=>(
              <button key={id} onClick={()=>startSession(id)} style={{
                flex:1,padding:"14px 6px",borderRadius:13,border:"1px solid rgba(255,200,100,.22)",cursor:"pointer",
                background:"rgba(255,255,255,.07)",color:sub,fontFamily:"Georgia,serif",
                display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              }}>
                <span style={{fontSize:30}}>{ic}</span>
                <span style={{fontWeight:"bold",fontSize:14,color:textCol}}>{lb}</span>
                <span style={{fontSize:11,color:muted}}>{xplb}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:12,fontSize:12,color:muted}}>{WORD_BANK.length} total words · {tricky.length} starred as tricky</div>
      </div>
      <BottomNav tab={nav} onTab={goNav}/>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PLAY — FLASHCARD
  // ══════════════════════════════════════════════════════════════════════════
  if(nav==="home" && phase==="play" && mode==="flashcard" && cur.word) {
    const catObj=CATS.find(c=>c.id===cur.cat)||CATS[0];
    const isTricky=tricky.includes(cur.word);
    const answerText = quizType==="meaning" ? cur.meaning : quizType==="synonym"
      ? `A synonym: "${cur.synonyms?.[0]}"` : `An antonym: "${cur.antonyms?.[0]}"`;
    const prompt = quizType==="meaning" ? "What does this word mean?"
      : quizType==="synonym" ? "Can you name a synonym?" : "Can you name an antonym?";
    return (
      <div style={appWrap}>
        <div style={hdrStyle}>
          <button onClick={()=>setPhase("menu")} style={{background:"none",border:"none",color:gold,fontSize:22,cursor:"pointer"}}>←</button>
          <div style={{fontSize:14,color:sub}}>🃏 {idx+1} / {words.length}</div>
          <div style={{fontSize:13,color:gold}}>+{sessXP} XP</div>
        </div>
        <div style={wrap}>
          <Dots answers={answers} idx={idx} total={words.length}/>
          <div style={{...cardStyle,marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:12,color:catObj.color,background:`${catObj.color}18`,padding:"3px 10px",borderRadius:20}}>{catObj.icon} {catObj.label}</span>
              <button onClick={()=>toggleTricky(cur.word)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22}}>{isTricky?"⭐":"☆"}</button>
            </div>
            <div style={{fontSize:36,fontWeight:"bold",color:gold,textAlign:"center",letterSpacing:2,textShadow:`0 2px 12px ${gold}44`}}>{cur.word}</div>
            <div style={{fontSize:13,color:muted,textAlign:"center",marginTop:6}}>{prompt}</div>
            {showHint && <div style={{fontSize:13,color:"#a89070",textAlign:"center",fontStyle:"italic",marginTop:8}}>💡 {cur.hint}</div>}

            {!revealed ? (
              <>
                <button style={mkBtn()} onClick={()=>setRevealed(true)}>Reveal answer</button>
                <button style={{...mkBtn("ghost"),fontSize:13}} onClick={()=>setShowHint(true)}>💡 Show hint</button>
              </>
            ) : (
              <>
                <div style={{fontSize:16,color:textCol,textAlign:"center",marginTop:14,lineHeight:1.7}}>{answerText}</div>
                {quizType==="meaning" && (
                  <div style={{marginTop:12}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                      <span style={{fontSize:12,color:muted}}>Syn:</span>
                      {cur.synonyms?.map(s=><span key={s} style={{fontSize:12,background:"rgba(0,150,100,.15)",color:"#80cbc4",padding:"2px 9px",borderRadius:20}}>{s}</span>)}
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,color:muted}}>Ant:</span>
                      {cur.antonyms?.map(a=><span key={a} style={{fontSize:12,background:"rgba(200,80,80,.15)",color:"#ef9a9a",padding:"2px 9px",borderRadius:20}}>{a}</span>)}
                    </div>
                  </div>
                )}
                <div style={{fontSize:13,color:muted,textAlign:"center",marginTop:14}}>Did you know it?</div>
                <button style={mkBtn("suc")} onClick={()=>handleFC(true)}>✅ Yes, I knew it!</button>
                <button style={mkBtn("dan")} onClick={()=>handleFC(false)}>❌ Still learning</button>
              </>
            )}
          </div>
        </div>
        <BottomNav tab={nav} onTab={goNav}/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PLAY — FILL IN THE BLANK (multiple choice)
  // ══════════════════════════════════════════════════════════════════════════
  if(nav==="home" && phase==="play" && mode==="fillin" && cur.word) {
    const catObj=CATS.find(c=>c.id===cur.cat)||CATS[0];
    const isTricky=tricky.includes(cur.word);
    const target=getFillTarget();
    const rawParts = quizType==="meaning" ? (cur.sentence||"").split("___") : ["",""];
    const parts = [rawParts[0]||"", rawParts[1]||""];
    const options = cur._options || [];

    // Determine button state after selection
    const getOptionStyle = (opt) => {
      if(!fillRes) return {
        flex:"1 1 calc(50% - 8px)", padding:"14px 10px", borderRadius:14,
        border:"1px solid rgba(255,200,100,.25)", cursor:"pointer",
        background:"rgba(255,255,255,.07)", color:textCol,
        fontFamily:"Georgia,serif", fontSize:15, fontWeight:"bold",
        textAlign:"center", transition:"all .15s", minHeight:52,
        display:"flex",alignItems:"center",justifyContent:"center",
      };
      const isCorrectOpt = opt.toLowerCase()===target.toLowerCase();
      const isChosen = opt===fillVal;
      if(isCorrectOpt) return {
        flex:"1 1 calc(50% - 8px)", padding:"14px 10px", borderRadius:14,
        border:"2px solid #43a047", cursor:"default",
        background:"rgba(67,160,71,.25)", color:"#a5d6a7",
        fontFamily:"Georgia,serif", fontSize:15, fontWeight:"bold",
        textAlign:"center", minHeight:52,
        display:"flex",alignItems:"center",justifyContent:"center",
      };
      if(isChosen && !isCorrectOpt) return {
        flex:"1 1 calc(50% - 8px)", padding:"14px 10px", borderRadius:14,
        border:"2px solid #e53935", cursor:"default",
        background:"rgba(229,57,53,.2)", color:"#ef9a9a",
        fontFamily:"Georgia,serif", fontSize:15, fontWeight:"bold",
        textAlign:"center", minHeight:52,
        display:"flex",alignItems:"center",justifyContent:"center",
      };
      return {
        flex:"1 1 calc(50% - 8px)", padding:"14px 10px", borderRadius:14,
        border:"1px solid rgba(255,255,255,.1)", cursor:"default",
        background:"rgba(255,255,255,.03)", color:"rgba(255,255,255,.3)",
        fontFamily:"Georgia,serif", fontSize:15, fontWeight:"bold",
        textAlign:"center", minHeight:52,
        display:"flex",alignItems:"center",justifyContent:"center",
      };
    };

    return (
      <div style={appWrap}>
        <div style={hdrStyle}>
          <button onClick={()=>setPhase("menu")} style={{background:"none",border:"none",color:gold,fontSize:22,cursor:"pointer"}}>←</button>
          <div style={{fontSize:14,color:sub}}>✍️ {idx+1} / {words.length}</div>
          <div style={{fontSize:13,color:gold}}>+{sessXP} XP</div>
        </div>
        <div style={wrap}>
          <Dots answers={answers} idx={idx} total={words.length}/>
          <div style={{...cardStyle,marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,color:catObj.color,background:`${catObj.color}18`,padding:"3px 10px",borderRadius:20}}>{catObj.icon} {catObj.label}</span>
              <button onClick={()=>toggleTricky(cur.word)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22}}>{isTricky?"⭐":"☆"}</button>
            </div>

            {/* Sentence with blank (meaning mode) or word prompt (syn/ant mode) */}
            {quizType==="meaning" ? (
              <>
                <div style={{fontSize:13,color:muted,textAlign:"center",marginBottom:8}}>Choose the word that fits the sentence:</div>
                <div style={{fontSize:16,lineHeight:1.9,color:"#e8dcc8",textAlign:"center",fontStyle:"italic",padding:"8px 4px"}}>
                  {parts[0]}
                  <span style={{display:"inline-block",borderBottom:`2px solid ${gold}`,minWidth:90,
                    color: fillRes ? (fillRes==="correct"?"#a5d6a7":"#ef9a9a") : gold,
                    fontStyle:"normal",fontWeight:"bold",padding:"0 6px",transition:"color .3s"}}>
                    {fillVal || "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}
                  </span>
                  {parts[1]}
                </div>
              </>
            ) : (
              <>
                <div style={{fontSize:30,fontWeight:"bold",color:gold,textAlign:"center",letterSpacing:2,marginBottom:4}}>{cur.word}</div>
                <div style={{fontSize:13,color:muted,textAlign:"center",marginBottom:4}}>
                  {quizType==="synonym" ? "Choose a synonym:" : "Choose an antonym:"}
                </div>
              </>
            )}

            {showHint && <div style={{fontSize:13,color:"#a89070",textAlign:"center",fontStyle:"italic",marginTop:6,marginBottom:4}}>💡 {cur.hint}</div>}

            {/* Result feedback + Note panel */}
            {fillRes && (
              <div style={{marginTop:10}}>
                {/* Result badge */}
                <div style={{textAlign:"center",marginBottom:10}}>
                  <span style={{fontSize:32}}>{fillRes==="correct"?"🌟":"💫"}</span>
                  <div style={{color:fillRes==="correct"?"#43a047":"#e53935",fontWeight:"bold",fontSize:15,marginTop:2}}>
                    {fillRes==="correct" ? `Correct! +${getXPFor(true)} XP` : `Not quite — the answer was "${toTitle(target)}"`}
                  </div>
                </div>

                {/* ── NOTE panel (always shown, no AI needed) ── */}
                {(() => {
                  // Look up the correct word and the close distractor in the word bank
                  const correctWord = toTitle(target);
                  const closeWord   = cur._close || "";
                  const correctEntry = WORD_BANK.find(w=>w.word.toLowerCase()===correctWord.toLowerCase());
                  const closeEntry   = WORD_BANK.find(w=>w.word.toLowerCase()===closeWord.toLowerCase());
                  // For synonym/antonym modes the "close" is not a word bank entry — use inline meaning
                  const closeIsEntry = !!closeEntry;

                  return (
                    <div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,200,100,.2)",
                      borderRadius:14,overflow:"hidden"}}>
                      {/* Header */}
                      <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,200,100,.1)",
                        display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:15}}>📋</span>
                        <span style={{fontSize:13,fontWeight:"bold",color:gold,letterSpacing:.5}}>NOTE</span>
                      </div>

                      {/* Correct word */}
                      <div style={{padding:"10px 14px",borderBottom: (closeWord&&(closeEntry||!closeIsEntry)) ? "1px solid rgba(255,255,255,.06)" : "none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <span style={{fontSize:11,background:"rgba(67,160,71,.2)",color:"#a5d6a7",
                            padding:"2px 8px",borderRadius:20,fontWeight:"bold"}}>✓ CORRECT</span>
                          <span style={{fontSize:15,fontWeight:"bold",color:"#a5d6a7"}}>{correctWord}</span>
                        </div>
                        <div style={{fontSize:13,color:"#e8dcc8",lineHeight:1.6}}>
                          {correctEntry ? correctEntry.meaning : "—"}
                        </div>
                        {correctEntry?.synonyms?.length>0 && (
                          <div style={{marginTop:5,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                            <span style={{fontSize:11,color:muted}}>Synonyms:</span>
                            {correctEntry.synonyms.slice(0,3).map(s=>(
                              <span key={s} style={{fontSize:11,background:"rgba(0,150,100,.12)",color:"#80cbc4",padding:"1px 8px",borderRadius:20}}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Close distractor */}
                      {closeWord && (
                        <div style={{padding:"10px 14px", borderBottom: APP_MODE==="ai" ? "1px solid rgba(255,255,255,.06)" : "none"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                            <span style={{fontSize:11,background:"rgba(229,57,53,.15)",color:"#ef9a9a",
                              padding:"2px 8px",borderRadius:20,fontWeight:"bold"}}>≈ CLOSE</span>
                            <span style={{fontSize:15,fontWeight:"bold",color:"#ef9a9a"}}>{closeWord}</span>
                          </div>
                          {closeEntry ? (
                            <>
                              <div style={{fontSize:13,color:"#e8dcc8",lineHeight:1.6}}>{closeEntry.meaning}</div>
                              {closeEntry?.synonyms?.length>0 && (
                                <div style={{marginTop:5,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                                  <span style={{fontSize:11,color:muted}}>Synonyms:</span>
                                  {closeEntry.synonyms.slice(0,3).map(s=>(
                                    <span key={s} style={{fontSize:11,background:"rgba(200,80,80,.1)",color:"#ef9a9a",padding:"1px 8px",borderRadius:20}}>{s}</span>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{fontSize:13,color:"#e8dcc8",lineHeight:1.6}}>
                              Similar to <strong style={{color:"#a5d6a7"}}>{correctWord}</strong> but not the best fit here.
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Tutor's Note (AI only, collapsible) ── */}
                      {APP_MODE==="ai" && (
                        <>
                          <button
                            onClick={()=>setNoteOpen(o=>!o)}
                            style={{width:"100%",background:"none",border:"none",cursor:"pointer",
                              padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={{fontSize:14}}>🤖</span>
                              <span style={{fontSize:13,fontWeight:"bold",color:"#f9a825",fontFamily:"Georgia,serif"}}>Tutor's Note</span>
                              <span style={{fontSize:11,color:muted,fontFamily:"Georgia,serif"}}>AI explanation</span>
                            </div>
                            <span style={{fontSize:12,color:muted,transition:"transform .2s",
                              display:"inline-block",transform:noteOpen?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
                          </button>
                          {noteOpen && (
                            <div style={{padding:"0 14px 12px"}}>
                              {explLoading ? (
                                <div style={{display:"flex",alignItems:"center",gap:8,color:muted,fontSize:13}}>
                                  <span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⏳</span>
                                  Thinking…
                                </div>
                              ) : explanation ? (
                                <div style={{fontSize:14,color:"#e8dcc8",lineHeight:1.75}}>{explanation}</div>
                              ) : (
                                <div style={{fontSize:13,color:muted}}>Explanation unavailable.</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2×2 option grid */}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
              {options.map(opt=>(
                <button key={opt} style={getOptionStyle(opt)}
                  onClick={()=>{ if(!fillRes) handleFill(opt); }}
                  disabled={!!fillRes}>
                  {opt}
                </button>
              ))}
            </div>

            {!fillRes && (
              <button style={{...mkBtn("ghost"),fontSize:13,marginTop:10}} onClick={()=>setShowHint(true)}>💡 Show hint</button>
            )}
            {fillRes && (
              <button style={{...mkBtn("pri"),marginTop:12}}
                onClick={()=>{ 
                  setExplanation(""); setExplLoading(false);
                  if(idx+1<words.length){
                    setIdx(idx+1); setRevealed(false); setFillVal(""); setFillRes(null); setShowHint(false);
                  } else {
                    const finalAnswers = answersRef.current;
                    const newXP=xp+sessXP; saveXP(newXP); saveStr(streak+1);
                    const rec={date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
                      cat:selCat,mode,quizType,correct:finalAnswers.filter(a=>a==="correct").length,total:words.length,xp:sessXP};
                    saveHist([...history,rec]); setPhase("summary");
                  }
                }}>
                {idx+1<words.length ? "Next word →" : "See results 🏆"}
              </button>
            )}
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
        <BottomNav tab={nav} onTab={goNav}/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  if(nav==="home" && phase==="summary") {
    const finalAnswers = answersRef.current.length > 0 ? answersRef.current : answers;
    const correct=finalAnswers.filter(a=>a==="correct").length;
    const pct=Math.round((correct/words.length)*100);
    const stars=pct>=90?3:pct>=60?2:1;
    return (
      <div style={appWrap}>
        <div style={hdrStyle}>
          <div style={{width:24}}/>
          <div style={{fontSize:17,fontWeight:"bold",color:gold}}>Quest Complete!</div>
          <div style={{width:24}}/>
        </div>
        <div style={wrap}>
          <div style={{...cardStyle,textAlign:"center",marginTop:18}}>
            <div style={{fontSize:50,marginBottom:6}}>{"⭐".repeat(stars)}{"☆".repeat(3-stars)}</div>
            <div style={{fontSize:26,fontWeight:"bold",color:gold}}>{correct}/{words.length} correct</div>
            <div style={{fontSize:15,color:muted,marginTop:4}}>{pct>=90?"Legendary! 👑":pct>=70?"Great work! 🏆":pct>=50?"Good effort! ⚔️":"Keep going! 💪"}</div>
            <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:16}}>
              <div><div style={{fontSize:22,color:gold}}>+{sessXP}</div><div style={{fontSize:11,color:muted}}>XP earned</div></div>
              <div><div style={{fontSize:22,color:"#ffb74d"}}>🔥 {streak}</div><div style={{fontSize:11,color:muted}}>day streak</div></div>
              <div><div style={{fontSize:22,color:"#43a047"}}>{correct}</div><div style={{fontSize:11,color:muted}}>correct</div></div>
            </div>
          </div>

          <div style={{...cardStyle,marginTop:12}}>
            <div style={{fontSize:13,color:muted,marginBottom:8,textAlign:"center"}}>Word Review — tap ☆ to save for practice</div>
            {words.map((w,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                <span style={{fontSize:16,marginTop:2}}>{finalAnswers[i]==="correct"?"✅":"❌"}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:"bold",color:gold,fontSize:15}}>{w.word}</span>
                    <button onClick={()=>toggleTricky(w.word)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18}}>{tricky.includes(w.word)?"⭐":"☆"}</button>
                  </div>
                  <div style={{fontSize:13,color:sub}}>{w.meaning}</div>
                  <div style={{fontSize:12,color:"#80cbc4",marginTop:2}}>Syn: {w.synonyms?.slice(0,2).join(", ")} · Ant: {w.antonyms?.slice(0,2).join(", ")}</div>
                </div>
              </div>
            ))}
          </div>

          <button style={{...mkBtn(),marginTop:14}} onClick={()=>setPhase("menu")}>🗺️ Back to Quest Map</button>
          <button style={{...mkBtn("ghost"),marginTop:8}} onClick={()=>startSession(mode)}>🔄 Play Again</button>
          <div style={{height:20}}/>
        </div>
        <BottomNav tab={nav} onTab={goNav}/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRICKY WORDS
  // ══════════════════════════════════════════════════════════════════════════
  if(nav==="tricky") {
    const trickyWords=WORD_BANK.filter(w=>tricky.includes(w.word));
    return (
      <div style={appWrap}>
        <div style={hdrStyle}>
          <div style={{fontSize:17,fontWeight:"bold",color:gold}}>⭐ My Tricky Words</div>
          <div style={{fontSize:13,color:muted}}>{trickyWords.length} saved</div>
        </div>
        <div style={{...wrap,marginTop:16}}>
          {trickyWords.length===0 ? (
            <div style={{...cardStyle,textAlign:"center",marginTop:20,padding:"40px 20px"}}>
              <div style={{fontSize:48}}>☆</div>
              <div style={{fontSize:16,color:gold,marginTop:12}}>No tricky words yet!</div>
              <div style={{fontSize:14,color:muted,marginTop:8,lineHeight:1.6}}>During any quiz, tap ☆ next to a word to save it here for extra practice.</div>
            </div>
          ) : (
            <>
              <div style={{...cardStyle,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:sub}}>{trickyWords.length} words saved for practice</span>
                <button onClick={()=>{setSelCat("tricky");setNav("home");setPhase("menu");}}
                  style={{background:"linear-gradient(135deg,#e91e63,#880e4f)",color:"#fff",border:"none",borderRadius:10,
                    padding:"7px 14px",cursor:"pointer",fontSize:13,fontFamily:"Georgia,serif",fontWeight:"bold"}}>
                  Quiz me ⚔️
                </button>
              </div>
              {trickyWords.map(w=>{
                const catObj=CATS.find(c=>c.id===w.cat)||CATS[0];
                const open=expandedWord===w.word;
                return (
                  <div key={w.word} style={{...cardStyle,marginBottom:10,padding:"14px 16px",cursor:"pointer"}}
                    onClick={()=>setExpandedWord(open?null:w.word)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontWeight:"bold",fontSize:17,color:gold}}>{w.word}</span>
                        <span style={{fontSize:11,color:catObj.color,background:`${catObj.color}18`,padding:"2px 8px",borderRadius:20}}>{catObj.icon} {catObj.label}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:11,color:muted}}>{open?"▲":"▼"}</span>
                        <button onClick={e=>{e.stopPropagation();toggleTricky(w.word);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#e91e63"}}>⭐</button>
                      </div>
                    </div>
                    <div style={{fontSize:14,color:sub,marginTop:4}}>{w.meaning}</div>
                    {open && (
                      <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:10}}>
                        <div style={{fontSize:13,color:"#e8dcc8",fontStyle:"italic",marginBottom:10,lineHeight:1.7}}>
                          "{w.sentence?.replace("___",`[${w.word}]`)}"
                        </div>
                        <div style={{marginBottom:6}}>
                          <span style={{fontSize:12,color:muted}}>Synonyms: </span>
                          {w.synonyms?.map(s=><span key={s} style={{fontSize:12,background:"rgba(0,150,100,.15)",color:"#80cbc4",padding:"2px 8px",borderRadius:20,marginRight:4,marginBottom:4,display:"inline-block"}}>{s}</span>)}
                        </div>
                        <div style={{marginBottom:6}}>
                          <span style={{fontSize:12,color:muted}}>Antonyms: </span>
                          {w.antonyms?.map(a=><span key={a} style={{fontSize:12,background:"rgba(200,80,80,.15)",color:"#ef9a9a",padding:"2px 8px",borderRadius:20,marginRight:4,marginBottom:4,display:"inline-block"}}>{a}</span>)}
                        </div>
                        <div style={{fontSize:12,color:"#a89070",fontStyle:"italic"}}>💡 {w.hint}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
          <div style={{height:20}}/>
        </div>
        <BottomNav tab={nav} onTab={goNav}/>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PARENT DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  if(nav==="parent") {
    if(!pinUnlocked) return (
      <div style={appWrap}>
        <div style={hdrStyle}>
          <div style={{fontSize:17,fontWeight:"bold",color:gold}}>👨‍👩‍👧 Parent Dashboard</div>
          <div style={{width:24}}/>
        </div>
        <div style={wrap}>
          <div style={{...cardStyle,marginTop:40,textAlign:"center",padding:"36px 24px"}}>
            <div style={{fontSize:48}}>🔒</div>
            <div style={{fontSize:18,fontWeight:"bold",color:gold,marginTop:12}}>Parent Access</div>
            <div style={{fontSize:14,color:muted,marginTop:6}}>Enter your 4-digit PIN</div>
            <div style={{fontSize:12,color:muted,marginBottom:4}}>(Default: 1234)</div>
            <input style={{...inpStyle,textAlign:"center",letterSpacing:8,fontSize:22,border:pinError?"1px solid #e53935":"1px solid rgba(255,200,100,.22)"}}
              type="password" inputMode="numeric" maxLength={4} value={pinInput}
              onChange={e=>{setPinInput(e.target.value);setPinError(false);}}
              onKeyDown={e=>{if(e.key==="Enter"){if(pinInput===PIN)setPinUnlocked(true);else{setPinError(true);setPinInput("");}}}
              } placeholder="••••"/>
            {pinError && <div style={{color:"#e53935",fontSize:13,marginTop:6}}>Incorrect PIN — try again.</div>}
            <button style={{...mkBtn(),marginTop:14}} onClick={()=>{if(pinInput===PIN)setPinUnlocked(true);else{setPinError(true);setPinInput("");}}}>Unlock</button>
          </div>
        </div>
        <BottomNav tab={nav} onTab={goNav}/>
      </div>
    );

    // ── Dashboard ────────────────────────────────────────────────────────
    const totalQ    = history.reduce((s,h)=>s+h.total,0);
    const totalCor  = history.reduce((s,h)=>s+h.correct,0);
    const overallPct= totalQ ? Math.round((totalCor/totalQ)*100) : 0;

    const catStats = CATS.filter(c=>c.id!=="all"&&c.id!=="tricky").map(c=>{
      const hs=history.filter(h=>h.cat===c.id||h.cat==="all");
      const cor=hs.reduce((s,h)=>s+h.correct,0), tot=hs.reduce((s,h)=>s+h.total,0);
      return {...c,sessions:hs.length,pct:tot?Math.round((cor/tot)*100):null};
    });

    const today=new Date();
    const last7=Array.from({length:7},(_,i)=>{
      const d=new Date(today); d.setDate(today.getDate()-6+i);
      const dateStr=d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
      const label=d.toLocaleDateString("en-GB",{weekday:"short"});
      const daySess=history.filter(h=>h.date===dateStr);
      return {label,xpDay:daySess.reduce((s,h)=>s+h.xp,0),count:daySess.length};
    });
    const maxXP=Math.max(...last7.map(d=>d.xpDay),1);

    return (
      <div style={appWrap}>
        <div style={hdrStyle}>
          <div style={{fontSize:17,fontWeight:"bold",color:gold}}>👨‍👩‍👧 Parent Dashboard</div>
          <button onClick={()=>setPinUnlocked(false)} style={{background:"none",border:"none",color:muted,cursor:"pointer",fontSize:13}}>🔒 Lock</button>
        </div>
        <div style={wrap}>

          {/* Headline stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:18}}>
            {[[`${xp} XP`,"⭐","Total XP"],[`${streak} days`,"🔥","Streak"],[`${overallPct}%`,"🎯","Accuracy"]].map(([v,ic,lb])=>(
              <div key={lb} style={{...cardStyle,textAlign:"center",padding:"14px 8px"}}>
                <div style={{fontSize:22}}>{ic}</div>
                <div style={{fontSize:17,fontWeight:"bold",color:gold,marginTop:4}}>{v}</div>
                <div style={{fontSize:11,color:muted}}>{lb}</div>
              </div>
            ))}
          </div>

          {/* Additional stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
            <div style={{...cardStyle,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:20,color:gold,fontWeight:"bold"}}>{history.length}</div>
              <div style={{fontSize:11,color:muted}}>Total Sessions</div>
            </div>
            <div style={{...cardStyle,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:20,color:gold,fontWeight:"bold"}}>{tricky.length}</div>
              <div style={{fontSize:11,color:muted}}>Tricky Words Saved</div>
            </div>
          </div>

          {/* 7-day XP bar chart */}
          <div style={{...cardStyle,marginTop:12}}>
            <div style={{fontSize:13,color:muted,marginBottom:12}}>📊 XP Earned — Last 7 Days</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90}}>
              {last7.map((d,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:10,color:muted,minHeight:14}}>{d.xpDay||""}</div>
                  <div style={{width:"100%",
                    background:d.xpDay?"linear-gradient(180deg,#f9a825,#ff6f00)":"rgba(255,255,255,.08)",
                    height:`${Math.max(4,(d.xpDay/maxXP)*60)}px`,
                    borderRadius:"4px 4px 0 0",transition:"height .4s"}}/>
                  <div style={{fontSize:10,color:muted}}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category performance */}
          <div style={{...cardStyle,marginTop:12}}>
            <div style={{fontSize:13,color:muted,marginBottom:10}}>📚 Performance by Category</div>
            {catStats.map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                <span style={{fontSize:18}}>{c.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                    <span style={{color:textCol}}>{c.label}</span>
                    <span style={{color:c.pct!=null?(c.pct>=70?"#43a047":c.pct>=50?"#f9a825":"#e53935"):muted}}>
                      {c.pct!=null?`${c.pct}%`:"No data yet"}
                    </span>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,.08)",borderRadius:3,marginTop:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${c.pct||0}%`,
                      background:c.pct>=70?"#43a047":c.pct>=50?"#f9a825":"#e53935",
                      borderRadius:3,transition:"width .5s"}}/>
                  </div>
                  <div style={{fontSize:11,color:muted,marginTop:2}}>{c.sessions} session{c.sessions!==1?"s":""}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tricky words at a glance */}
          <div style={{...cardStyle,marginTop:12}}>
            <div style={{fontSize:13,color:muted,marginBottom:8}}>⭐ Tricky Words ({tricky.length})</div>
            {tricky.length===0 ? <div style={{fontSize:13,color:muted}}>None saved yet.</div>
              : <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{tricky.map(w=><span key={w} style={{fontSize:12,background:"rgba(233,30,99,.15)",color:"#f48fb1",padding:"4px 10px",borderRadius:20}}>{w}</span>)}</div>}
          </div>

          {/* Recent sessions */}
          <div style={{...cardStyle,marginTop:12}}>
            <div style={{fontSize:13,color:muted,marginBottom:8}}>🕐 Recent Sessions</div>
            {history.length===0 ? <div style={{fontSize:13,color:muted}}>No sessions yet.</div>
              : [...history].reverse().slice(0,15).map((h,i)=>{
                const c=CATS.find(x=>x.id===h.cat)||{icon:"📚",label:h.cat};
                const pct=Math.round((h.correct/h.total)*100);
                const qtLabel={meaning:"Meanings",synonym:"Synonyms",antonym:"Antonyms"}[h.quizType]||"";
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                    padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                    <div>
                      <div style={{fontSize:13,color:textCol}}>{c.icon} {c.label} · {h.mode==="fillin"?"Fill Blank":"Flashcard"} · {qtLabel}</div>
                      <div style={{fontSize:11,color:muted}}>{h.date}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:13,fontWeight:"bold",color:pct>=70?"#43a047":pct>=50?"#f9a825":"#e53935"}}>{pct}%</div>
                      <div style={{fontSize:11,color:muted}}>+{h.xp} XP</div>
                    </div>
                  </div>
                );
              })
            }
          </div>

          {/* Controls */}
          <div style={{...cardStyle,marginTop:12,padding:"14px 16px"}}>
            <div style={{fontSize:13,color:muted,marginBottom:8}}>🛠️ Parent Controls</div>
            <button style={{...mkBtn("ghost"),fontSize:13,marginTop:0}}
              onClick={()=>{if(window.confirm("Reset ALL progress? This cannot be undone.")){saveXP(0);saveStr(0);saveTricky([]);saveHist([]);}}}>
              🔄 Reset All Progress
            </button>
          </div>
          <div style={{height:24}}/>
        </div>
        <BottomNav tab={nav} onTab={goNav}/>
      </div>
    );
  }

  return null;
}