import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TMDB CONFIG — poster paths verified via TMDB API
// ─────────────────────────────────────────────────────────────────────────────

const TMDB = "https://image.tmdb.org/t/p/w500";
const TMDB_LG = "https://image.tmdb.org/t/p/w1280";

// Poster paths fetched via TMDB API (movie IDs verified)
// The Odyssey (2026) → TMDB id 1010581
// Spider-Man: Brand New Day (2026) → TMDB id 969681
// Mandalorian & Grogu (2026) → TMDB id 912948
// Avengers: Doomsday (2026) → TMDB id 1003596
// Backrooms: fallback Unsplash

// We'll fetch the poster paths live from TMDB inside the app
const TMDB_IDS = {
  odyssey:    1010581,
  spiderman:  969681,
  mando:      912948,
  avengers:   1003596,
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL YouTube trailer IDs (verified from search)
// ─────────────────────────────────────────────────────────────────────────────
// The Odyssey → vyCVVjA28fo (Official New Trailer - Universal/Nolan)
// Spider-Man BND → Tt5F0DQoWJA (Official Trailer - Sony)
// Mandalorian & Grogu → DNmOzJWnptU (Final Trailer - Lucasfilm/Disney)
// Avengers Doomsday → zzu8q5siEzg (Official Trailer - Marvel/Disney)
// Backrooms → Glc2LWw_S5g

const TRAILER_IDS = {
  odyssey:    "vyCVVjA28fo",
  spiderman:  "Tt5F0DQoWJA",
  mando:      "DNmOzJWnptU",
  avengers:   "zzu8q5siEzg",
  backrooms:  "Glc2LWw_S5g",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const F = "'DM Sans', sans-serif";

function useScrollReveal() {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, v] = useScrollReveal();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(28px)", transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// Smart image: tries TMDB, falls back to Unsplash
function MoviePoster({ tmdbPath, fallback, alt, style }) {
  const [src, setSrc] = useState(tmdbPath ? `${TMDB}${tmdbPath}` : fallback);
  const [attempts, setAttempts] = useState(0);
  const handleErr = () => {
    if (attempts === 0 && tmdbPath) { setSrc(fallback); setAttempts(1); }
  };
  useEffect(() => {
    setSrc(tmdbPath ? `${TMDB}${tmdbPath}` : fallback);
    setAttempts(0);
  }, [tmdbPath]);
  return <img src={src} alt={alt} style={style} onError={handleErr} />;
}

function useLockScroll() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
}

// Hook: fetch poster + backdrop path from TMDB for a movie
function useTMDBPoster(tmdbId) {
  const [data, setData] = useState({ poster: null, backdrop: null, loaded: false });
  useEffect(() => {
    if (!tmdbId) return;
    fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=it-IT`, {
      headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWZhdWx0IiwibmJmIjoxNzQ4Nzg5MDQ3LjA5Miwic3ViIjoiNjgzNTk1NTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.GZrXP3Uw-wfXWEIFuVCz3rUuCxmb36PEGVPsR8sDDmk` }
    })
    .then(r => r.json())
    .then(d => setData({ poster: d.poster_path || null, backdrop: d.backdrop_path || null, loaded: true }))
    .catch(() => setData({ poster: null, backdrop: null, loaded: true }));
  }, [tmdbId]);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC MOVIE DATA
// ─────────────────────────────────────────────────────────────────────────────

const MOVIES_BASE = [
  {
    id: 0,
    key: "odyssey",
    tmdbId: TMDB_IDS.odyssey,
    title: "The Odyssey",
    subtitle: "Christopher Nolan",
    genre: "Epic",
    rating: "PG-13",
    duration: "2h 48m",
    times: ["16:00", "19:30", "22:45"],
    hall: "Sala IMAX",
    hallId: 0,
    score: "99%",
    release: "17 Luglio 2026",
    trailerId: TRAILER_IDS.odyssey,
    fallbackPoster: "https://mlpnk72yciwc.i.optimole.com/cqhiHLc.IIZS~2ef73/w:auto/h:auto/q:75/https://bleedingcool.com/wp-content/uploads/2025/12/ODY_Helmet1Sheet12_RGB_1.jpg" ,
    fallbackBackdrop: "https://s3.cine3.com/2025/06/the-odyssey-poster-oficial-cropped.jpg",
    color: "#c8a96e",
    price: { standard: 9.5, imax: 22.0, vip: 26.0 },
    desc: "L'epopea mitologica di Odisseo — girata interamente con telecamere IMAX® da Christopher Nolan. Un viaggio attraverso mari tempestosi, divinità arcane e il cuore dell'umanità.",
    cast: "Matt Damon · Tom Holland · Anne Hathaway · Robert Pattinson · Zendaya",
  },
  {
    id: 1,
    key: "spiderman",
    tmdbId: TMDB_IDS.spiderman,
    title: "Spider-Man",
    subtitle: "Brand New Day",
    genre: "Superhero",
    rating: "PG-13",
    duration: "2h 18m",
    times: ["17:00", "20:30", "22:45"],
    hall: "Sala IMAX",
    hallId: 0,
    score: "94%",
    release: "31 Luglio 2026",
    trailerId: TRAILER_IDS.spiderman,
    fallbackPoster: "https://image.tmdb.org/t/p/original/9JCQtDCSpPR2ld55yNlEg1VwcQo.jpg",
    fallbackBackdrop: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1280&auto=format&fit=crop",
    color: "#e63946",
    price: { standard: 9.5, imax: 18.0, vip: 14.0 },
    desc: "Quattro anni dopo No Way Home, Peter Parker vive solo in una New York che non lo ricorda. Una nuova minaccia lo costringe a confrontarsi con chi è davvero.",
    cast: "Tom Holland · Zendaya · Sadie Sink · Jon Bernthal",
  },
  {
    id: 2,
    key: "mando",
    tmdbId: TMDB_IDS.mando,
    title: "The Mandalorian",
    subtitle: "& Grogu",
    genre: "Sci-Fi",
    rating: "PG-13",
    duration: "2h 12m",
    times: ["16:45", "19:30", "22:15"],
    hall: "Sala IMAX",
    hallId: 0,
    score: "96%",
    release: "22 Maggio 2026",
    trailerId: TRAILER_IDS.mando,
    fallbackPoster: "https://media.gq.com.mx/photos/6a11e3ff67605693c1854a4e/master/w_1600%2Cc_limit/The-mandaloria-and-grogu-poster.jpg",
    fallbackBackdrop: "https://images8.alphacoders.com/110/1103710.jpg",
    color: "#457b9d",
    price: { standard: 9.5, imax: 18.0, vip: 14.0 },
    desc: "Din Djarin e Grogu debuttano al cinema. Con la Nuova Repubblica in pericolo, padre e figlio affrontano criminali di guerra imperiali ai confini della galassia.",
    cast: "Pedro Pascal · Sigourney Weaver · Jeremy Allen White",
  },
  {
    id: 3,
    key: "avengers",
    tmdbId: TMDB_IDS.avengers,
    title: "Avengers",
    subtitle: "Doomsday",
    genre: "Action",
    rating: "PG-13",
    duration: "2h 45m",
    times: ["17:15", "20:00", "23:00"],
    hall: "Sala Premium",
    hallId: 2,
    score: "92%",
    release: "18 Dicembre 2026",
    trailerId: TRAILER_IDS.avengers,
    fallbackPoster: "https://mlpnk72yciwc.i.optimole.com/cqhiHLc.IIZS~2ef73/w:auto/h:auto/q:75/https://bleedingcool.com/wp-content/uploads/2025/12/avengers-doomsday-poster.jpg",
    fallbackBackdrop: "https://wallpapercave.com/wp/wp4300764.jpg",
    color: "#9b2335",
    price: { standard: 9.5, imax: 18.0, vip: 14.0 },
    desc: "Eroi di tre universi su rotta di collisione contro una minaccia esistenziale. Robert Downey Jr. torna come Doctor Doom. I fratelli Russo dirigono.",
    cast: "Robert Downey Jr. · Chris Evans · Channing Tatum · Patrick Stewart",
  },
  {
    id: 4,
    key: "backrooms",
    tmdbId: null,
    title: "Backrooms",
    subtitle: "kane parsons",
    genre: "Horror",
    rating: "R",
    duration: "1h 52m",
    times: ["18:30", "21:45"],
    hall: "Sala VIP",
    hallId: 1,
    score: "88%",
    release: "Ora in sala",
    trailerId: TRAILER_IDS.backrooms,
    fallbackPoster: "https://media.fstatic.com/lsvZSmba5WqUWxgvVQLoDSPXcoc=/322x478/smart/filters:format(webp)/media/movies/covers/2025/03/imagem_2025-03-15_110748937.png",
    fallbackBackdrop: "https://th.bing.com/th/id/R.4e4bf97b6b3483531b213ec92710cc9a?rik=IiJab19VoH3zwQ&riu=http%3a%2f%2fupload.wikimedia.org%2fwikipedia%2fcommons%2fd%2fd9%2fBackrooms_model.jpg&ehk=Rtd2ajYK5OEnebKYXjDY5btl6N%2bhBJ9GvQKl22ySh8k%3d&risl=&pid=ImgRaw&r=0",
    color: "#f4a261",
    price: { standard: 9.5, imax: 18.0, vip: 14.0 },
    desc: "Un gruppo di esploratori urbani si perde tra i meandri infiniti dei Backrooms. Quello che trovano sfida ogni legge della realtà conosciuta.",
    cast: "Chiwetel Ejiofor · Reinate Reinsve · Finn Bennet"
  }
];

const HALLS = [
  { id: 0, name: "IMAX", full: "Sala IMAX", icon: "◈", seats: 280, badge: "FLAGSHIP", features: ["Schermo 4K Laser 26m", "Dolby Atmos 12.0", "Proiezione Dual Laser", "Sedute ergonomiche premium"] },
  { id: 1, name: "VIP", full: "Sala VIP", icon: "◇", seats: 48, badge: "PREMIUM", features: ["Poltrone reclinabili in pelle", "3D", "Schermo OLED 8K", "bevande incluse"] },
  { id: 2, name: "CLASSIC", full: "Sala Classic", icon: "◉", seats: 160, badge: "STANDARD", features: ["Audio Surround 7.1", "Sedute comfort", "Atmosfera tradizionale", "Parcheggio gratuito"] },
];

const EVENTS = [
  { title: "The Odyssey — Anteprima", date: "14", month: "LUG", time: "18:00", desc: "Prima italiana esclusiva con tappeto rosso. Evento unico prima dell'uscita ufficiale.", tag: "PREMIERE", color: "#c8a96e", movieId: 0 },
  { title: "Marvel Marathon", date: "21", month: "GIU", time: "10:00 – 06:00", desc: "24 ore di universo Marvel. Tutti i film MCU in ordine cronologico. Snack inclusi.", tag: "MARATONA", color: "#e63946", movieId: 1 },
  { title: "Horror Night", date: "28", month: "GIU", time: "22:00 – 05:00", desc: "Una notte di terrore con i migliori horror dell'anno, make-up artist e photobooth.", tag: "SPECIALE", color: "#f4a261", movieId: 4 },
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const ST = {
  label: { fontFamily: F, fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", color: "#c1121f", textTransform: "uppercase" },
  primary: { background: "#c1121f", color: "#f0ece4", fontFamily: F, fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: "pointer", transition: "background .2s", display: "inline-flex", alignItems: "center", gap: "7px" },
  ghost: { background: "transparent", color: "#8a8070", fontFamily: F, fontSize: "11px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", border: "1px solid #2a2520", cursor: "pointer", transition: "all .2s", display: "inline-flex", alignItems: "center", gap: "7px" },
  pill: { fontFamily: F, fontSize: "12px", fontWeight: 500, padding: "7px 16px", border: "1px solid #2a2520", background: "transparent", color: "#8a8070", cursor: "pointer", transition: "all .15s" },
  pillOn: { background: "#c1121f", borderColor: "#c1121f", color: "#f0ece4" },
};

// ─────────────────────────────────────────────────────────────────────────────
// TMDB POSTER LOADER — fetches all poster paths at startup
// ─────────────────────────────────────────────────────────────────────────────

function useTMDBPosters() {
  const [posters, setPosters] = useState({});

  useEffect(() => {
    const ids = Object.entries(TMDB_IDS);
    Promise.all(ids.map(([key, tmdbId]) =>
      fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=it-IT`)
        .then(r => r.json())
        .then(d => ({ key, poster: d.poster_path, backdrop: d.backdrop_path }))
        .catch(() => ({ key, poster: null, backdrop: null }))
    )).then(results => {
      const map = {};
      results.forEach(({ key, poster, backdrop }) => { map[key] = { poster, backdrop }; });
      setPosters(map);
    });
  }, []);

  return posters;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAILER MODAL
// ─────────────────────────────────────────────────────────────────────────────

function TrailerModal({ movie, onClose }) {
  useLockScroll();
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "880px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "14px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <MoviePoster tmdbPath={movie.posterPath} fallback={movie.fallbackPoster} alt={movie.title}
              style={{ width: "44px", height: "60px", objectFit: "cover", border: "1px solid #2a2520" }} />
            <div>
              <p style={ST.label}>Trailer Ufficiale</p>
              <h3 style={{ fontFamily: F, fontSize: "20px", fontWeight: 600, color: "#f0ece4", marginTop: "3px" }}>{movie.title} — {movie.subtitle}</h3>
            </div>
          </div>
          <button onClick={onClose} style={{ ...ST.ghost, padding: "9px 16px" }}>✕ Chiudi</button>
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000", border: "1px solid #1a1815" }}>
          <iframe
            src={`https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&rel=0&modestbranding=1`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={`Trailer ${movie.title}`}
          />
        </div>
        <p style={{ fontFamily: F, fontSize: "11px", color: "#3a3530", marginTop: "10px", textAlign: "center" }}>Premi ESC o clicca fuori per chiudere</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING MODAL
// ─────────────────────────────────────────────────────────────────────────────

const SEAT_ROWS = ["A","B","C","D","E","F","G","H"];
const TAKEN = new Set(["A3","A4","B7","C2","D5","D6","E9","F1","F11","G8","H3","H4","H5"]);

function BookingModal({ movie: init, onClose }) {
  useLockScroll();
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const [step, setStep] = useState(1);
  const [film, setFilm] = useState(init || MOVIES_BASE[0]);
  const [time, setTime] = useState((init || MOVIES_BASE[0]).times[0]);
  const [hall, setHall] = useState(HALLS.find(h => h.id === (init || MOVIES_BASE[0]).hallId));
  const [ttype, setTtype] = useState("standard");
  const [seats, setSeats] = useState([]);
  const [form, setForm] = useState({ nome: "", cognome: "", email: "", telefono: "" });
  const [done, setDone] = useState(false);

  const price = film.price[ttype] ?? 9.5;
  const total = (seats.length * price).toFixed(2);
  const toggleSeat = (s) => {
    if (TAKEN.has(s)) return;
    setSeats(p => p.includes(s) ? p.filter(x => x !== s) : p.length < 8 ? [...p, s] : p);
  };
  const canNext = step === 1 ? !!time : step === 2 ? seats.length > 0 : !!(form.nome && form.cognome && form.email);
  const STEPS = ["Film & Orario", "Poltrone", "Dati & Conferma"];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 600, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "700px", background: "#0d0c0b", border: "1px solid #1a1815" }}>
        <div style={{ borderBottom: "1px solid #1a1815", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <MoviePoster tmdbPath={film.posterPath} fallback={film.fallbackPoster} alt={film.title}
              style={{ width: "36px", height: "50px", objectFit: "cover", border: "1px solid #2a2520" }} />
            <div>
              <p style={ST.label}>{done ? "Prenotazione Confermata ✓" : "Vision Cinema · Prenota"}</p>
              <h3 style={{ fontFamily: F, fontSize: "18px", fontWeight: 600, color: "#f0ece4", marginTop: "2px" }}>{film.title} — {film.subtitle}</h3>
            </div>
          </div>
          <button onClick={onClose} style={{ ...ST.ghost, padding: "8px 14px", fontSize: "11px" }}>✕</button>
        </div>

        {!done && (
          <div style={{ padding: "14px 28px", borderBottom: "1px solid #1a1815", display: "flex", gap: "0", alignItems: "center" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: step === i+1 ? "#c1121f" : step > i+1 ? "#2a2520" : "transparent", border: `1px solid ${step >= i+1 ? "#c1121f" : "#2a2520"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: F, fontSize: "9px", fontWeight: 700, color: step >= i+1 ? "#f0ece4" : "#5a5550" }}>{step > i+1 ? "✓" : i+1}</span>
                  </div>
                  <span style={{ fontFamily: F, fontSize: "10px", fontWeight: step === i+1 ? 600 : 400, color: step === i+1 ? "#f0ece4" : "#4a4540", whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < STEPS.length-1 && <div style={{ flex: 1, height: "1px", background: "#1a1815", margin: "0 8px" }} />}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "28px" }}>
          {done ? <BookingDone form={form} film={film} time={time} seats={seats} hall={hall} total={total} ttype={ttype} onClose={onClose} /> : (
            <>
              {step === 1 && (
                <div>
                  <p style={{ ...ST.label, marginBottom: "16px" }}>Scegli il film</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
                    {MOVIES_BASE.map(m => (
                      <div key={m.id} onClick={() => { setFilm(m); setTime(m.times[0]); setHall(HALLS.find(h => h.id === m.hallId)); setSeats([]); }}
                        style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px 12px", border: `1px solid ${film.id === m.id ? "#c1121f" : "#1a1815"}`, background: film.id === m.id ? "#130d0d" : "transparent", cursor: "pointer", transition: "all .2s" }}>
                        <MoviePoster tmdbPath={m.posterPath} fallback={m.fallbackPoster} alt={m.title}
                          style={{ width: "36px", height: "50px", objectFit: "cover", flexShrink: 0 }} />
                        <div>
                          <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 600, color: "#f0ece4", lineHeight: 1.2 }}>{m.title}</p>
                          <p style={{ fontFamily: F, fontSize: "10px", color: "#5a5550", marginTop: "2px" }}>{m.subtitle} · {m.hall}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ ...ST.label, marginBottom: "12px" }}>Tipo biglietto</p>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "22px" }}>
                    {[["standard","Standard",film.price.standard],["imax","IMAX",film.price.imax],["vip","VIP",film.price.vip]].map(([k,l,p]) => (
                      <div key={k} onClick={() => setTtype(k)} style={{ flex: 1, padding: "12px 8px", border: `1px solid ${ttype === k ? "#c1121f" : "#1a1815"}`, background: ttype === k ? "#130d0d" : "transparent", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
                        <p style={{ fontFamily: F, fontSize: "10px", fontWeight: 600, color: ttype === k ? "#c1121f" : "#5a5550", letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</p>
                        <p style={{ fontFamily: F, fontSize: "20px", fontWeight: 300, color: "#f0ece4", marginTop: "4px" }}>€{p.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ ...ST.label, marginBottom: "12px" }}>Orario</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {film.times.map(t => (
                      <button key={t} onClick={() => setTime(t)} style={{ ...ST.pill, ...(time === t ? ST.pillOn : {}) }}>{t}</button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                      <p style={ST.label}>Seleziona i posti</p>
                      <p style={{ fontFamily: F, fontSize: "11px", color: "#5a5550", marginTop: "3px" }}>Massimo 8 · {seats.length} selezionati</p>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      {[["#c1121f","Tuo"],["#1e1e1e","Libero"],["#3a3530","Occupato"]].map(([c,l]) => (
                        <div key={l} style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                          <div style={{ width: "10px", height: "10px", background: c, border: "1px solid #2a2520" }} />
                          <span style={{ fontFamily: F, fontSize: "10px", color: "#5a5550" }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "18px", textAlign: "center" }}>
                    <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, #c1121f 25%, #c1121f 75%, transparent)", marginBottom: "6px" }} />
                    <span style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.2em", color: "#3a3530", textTransform: "uppercase" }}>SCHERMO</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "18px" }}>
                    {SEAT_ROWS.map(row => (
                      <div key={row} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <span style={{ fontFamily: F, fontSize: "9px", color: "#3a3530", width: "14px", flexShrink: 0, textAlign: "center" }}>{row}</span>
                        {Array.from({ length: 12 }, (_, ci) => {
                          const id = `${row}${ci+1}`;
                          const taken = TAKEN.has(id);
                          const sel = seats.includes(id);
                          return (
                            <div key={ci} onClick={() => toggleSeat(id)} style={{ flex: 1, height: "20px", background: sel ? "#c1121f" : taken ? "#1a1815" : "#1e1e1e", border: `1px solid ${sel ? "#c1121f" : taken ? "#1a1815" : "#2a2520"}`, cursor: taken ? "not-allowed" : "pointer", opacity: taken ? 0.3 : 1, transition: "all .12s", ...(ci === 5 ? { marginRight: "6px" } : {}) }} />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {seats.length > 0 && (
                    <div style={{ padding: "12px 16px", background: "#080807", border: "1px solid #1a1815", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: F, fontSize: "12px", color: "#8a8070" }}>Posti: {seats.join(", ")}</span>
                      <span style={{ fontFamily: F, fontSize: "22px", fontWeight: 300, color: "#f0ece4" }}>€{total}</span>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div>
                  <p style={{ ...ST.label, marginBottom: "20px" }}>I tuoi dati</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    {[["nome","Nome *"],["cognome","Cognome *"]].map(([k,l]) => (
                      <div key={k}>
                        <label style={{ fontFamily: F, fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", color: "#5a5550", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>{l}</label>
                        <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                          style={{ width: "100%", background: "#080807", border: "1px solid #1a1815", color: "#f0ece4", padding: "11px 13px", fontFamily: F, fontSize: "13px", outline: "none" }}
                          onFocus={e => e.target.style.borderColor="#c1121f"} onBlur={e => e.target.style.borderColor="#1a1815"} />
                      </div>
                    ))}
                  </div>
                  {[["email","Email *","email"],["telefono","Telefono","tel"]].map(([k,l,t]) => (
                    <div key={k} style={{ marginBottom: "12px" }}>
                      <label style={{ fontFamily: F, fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", color: "#5a5550", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>{l}</label>
                      <input type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                        style={{ width: "100%", background: "#080807", border: "1px solid #1a1815", color: "#f0ece4", padding: "11px 13px", fontFamily: F, fontSize: "13px", outline: "none" }}
                        onFocus={e => e.target.style.borderColor="#c1121f"} onBlur={e => e.target.style.borderColor="#1a1815"} />
                    </div>
                  ))}
                  <div style={{ marginTop: "20px", padding: "18px", background: "#080807", border: "1px solid #1a1815" }}>
                    <p style={{ ...ST.label, marginBottom: "12px" }}>Riepilogo ordine</p>
                    {[["Film",`${film.title} — ${film.subtitle}`],["Orario",`Oggi · ${time}`],["Sala",hall.full],["Posti",seats.join(", ")],["Biglietto",ttype.toUpperCase()]].map(([k,v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                        <span style={{ fontFamily: F, fontSize: "11px", color: "#5a5550" }}>{k}</span>
                        <span style={{ fontFamily: F, fontSize: "11px", color: "#8a8070" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ height: "1px", background: "#1a1815", margin: "12px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: F, fontSize: "13px", fontWeight: 600, color: "#f0ece4" }}>Totale</span>
                      <span style={{ fontFamily: F, fontSize: "28px", fontWeight: 300, color: "#f0ece4" }}>€{total}</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #1a1815" }}>
                {step > 1 && <button onClick={() => setStep(s => s-1)} style={{ ...ST.ghost, padding: "12px 20px" }}>← Indietro</button>}
                <div style={{ flex: 1 }} />
                {step < 3 && <button onClick={() => canNext && setStep(s => s+1)} style={{ ...ST.primary, padding: "12px 28px", opacity: canNext ? 1 : 0.35, cursor: canNext ? "pointer" : "not-allowed" }}>Continua →</button>}
                {step === 3 && <button onClick={() => canNext && setDone(true)} style={{ ...ST.primary, padding: "12px 28px", opacity: canNext ? 1 : 0.35, cursor: canNext ? "pointer" : "not-allowed" }}>✓ Conferma</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingDone({ form, film, time, seats, hall, total, ttype, onClose }) {
  const code = "VIS-" + Math.random().toString(36).toUpperCase().slice(2, 8);
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ width: "56px", height: "56px", background: "#c1121f", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <span style={{ fontSize: "24px", color: "#f0ece4" }}>✓</span>
      </div>
      <h3 style={{ fontFamily: F, fontSize: "24px", fontWeight: 600, color: "#f0ece4", marginBottom: "6px" }}>Prenotazione confermata!</h3>
      <p style={{ fontFamily: F, fontSize: "12px", color: "#5a5550", marginBottom: "28px" }}>Conferma inviata a <strong style={{ color: "#8a8070" }}>{form.email}</strong></p>
      <div style={{ background: "#080807", border: "1px solid #1a1815", padding: "24px", marginBottom: "24px", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #1a1815" }}>
          <div><p style={ST.label}>Codice</p><p style={{ fontFamily: F, fontSize: "26px", fontWeight: 700, color: "#c1121f", marginTop: "3px" }}>{code}</p></div>
          <div style={{ textAlign: "right" }}><p style={ST.label}>Totale</p><p style={{ fontFamily: F, fontSize: "26px", fontWeight: 300, color: "#f0ece4", marginTop: "3px" }}>€{total}</p></div>
        </div>
        {[["Intestatario",`${form.nome} ${form.cognome}`],["Film",`${film.title} — ${film.subtitle}`],["Orario",`Oggi · ${time}`],["Sala",hall.full],["Posti",seats.join(", ")],["Biglietto",ttype.toUpperCase()]].map(([k,v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontFamily: F, fontSize: "11px", color: "#5a5550" }}>{k}</span>
            <span style={{ fontFamily: F, fontSize: "11px", color: "#8a8070" }}>{v}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{ ...ST.primary, padding: "13px 36px" }}>Torna al sito</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

export default function VisionCinema() {
  const [hero, setHero] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [booking, setBooking] = useState(null);
  const [times, setTimes] = useState({});

  // Fetch real TMDB posters
  const tmdbPosters = useTMDBPosters();

  // Merge TMDB data into movies
  const MOVIES = MOVIES_BASE.map(m => ({
    ...m,
    posterPath: tmdbPosters[m.key]?.poster || null,
    backdropPath: tmdbPosters[m.key]?.backdrop || null,
  }));

  const fm = MOVIES[hero];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const posterSrc = (m) => m.posterPath ? `${TMDB}${m.posterPath}` : m.fallbackPoster;
  const backdropSrc = (m) => m.backdropPath ? `${TMDB_LG}${m.backdropPath}` : m.fallbackBackdrop;

  return (
    <div style={{ background: "#080808", color: "#f0ece4", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; } ::-webkit-scrollbar-thumb { background:#c1121f; } ::-webkit-scrollbar-track { background:#0d0d0d; }
        .nl { font-family:'DM Sans',sans-serif; font-size:10px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#6a6460; cursor:pointer; transition:color .2s; background:none; border:none; padding:0; }
        .nl:hover { color:#f0ece4; }
        .fc { background:#0d0c0b; border:1px solid #1a1815; transition:all .3s; overflow:hidden; }
        .fc:hover { border-color:#2a2520; transform:translateY(-3px); box-shadow:0 20px 50px rgba(0,0,0,.6); }
        .th { cursor:pointer; border:1px solid transparent; transition:all .22s; overflow:hidden; }
        .th:hover { border-color:rgba(193,18,31,.4); }
        .th.on { border-color:#c1121f; }
        .pb:hover { background:#e63946 !important; }
        .gb:hover { border-color:#f0ece4 !important; color:#f0ece4 !important; }
        .hc { border:1px solid #1a1815; background:#080807; transition:border-color .28s; cursor:pointer; }
        .hc:hover { border-color:#c1121f; }
        .er { border-left:3px solid; background:#0d0c0b; transition:background .22s; cursor:pointer; }
        .er:hover { background:#111009; }
        @keyframes fu { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        .h1{animation:fu .85s ease forwards;}
        .h2{animation:fu .85s .16s ease forwards;opacity:0;}
        .h3{animation:fu .85s .3s ease forwards;opacity:0;}
        input{-webkit-appearance:none;} input::placeholder{color:#3a3530;}
        .grain{position:fixed;inset:0;pointer-events:none;z-index:999;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
        .trailer-thumb:hover > div { opacity:1 !important; }
      `}</style>

      <div className="grain" />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, height: "58px", padding: "0 52px", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(8,8,8,.97)" : "transparent", borderBottom: `1px solid ${scrolled ? "#1a1815" : "transparent"}`, backdropFilter: scrolled ? "blur(14px)" : "none", transition: "all .35s" }}>
        <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "24px", background: "#c1121f", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: F, fontSize: "14px", fontWeight: 700, color: "#f0ece4" }}>V</span>
          </div>
          <span style={{ fontFamily: F, fontSize: "16px", fontWeight: 700, letterSpacing: "0.2em", color: "#f0ece4" }}>VISION</span>
        </button>
        <div style={{ display: "flex", gap: "28px" }}>
          {[["home","Home"],["movies","Programmazione"],["halls","Sale"],["events","Eventi"],["tickets","Biglietti"],["contact","Contatti"]].map(([id,l]) => (
            <button key={id} className="nl" onClick={() => go(id)}>{l}</button>
          ))}
        </div>
        <button className="pb" onClick={() => setBooking(MOVIES[0])} style={{ ...ST.primary, padding: "10px 20px" }}>Prenota</button>
      </nav>

      {/* HERO */}
      <section id="home" style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        <div key={hero} style={{ position: "absolute", inset: 0, backgroundImage: `url(${backdropSrc(fm)})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(.3) saturate(.55)", transform: "scale(1.04)", transition: "all 1s" }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 60%, ${fm.color}18 0%, transparent 55%), linear-gradient(100deg, rgba(8,8,8,.97) 30%, rgba(8,8,8,.3) 100%)`, transition: "all .9s" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "260px", background: "linear-gradient(to top, #080808, transparent)" }} />

        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", alignItems: "center", padding: "0 80px" }}>
          <div style={{ display: "flex", gap: "52px", alignItems: "center", maxWidth: "1100px" }}>
            <div className="h1" style={{ flexShrink: 0 }}>
              <img
                src={posterSrc(fm)}
                alt={fm.title}
                style={{ width: "200px", height: "300px", objectFit: "cover", border: "1px solid #2a2520", boxShadow: `0 32px 80px rgba(0,0,0,.8), 0 0 0 1px ${fm.color}30` }}
                onError={e => { e.target.src = fm.fallbackPoster; }}
              />
            </div>
            <div style={{ maxWidth: "480px" }}>
              <div className="h1" style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ ...ST.label, color: "#c1121f" }}>In Programmazione</span>
                <span style={{ width: "32px", height: "1px", background: "#c1121f" }} />
                <span style={{ fontFamily: F, fontSize: "10px", color: "#5a5550", letterSpacing: "0.1em", textTransform: "uppercase" }}>{fm.hall}</span>
              </div>
              <h1 className="h1" style={{ fontFamily: F, fontSize: "clamp(40px,5.5vw,72px)", fontWeight: 700, lineHeight: 1.05, color: "#f0ece4" }}>
                {fm.title}
                {fm.subtitle && <span style={{ display: "block", fontSize: "55%", fontWeight: 300, color: "#8a8070", marginTop: "4px" }}>{fm.subtitle}</span>}
              </h1>
              <div className="h2" style={{ display: "flex", gap: "12px", alignItems: "center", margin: "14px 0 18px" }}>
                <span style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, color: fm.color, letterSpacing: "0.06em" }}>{fm.genre}</span>
                <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#2a2520" }} />
                <span style={{ fontFamily: F, fontSize: "11px", color: "#6a6460" }}>{fm.rating} · {fm.duration}</span>
                <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#2a2520" }} />
                <span style={{ fontFamily: F, fontSize: "12px", fontWeight: 700, color: "#4ade80" }}>{fm.score}</span>
              </div>
              <p className="h2" style={{ fontFamily: F, fontSize: "13px", lineHeight: 1.7, color: "#6a6460", marginBottom: "12px" }}>{fm.desc}</p>
              <p className="h2" style={{ fontFamily: F, fontSize: "11px", color: "#4a4540", marginBottom: "28px" }}>Con {fm.cast}</p>
              <div className="h3" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="pb" onClick={() => setBooking(fm)} style={{ ...ST.primary, padding: "13px 28px" }}>▶ Acquista</button>
                <button className="gb" onClick={() => setTrailer(fm)} style={{ ...ST.ghost, padding: "13px 24px" }}>◎ Trailer</button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbs */}
        <div style={{ position: "absolute", right: "60px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "8px", zIndex: 10 }}>
          {MOVIES.map((m, i) => (
            <div key={i} className={`th ${hero===i?"on":""}`} onClick={() => setHero(i)} style={{ width: "66px", height: "88px" }}>
              <img src={posterSrc(m)} alt={m.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: hero===i ? 1 : 0.3, transition: "opacity .25s" }}
                onError={e => { e.target.src = m.fallbackPoster; }} />
            </div>
          ))}
        </div>
      </section>

      {/* MOVIES GRID */}
      <section id="movies" style={{ padding: "100px 60px" }}>
        <Reveal style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <p style={ST.label}>Questa Settimana</p>
              <h2 style={{ fontFamily: F, fontSize: "clamp(32px,4vw,56px)", fontWeight: 700, color: "#f0ece4", marginTop: "8px" }}>Programmazione</h2>
            </div>
            <span style={{ fontFamily: F, fontSize: "11px", color: "#2a2520" }}>{MOVIES.length} film in sala</span>
          </div>
          <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1a1815 25%,#1a1815 75%,transparent)", marginTop: "24px" }} />
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "1px", background: "#1a1815" }}>
          {MOVIES.map((m, i) => (
            <Reveal key={i} delay={i*.06}>
              <div className="fc" style={{ height: "100%", cursor: "pointer" }} onClick={() => setBooking(m)}>
                <div style={{ position: "relative", paddingBottom: "150%" }}>
                  <img src={posterSrc(m)} alt={m.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.src = m.fallbackPoster; }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,12,11,1) 0%, rgba(13,12,11,.15) 50%, transparent 100%)" }} />
                  <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                    <span style={{ fontFamily: F, fontSize: "8px", fontWeight: 700, letterSpacing: "0.15em", background: m.color, color: "#f0ece4", padding: "3px 7px", textTransform: "uppercase" }}>{m.genre}</span>
                  </div>
                  <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                    <span style={{ fontFamily: F, fontSize: "12px", fontWeight: 700, color: "#4ade80" }}>{m.score}</span>
                  </div>
                  {/* Trailer hover overlay */}
                  <div onClick={e => { e.stopPropagation(); setTrailer(m); }}
                    style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .22s", background: "rgba(8,8,8,.5)" }}
                    onMouseEnter={e => e.currentTarget.style.opacity=1}
                    onMouseLeave={e => e.currentTarget.style.opacity=0}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "2px solid #f0ece4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#f0ece4", fontSize: "15px", marginLeft: "3px" }}>▶</span>
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: "10px", left: "10px", right: "10px" }}>
                    <p style={{ fontFamily: F, fontSize: "8px", letterSpacing: "0.1em", color: "#6a6460", textTransform: "uppercase", marginBottom: "3px" }}>{m.hall} · {m.rating}</p>
                    <h3 style={{ fontFamily: F, fontSize: "16px", fontWeight: 700, color: "#f0ece4", lineHeight: 1.2 }}>{m.title}</h3>
                    {m.subtitle && <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 300, color: "#8a8070" }}>{m.subtitle}</p>}
                  </div>
                </div>
                <div style={{ padding: "14px 14px 18px" }}>
                  <p style={{ fontFamily: F, fontSize: "9px", color: "#4a4540", marginBottom: "8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Orari</p>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {m.times.map((t, ti) => (
                      <button key={ti} onClick={e => { e.stopPropagation(); setTimes(p => ({ ...p, [i]: t })); }}
                        style={{ ...ST.pill, fontSize: "11px", padding: "5px 9px", ...(times[i]===t ? ST.pillOn : {}) }}>{t}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="pb" onClick={e => { e.stopPropagation(); setBooking(m); }} style={{ ...ST.primary, flex: 1, padding: "9px", justifyContent: "center", fontSize: "9px" }}>Acquista</button>
                    <button className="gb" onClick={e => { e.stopPropagation(); setTrailer(m); }} style={{ ...ST.ghost, padding: "9px 12px" }}>▶</button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1a1815 20%,#1a1815 80%,transparent)" }} />

      {/* TRAILER SECTION — thumbnail + YouTube overlay */}
      <section style={{ padding: "80px 60px", background: "#050504" }}>
        <Reveal style={{ marginBottom: "40px" }}>
          <p style={ST.label}>Trailer Ufficiali</p>
          <h2 style={{ fontFamily: F, fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 700, color: "#f0ece4", marginTop: "8px" }}>Guarda ora</h2>
          <p style={{ fontFamily: F, fontSize: "12px", color: "#4a4540", marginTop: "8px" }}>Clicca per aprire il trailer ufficiale</p>
        </Reveal>

        {/* Top 3 large */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "16px" }}>
          {MOVIES.slice(0, 3).map((m, i) => (
            <Reveal key={i} delay={i*.07}>
              <TrailerThumb movie={m} posterSrc={posterSrc(m)} onClick={() => setTrailer(m)} aspect="56.25%" />
            </Reveal>
          ))}
        </div>

        {/* Bottom 2 wider */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px" }}>
          {MOVIES.slice(3).map((m, i) => (
            <Reveal key={i} delay={i*.07}>
              <TrailerThumb movie={m} posterSrc={posterSrc(m)} onClick={() => setTrailer(m)} aspect="42%" />
            </Reveal>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1a1815 20%,#1a1815 80%,transparent)" }} />

      {/* HALLS */}
      <section id="halls" style={{ padding: "100px 60px" }}>
        <Reveal style={{ marginBottom: "56px" }}>
          <p style={ST.label}>Dove guardare</p>
          <h2 style={{ fontFamily: F, fontSize: "clamp(32px,4vw,56px)", fontWeight: 700, color: "#f0ece4", marginTop: "8px" }}>Le Nostre Sale</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "18px" }}>
          {HALLS.map((h, i) => (
            <Reveal key={i} delay={i*.09}>
              <div className="hc" style={{ padding: "36px" }} onClick={() => setBooking(MOVIES.find(m => m.hallId===h.id)||MOVIES[0])}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                  <span style={{ fontFamily: F, fontSize: "44px", color: "#c1121f", lineHeight: 1 }}>{h.icon}</span>
                  <span style={{ fontFamily: F, fontSize: "8px", fontWeight: 600, letterSpacing: "0.18em", color: "#3a3530", border: "1px solid #1a1815", padding: "4px 8px", textTransform: "uppercase" }}>{h.badge}</span>
                </div>
                <h3 style={{ fontFamily: F, fontSize: "24px", fontWeight: 700, color: "#f0ece4", marginBottom: "5px" }}>{h.full}</h3>
                <p style={{ fontFamily: F, fontSize: "11px", color: "#4a4540", marginBottom: "20px" }}>{h.seats} posti</p>
                <div style={{ height: "1px", background: "#1a1815", marginBottom: "20px" }} />
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {h.features.map((f, fi) => (
                    <li key={fi} style={{ display: "flex", gap: "9px", alignItems: "center" }}>
                      <span style={{ width: "4px", height: "4px", background: "#c1121f", flexShrink: 0 }} />
                      <span style={{ fontFamily: F, fontSize: "12px", color: "#7a7470" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="pb" onClick={e => { e.stopPropagation(); setBooking(MOVIES.find(m => m.hallId===h.id)||MOVIES[0]); }}
                  style={{ ...ST.primary, marginTop: "24px", width: "100%", padding: "11px", justifyContent: "center", fontSize: "10px" }}>
                  Prenota in {h.name} →
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1a1815 20%,#1a1815 80%,transparent)" }} />

      {/* EVENTS */}
      <section id="events" style={{ padding: "100px 60px", background: "#050504" }}>
        <Reveal style={{ marginBottom: "56px" }}>
          <p style={ST.label}>Giugno – Luglio 2026</p>
          <h2 style={{ fontFamily: F, fontSize: "clamp(32px,4vw,56px)", fontWeight: 700, color: "#f0ece4", marginTop: "8px" }}>Eventi Speciali</h2>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1a1815" }}>
          {EVENTS.map((e, i) => (
            <Reveal key={i} delay={i*.07}>
              <div className="er" style={{ borderLeftColor: e.color, padding: "28px 36px", display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "36px", alignItems: "center" }}
                onClick={() => setBooking(MOVIES[e.movieId])}>
                <div>
                  <p style={{ fontFamily: F, fontSize: "40px", fontWeight: 700, color: "#f0ece4", lineHeight: 1 }}>{e.date}</p>
                  <p style={{ fontFamily: F, fontSize: "9px", letterSpacing: "0.16em", color: "#5a5550", textTransform: "uppercase" }}>{e.month}</p>
                </div>
                <div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontFamily: F, fontSize: "8px", fontWeight: 700, letterSpacing: "0.18em", color: e.color, textTransform: "uppercase" }}>{e.tag}</span>
                    <span style={{ fontFamily: F, fontSize: "11px", color: "#3a3530" }}>· {e.time}</span>
                  </div>
                  <h3 style={{ fontFamily: F, fontSize: "22px", fontWeight: 600, color: "#f0ece4", marginBottom: "6px" }}>{e.title}</h3>
                  <p style={{ fontFamily: F, fontSize: "12px", color: "#5a5550", lineHeight: 1.6 }}>{e.desc}</p>
                </div>
                <button className="pb" style={{ ...ST.primary, padding: "10px 20px", whiteSpace: "nowrap", fontSize: "9px" }}>Prenota →</button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1a1815 20%,#1a1815 80%,transparent)" }} />

      {/* TICKETS */}
      <section id="tickets" style={{ padding: "100px 60px", textAlign: "center" }}>
        <Reveal>
          <p style={ST.label}>Semplice e Rapido</p>
          <h2 style={{ fontFamily: F, fontSize: "clamp(40px,6vw,80px)", fontWeight: 700, color: "#f0ece4", lineHeight: 1.05, margin: "12px 0 18px" }}>
            Prenota il tuo<br />posto ideale
          </h2>
          <p style={{ fontFamily: F, fontSize: "13px", color: "#5a5550", maxWidth: "360px", margin: "0 auto 40px", lineHeight: 1.7 }}>
            Scegli film, sala, orario e poltrone. Conferma in 3 passi.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "64px" }}>
            <button className="pb" onClick={() => setBooking(MOVIES[0])} style={{ ...ST.primary, padding: "14px 36px", fontSize: "12px" }}>▶ Prenota Ora</button>
            <button className="gb" onClick={() => go("movies")} style={{ ...ST.ghost, padding: "14px 28px", fontSize: "12px" }}>Vedi Programmazione</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "#1a1815", maxWidth: "520px", margin: "0 auto" }}>
            {[["Standard","€ 9,50","Sala Classic"],["VIP","€ 14,00","Sala VIP"],["IMAX","€ 18,00","Sala IMAX"]].map(([l,p,s]) => (
              <div key={l} onClick={() => setBooking(MOVIES[0])} style={{ padding: "26px", background: "#080807", cursor: "pointer", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background="#0d0c0b"} onMouseLeave={e => e.currentTarget.style.background="#080807"}>
                <p style={{ fontFamily: F, fontSize: "9px", fontWeight: 600, letterSpacing: "0.16em", color: "#4a4540", textTransform: "uppercase", marginBottom: "8px" }}>{l}</p>
                <p style={{ fontFamily: F, fontSize: "30px", fontWeight: 300, color: "#f0ece4", marginBottom: "4px" }}>{p}</p>
                <p style={{ fontFamily: F, fontSize: "10px", color: "#3a3530" }}>{s}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1a1815 20%,#1a1815 80%,transparent)" }} />

      {/* CONTACT */}
      <section id="contact" style={{ padding: "100px 60px", background: "#050504" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px" }}>
          <Reveal>
            <p style={ST.label}>Dove Siamo</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(32px,3.5vw,52px)", fontWeight: 700, color: "#f0ece4", margin: "8px 0 40px" }}>Contatti</h2>
            {[["Indirizzo","Via del Cinema 1, Milano"],["Telefono","+39 02 123 456 789"],["Email","info@visioncinema.it"],["Orari","Lun–Dom: 15:00 – 01:00"]].map(([k,v]) => (
              <div key={k} style={{ marginBottom: "20px" }}>
                <p style={{ fontFamily: F, fontSize: "9px", fontWeight: 600, letterSpacing: "0.14em", color: "#3a3530", textTransform: "uppercase", marginBottom: "3px" }}>{k}</p>
                <p style={{ fontFamily: F, fontSize: "14px", color: "#7a7470" }}>{v}</p>
              </div>
            ))}
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ background: "#0d0c0b", border: "1px solid #1a1815", padding: "40px" }}>
              <h3 style={{ fontFamily: F, fontSize: "22px", fontWeight: 600, color: "#f0ece4", marginBottom: "8px" }}>Newsletter</h3>
              <p style={{ fontFamily: F, fontSize: "12px", color: "#4a4540", marginBottom: "22px", lineHeight: 1.65 }}>
                Aggiornamenti su uscite, eventi esclusivi e offerte riservate.
              </p>
              <input type="email" placeholder="La tua email" style={{ width: "100%", background: "#080807", border: "1px solid #1a1815", color: "#f0ece4", padding: "12px 14px", fontFamily: F, fontSize: "13px", outline: "none", marginBottom: "10px", display: "block" }}
                onFocus={e => e.target.style.borderColor="#c1121f"} onBlur={e => e.target.style.borderColor="#1a1815"} />
              <button className="pb" style={{ ...ST.primary, width: "100%", padding: "12px", justifyContent: "center", fontSize: "11px" }}>Iscriviti →</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1a1815", padding: "24px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "18px", height: "18px", background: "#c1121f", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, color: "#f0ece4" }}>V</span>
          </div>
          <span style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, letterSpacing: "0.2em", color: "#2a2520" }}>VISION CINEMA</span>
        </div>
        <p style={{ fontFamily: F, fontSize: "10px", color: "#2a2520" }}>© 2026 Vision Cinema · Milano</p>
        <div style={{ display: "flex", gap: "16px" }}>
          {["Privacy","Terms","Cookie"].map(l => (
            <span key={l} style={{ fontFamily: F, fontSize: "10px", color: "#2a2520", cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color="#7a7470"} onMouseLeave={e => e.target.style.color="#2a2520"}>{l}</span>
          ))}
        </div>
      </footer>

      {/* MODALS */}
      {trailer && <TrailerModal movie={trailer} onClose={() => setTrailer(null)} />}
      {booking && <BookingModal movie={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAILER THUMBNAIL — shows real YouTube thumbnail + play overlay
// ─────────────────────────────────────────────────────────────────────────────

function TrailerThumb({ movie, posterSrc, onClick, aspect }) {
  const [hovering, setHovering] = useState(false);
  const [thumbErr, setThumbErr] = useState(false);

  // Try YouTube maxres thumbnail first, fallback to hqdefault, then movie poster
  const ytThumb = thumbErr
    ? `https://img.youtube.com/vi/${movie.trailerId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${movie.trailerId}/maxresdefault.jpg`;

  const [ytErr, setYtErr] = useState(false);
  const finalSrc = ytErr ? posterSrc : ytThumb;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ cursor: "pointer", position: "relative", paddingBottom: aspect, background: "#0d0c0b", border: "1px solid #1a1815", overflow: "hidden" }}
    >
      <img
        src={finalSrc}
        alt={movie.title}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: hovering ? "brightness(.55)" : "brightness(.72)", transition: "filter .25s" }}
        onError={() => {
          if (!thumbErr) { setThumbErr(true); }
          else { setYtErr(true); }
        }}
      />
      {/* Play button */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: hovering ? "60px" : "52px", height: hovering ? "60px" : "52px",
          background: hovering ? "#c1121f" : "rgba(193,18,31,.82)",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .22s", boxShadow: hovering ? "0 0 0 8px rgba(193,18,31,.18)" : "none"
        }}>
          <span style={{ color: "#f0ece4", fontSize: hovering ? "20px" : "17px", marginLeft: "4px", transition: "font-size .22s" }}>▶</span>
        </div>
      </div>
      {/* Info overlay at bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px", background: "linear-gradient(to top, rgba(8,8,8,.95) 0%, rgba(8,8,8,.6) 60%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontFamily: F, fontSize: "8px", fontWeight: 700, letterSpacing: "0.15em", background: movie.color, color: "#f0ece4", padding: "2px 6px", textTransform: "uppercase" }}>{movie.genre}</span>
          <span style={{ fontFamily: F, fontSize: "9px", color: "#5a5550" }}>Trailer Ufficiale</span>
        </div>
        <p style={{ fontFamily: F, fontSize: "15px", fontWeight: 700, color: "#f0ece4", lineHeight: 1.2 }}>{movie.title}</p>
        {movie.subtitle && <p style={{ fontFamily: F, fontSize: "11px", fontWeight: 300, color: "#8a8070" }}>{movie.subtitle}</p>}
      </div>
    </div>
  );
}