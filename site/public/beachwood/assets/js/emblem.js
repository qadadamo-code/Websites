/* Beachwood emblem, redrawn from the logo as SVG so every part can move:
   open door, warm room (armchair, lamp, side table), golden tree, wood waves. */
(function () {
  var C = { dark: '#3f200d', mid: '#7a4419', gold: '#c88a2c', honey: '#e8b25a', light: '#f7dca6', cream: '#fff8ec' };
  var uid = 0;

  // door quad: hinge on the left edge of the opening (x=86); t=0 closed, t=1 open (like the logo)
  function doorQuad(t) {
    var a = t * 127 * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var fx = 86 + 104 * c;
    return { hT: [86, 34], hB: [86, 204], fT: [fx, 34 - 17 * s], fB: [fx, 204 + 2 * s], c: c };
  }
  function lerp(p, q, u) { return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; }
  function bil(Q, u, v) { return lerp(lerp(Q.hT, Q.fT, u), lerp(Q.hB, Q.fB, u), v); }
  function poly(Q, u0, u1, v0, v1) {
    return [bil(Q, u0, v0), bil(Q, u1, v0), bil(Q, u1, v1), bil(Q, u0, v1)].map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' ');
  }
  function setDoor(root, t) {
    var Q = doorQuad(t);
    var g = root.querySelector('.em-door');
    if (!g) return;
    g.querySelector('.em-leaf').setAttribute('points', poly(Q, 0, 1, 0, 1));
    g.querySelector('.em-p1').setAttribute('points', poly(Q, 0.2, 0.8, 0.08, 0.45));
    g.querySelector('.em-p2').setAttribute('points', poly(Q, 0.2, 0.8, 0.55, 0.92));
    var h1 = bil(Q, 0.86, 0.52), h2 = bil(Q, 0.76, 0.52);
    var h = g.querySelector('.em-handle');
    h.setAttribute('x1', h1[0].toFixed(2)); h.setAttribute('y1', h1[1].toFixed(2));
    h.setAttribute('x2', h2[0].toFixed(2)); h.setAttribute('y2', h2[1].toFixed(2));
    // the side facing us gets lighter as it turns towards the light
    g.querySelector('.em-leaf').style.fill = t < 0.55 ? C.mid : 'url(#' + root.dataset.gid + 'door)';
    var light = root.querySelector('.em-light');
    if (light) light.style.opacity = Math.min(1, t * 1.7);
  }

  function svg(opts) {
    opts = opts || {};
    var id = 'em' + (++uid), only = opts.only;
    var defs =
      '<defs>' +
      '<linearGradient id="' + id + 'crown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0be63"/><stop offset=".55" stop-color="#d5952f"/><stop offset="1" stop-color="#a8641c"/></linearGradient>' +
      '<linearGradient id="' + id + 'room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe2a8"/><stop offset=".7" stop-color="#f1bd62"/><stop offset="1" stop-color="#d99a3c"/></linearGradient>' +
      '<linearGradient id="' + id + 'door" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a2e12"/><stop offset="1" stop-color="#7d4519"/></linearGradient>' +
      '<linearGradient id="' + id + 'wave" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3f200d"/><stop offset=".6" stop-color="#6a3713"/><stop offset="1" stop-color="#3f200d"/></linearGradient>' +
      '<clipPath id="' + id + 'gclip"><rect class="em-gclip" x="0" y="180" width="420" height="80"/></clipPath>' +
      '</defs>';

    var tree =
      '<g class="em-tree" transform="translate(16,0)">' +
        '<path class="em-crown" d="M268,8 C243,8 225,24 223,44 C203,44 189,62 193,82 C175,92 171,118 185,134 C179,152 195,171 217,169 C238,176 250,166 258,158 L280,158 C290,166 303,176 322,169 C344,171 358,152 352,134 C366,118 362,92 344,82 C348,62 334,44 314,44 C312,24 294,8 268,8 Z" fill="url(#' + id + 'crown)" stroke="' + C.dark + '" stroke-width="5" stroke-linejoin="round"/>' +
        '<g class="em-grain" fill="none" stroke="' + C.cream + '" stroke-width="2.4" stroke-linecap="round" opacity=".92">' +
          '<path d="M262,148 C250,118 232,96 214,82"/><path d="M262,140 C254,104 248,70 240,40"/><path d="M270,138 C270,100 268,62 266,24"/>' +
          '<path d="M276,140 C284,104 292,72 300,40"/><path d="M278,148 C292,118 312,96 330,84"/><path d="M256,152 C232,140 212,128 196,112"/><path d="M284,152 C306,142 326,130 344,114"/>' +
          '<path d="M226,64 C232,74 236,86 236,98"/><path d="M314,64 C306,76 304,88 304,100"/>' +
        '</g>' +
        '<g class="em-branches" fill="none" stroke="' + C.dark + '" stroke-width="5" stroke-linecap="round">' +
          '<path d="M268,170 C266,140 252,112 232,92"/><path d="M270,168 C274,136 290,110 310,90"/><path d="M269,160 C269,120 268,84 268,56"/>' +
        '</g>' +
        '<path class="em-trunk" d="M256,128 C260,148 258,166 250,182 C242,196 226,203 206,207 L334,207 C312,202 296,194 288,180 C280,164 279,146 283,128 C275,138 264,138 256,128 Z" fill="' + C.dark + '"/>' +
      '</g>';

    if (only === 'tree') {
      return '<svg viewBox="196 0 190 212" data-gid="' + id + '" class="emblem emblem--tree" role="img" aria-label="Beachwood tree">' + defs + tree + '</svg>';
    }

    var room =
      '<rect class="em-light" x="88" y="36" width="100" height="168" fill="url(#' + id + 'room)"/>' +
      '<g class="em-room">' +
        '<g class="em-lamp"><path d="M134,96 L152,96 L158,119 L128,119 Z" fill="' + C.gold + '" stroke="' + C.dark + '" stroke-width="2"/><rect x="141.5" y="119" width="3" height="27" fill="' + C.dark + '"/><rect x="134" y="146" width="20" height="4" rx="1" fill="' + C.dark + '"/></g>' +
        '<g class="em-table"><rect x="154" y="152" width="36" height="6" fill="' + C.dark + '"/><rect x="158" y="158" width="28" height="11" fill="' + C.mid + '" stroke="' + C.dark + '" stroke-width="2"/><rect x="159" y="168" width="4" height="30" fill="' + C.dark + '"/><rect x="181" y="168" width="4" height="30" fill="' + C.dark + '"/></g>' +
        '<g class="em-chair"><path d="M95,140 C93,129 101,123 113,126 L131,131 C138,133 140,141 137,150 L135,160 L151,160 C159,160 163,166 161,172 L159,180 L101,184 C96,171 96,153 95,140 Z" fill="' + C.mid + '" stroke="' + C.dark + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M104,160 C113,151 128,155 134,168" fill="none" stroke="' + C.cream + '" stroke-width="2.4" stroke-linecap="round"/>' +
          '<path d="M105,183 L103,198 M155,180 L157,196" stroke="' + C.dark + '" stroke-width="4" stroke-linecap="round"/></g>' +
      '</g>';

    var door =
      '<g class="em-door">' +
        '<polygon class="em-leaf" points="" stroke="' + C.dark + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<polygon class="em-p1" points="" fill="none" stroke="' + C.gold + '" stroke-width="2" stroke-linejoin="round" opacity=".85"/>' +
        '<polygon class="em-p2" points="" fill="none" stroke="' + C.gold + '" stroke-width="2" stroke-linejoin="round" opacity=".85"/>' +
        '<line class="em-handle" stroke="' + C.cream + '" stroke-width="3" stroke-linecap="round"/>' +
      '</g>' +
      '<path class="em-frame" d="M86,206 L86,33 L191,33 L191,206" fill="none" stroke="' + C.dark + '" stroke-width="5" stroke-linejoin="round"/>';

    var ground =
      '<g class="em-ground" clip-path="url(#' + id + 'gclip)">' +
        '<path d="M0,226 C80,206 200,200 290,210 C330,214 365,212 400,204 C372,222 334,230 292,226 C206,216 104,218 0,236 Z" fill="url(#' + id + 'wave)"/>' +
        '<path d="M64,213 C150,196 258,194 372,203 C268,203 172,206 64,218 Z" fill="' + C.gold + '"/>' +
        '<path d="M18,246 C96,236 190,233 276,239 C190,240 100,243 18,252 Z" fill="' + C.gold + '"/>' +
      '</g>';

    return '<svg viewBox="0 0 410 256" data-gid="' + id + '" class="emblem" role="img" aria-label="Beachwood">' + defs + room + door + tree + ground + '</svg>';
  }

  function mount(el, opts) {
    el.innerHTML = svg(opts);
    var s = el.querySelector('svg');
    if (!opts || opts.only !== 'tree') setDoor(s, opts && opts.closed ? 0 : 1);
    return s;
  }

  window.BWEmblem = { mount: mount, setDoor: setDoor, colors: C };
})();
