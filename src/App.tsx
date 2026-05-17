import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// WORD BANK
// ─────────────────────────────────────────────────────────────────────────────
const WORD_BANK = [
  // EMOTIONS
  { word:"Jubilant",     category:"emotions",   meaning:"Feeling great happiness and triumph",             sentence:"The ___ children cheered when school was cancelled.",           hint:"Jubilee → celebration",           synonyms:["elated","overjoyed","exultant"],         antonyms:["miserable","dejected","sorrowful"] },
  { word:"Melancholy",   category:"emotions",   meaning:"A deep feeling of pensive sadness",               sentence:"A ___ tune drifted from the old piano.",                       hint:"Melan = black (Greek)",            synonyms:["sorrowful","gloomy","wistful"],           antonyms:["cheerful","elated","joyful"] },
  { word:"Forlorn",      category:"emotions",   meaning:"Pitifully sad and abandoned",                     sentence:"The ___ puppy sat alone in the rain.",                         hint:"For + lorn = utterly lost",        synonyms:["miserable","wretched","desolate"],        antonyms:["content","cheerful","hopeful"] },
  { word:"Indignant",    category:"emotions",   meaning:"Feeling anger at unfair treatment",               sentence:"She was ___ when her essay was given to someone else.",         hint:"Indig = unworthy treatment",       synonyms:["outraged","furious","resentful"],         antonyms:["pleased","content","calm"] },
  { word:"Apprehensive", category:"emotions",   meaning:"Anxious or fearful about the future",             sentence:"He felt ___ before his first day at the new school.",           hint:"Apprehend = grasp with dread",     synonyms:["anxious","uneasy","worried"],             antonyms:["confident","reassured","calm"] },
  { word:"Elated",       category:"emotions",   meaning:"Extremely happy and excited",                     sentence:"She was ___ when she heard she had passed the exam.",           hint:"Elate = lift up",                  synonyms:["overjoyed","jubilant","thrilled"],        antonyms:["dejected","miserable","gloomy"] },
  { word:"Remorseful",   category:"emotions",   meaning:"Filled with deep regret for wrongdoing",          sentence:"The boy felt truly ___ after breaking his sister's toy.",       hint:"Re + morse = bite again (guilt)",  synonyms:["guilty","repentant","contrite"],          antonyms:["unrepentant","shameless","proud"] },
  { word:"Serene",       category:"emotions",   meaning:"Calm, peaceful and untroubled",                   sentence:"The ___ lake reflected the mountains like a mirror.",           hint:"Serene sounds like 'clear'",       synonyms:["tranquil","peaceful","placid"],           antonyms:["agitated","turbulent","anxious"] },
  // CHARACTER
  { word:"Benevolent",   category:"character",  meaning:"Kind, generous and well-meaning",                 sentence:"The ___ queen shared her feast with the whole village.",         hint:"Bene = good (Latin)",              synonyms:["kind","generous","charitable"],           antonyms:["malevolent","cruel","selfish"] },
  { word:"Diligent",     category:"character",  meaning:"Showing careful and consistent effort",            sentence:"The ___ pupil checked all her answers twice.",                  hint:"Diligence = hard work",            synonyms:["industrious","hardworking","assiduous"],  antonyms:["lazy","idle","negligent"] },
  { word:"Zealous",      category:"character",  meaning:"Having great energy or enthusiasm",                sentence:"The ___ student studied every evening for the exam.",           hint:"Zeal → passionate effort",         synonyms:["enthusiastic","fervent","keen"],          antonyms:["apathetic","indifferent","lukewarm"] },
  { word:"Impulsive",    category:"character",  meaning:"Acting quickly without thinking first",            sentence:"His ___ decision to climb the fence got him into trouble.",     hint:"Im + pulse = act on impulse",      synonyms:["reckless","hasty","spontaneous"],         antonyms:["cautious","deliberate","restrained"] },
  { word:"Tenacious",    category:"character",  meaning:"Very determined; not giving up easily",            sentence:"The ___ climber refused to turn back despite the storm.",       hint:"Tenac = holding on tightly",       synonyms:["persistent","resolute","determined"],     antonyms:["weak-willed","irresolute","feeble"] },
  { word:"Prudent",      category:"character",  meaning:"Acting with care and thought for the future",      sentence:"It was ___ to save money rather than spend it all at once.",    hint:"Prudent = wise planning",          synonyms:["sensible","careful","judicious"],         antonyms:["reckless","foolish","imprudent"] },
  { word:"Audacious",    category:"character",  meaning:"Showing a willingness to take bold risks",         sentence:"The ___ explorer sailed into uncharted waters alone.",           hint:"Aud = dare (Latin)",               synonyms:["bold","daring","fearless"],               antonyms:["timid","cowardly","cautious"] },
  { word:"Indolent",     category:"character",  meaning:"Wanting to avoid work or effort; lazy",            sentence:"The ___ boy left all his chores until the very last moment.",   hint:"In + dolent = without pain/effort", synonyms:["lazy","idle","sluggish"],                antonyms:["diligent","industrious","energetic"] },
  // ACTIONS
  { word:"Abolish",      category:"actions",    meaning:"To formally put an end to something",              sentence:"The government decided to ___ the unfair law.",                hint:"Ab + vanish",                      synonyms:["eliminate","eradicate","annul"],          antonyms:["establish","create","introduce"] },
  { word:"Deduce",       category:"actions",    meaning:"To reach a conclusion through reasoning",           sentence:"The detective could ___ who had stolen the jewels.",            hint:"De + reduce to facts",             synonyms:["infer","conclude","reason"],              antonyms:["assume","guess","speculate"] },
  { word:"Persevere",    category:"actions",    meaning:"To continue despite difficulty or delay",           sentence:"You must ___ even when the task feels impossible.",             hint:"Per = through + severe",           synonyms:["persist","endure","continue"],            antonyms:["quit","give up","surrender"] },
  { word:"Conceal",      category:"actions",    meaning:"To prevent something from being known or seen",     sentence:"He tried to ___ the broken vase behind the curtain.",           hint:"Con + ceal = cover up",            synonyms:["hide","disguise","mask"],                 antonyms:["reveal","expose","disclose"] },
  { word:"Elaborate",    category:"actions",    meaning:"To explain something in more detail",               sentence:"The teacher asked him to ___ on his answer.",                   hint:"Labour = work through in detail",  synonyms:["expand","explain","detail"],              antonyms:["simplify","summarise","condense"] },
  { word:"Lament",       category:"actions",    meaning:"To feel or express great sorrow or regret",         sentence:"He would ___ the loss of his favourite book for years.",        hint:"Lament = cry about",               synonyms:["mourn","grieve","bewail"],                antonyms:["celebrate","rejoice","revel"] },
  { word:"Dispel",       category:"actions",    meaning:"To make a feeling or belief disappear",             sentence:"Her calm words helped ___ his fears about the dark.",           hint:"Dis + pel = drive away",           synonyms:["banish","dismiss","scatter"],             antonyms:["create","instil","foster"] },
  { word:"Ponder",       category:"actions",    meaning:"To think about something carefully",                sentence:"She sat by the window to ___ the strange events of the day.",   hint:"Pon = weigh in the mind",          synonyms:["contemplate","reflect","muse"],           antonyms:["ignore","dismiss","react"] },
  // DESCRIBING
  { word:"Ominous",      category:"describing", meaning:"Suggesting something bad is about to happen",       sentence:"Dark ___ clouds gathered above the castle.",                   hint:"Omen → bad sign",                  synonyms:["threatening","foreboding","sinister"],    antonyms:["reassuring","promising","hopeful"] },
  { word:"Treacherous",  category:"describing", meaning:"Guilty of betrayal; dangerously unstable",          sentence:"The ___ path over the mountain was covered in ice.",            hint:"Treason → betrayal → dangerous",   synonyms:["dangerous","hazardous","deceitful"],      antonyms:["safe","loyal","trustworthy"] },
  { word:"Vivid",        category:"describing", meaning:"Producing powerful feelings; intensely bright",      sentence:"She had a ___ imagination that painted pictures in her mind.",  hint:"Viv = life → lively, bright",      synonyms:["striking","dazzling","bold"],             antonyms:["dull","pale","faded"] },
  { word:"Quaint",       category:"describing", meaning:"Attractively unusual or old-fashioned",              sentence:"They stayed in a ___ little cottage by the sea.",               hint:"Sounds old and charming",          synonyms:["charming","picturesque","quaint"],        antonyms:["modern","ordinary","unremarkable"] },
  { word:"Ambiguous",    category:"describing", meaning:"Open to more than one interpretation; unclear",      sentence:"The riddle was so ___ that nobody could agree on the answer.",  hint:"Ambi = both; could go either way", synonyms:["unclear","vague","cryptic"],              antonyms:["clear","definite","unambiguous"] },
  { word:"Notorious",    category:"describing", meaning:"Famous for something bad or shameful",                sentence:"The ___ pirate was feared across the seven seas.",              hint:"Notori + ous = known for bad",     synonyms:["infamous","disreputable","scandalous"],   antonyms:["unknown","reputable","honourable"] },
  { word:"Ferocious",    category:"describing", meaning:"Fierce and violently intense",                        sentence:"The ___ lion roared loudly across the savannah.",               hint:"Ferocious ≈ fierce",               synonyms:["fierce","savage","brutal"],               antonyms:["gentle","tame","mild"] },
  { word:"Eloquent",     category:"describing", meaning:"Fluent and persuasive in speech or writing",          sentence:"Her ___ speech moved the whole audience to tears.",             hint:"Eloq = speak out well",            synonyms:["articulate","expressive","fluent"],       antonyms:["inarticulate","mumbling","tongue-tied"] },
  // SYNONYMS FOCUS
  { word:"Cautious",     category:"synonyms",   meaning:"Careful to avoid danger or mistakes",                sentence:"She was ___ when crossing the busy road.",                     hint:"Caution → careful",                synonyms:["wary","careful","prudent"],               antonyms:["reckless","careless","impulsive"] },
  { word:"Hostile",      category:"synonyms",   meaning:"Unfriendly and aggressive",                          sentence:"The ___ crowd booed the visiting team.",                       hint:"Host gone wrong!",                 synonyms:["aggressive","belligerent","antagonistic"], antonyms:["friendly","welcoming","amicable"] },
  { word:"Reluctant",    category:"synonyms",   meaning:"Unwilling and hesitant to do something",              sentence:"He was ___ to admit that he had made a mistake.",               hint:"Re + luctant = pulling back",      synonyms:["unwilling","hesitant","loath"],           antonyms:["eager","willing","enthusiastic"] },
  { word:"Wary",         category:"synonyms",   meaning:"Cautious about possible dangers",                    sentence:"The deer was ___ of any noise in the forest.",                 hint:"Be aware → be wary",               synonyms:["cautious","alert","vigilant"],            antonyms:["careless","unsuspecting","trusting"] },
  { word:"Sincere",      category:"synonyms",   meaning:"Genuine; truly meaning what you say",                 sentence:"Her ___ apology made everyone feel better.",                   hint:"Sine = without + cera = wax",     synonyms:["genuine","heartfelt","honest"],           antonyms:["insincere","fake","dishonest"] },
  { word:"Brisk",        category:"synonyms",   meaning:"Active, quick and full of energy",                    sentence:"They set off at a ___ pace to beat the rain.",                  hint:"Brisk = crisp and fast",           synonyms:["lively","energetic","quick"],             antonyms:["slow","sluggish","lethargic"] },
  { word:"Furtive",      category:"synonyms",   meaning:"Attempting to avoid notice; secretive",               sentence:"He cast a ___ glance over his shoulder before opening the door.",hint:"Furtive = sneaky, like a thief",  synonyms:["secretive","stealthy","sly"],             antonyms:["open","transparent","brazen"] },
  { word:"Gloomy",       category:"synonyms",   meaning:"Dark and dull; causing sadness",                      sentence:"On the ___ winter morning, nobody wanted to go outside.",       hint:"Sounds like 'gloom'",              synonyms:["dismal","bleak","dreary"],                antonyms:["bright","cheerful","sunny"] },
];

const CATEGORIES = [
  { id:"all",        label:"All Words",          icon:"📚", color:"#ffd77a" },
  { id:"emotions",   label:"Emotions",           icon:"💛", color:"#ffca28" },
  { id:"character",  label:"Character",          icon:"🧭", color:"#66bb6a" },
  { id:"actions",    label:"Actions",            icon:"⚔️", color:"#42a5f5" },
  { id:"describing", label:"Describing",         icon:"🎨", color:"#ab47bc" },
  { id:"synonyms",   label:"Synonyms",           icon:"🔗", color:"#ff7043" },
  { id:"tricky",     label:"My Tricky Words",    icon:"⭐", color:"#ffd77a" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const pick    = (arr, n) => shuffle(arr).slice(0, n);
const todayStr = () => new Date().toDateString();

const ls = {
  get: (k, d=null) => { try { const v=localStorage.getItem(k); return v!==null?JSON.parse(v):d; } catch{ return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch{} },
};

const LEVELS = [
  { name:"Scout",    minXP:0,   icon:"🗺️" },
  { name:"Explorer", minXP:50,  icon:"⚔️" },
  { name:"Ranger",   minXP:120, icon:"🏹" },
  { name:"Champion", minXP:250, icon:"🏆" },
  { name:"Legend",   minXP:450, icon:"👑" },
];
const getLevel     = xp => { let l=LEVELS[0]; for(const lv of LEVELS) if(xp>=lv.minXP) l=lv; return l; };
const getNextLevel = xp => LEVELS.find(lv => lv.minXP > xp) || null;

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const gold = "#ffd77a";
const muted = "#a89070";
const textMain = "#f0e6d3";

const appStyle = {
  minHeight:"100vh",
  background:"linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)",
  fontFamily:"Georgia,serif", color:textMain,
  display:"flex", flexDirection:"column", alignItems:"center",
  paddingBottom:64, position:"relative", overflowX:"hidden",
};
const glowStyle = {
  position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:0,
  background:"radial-gradient(ellipse at 20% 20%,rgba(255,220,150,.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(150,180,255,.07) 0%,transparent 60%)",
};
const hdrStyle = {
  width:"100%",maxWidth:430,zIndex:2,
  background:"rgba(8,6,24,.7)",backdropFilter:"blur(16px)",
  borderBottom:"1px solid rgba(255,200,100,.18)",
  padding:"12px 18px 10px",
  display:"flex",alignItems:"center",justifyContent:"space-between",
};
const wrapStyle = { width:"100%", maxWidth:430, zIndex:1, padding:"0 14px" };

const cardStyle = {
  background:"rgba(255,255,255,.07)",
  border:"1px solid rgba(255,200,100,.22)",
  borderRadius:20, padding:"22px 18px", marginTop:16,
  backdropFilter:"blur(8px)",
  boxShadow:"0 8px 32px rgba(0,0,0,.45)",
};

const btn = (variant="primary") => ({
  display:"block",width:"100%",padding:"13px 18px",
  borderRadius:14,border:"none",cursor:"pointer",
  fontSize:15,fontWeight:"bold",letterSpacing:.4,marginTop:10,transition:"all .15s",
  ...(variant==="primary"?{ background:"linear-gradient(135deg,#f9a825,#ff6f00)",color:"#1a0a00",boxShadow:"0 4px 16px rgba(249,168,37,.3)" }
    :variant==="success"?{ background:"linear-gradient(135deg,#43a047,#1b5e20)",color:"#fff" }
    :variant==="danger" ?{ background:"linear-gradient(135deg,#e53935,#7f0000)",color:"#fff" }
    :variant==="info"   ?{ background:"linear-gradient(135deg,#1565c0,#0288d1)",color:"#fff" }
    :{ background:"rgba(255,255,255,.08)",color:"#d0c0a8",border:"1px solid rgba(255,255,255,.14)" }),
});

const inputStyle = {
  width:"100%",boxSizing:"border-box",padding:"13px 15px",
  borderRadius:12,border:"1px solid rgba(255,200,100,.3)",
  background:"rgba(255,255,255,.08)",color:textMain,fontSize:15,
  outline:"none",marginTop:10,fontFamily:"Georgia,serif",
};

const pill = (col=gold) => ({
  display:"inline-block",
  background:`${col}22`,border:`1px solid ${col}44`,
  borderRadius:20,padding:"3px 10px",fontSize:12,color:col,
});

const tag = (col=gold) => ({
  display:"inline-block",
  background:`${col}18`,border:`1px solid ${col}44`,
  borderRadius:20,padding:"2px 9px",fontSize:12,color:col,
  marginRight:4,marginTop:4,
});

const catBtn = (active, col) => ({
  padding:"9px 13px",borderRadius:12,
  border:`1px solid ${active?col:"rgba(255,255,255,.1)"}`,
  background:active?`${col}22`:"rgba(255,255,255,.04)",
  color:active?col:muted,cursor:"pointer",
  fontSize:13,fontWeight:active?"bold":"normal",
  whiteSpace:"nowrap",transition:"all .2s",flexShrink:0,
});

const dot = st => ({
  width:13,height:13,borderRadius:"50%",
  background:st==="correct"?"#43a047":st==="wrong"?"#e53935":"rgba(255,255,255,.13)",
  border:st==="current"?"2px solid #ffd77a":"2px solid transparent",
});

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const BackBtn = ({onClick}) => (
  <button onClick={onClick}
    style={{background:"none",border:"none",color:gold,fontSize:22,cursor:"pointer",padding:"0 4px",lineHeight:1}}>
    ←
  </button>
);

const ProgressDots = ({answers, total, idx}) => (
  <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",margin:"12px 0 2px"}}>
    {Array.from({length:total}).map((_,i) => (
      <div key={i} style={dot(
        answers[i]==="correct"?"correct":answers[i]==="wrong"?"wrong":i===idx?"current":"none"
      )}/>
    ))}
  </div>
);

const SynRow = ({label, items, col}) => !items?.length ? null : (
  <div style={{marginTop:5}}>
    <span style={{fontSize:11,color:muted}}>{label}: </span>
    {items.map(w => <span key={w} style={tag(col)}>{w}</span>)}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────────────────────────────────────
function BottomNav({tab, onTab}) {
  const tabs = [
    {id:"home",  icon:"🗺️", label:"Quest"},
    {id:"words", icon:"📚", label:"Words"},
    {id:"parent",icon:"📊", label:"Parent"},
  ];
  return (
    <div style={{
      position:"fixed",bottom:0,left:0,right:0,zIndex:20,
      background:"rgba(8,6,24,.93)",backdropFilter:"blur(16px)",
      borderTop:"1px solid rgba(255,200,100,.14)",
      display:"flex",justifyContent:"center",
    }}>
      <div style={{display:"flex",width:"100%",maxWidth:430}}>
        {tabs.map(({id,icon,label}) => (
          <button key={id} onClick={()=>onTab(id)}
            style={{
              flex:1,padding:"11px 0 8px",border:"none",cursor:"pointer",
              background:"transparent",display:"flex",flexDirection:"column",
              alignItems:"center",gap:2,
              color:tab===id?gold:"#6a5a42",transition:"color .2s",
            }}>
            <span style={{fontSize:20}}>{icon}</span>
            <span style={{fontSize:11,fontFamily:"Georgia,serif",fontWeight:tab===id?"bold":"normal"}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function VocabQuest() {
  // Persistent
  const [xp,        setXpRaw]    = useState(() => ls.get("vq2_xp", 0));
  const [streak,    setStreakRaw] = useState(() => ls.get("vq2_streak", 0));
  const [lastDate,  setLastDate]  = useState(() => ls.get("vq2_date", ""));
  const [tricky,    setTrickyRaw] = useState(() => ls.get("vq2_tricky", []));
  const [history,   setHistoryRaw]= useState(() => ls.get("vq2_history", []));

  // Navigation
  const [navTab,    setNavTab]    = useState("home");
  const [screen,    setScreen]    = useState("home");

  // Quiz session
  const [selCat,    setSelCat]    = useState("all");
  const [mode,      setMode]      = useState("flashcard");
  const [quizType,  setQuizType]  = useState("main");
  const [sessionWords, setSW]     = useState([]);
  const [idx,       setIdx]       = useState(0);
  const [answers,   setAnswers]   = useState([]);
  const [sessionXp, setSessionXp] = useState(0);
  const [showMeaning,setShowMean] = useState(false);
  const [showHint,  setShowHint]  = useState(false);
  const [fillVal,   setFillVal]   = useState("");
  const [fillResult,setFillRes]   = useState(null);

  // Parent PIN
  const [pinInput,   setPinInput]   = useState("");
  const [pinUnlocked,setPinUnlocked]= useState(false);
  const [pinError,   setPinError]   = useState(false);
  const PIN = "1234";

  // Word list
  const [filterCat, setFilterCat] = useState("all");
  const [search,    setSearch]    = useState("");

  // Streak check on load
  useEffect(() => {
    const t = todayStr();
    if (lastDate !== t) {
      const yest = new Date(Date.now()-86400000).toDateString();
      if (lastDate !== yest && lastDate !== "") {
        ls.set("vq2_streak", 0); setStreakRaw(0);
      }
    }
  }, []);

  // Savers
  const saveXP      = v => { setXpRaw(v);     ls.set("vq2_xp", v); };
  const saveStreak  = v => { setStreakRaw(v);  ls.set("vq2_streak", v); ls.set("vq2_date", todayStr()); setLastDate(todayStr()); };
  const saveTricky  = v => { setTrickyRaw(v);  ls.set("vq2_tricky", v); };
  const saveHistory = v => { const t=v.slice(-80); setHistoryRaw(t); ls.set("vq2_history", t); };

  const toggleTricky = word => {
    const next = tricky.includes(word) ? tricky.filter(w=>w!==word) : [...tricky, word];
    saveTricky(next);
  };

  // Level
  const level     = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const xpPct     = nextLevel ? Math.min(100,((xp-level.minXP)/(nextLevel.minXP-level.minXP))*100) : 100;

  // Pool
  const getPool = cat => {
    if (cat==="tricky") return WORD_BANK.filter(w => tricky.includes(w.word));
    if (cat==="all")    return WORD_BANK;
    return WORD_BANK.filter(w => w.category===cat);
  };

  // Nav
  const goNav = tab => {
    setNavTab(tab);
    if (tab==="home")   { setScreen("home"); }
    if (tab==="words")  { setSearch(""); setFilterCat("all"); setScreen("wordlist"); }
    if (tab==="parent") { setPinUnlocked(false); setPinInput(""); setPinError(false); setScreen("parent"); }
  };

  // Start session
  const startSession = (m, cat, qt="main") => {
    const pool = getPool(cat);
    if (!pool.length) return;
    setSW(pick(pool, Math.min(8, pool.length)));
    setMode(m); setSelCat(cat); setQuizType(qt);
    setIdx(0); setAnswers([]); setSessionXp(0);
    setShowMean(false); setShowHint(false);
    setFillVal(""); setFillRes(null);
    setScreen("quiz");
  };

  // Record answer
  const recordAnswer = correct => {
    const gained = correct ? (mode==="fillin"?8:5) : (mode==="fillin"?3:2);
    const newAns = [...answers, correct?"correct":"wrong"];
    const newSXP = sessionXp + gained;
    setAnswers(newAns); setSessionXp(newSXP);
    if (idx+1 < sessionWords.length) {
      setIdx(idx+1);
      setShowMean(false); setShowHint(false); setFillVal(""); setFillRes(null);
    } else {
      const newXP = xp + newSXP;
      saveXP(newXP); saveStreak(streak+1);
      const rec = { date:todayStr(), mode, cat:selCat, quizType,
                    correct:newAns.filter(a=>a==="correct").length, total:newAns.length, xp:newSXP };
      saveHistory([...history, rec]);
      setScreen("summary");
    }
  };

  const handleFillSubmit = () => {
    if (!fillVal.trim() || fillRes) return;
    const correct = fillVal.trim().toLowerCase() === currentWord.word.toLowerCase();
    setFillRes(correct?"correct":"wrong");
    setTimeout(() => recordAnswer(correct), 1300);
  };

  const currentWord = sessionWords[idx];

  // ═══════════════════════════════════════════════════════════════════════
  // HOME
  // ═══════════════════════════════════════════════════════════════════════
  if (screen==="home") return (
    <div style={appStyle}>
      <div style={glowStyle}/>
      <div style={{...hdrStyle, borderRadius:"0 0 18px 18px"}}>
        <div>
          <div style={{fontSize:18,fontWeight:"bold",color:gold,letterSpacing:1}}>📖 Vocab Quest</div>
          <div style={{fontSize:11,color:muted}}>11+ Grammar Prep</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:"#ffb74d",justifyContent:"flex-end"}}>
            🔥 {streak} day streak
          </div>
          <div style={{fontSize:11,color:muted,marginTop:2}}>⭐ {xp} XP total</div>
        </div>
      </div>

      <div style={wrapStyle}>
        {/* Level */}
        <div style={{...cardStyle,textAlign:"center",padding:"18px 20px 14px"}}>
          <div style={{fontSize:42}}>{level.icon}</div>
          <div style={{fontSize:20,fontWeight:"bold",color:gold,marginTop:4}}>{level.name}</div>
          <div style={{fontSize:12,color:muted,marginBottom:8}}>
            {nextLevel ? `${nextLevel.minXP-xp} XP to ${nextLevel.name} ${nextLevel.icon}` : "👑 Max Level!"}
          </div>
          <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.1)",overflow:"hidden",margin:"4px 0 2px"}}>
            <div style={{height:"100%",width:`${xpPct}%`,background:"linear-gradient(90deg,#f9a825,#ffd54f)",borderRadius:3,transition:"width .6s"}}/>
          </div>
          <div style={{fontSize:11,color:muted,marginTop:3}}>{xp} XP</div>
        </div>

        {/* Category picker */}
        <div style={{...cardStyle,padding:"16px 14px"}}>
          <div style={{fontSize:13,color:muted,marginBottom:9}}>📂 Choose a word set:</div>
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} style={catBtn(selCat===cat.id,cat.color)}
                onClick={()=>setSelCat(cat.id)}>
                {cat.icon} {cat.label}
                {cat.id==="tricky" && <span style={{marginLeft:3,opacity:.65}}>({tricky.length})</span>}
              </button>
            ))}
          </div>
          {selCat==="tricky" && tricky.length===0 && (
            <div style={{fontSize:13,color:muted,marginTop:10,textAlign:"center"}}>
              ⭐ Star words during quizzes to add them here.
            </div>
          )}
        </div>

        {/* Mode picker */}
        <div style={{...cardStyle,padding:"16px 14px"}}>
          <div style={{fontSize:13,color:muted,marginBottom:9}}>⚔️ Choose your quest:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {[
              {m:"flashcard",qt:"main",    icon:"🃏",label:"Flashcards",    sub:"5 XP each"},
              {m:"fillin",   qt:"main",    icon:"✍️",label:"Fill the Blank",sub:"8 XP each"},
              {m:"flashcard",qt:"synonym",  icon:"🔗",label:"Synonyms",      sub:"5 XP each"},
              {m:"flashcard",qt:"antonym",  icon:"↔️",label:"Antonyms",      sub:"5 XP each"},
            ].map(({m,qt,icon,label,sub}) => {
              const pool = getPool(selCat);
              const disabled = pool.length===0;
              return (
                <button key={label}
                  onClick={()=>!disabled&&startSession(m,selCat,qt)}
                  style={{...btn("ghost"),display:"flex",flexDirection:"column",alignItems:"center",
                    gap:4,padding:"14px 8px",opacity:disabled?.4:1,cursor:disabled?"not-allowed":"pointer"}}>
                  <span style={{fontSize:24}}>{icon}</span>
                  <span style={{fontSize:13}}>{label}</span>
                  <span style={{fontSize:11,color:muted}}>{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:12,fontSize:12,color:"#5a4535"}}>
          {WORD_BANK.length} words · {CATEGORIES.length-2} topic sets
        </div>
      </div>
      <BottomNav tab={navTab} onTab={goNav}/>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // QUIZ
  // ═══════════════════════════════════════════════════════════════════════
  if (screen==="quiz" && currentWord) {
    const catMeta = CATEGORIES.find(c=>c.id===selCat)||CATEGORIES[0];
    const isTricky = tricky.includes(currentWord.word);
    const fillParts = currentWord.sentence.split("___");
    const modeLabel = quizType==="synonym"?"Synonyms":quizType==="antonym"?"Antonyms":mode==="fillin"?"Fill the Blank":"Flashcards";

    return (
      <div style={appStyle}>
        <div style={glowStyle}/>
        <div style={hdrStyle}>
          <BackBtn onClick={()=>setScreen("home")}/>
          <div style={{fontSize:14,color:muted}}>{modeLabel} — {idx+1}/{sessionWords.length}</div>
          <div style={pill()}>+{sessionXp} XP</div>
        </div>

        <div style={wrapStyle}>
          <ProgressDots answers={answers} total={sessionWords.length} idx={idx}/>
          <div style={cardStyle}>
            {/* Header row */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={tag(catMeta.color)}>{catMeta.icon} {catMeta.label}</span>
              <button onClick={()=>toggleTricky(currentWord.word)}
                title={isTricky?"Remove from tricky":"Add to tricky"}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:20,opacity:isTricky?1:.25,lineHeight:1}}>⭐</button>
            </div>

            <div style={{fontSize:32,fontWeight:"bold",color:gold,textAlign:"center",letterSpacing:2,marginBottom:4,textShadow:"0 2px 10px rgba(255,200,80,.4)"}}>
              {currentWord.word}
            </div>
            {showHint && <div style={{fontSize:13,color:muted,textAlign:"center",fontStyle:"italic",marginBottom:4}}>💡 {currentWord.hint}</div>}

            {/* ── FLASHCARD MAIN ── */}
            {mode==="flashcard" && quizType==="main" && (
              !showMeaning ? (
                <>
                  <div style={{fontSize:14,color:"#6a5a40",textAlign:"center",marginTop:10}}>Do you know this word?</div>
                  <button style={btn("ghost")} onClick={()=>setShowMean(true)}>Reveal meaning</button>
                  <button style={{...btn("ghost"),marginTop:8,fontSize:13}} onClick={()=>setShowHint(true)}>💡 Show hint</button>
                </>
              ) : (
                <>
                  <div style={{fontSize:15,color:"#e0d4c0",textAlign:"center",lineHeight:1.65,marginTop:12}}>{currentWord.meaning}</div>
                  <div style={{fontSize:13,color:muted,textAlign:"center",marginTop:8,fontStyle:"italic"}}>Did you know it?</div>
                  <button style={btn("success")} onClick={()=>recordAnswer(true)}>✅ Yes, I knew it!</button>
                  <button style={btn("danger")}  onClick={()=>recordAnswer(false)}>❌ Still learning</button>
                </>
              )
            )}

            {/* ── SYNONYM ── */}
            {quizType==="synonym" && (
              !showMeaning ? (
                <>
                  <div style={{fontSize:13,color:muted,textAlign:"center",marginTop:8}}>Can you name a synonym?</div>
                  <button style={btn("ghost")} onClick={()=>setShowMean(true)}>Reveal synonyms</button>
                  <button style={{...btn("ghost"),marginTop:8,fontSize:13}} onClick={()=>setShowHint(true)}>💡 Show hint</button>
                </>
              ) : (
                <>
                  <div style={{marginTop:12,textAlign:"center"}}>
                    {currentWord.synonyms?.map(s=><span key={s} style={tag("#42a5f5")}>{s}</span>)}
                  </div>
                  <div style={{fontSize:14,color:"#d0c0a8",textAlign:"center",marginTop:10}}>{currentWord.meaning}</div>
                  <button style={btn("success")} onClick={()=>recordAnswer(true)}>✅ Got one!</button>
                  <button style={btn("danger")}  onClick={()=>recordAnswer(false)}>❌ Needed the reveal</button>
                </>
              )
            )}

            {/* ── ANTONYM ── */}
            {quizType==="antonym" && (
              !showMeaning ? (
                <>
                  <div style={{fontSize:13,color:muted,textAlign:"center",marginTop:8}}>Can you name an antonym (opposite)?</div>
                  <button style={btn("ghost")} onClick={()=>setShowMean(true)}>Reveal antonyms</button>
                  <button style={{...btn("ghost"),marginTop:8,fontSize:13}} onClick={()=>setShowHint(true)}>💡 Show hint</button>
                </>
              ) : (
                <>
                  <div style={{marginTop:12,textAlign:"center"}}>
                    {currentWord.antonyms?.map(s=><span key={s} style={tag("#ff7043")}>{s}</span>)}
                  </div>
                  <div style={{fontSize:14,color:"#d0c0a8",textAlign:"center",marginTop:10}}>{currentWord.meaning}</div>
                  <button style={btn("success")} onClick={()=>recordAnswer(true)}>✅ Got one!</button>
                  <button style={btn("danger")}  onClick={()=>recordAnswer(false)}>❌ Needed the reveal</button>
                </>
              )
            )}

            {/* ── FILL IN THE BLANK ── */}
            {mode==="fillin" && quizType==="main" && (
              <>
                <div style={{fontSize:12,color:muted,textAlign:"center",marginBottom:6}}>Fill in the missing word:</div>
                <div style={{fontSize:16,lineHeight:1.9,color:"#e8dcc8",textAlign:"center",fontStyle:"italic"}}>
                  {fillParts[0]}
                  <span style={{
                    display:"inline-block",borderBottom:"2px solid #ffd77a",minWidth:88,
                    color:fillRes?"#ffd77a":fillVal?"#ffd77a":"#5a4a38",
                    fontStyle:"normal",fontWeight:"bold",padding:"0 4px",
                  }}>
                    {fillRes ? currentWord.word : fillVal||"___"}
                  </span>
                  {fillParts[1]}
                </div>

                {fillRes ? (
                  <div style={{textAlign:"center",marginTop:10}}>
                    <div style={{fontSize:40}}>{fillRes==="correct"?"🌟":"💫"}</div>
                    <div style={{color:fillRes==="correct"?"#66bb6a":"#ef5350",fontWeight:"bold",fontSize:15}}>
                      {fillRes==="correct"?"Brilliant! +8 XP":`The word was: ${currentWord.word}`}
                    </div>
                    {fillRes==="wrong" && <div style={{fontSize:13,color:"#a89070",marginTop:6,textAlign:"center"}}>{currentWord.meaning}</div>}
                  </div>
                ) : (
                  <>
                    {showHint && <div style={{fontSize:13,color:muted,textAlign:"center",fontStyle:"italic",marginTop:6}}>💡 {currentWord.hint}</div>}
                    <input style={{...inputStyle,textAlign:"center",textTransform:"capitalize"}}
                      value={fillVal} onChange={e=>setFillVal(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&handleFillSubmit()}
                      placeholder="Type your answer…" autoFocus autoCapitalize="words"/>
                    <button style={btn("primary")} onClick={handleFillSubmit}>⚔️ Submit</button>
                    <button style={{...btn("ghost"),marginTop:8,fontSize:13}} onClick={()=>setShowHint(true)}>💡 Show hint</button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════
  if (screen==="summary") {
    const correct = answers.filter(a=>a==="correct").length;
    const pct     = Math.round((correct/answers.length)*100);
    const stars   = pct>=90?3:pct>=60?2:1;

    return (
      <div style={appStyle}>
        <div style={glowStyle}/>
        <div style={hdrStyle}>
          <div style={{width:28}}/>
          <div style={{fontSize:17,fontWeight:"bold",color:gold,letterSpacing:1}}>Quest Complete!</div>
          <div style={{width:28}}/>
        </div>
        <div style={wrapStyle}>
          <div style={{...cardStyle,textAlign:"center",marginTop:20}}>
            <div style={{fontSize:48,marginBottom:6}}>{"⭐".repeat(stars)}{"☆".repeat(3-stars)}</div>
            <div style={{fontSize:26,fontWeight:"bold",color:gold}}>{correct}/{answers.length} correct</div>
            <div style={{fontSize:14,color:muted,marginTop:4}}>
              {pct>=90?"Legendary! 👑":pct>=70?"Great adventuring! 🏆":pct>=50?"Good effort! ⚔️":"Keep going, hero! 💪"}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:16}}>
              {[
                {val:`+${sessionXp}`,label:"XP earned",col:gold},
                {val:`🔥 ${streak}`,  label:"Day streak",col:"#ffb74d"},
                {val:correct,         label:"Correct",   col:"#66bb6a"},
              ].map(({val,label,col})=>(
                <div key={label}>
                  <div style={{fontSize:22,fontWeight:"bold",color:col}}>{val}</div>
                  <div style={{fontSize:11,color:muted}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Word review */}
          <div style={{...cardStyle,marginTop:14}}>
            <div style={{fontSize:13,color:muted,marginBottom:8,textAlign:"center"}}>📝 Word Review</div>
            {sessionWords.map((w,i)=>(
              <div key={i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>{answers[i]==="correct"?"✅":"❌"}</span>
                  <span style={{fontWeight:"bold",color:gold,fontSize:15}}>{w.word}</span>
                  <button onClick={()=>toggleTricky(w.word)}
                    style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:16,opacity:tricky.includes(w.word)?1:.2,lineHeight:1}}>⭐</button>
                </div>
                <div style={{fontSize:13,color:"#a89070",marginTop:3,paddingLeft:22}}>{w.meaning}</div>
                <div style={{paddingLeft:22}}>
                  <SynRow label="Synonyms" items={w.synonyms} col="#42a5f5"/>
                  <SynRow label="Antonyms" items={w.antonyms} col="#ff7043"/>
                </div>
              </div>
            ))}
          </div>

          <button style={{...btn("primary"),marginTop:16}} onClick={()=>{ setNavTab("home"); setScreen("home"); }}>
            🗺️ Back to Quest Map
          </button>
          <button style={{...btn("ghost"),marginTop:10}} onClick={()=>startSession(mode,selCat,quizType)}>
            🔄 Play Again
          </button>
          <div style={{height:20}}/>
        </div>
        <BottomNav tab={navTab} onTab={goNav}/>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // WORD LIST
  // ═══════════════════════════════════════════════════════════════════════
  if (screen==="wordlist") {
    const pool = getPool(filterCat).filter(w =>
      !search ||
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div style={appStyle}>
        <div style={glowStyle}/>
        <div style={hdrStyle}>
          <div style={{fontSize:17,fontWeight:"bold",color:gold}}>📚 Word Library</div>
          <div style={pill()}>{pool.length} words</div>
        </div>
        <div style={wrapStyle}>
          <input style={{...inputStyle,marginTop:14}} placeholder="🔍 Search words or meanings…"
            value={search} onChange={e=>setSearch(e.target.value)}/>

          <div style={{display:"flex",gap:7,overflowX:"auto",padding:"10px 0",margin:"2px 0"}}>
            {CATEGORIES.map(cat=>(
              <button key={cat.id} style={catBtn(filterCat===cat.id,cat.color)} onClick={()=>setFilterCat(cat.id)}>
                {cat.icon} {cat.id==="all"?"All":cat.id==="tricky"?`Tricky (${tricky.length})`:cat.label}
              </button>
            ))}
          </div>

          {pool.length===0 && (
            <div style={{...cardStyle,textAlign:"center",color:muted,fontSize:14}}>
              {filterCat==="tricky"
                ? "No tricky words yet! ⭐ Star words during quizzes to add them here."
                : "No words found."}
            </div>
          )}

          {pool.map((w,i)=>{
            const cat = CATEGORIES.find(c=>c.id===w.category)||CATEGORIES[0];
            const isTr = tricky.includes(w.word);
            return (
              <div key={i} style={{...cardStyle,padding:"14px 16px",marginTop:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontWeight:"bold",color:gold,fontSize:17}}>{w.word}</div>
                  <span style={tag(cat.color)}>{cat.icon} {cat.label}</span>
                  <button onClick={()=>toggleTricky(w.word)}
                    style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",fontSize:18,opacity:isTr?1:.2,lineHeight:1}}
                    title={isTr?"Remove from tricky":"Add to tricky"}>⭐</button>
                </div>
                <div style={{fontSize:14,color:"#d0c0a8",marginTop:4}}>{w.meaning}</div>
                <div style={{fontSize:13,fontStyle:"italic",color:muted,marginTop:4}}>
                  "{w.sentence.replace("___",`[${w.word}]`)}"
                </div>
                <SynRow label="Synonyms" items={w.synonyms} col="#42a5f5"/>
                <SynRow label="Antonyms" items={w.antonyms} col="#ff7043"/>
                {w.hint && <div style={{fontSize:12,color:muted,fontStyle:"italic",marginTop:5}}>💡 {w.hint}</div>}
              </div>
            );
          })}
          <div style={{height:80}}/>
        </div>
        <BottomNav tab={navTab} onTab={goNav}/>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PARENT DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════
  if (screen==="parent") {
    if (!pinUnlocked) return (
      <div style={appStyle}>
        <div style={glowStyle}/>
        <div style={hdrStyle}>
          <BackBtn onClick={()=>goNav("home")}/>
          <div style={{fontSize:17,fontWeight:"bold",color:gold}}>🔒 Parent Dashboard</div>
          <div style={{width:28}}/>
        </div>
        <div style={wrapStyle}>
          <div style={{...cardStyle,textAlign:"center",marginTop:30}}>
            <div style={{fontSize:48,marginBottom:12}}>🔐</div>
            <div style={{fontSize:15,color:muted,marginBottom:14}}>Enter parent PIN to continue</div>
            <div style={{fontSize:12,color:"#6a5535",marginBottom:12}}>(Default PIN: 1234)</div>
            <input style={{...inputStyle,textAlign:"center",letterSpacing:10,fontSize:24}}
              type="password" maxLength={4} value={pinInput}
              onChange={e=>{ setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={e=>{ if(e.key==="Enter"){ if(pinInput===PIN) setPinUnlocked(true); else{ setPinError(true); setPinInput(""); } } }}
              placeholder="● ● ● ●"/>
            {pinError && <div style={{color:"#e53935",fontSize:13,marginTop:8}}>Incorrect PIN. Try again.</div>}
            <button style={{...btn("primary"),marginTop:14}}
              onClick={()=>{ if(pinInput===PIN) setPinUnlocked(true); else{ setPinError(true); setPinInput(""); } }}>
              Unlock Dashboard
            </button>
          </div>
        </div>
        <BottomNav tab={navTab} onTab={goNav}/>
      </div>
    );

    // Stats
    const totalSessions = history.length;
    const totalCorrect  = history.reduce((s,h)=>s+h.correct,0);
    const totalAns      = history.reduce((s,h)=>s+h.total,0);
    const overallPct    = totalAns ? Math.round((totalCorrect/totalAns)*100) : 0;
    const now           = Date.now();
    const last7XP       = history.filter(h=>new Date(h.date)>new Date(now-7*86400000)).reduce((s,h)=>s+h.xp,0);

    const catBreakdown = CATEGORIES.filter(c=>c.id!=="all"&&c.id!=="tricky").map(cat=>{
      const hs = history.filter(h=>h.cat===cat.id);
      const c2 = hs.reduce((s,h)=>s+h.correct,0);
      const t  = hs.reduce((s,h)=>s+h.total,0);
      return {...cat, sessions:hs.length, pct:t?Math.round((c2/t)*100):null};
    });

    return (
      <div style={appStyle}>
        <div style={glowStyle}/>
        <div style={hdrStyle}>
          <BackBtn onClick={()=>{ setPinUnlocked(false); goNav("home"); }}/>
          <div style={{fontSize:17,fontWeight:"bold",color:gold}}>📊 Parent Dashboard</div>
          <div style={pill()}>PIN: {PIN}</div>
        </div>

        <div style={wrapStyle}>
          {/* Overview grid */}
          <div style={{...cardStyle,marginTop:18}}>
            <div style={{fontSize:13,color:muted,marginBottom:10}}>📈 Overall Progress</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
              {[
                {val:xp,           label:"Total XP",   col:gold},
                {val:`🔥 ${streak}`,label:"Day Streak", col:"#ffb74d"},
                {val:level.name,   label:"Level",      col:gold},
                {val:totalSessions,label:"Sessions",   col:"#66bb6a"},
                {val:`${overallPct}%`,label:"Accuracy",col:overallPct>=70?"#66bb6a":overallPct>=50?"#f9a825":"#e53935"},
                {val:last7XP,      label:"XP (7 days)",col:"#42a5f5"},
              ].map(({val,label,col})=>(
                <div key={label} style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:"12px 6px",textAlign:"center"}}>
                  <div style={{fontSize:19,fontWeight:"bold",color:col}}>{val}</div>
                  <div style={{fontSize:11,color:muted,marginTop:2}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tricky words */}
          <div style={{...cardStyle,marginTop:14}}>
            <div style={{fontSize:13,color:muted,marginBottom:8}}>⭐ Tricky Words ({tricky.length})</div>
            {tricky.length===0
              ? <div style={{fontSize:13,color:muted}}>None marked yet — she can star words during quizzes.</div>
              : <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {tricky.map(w=><span key={w} style={tag(gold)}>{w}</span>)}
                </div>
            }
            {tricky.length>0 && (
              <button style={{...btn("ghost"),marginTop:12,fontSize:13}}
                onClick={()=>startSession("flashcard","tricky","main")}>
                🃏 Quiz on Tricky Words
              </button>
            )}
          </div>

          {/* Category breakdown */}
          <div style={{...cardStyle,marginTop:14}}>
            <div style={{fontSize:13,color:muted,marginBottom:10}}>📂 Performance by Category</div>
            {catBreakdown.map(cat=>(
              <div key={cat.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <span style={{fontSize:18,width:24,textAlign:"center"}}>{cat.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:13,color:textMain}}>{cat.label}</span>
                    <span style={{fontSize:12,fontWeight:"bold",
                      color:cat.pct===null?muted:cat.pct>=70?"#66bb6a":cat.pct>=50?"#f9a825":"#e53935"}}>
                      {cat.pct===null?"—":cat.pct+"%"}
                    </span>
                  </div>
                  <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.08)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:3,
                      width:`${cat.pct||0}%`,
                      background:cat.pct>=70?"#43a047":cat.pct>=50?"#f9a825":"#e53935",
                      transition:"width .5s"}}/>
                  </div>
                  <div style={{fontSize:11,color:muted,marginTop:2}}>{cat.sessions} session{cat.sessions!==1?"s":""}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent sessions */}
          <div style={{...cardStyle,marginTop:14}}>
            <div style={{fontSize:13,color:muted,marginBottom:8}}>🕐 Recent Sessions</div>
            {history.length===0
              ? <div style={{fontSize:13,color:muted}}>No sessions yet.</div>
              : [...history].reverse().slice(0,12).map((h,i)=>{
                  const cat = CATEGORIES.find(c=>c.id===h.cat)||{icon:"📚",label:h.cat};
                  const pct = Math.round((h.correct/h.total)*100);
                  const qLabel = h.quizType==="synonym"?" · Synonyms":h.quizType==="antonym"?" · Antonyms":"";
                  const mLabel = h.mode==="fillin"?"Fill Blank":"Flashcard";
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                      padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                      <div>
                        <div style={{fontSize:13,color:textMain}}>{cat.icon} {cat.label} · {mLabel}{qLabel}</div>
                        <div style={{fontSize:11,color:muted}}>{h.date}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:"bold",
                          color:pct>=70?"#66bb6a":pct>=50?"#f9a825":"#e53935"}}>{pct}%</div>
                        <div style={{fontSize:11,color:muted}}>+{h.xp} XP</div>
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Reset (hidden, for parent) */}
          <div style={{...cardStyle,marginTop:14,padding:"14px 16px"}}>
            <div style={{fontSize:13,color:muted,marginBottom:8}}>🛠️ Parent Controls</div>
            <button style={{...btn("ghost"),fontSize:13,marginTop:0}}
              onClick={()=>{ if(window.confirm("Reset all progress? This cannot be undone.")){ saveXP(0); saveStreak(0); saveTricky([]); saveHistory([]); }}}>
              🔄 Reset All Progress
            </button>
          </div>

          <div style={{height:80}}/>
        </div>
        <BottomNav tab={navTab} onTab={goNav}/>
      </div>
    );
  }

  return null;
}
