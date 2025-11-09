// ===== Setup & global state =====
const fmtInt = d3.format(",");
const fmtShort = d3.format(".2s");
const tooltip = d3.select("body").append("div").attr("class","tooltip");

let DATA = [];
const BAR_PAGE_SIZE = 20;
const state = { artist: null, explicit: "all", trackQuery: "", barSort: "streams", barPage: 1 };

/* ==== PALET GRAFIK (MSF) ==== */
const CHART_COLORS = {
  red:   "#F23F3A",
  pink:  "#FF70A4",
  yellow:"#FFCA4D",
  green: "#06BA87",
  blue:  "#60D0F0",
  purple:"#775AFF",

  ok:    "#06BA87",  // non-explicit
  bad:   "#F23F3A",  // explicit
  box:   "#60D0F0",  // box fill
  out:   "#FFCA4D",  // outliers
  artistSeq: ["#60D0F0","#775AFF","#FF70A4","#06BA87","#F23F3A","#FFCA4D"]
};

/* ===== Global Plotly dark template ===== */
const PLOTLY_DARK = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { family: "Inter, ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial", color: "#e7edf7", size: 13 },
  hoverlabel: { bgcolor: "#0b0f16", bordercolor: "#1b2944", font: { color: "#e7edf7" } },
  scene: {
    xaxis: { backgroundcolor: "rgba(0,0,0,0)", gridcolor: "#334463", zerolinecolor: "#334463", color:"#e7edf7", tickfont:{size:11}, titlefont:{size:12} },
    yaxis: { backgroundcolor: "rgba(0,0,0,0)", gridcolor: "#334463", zerolinecolor: "#334463", color:"#e7edf7", tickfont:{size:11}, titlefont:{size:12} },
    zaxis: { backgroundcolor: "rgba(0,0,0,0)", gridcolor: "#334463", zerolinecolor: "#334463", color:"#e7edf7", tickfont:{size:11}, titlefont:{size:12} }
  },
  colorway: ["#60D0F0","#775AFF","#FF70A4","#06BA87","#F23F3A","#FFCA4D"]
};


// ===== robust CSV loader =====
const CSV_CANDIDATES = [
  "spotify_songs_2024.csv","./spotify_songs_2024.csv","data/spotify_songs_2024.csv","/spotify_songs_2024.csv"
];

async function loadCsvRobust() {
  const fmt = d3.dsvFormat(";");
  for (const p of CSV_CANDIDATES) {
    try {
      const resp = await fetch(p, { cache: "no-store" });
      if (!resp.ok) { console.warn("CSV not at", p, resp.status); continue; }
      const text = await resp.text();
      return fmt.parse(text);
    } catch (e) { console.warn("Fetch fail at", p, e); }
  }
  throw new Error("CSV not found in candidates: " + CSV_CANDIDATES.join(", "));
}

// ===== start app =====
loadCsvRobust().then(raw => {
  DATA = sanitize(raw);
  seedUI(DATA);
  renderAll();
  d3.select("#loading").style("display","none");
}).catch(err => {
  console.error(err);
  d3.select("#loading").html(
    `<div>Failed to load CSV.<br>
      Tried: <code>${CSV_CANDIDATES.join(", ")}</code>.<br>
      Pastikan file ada & Live Server berjalan.</div>`
  );
});

// ===== helpers =====
function sanitize(data){
  return data.filter(d => d["Spotify Streams"] != null)
    .map(d => ({
      id: d["Track"]+"__"+d["Artist"],
      track: d["Track"],
      album: d["Album Name"],
      artist: d["Artist"],
      explicit: +d["Explicit Track"] || 0,
      rank: d["All Time Rank"],
      streams: +num(d["Spotify Streams"]),
      sp_pop: +d["Spotify Popularity"],
      yt_views: (+num(d["YouTube Views"])) || 0,
      yt_likes: (+num(d["YouTube Likes"])) || 0,
      tt_posts: (+num(d["TikTok Posts"])) || 0,
      tt_likes: (+num(d["TikTok Likes"])) || 0,
      tt_views: (+num(d["TikTok Views"])) || 0
    }));
}
function num(v){ if(v==null) return NaN; if(typeof v==="number") return v; return +String(v).replace(/[^0-9.\-]/g,""); }

/* simple memoize for filtered() */
let _cache = { key:"", data:[] };
function filtered(){
  const key = [state.artist||"", state.explicit].join("|");
  if (_cache.key === key) return _cache.data;
  const out = DATA
    .filter(d => (state.artist? d.artist===state.artist : true))
    .filter(d => (state.explicit==="all" ? true : String(d.explicit)===state.explicit));
  _cache = { key, data: out };
  return out;
}

function countUp(sel, val, fmt=(x)=>x){
  const el = d3.select(sel);
  const start = +el.attr("data-val") || 0;
  const i = d3.interpolateNumber(start, val);
  el.attr("data-val", val)
    .transition().duration(600).tween("text", () => t => el.text(fmt(i(t))));
}
function showTip(html, e){ tooltip.html(html).classed("show",true).style("left",(e.pageX+12)+"px").style("top",(e.pageY-28)+"px"); }
function hideTip(){ tooltip.classed("show",false); }

// ===== seed UI =====
function seedUI(data){
  const artists = Array.from(new Set(data.map(d=>d.artist))).sort(d3.ascending);
  d3.select("#artistList").selectAll("option").data(artists).join("option").attr("value", d=>d);

  const artistInput = document.getElementById("artistSearch");
  const btnClearArtist = document.getElementById("btnClearArtist");

  artistInput.addEventListener("input", (e) => {
    const val = (e.target.value || "").trim();
    if (!val){ state.artist = null; state.barPage = 1; renderAll(); return; }
    const exact = artists.find(a => a.toLowerCase() === val.toLowerCase());
    state.artist = exact || null; state.barPage = 1; renderAll();
  });

  artistInput.addEventListener("change", (e) => {
    const val = (e.target.value || "").trim();
    const exact = artists.find(a => a.toLowerCase() === val.toLowerCase());
    state.artist = exact || null; state.barPage = 1; renderAll();
  });

  btnClearArtist.addEventListener("click", () => {
    state.artist = null; state.barPage = 1; artistInput.value = ""; renderAll(); artistInput.focus();
  });

  d3.select("#explicitFilter").on("change", e => { state.explicit = e.target.value; state.barPage = 1; renderAll(); });
  d3.select("#trackSearch").on("input", e => { state.trackQuery = e.target.value.toLowerCase(); state.barPage = 1; renderBar(); renderScatter(); });
  d3.select("#barSort").on("change", e => { state.barSort = e.target.value; state.barPage = 1; renderBar(); });

  const sel = document.getElementById("scatterColorBy"); if (sel) sel.onchange = renderScatter;

  const btnScatter = document.getElementById("btnScatterPng");
  if (btnScatter) btnScatter.onclick = () => { if (SCATTER_HANDLE) Plotly.downloadImage(SCATTER_HANDLE, {format:"png", filename:"tiktok_engagement_3d"}); };
  const btnCorr = document.getElementById("btnCorrPng");
  if (btnCorr) btnCorr.onclick = () => {
    const el = document.getElementById("corr3D");
    if (el && el._fullLayout) Plotly.downloadImage(el, {format:"png", filename:"correlations_3d"});
  };

  const btnClearTrack = document.getElementById("btnClearTrack");
  if (btnClearTrack) btnClearTrack.addEventListener("click", ()=>{
    state.trackQuery=""; document.getElementById("trackSearch").value=""; renderBar(); renderScatter();
  });
}

// ===== Renders =====
function renderAll(){ updateKPIs(); renderDonut(); renderBox(); renderBar(); renderScatter(); renderCorr(); }

function updateKPIs(){
  const f = filtered();
  const total = f.length;
  const uniqueArtists = new Set(f.map(d=>d.artist)).size;
  const pctExp = d3.mean(f, d=>d.explicit)*100 || 0;
  countUp('.kpi[data-k="tracks"] .big', total, d3.format(","));
  countUp('.kpi[data-k="artists"] .big', uniqueArtists, d3.format(","));
  countUp('.kpi[data-k="explicit"] .big', pctExp, x => d3.format(".1f")(x)+"%");
}

/* ---------- BAR ---------- */
function renderBar(){
  const container = d3.select("#barChart");
  const containerEl = container.node();
  container.selectAll("*").remove();

  let all = filtered();
  if (!state.artist) all = all.slice().sort((a,b)=> d3.descending(a.streams,b.streams)).slice(0,100);
  if (state.barSort==="az") all = all.slice().sort((a,b)=> d3.ascending(a.track,b.track));

  const total = all.length;
  const visibleCount = Math.min(state.barPage * BAR_PAGE_SIZE, total);
  const data = all.slice(0, visibleCount);

  const W = containerEl.clientWidth;
  const viewportH = containerEl.clientHeight;
  const M = {top:20,right:18,bottom:120,left:120};
  const bandH = 20;
  const contentH = M.top + bandH*data.length + M.bottom + 10;
  const H = Math.max(viewportH, contentH);

  const svg = container.append("svg").attr("width", W).attr("height", H);
  const g = svg.append("g").attr("transform",`translate(${M.left},${M.top})`);
  const w = W - M.left - M.right;

  const x = d3.scaleLinear().domain([0, d3.max(data, d=>d.streams)||1]).nice().range([0, w]);
  const y = d3.scaleBand().domain(data.map(d=>d.track)).range([0, bandH*data.length]).paddingInner(0.12);

  const color = d3.scaleOrdinal().domain([0,1]).range([CHART_COLORS.ok, CHART_COLORS.bad]);

  g.append("g").attr("transform", `translate(0, ${bandH*data.length})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(fmtShort));
  g.append("g").attr("class","y-axis axis")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text").style("font-size","10px");

  const bars = g.selectAll("rect").data(data, d=>d.id).join(enter =>
    enter.append("rect")
      .attr("x", 0)
      .attr("y", d => y(d.track))
      .attr("height", Math.max(1, y.bandwidth()))
      .attr("rx",5).attr("ry",5)
      .attr("width", 0)
      .attr("fill", d => color(d.explicit))
      .call(enter => enter.transition().duration(600).attr("width", d => x(d.streams)))
  );

  // value label kecil di ujung bar
  g.selectAll("text.val").data(data, d=>d.id).join(
    enter => enter.append("text").attr("class","val")
      .attr("x", d => x(d.streams) + 6)
      .attr("y", d => (y(d.track) || 0) + Math.max(1, y.bandwidth())/2 + 4)
      .style("font-size","10px").style("fill","#cfe3ff")
      .text(d => fmtShort(d.streams)),
    update => update
      .transition().duration(400)
      .attr("x", d => x(d.streams) + 6)
      .attr("y", d => (y(d.track) || 0) + Math.max(1, y.bandwidth())/2 + 4),
    exit => exit.remove()
  );

  bars.on("mousemove", (e,d) => {
      showTip(`<b>${d.track}</b><br>${d.artist}<br>Streams: ${fmtInt(d.streams)}<br>Album: ${d.album}<br>Rank: ${d.rank ?? "–"}`, e);
      highlightScatter(d.id, true);
    })
    .on("mouseleave", () => { hideTip(); highlightScatter(null,false); })
    .on("click", (e,d) => { state.artist = d.artist; state.barPage = 1; d3.select("#artistSearch").property("value", d.artist); renderAll(); });

  if (state.trackQuery){
    const mask = d => d.track.toLowerCase().includes(state.trackQuery);
    g.selectAll("rect").attr("opacity", d => mask(d) ? 1 : 0.25);
    g.selectAll("text.val").attr("opacity", d => mask(d) ? 1 : 0.25);
  }

  container.append("div").attr("class","mini-help")
    .text(`${visibleCount} / ${total} ditampilkan — scroll untuk load lebih banyak`);

  containerEl.onscroll = null;
  containerEl.addEventListener("scroll", function onScroll(){
    const nearBottom = containerEl.scrollTop + containerEl.clientHeight >= containerEl.scrollHeight - 10;
    if (nearBottom && visibleCount < total){
      const prev = containerEl.scrollTop;
      state.barPage += 1;
      renderBar();
      setTimeout(()=> containerEl.scrollTop = prev, 0);
    }
  });
}

/* ---------- DONUT ---------- */
function renderDonut(){
  const container = d3.select("#donutChart");
  container.selectAll("*").remove();
  const W = container.node().clientWidth, H = container.node().clientHeight;
  const R = Math.min(W,H)/2 - 10;
  const svg = container.append("svg").attr("width",W).attr("height",H)
    .append("g").attr("transform",`translate(${W/2},${H/2})`);

  const data = filtered();
  const counts = d3.rollup(data, v=>v.length, d=> d.explicit? "Explicit":"Non-Explicit");
  const entries = Array.from(counts, ([k,v]) => ({label:k, value:v}));
  const total = d3.sum(entries, d=>d.value) || 1;

  const color = d3.scaleOrdinal().domain(["Explicit","Non-Explicit"]).range([CHART_COLORS.bad, CHART_COLORS.ok]);
  const pie = d3.pie().value(d=>d.value)(entries);
  const arc = d3.arc().innerRadius(R*0.62).outerRadius(R);

  svg.selectAll("path").data(pie).join("path")
    .attr("fill", d=>color(d.data.label))
    .attr("d", arc)
    .style("cursor","pointer")
    .on("mousemove",(e,d)=> showTip(`<b>${d.data.label}</b><br>${fmtInt(d.data.value)} tracks (${d3.format(".1%")(d.data.value/total)})`,e))
    .on("mouseleave", hideTip)
    .on("click",(e,d)=>{ const val = d.data.label==="Explicit" ? "1" : "0"; state.explicit = (state.explicit===val? "all" : val); d3.select("#explicitFilter").property("value", state.explicit); renderAll(); });

  // label tengah (total & % explicit)
  svg.append("text").attr("text-anchor","middle").attr("dy","-0.1em")
    .style("font-weight","900").style("font-size","20px")
    .text(fmtInt(total));
  const pctExp = (counts.get("Explicit")||0) / total;
  svg.append("text").attr("text-anchor","middle").attr("dy","1.2em")
    .style("fill","#9fb3c8").style("font-size","12px")
    .text(`${d3.format(".1%")(pctExp)} explicit`);

  d3.select("#explicitNarrative").text(`Sebanyak ${d3.format(".1%")(pctExp)} lagu memiliki label eksplisit.`);
}

/* ---------- BOX ---------- */
function renderBox(){
  const container = d3.select("#boxPlot");
  container.selectAll("*").remove();
  const W = container.node().clientWidth, H = container.node().clientHeight;
  const M={top:10,right:10,bottom:140,left:80}, w=W-M.left-M.right, h=H-M.top-M.bottom;
  const svg = container.append("svg").attr("width",W).attr("height",H);
  const g = svg.append("g").attr("transform",`translate(${M.left},${M.top})`);

  const scope = d3.select("#artistScope").node().value;
  d3.select("#artistScope").on("change", renderBox);

  const groups = d3.rollups(filtered(), v => v.map(d=>d.streams).filter(Number.isFinite), d=>d.artist);
  const sortedByCount = groups.sort((a,b)=> d3.descending(a[1].length,b[1].length));
  const chosen = scope==="top5" ? sortedByCount.slice(0,5) : scope==="top10" ? sortedByCount.slice(0,10) : sortedByCount.slice(0,30);

  const stats = chosen.map(([artist, values])=>{
    values.sort(d3.ascending);
    const q1=d3.quantile(values,.25), med=d3.quantile(values,.5), q3=d3.quantile(values,.75);
    const iqr=q3-q1, lo=Math.max(d3.min(values), q1-1.5*iqr), hi=Math.min(d3.max(values), q3+1.5*iqr);
    return {artist,q1,med,q3,lo,hi,outliers:values.filter(v=>v<lo||v>hi)};
  });

  const x=d3.scaleBand().domain(stats.map(d=>d.artist)).range([0,w]).padding(.22);
  const y=d3.scaleLinear().domain([0, d3.max(stats,d=>d.hi)||1]).nice().range([h,0]);

  g.append("g").attr("transform",`translate(0,${h})`).call(d3.axisBottom(x))
    .selectAll("text").style("font-size","10px").attr("transform","rotate(-30)").style("text-anchor","end");
  g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(fmtShort));

  const box=g.selectAll(".box").data(stats).join("g").attr("class","box")
    .attr("transform",d=>`translate(${x(d.artist)},0)`).style("cursor","pointer")
    .on("click",(e,d)=>{ state.artist = d.artist; d3.select("#artistSearch").property("value", d.artist); renderAll(); });

  box.append("line").attr("x1",x.bandwidth()/2).attr("x2",x.bandwidth()/2)
    .attr("y1",d=>y(d.lo)).attr("y2",d=>y(d.hi)).attr("stroke","#8aa3b8");

  box.append("rect").attr("y",d=>y(d.q3))
    .attr("height", d=>Math.max(1, y(d.q1)-y(d.q3)))
    .attr("width",x.bandwidth()).attr("fill",CHART_COLORS.box)
    .attr("opacity", .92).attr("rx",6).attr("ry",6);

  box.append("line").attr("x1",0).attr("x2",x.bandwidth())
    .attr("y1",d=>y(d.med)).attr("y2",d=>y(d.med)).attr("stroke","#fff");

  box.selectAll("circle").data(d=>d.outliers.map(v=>({artist:d.artist,v}))).join("circle")
    .attr("cx",x.bandwidth()/2).attr("cy",d=>y(d.v)).attr("r",3).attr("fill",CHART_COLORS.out)
    .on("mousemove",(e,d)=> showTip(`<b>${d.artist}</b><br>Outlier: ${fmtInt(d.v)} streams`,e))
    .on("mouseleave", hideTip);
}

/* ---------- SCATTER 3D ---------- */
let SCATTER_HANDLE = null;
function renderScatter(){
  const el = document.getElementById("scatter3D");
  if (!el) return;

  const colorBy = document.getElementById("scatterColorBy").value;
  const data = filtered();

  const x = data.map(d => Number.isFinite(d.tt_posts) ? d.tt_posts : 0);
  const y = data.map(d => Number.isFinite(d.tt_views) ? d.tt_views : 0);
  const z = data.map(d => Number.isFinite(d.tt_likes) ? d.tt_likes : 0);
  const text = data.map(d => `${d.track} — ${d.artist}`);
  const ids  = data.map(d => d.id);

  const allZero = d3.max(x.concat(y, z)) === 0;
  if (allZero){
    el.innerHTML = '<div style="color:#9fb0c3;padding:.6rem">Tidak ada nilai TikTok (Posts/Views/Likes) di subset saat ini. Coba ganti filter.</div>';
    SCATTER_HANDLE = null; return;
  }

  // ukuran titik dinamis (berdasarkan Spotify Popularity, fallback 50)
  const sizeArr = data.map(d => {
    const v = Number.isFinite(d.sp_pop) ? d.sp_pop : 50;
    return 2 + (v/100)*4; // 2..6
  });

  const colors = (colorBy === "Explicit Track")
    ? data.map(d => d.explicit ? CHART_COLORS.bad : CHART_COLORS.ok)
    : data.map((d,i) => CHART_COLORS.artistSeq[i % CHART_COLORS.artistSeq.length]);

  const trace = {
    x, y, z, text, customdata: ids,
    mode:"markers", type:"scatter3d",
    marker:{ size: sizeArr, sizemode:"diameter", opacity:.9, color: colors },
    hovertemplate: "%{text}<br>Posts=%{x:,} • Views=%{y:,} • Likes=%{z:,}<extra></extra>"
  };

  const layout = {
    ...PLOTLY_DARK,
    margin:{l:0,r:0,t:0,b:0},
    scene:{
      ...PLOTLY_DARK.scene,
      camera:{ eye:{x:1.4,y:1.2,z:0.9} },
      xaxis:{ ...PLOTLY_DARK.scene.xaxis, title:"TikTok Posts" },
      yaxis:{ ...PLOTLY_DARK.scene.yaxis, title:"TikTok Views" },
      zaxis:{ ...PLOTLY_DARK.scene.zaxis, title:"TikTok Likes" }
    }
  };

  Plotly.newPlot(el, [trace], layout, {responsive:true, displayModeBar:false}).then(gd => {
    SCATTER_HANDLE = gd;
    if (state.trackQuery){
      const mask = text.map(t => t.toLowerCase().includes(state.trackQuery));
      Plotly.restyle(gd, {"marker.opacity":[mask.map(m=>m?1:0.2)]});
    }
  });
}

function highlightScatter(id, on){
  if (!SCATTER_HANDLE) return;
  const ids = SCATTER_HANDLE.data[0].customdata;
  const op = ids.map(v => on && v===id ? 1 : (on ? .15 : .9));
  Plotly.restyle(SCATTER_HANDLE, {"marker.opacity":[op]});
}

/* ---------- CORRELATION 3D ---------- */
function renderCorr(){
  const el = document.getElementById("corr3D");
  if (!el) return;

  const cols = ["streams","sp_pop","tt_posts","tt_likes","tt_views","yt_views"];
  const labels = ["Spotify Streams","Spotify Popularity","TikTok Posts","TikTok Likes","TikTok Views","YouTube Views"];

  const f = filtered();
  const mat = cols.map(ci => cols.map(cj => pearson(f.map(d=>d[ci]), f.map(d=>d[cj]))));

  const colorscale = [
    [0.00, "#0f1626"],
    [0.50, CHART_COLORS.blue],
    [1.00, CHART_COLORS.purple]
  ];

  const trace = {
    z: mat, x: labels, y: labels, type: "surface",
    colorscale, cmin: -1, cmax: 1,
    colorbar: { outlinecolor:"#1b2944", tickcolor:"#9fb3c8", tickfont:{color:"#e7edf7"} },
    hovertemplate: "%{x} ↔ %{y}<br>r = %{z:.2f}<extra></extra>"
  };

  const layout = {
    ...PLOTLY_DARK,
    margin:{l:0,r:0,t:0,b:0},
    scene:{ ...PLOTLY_DARK.scene, zaxis:{ ...PLOTLY_DARK.scene.zaxis, range:[-1,1], title:"Correlation (r)" } }
  };

  Plotly.newPlot(el, [trace], layout, {responsive:true, displayModeBar:false});
}

function pearson(a,b){
  const n = Math.min(a.length, b.length);
  const aa = a.slice(0,n).map(Number).filter(v=>isFinite(v));
  const bb = b.slice(0,n).map(Number).filter(v=>isFinite(v));
  const m = Math.min(aa.length, bb.length);
  if (m===0) return 0;
  const A = aa.slice(0,m), B = bb.slice(0,m);
  const meanA = d3.mean(A), meanB = d3.mean(B);
  const num = d3.sum(A.map((v,i)=>(v-meanA)*(B[i]-meanB)));
  const den = Math.sqrt(d3.sum(A.map(v=>(v-meanA)**2)) * d3.sum(B.map(v=>(v-meanB)**2)));
  return den ? num/den : 0;
}

/* tooltip style injector */
(function ensureTooltipStyle(){
  const css = `
  .tooltip{position:fixed;pointer-events:none;background:#0b0f16;color:#fff;border:1px solid #1b2944;border-radius:8px;padding:.42rem .56rem;font-size:.85rem;opacity:0;transition:opacity .12s ease, transform .12s ease;transform:translateY(-2px);z-index:1000}
  .tooltip.show{opacity:1;transform:translateY(0)}`;
  const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s);
})();
