(() => {
    const t0 = performance.now();
    const $ = id => document.getElementById(id);
    const C = { phos: '#7CF2A2', dim: '#4C8A62', text: '#C6EED2', amber: '#F5C26B', bg: '#090D0A', dark: '#0E1611' };
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- pixel sprites: hand-typed bitmaps ---------- */
    function sprite(rows, pal, px = 4) {
        const c = document.createElement('canvas'), h = rows.length, w = rows[0].length;
        c.width = w * px; c.height = h * px; const g = c.getContext('2d');
        rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x * px, y * px, px, px); } }));
        return c;
    }
    const ALIEN = ["....ggg....", "..ggggggg..", ".ggggggggg.", "ggggggggggg", "gkkgggggkkg", "gkkkgggkkkg", ".gkkgggkkg.", "..ggggggg..", "...ggmgg...", "....ggg...."];
    const KNIFE = ["..........sss...", "hhhhhbssssssssss", "hhhhhbsssssssss.", "......ssssssss.."];
    const HAND = ["..g.g.g..", "..g.g.g.g", "g.g.g.g.g", "g.ggggggg", "ggggggggg", "ggggggggg", ".gggggggg", "..ggggggg", "...ggggg.", "...ggggg."];
    const UFO = ["......ddd......", "....ddddddd....", "..ggggggggggg..", "ggaggaggaggaggg", ".ggggggggggggg.", "...gg.....gg...", "..g.........g.."];
    const PAL = { g: C.phos, k: C.bg, m: C.bg, s: C.text, h: C.amber, b: C.dim, d: C.dim, a: C.amber };
    $('mascot').appendChild(sprite(ALIEN, PAL, 6));

    /* 0x01 CD Player  */
    const TR = [
        { t: 'sep_20_2026', a: 'media/sep_20_2026.m4a' },
        { t: 'sep_27_2026', v: 'media/sep_27_2026.mp4' },
        { t: 'oct_14_2026', a: 'media/oct_14_2026.m4a' },
    ];
    let cur = 2, playing = false, start = 0, acc = 0, raf = 0, media = null;
    const au = new Audio(); au.preload = 'none';
    const trks = $('trks');
    TR.forEach((tk, i) => {
        const b = document.createElement('button'); b.className = 'trk';
        b.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span><span>${tk.t}</span>`;
        b.onclick = () => { load(i); if (!playing) toggle(); }; trks.appendChild(b);
    });
    function fmt(ms) { const s = ms / 1000; return String(Math.floor(s / 60)).padStart(2, '0') + ':' + (s % 60).toFixed(2).padStart(5, '0'); }
    function elapsed() { return media ? media.currentTime * 1000 : acc + (playing ? performance.now() - start : 0); }
    function tick() { const ms = elapsed(); $('lTime').textContent = fmt(ms); if (playing) raf = requestAnimationFrame(tick); }
    function setState(p) {
        if (p === playing) return; playing = p; $('cdplayer').classList.toggle('playing', p);
        cancelAnimationFrame(raf); if (p) { start = performance.now(); raf = requestAnimationFrame(tick); } else { acc += performance.now() - start; tick(); }
        $('play').textContent = p ? '❚❚ pause' : '▶ play'; $('lState').textContent = p ? '▶ PLAY' : '❚❚ PAUSE';
    }
    function bind(m) { m.onplay = () => { if (m === media) setState(true); }; m.onpause = m.onended = () => { if (m === media) setState(false); }; }
    bind(au);
    function load(i) {
        const was = playing; if (media) media.pause(); setState(false);
        cur = i; acc = 0; const tk = TR[i];
        [...trks.children].forEach((b, j) => b.setAttribute('aria-current', j === i));
        $('lTrk').textContent = `TRK ${String(i + 1).padStart(2, '0')}/${String(TR.length).padStart(2, '0')}`; $('lTitle').textContent = tk.t.toUpperCase();
        const scr = $('scr'); scr.innerHTML = ''; media = null;
        if (tk.v) {
            const v = document.createElement('video'); v.src = tk.v; v.preload = 'none'; v.controls = true; v.playsInline = true;
            if (tk.p) v.poster = tk.p; bind(v); scr.appendChild(v); media = v;
        } else if (tk.a) { au.src = tk.a; media = au; }
        $('screen').hidden = !tk.v;
        if (was) toggle();
    }
    function toggle() {
        if (media) { if (media.paused) media.play().catch(() => setState(false)); else media.pause(); }
        else setState(!playing);
    }
    $('play').onclick = toggle; const n = TR.length; $('prev').onclick = () => load((cur + n - 1) % n); $('next').onclick = () => load((cur + 1) % n);
    load(TR.length - 1);

    /* ---------- 0x02 ls ---------- */
    const PHOTO_DIR = 'media/';
    const FILES = [
        { n: 'braillaetor.webp', k: 'build', s: '133638', cap: 'Braillaetor, the braille reader/translator pen.'},
        { n: 'linkall.webp', k: 'build', s: '103282', cap: 'Developed the web platform for LinkAll, a 12-nation education nonprofit. (thinkforall-linkall.com)'},
        { n: 'tikz_figure.webp', k: 'build', s: '48286', cap: 'A TikZ diagram I drew for Prof. Hyounggyu Choi\'s paper. (Check github.com/david-eun/tikz-figures)'},
        { n: 'revolution_8b.webp', k: 'award', s: '763874', cap: 'Team Revolution_8B in the 2023 Hankyung Youth Economics Experience Competition. Grand Prize.'},
        { n: 'ai_frontier.webp', k: 'award', s: '199616', cap: '2023 AI Frontier National Grand Prize (Gwangju Mayor\'s Award) & Microsoft Special Prize'},
        { n: 'outburst.webp', k: 'club', s: '344110', cap: 'Played Nigel in OUTBURST\'s Devil Wears Prada, HAFS\'s only English Drama Club.'},
    ];
    const MAGIC = { jpg: 'JPEG image data', jpeg: 'JPEG image data', png: 'PNG image data', webp: 'RIFF (little-endian) data, Web/P image', avif: 'ISO Media, AVIF Image', gif: 'GIF image data' };
    const toK = x => { const m = /^([\d.]+)\s*([KMG]?)/i.exec(x || ''); if (!m) return 0; return +m[1] * ({ '': 1 / 1024, K: 1, M: 1024, G: 1048576 }[m[2].toUpperCase()]); };
    const body = $('lsBody'); let sel = 0;
    const pic = document.createElement('img'); pic.alt = ''; pic.decoding = 'async'; pic.hidden = true;
    document.querySelector('.viewer .img').appendChild(pic);
    function renderLs(f) {
        const vis = FILES.map((x, i) => [x, i]).filter(([x]) => f === 'all' || x.k === f);
        const tot = Math.ceil(vis.reduce((a, [x]) => a + toK(x.s), 0));
        body.innerHTML = `<tr class="total"><td colspan="5">total ${tot ? tot : vis.length}</td></tr>`;
        vis.forEach(([x, i]) => {
            const tr = document.createElement('tr'); tr.className = 'f'; tr.tabIndex = 0; tr.setAttribute('aria-selected', i === sel);
            tr.innerHTML = `<td class="dim">-rw-r--r--</td><td>david</td><td class="dim">${x.k}</td><td class="dim" style="text-align:right">${x.s || '—'}</td><td>${x.n}</td>`;
            tr.onclick = () => open(i); tr.onkeydown = e => { if (e.key === 'Enter') open(i); }; body.appendChild(tr);
        });
    }
    function open(i) {
        sel = i; const x = FILES[i];
        [...body.querySelectorAll('tr.f')].forEach(tr => tr.setAttribute('aria-selected', tr.lastChild.textContent === x.n));
        const ext = x.n.split('.').pop().toLowerCase(), kind = MAGIC[ext] || 'data';
        $('vCap').textContent = '> ' + x.cap;
        pic.hidden = true; $('vPh').textContent = '// loading…';
        pic.onload = () => {
            if (sel !== i) return; pic.hidden = false; $('vPh').textContent = '';
        };
        pic.alt = x.cap; pic.src = PHOTO_DIR + x.n;
    }
    document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
        document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b)); renderLs(b.dataset.f);
    });
    renderLs('all'); open(0);
})();