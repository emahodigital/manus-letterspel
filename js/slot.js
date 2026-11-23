/* Manú's Letterspel · LS.Slot: het spel is op slot tot op dit toestel één keer de gezinscode is ingevoerd.

   Hoe het werkt:
   - Alles wat persoonlijk is (de stemmen van papa en mama, de namen van familie en vrienden) zit in één versleuteld
     bestand: geheim.bin (AES-256-GCM). De sleutel wordt uit de gezinscode gemaakt met PBKDF2-SHA256 (het aantal rondes
     en het zout staan vooraan in het bestand). De code zelf staat nergens in het spel. Zie tools/maak-geheim.py.
   - Dit bestand is het enige script dat index.html meteen laadt. Zonder code start er niets: geen spel, geen geluid, geen ouderscherm.
     In de publieke versie (tools/bouw-publiek.py) zit ook de spelcode zelf in het pakket: op de site staat geen enkel
     spelscript. In de ontwikkelmap staan de scripts als gewone regels in <template id="spel"> en laadt dit bestand ze
     pas als het pakket open is.
   - Na de juiste code onthoudt het toestel de sleutel (niet de code) in localStorage en in IndexedDB, en vraagt het
     de browser om die opslag te bewaren. Daarna komt de vraag niet meer terug.
   - Een link met #code=... ontgrendelt ook. De code verdwijnt daarna meteen uit de adresbalk.
   - Verkeerde code: het paneel schudt. Na 5 keer mis is het 30 tellen wachten.
   - "Dit toestel vergrendelen" (ouderscherm) wist de sleutel van dit toestel: LS.Slot.vergrendel().

   Na het ontgrendelen:
     LS.Gezin          { vrienden: [{ naam, zeg, woord? }], familie: [{ naam, zeg }] }
     LS.Slot.open      true
     LS.Slot.opnames() de vaste opnames als [{ id, sr, duur, gemaakt, golf, pcm (ArrayBuffer), vast: true }] voor LS.Opname
     LS.Slot.aantal    hoeveel vaste opnames er in het spel zitten
     LS.Slot.klaar     belofte die vervuld wordt zodra het slot open is
     LS.Slot.bron      'pakket' (spelcode uit het pakket) of 'map' (losse scripts, ontwikkelversie)
     LS.Slot.kluis()   voor js/wolk.js (online bewaren), één keer op te halen: belofte met de gezinssleutel als sleutel die
                       de browser niet meer uitleest, en het deel `wolk` uit het pakket ({ repo, token, tak }). Zit dat deel
                       niet in het pakket, dan komt er null en staat online bewaren uit. Het toegangsbewijs staat alleen
                       versleuteld in het pakket en daarna in het werkgeheugen, nooit in de opslag van het toestel.
                       Op localhost staat online bewaren uit (de tests blijven zo van de echte gegevens af), tenzij met ?wolk=1.

   Voor bouwers: op een lokale testserver (localhost) met ?test=1 gaat het spel open zonder pakket, dus zonder stemmen en
   met een leeg LS.Gezin (LS.Slot.proef = true). Met ?gezin=proef erbij krijgt LS.Gezin zeven verzonnen vrienden.
   Op de echte site bestaat die weg niet. Wil je lokaal met de echte inhoud testen, open dan met #code=<gezinscode>. */
(function () {
  'use strict';
  var LS = window.LS = window.LS || {};
  var PAKKET = 'geheim.bin', OPSLAG = 'lsslot', MIS = 'lsslot-mis', DB = 'letterspel-slot', WINKEL = 'sleutel';
  var KOP = 33, VAST_DEEL = 21, MAX_MIS = 5, WACHT_SEC = 30, LETTER = 27;
  var TEKST = {
    uitleg: 'Voer de gezinscode in. Dit hoeft maar één keer op dit toestel.',
    fout: 'Dat is hem nog niet. Kijk de code nog eens na.',
    wacht: function (n) { return 'Even wachten. Over ' + n + (n === 1 ? ' tel' : ' tellen') + ' kun je het weer proberen.'; },
    net: 'Het spel kan nu niet laden. Is er internet?',
    kanNiet: 'Deze browser kan het slot niet openen. Open het spel via de gewone link.'
  };
  var PROEF_VRIENDEN = ['tim', 'noor', 'sem', 'lot', 'bas', 'finn', 'mik'];

  var Slot = LS.Slot = { open: false, proef: false, staat: 'bezig', aantal: 0, gemaakt: '', onthouden: false };
  var meldKlaar; Slot.klaar = new Promise(function (ok) { meldKlaar = ok; });
  var records = [], spelBron = [], pakketBelofte = null;
  var wolkDeel = null, kluisRuw = null, kluisKop = null;       // voor online bewaren (js/wolk.js), zie Slot.kluis

  var vraag = {};
  (location.search || '').replace(/^\?/, '').split('&').forEach(function (kv) {
    if (!kv) return; var p = kv.split('='); try { vraag[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '1'); } catch (e) { /* stil */ }
  });
  var lokaal = /^(localhost$|127\.|\[::1\]$)/.test(location.hostname);
  function sjabloonScripts() { var t = document.getElementById('spel'), bron = t ? (t.content || t) : null; return bron ? bron.querySelectorAll('script[src]') : []; }
  // de proefstand bestaat alleen in de ontwikkelmap, waar de scripts los in de template staan
  var magProef = lokaal && vraag.test === '1' && vraag.slot !== '1' && sjabloonScripts().length > 0;

  /* ---------- kleine hulpjes ---------- */
  // De code zoals hij telt: kleine letters, accenten eraf, alleen a tot z en 0 tot 9. Spaties en streepjes maken dus niet uit.
  function normaliseer(code) {
    var t = String(code == null ? '' : code).toLowerCase();
    try { t = t.normalize('NFD'); } catch (e) { /* oude browser */ }
    return t.replace(/[^a-z0-9]/g, '');
  }
  Slot.normaliseer = normaliseer;
  function naarB64(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
  function vanB64(t) { var s = atob(t), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
  function lsLees(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsZet(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsWis(k) { try { window.localStorage.removeItem(k); } catch (e) { /* stil */ } }

  /* ---------- de sleutel van dit toestel: localStorage en IndexedDB ---------- */
  function db() {
    return new Promise(function (ok) {
      try {
        var v = window.indexedDB.open(DB, 1);
        v.onupgradeneeded = function () { v.result.createObjectStore(WINKEL, { keyPath: 'id' }); };
        v.onsuccess = function () { ok(v.result); };
        v.onerror = v.onblocked = function () { ok(null); };
      } catch (e) { ok(null); }
    });
  }
  function dbDoe(schrijf, fn) {
    return db().then(function (d) {
      if (!d) return null;
      return new Promise(function (ok) {
        var uit = null;
        try {
          var tx = d.transaction(WINKEL, schrijf ? 'readwrite' : 'readonly'), r = fn(tx.objectStore(WINKEL));
          if (r) r.onsuccess = function () { uit = r.result; };
          tx.oncomplete = function () { d.close(); ok(uit); };
          tx.onerror = tx.onabort = function () { d.close(); ok(null); };
        } catch (e) { try { d.close(); } catch (e2) { /* stil */ } ok(null); }
      });
    });
  }
  function geldig(k) { return !!(k && typeof k.s === 'string' && typeof k.z === 'string' && k.s.length > 20); }
  function leesSleutel() {
    var k = null;
    try { k = JSON.parse(lsLees(OPSLAG) || 'null'); } catch (e) { k = null; }
    if (geldig(k)) return Promise.resolve(k);
    return dbDoe(false, function (w) { return w.get('k'); }).then(function (r) {
      if (!geldig(r)) return null;
      lsZet(OPSLAG, JSON.stringify({ v: 1, z: r.z, s: r.s }));          // localStorage was leeg: weer aanvullen
      return r;
    });
  }
  function bewaarSleutel(ruw, zout) {
    var k = { v: 1, z: naarB64(zout), s: naarB64(ruw) };
    Slot.onthouden = lsZet(OPSLAG, JSON.stringify(k));
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () { /* stil */ }); } catch (e) { /* stil */ }
    return dbDoe(true, function (w) { return w.put({ id: 'k', v: 1, z: k.z, s: k.s }); }).then(function (r) { if (r !== null) Slot.onthouden = true; });
  }
  function wisSleutel() {
    lsWis(OPSLAG); Slot.onthouden = false;
    return dbDoe(true, function (w) { return w.delete('k'); });
  }

  /* ---------- het pakket ophalen en openmaken ---------- */
  function haalPakket() {
    if (pakketBelofte) return pakketBelofte;
    var b = fetch(PAKKET).then(function (r) {
      if (!r || !r.ok) throw new Error('weg');
      return r.arrayBuffer();
    }).then(function (buf) {
      if (buf.byteLength < KOP + 16 || new Uint8Array(buf, 0, 1)[0] !== 1) throw new Error('vorm');
      return buf;
    });
    pakketBelofte = b;
    b.catch(function () { if (pakketBelofte === b) pakketBelofte = null; });      // de volgende keer opnieuw proberen
    return b;
  }
  function kanRekenen() { return !!(window.crypto && window.crypto.subtle && window.TextEncoder && window.fetch); }
  function sleutelUit(code, zout, rondes) {
    var S = window.crypto.subtle;
    return S.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits']).then(function (basis) {
      return S.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: zout, iterations: rondes }, basis, 256);
    }).then(function (bits) { return new Uint8Array(bits); });
  }
  function ontsleutel(buf, ruw) {
    var S = window.crypto.subtle, u8 = new Uint8Array(buf);
    return S.importKey('raw', ruw, { name: 'AES-GCM' }, false, ['decrypt']).then(function (sleutel) {
      return S.decrypt({ name: 'AES-GCM', iv: u8.subarray(VAST_DEEL, KOP), additionalData: u8.subarray(0, VAST_DEEL), tagLength: 128 }, sleutel, u8.subarray(KOP));
    }).then(function (inhoud) {
      var n = new DataView(inhoud).getUint32(0), kop = JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(inhoud, 4, n)));
      if (!kop || kop.soort !== 'letterspel-geheim') throw new Error('vorm');
      return { kop: kop, inhoud: inhoud, begin: 4 + n };
    });
  }
  function personen(lijst) {
    return (Array.isArray(lijst) ? lijst : []).filter(function (p) { return p && typeof p.naam === 'string' && p.naam; }).map(function (p) {
      var r = { naam: p.naam, zeg: typeof p.zeg === 'string' && p.zeg ? p.zeg : p.naam };
      if (typeof p.woord === 'string' && p.woord) r.woord = p.woord;
      return r;
    });
  }
  function neemOver(pak, ruw, buf) {
    var kop = pak.kop, g = kop.gezin || {}, w = kop.wolk;
    // online bewaren: alleen als het pakket een opslagplek en een toegangsbewijs meegeeft
    wolkDeel = null; kluisRuw = null; kluisKop = null;
    if (w && typeof w.repo === 'string' && /^[\w.-]+\/[\w.-]+$/.test(w.repo) && typeof w.token === 'string' && w.token.length >= 20 && ruw && buf) {
      wolkDeel = { repo: w.repo, token: w.token, tak: typeof w.tak === 'string' && w.tak ? w.tak : 'main' };
      if (lokaal && typeof w.api === 'string' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(w.api)) wolkDeel.api = w.api;      // alleen voor de tests op een eigen computer
      // Op een lokale testserver blijft de echte opslagplek met rust: anders zetten de tests van bouwers proefstanden tussen
      // de voortgang van Manú. Bewust lokaal tegen de echte opslagplek testen kan met ?wolk=1.
      if (lokaal && !wolkDeel.api && vraag.wolk !== '1') wolkDeel = null;
      kluisRuw = new Uint8Array(ruw); kluisKop = new Uint8Array(buf.slice(0, VAST_DEEL));
    }
    records = (Array.isArray(kop.opnames) ? kop.opnames : []).filter(function (r) {
      return r && typeof r.id === 'string' && r.id.indexOf('/') > 0 && r.lengte > 0 && r.lengte % 2 === 0 && pak.begin + r.van + r.lengte <= pak.inhoud.byteLength;
    }).map(function (r) {
      var sr = +r.sr || 24000;
      return { id: r.id, sr: sr, duur: r.lengte / 2 / sr, gemaakt: r.gemaakt || '', golf: Array.isArray(r.golf) ? r.golf : null,
        pcm: pak.inhoud.slice(pak.begin + r.van, pak.begin + r.van + r.lengte), vast: true };
    });
    LS.Gezin = { vrienden: personen(g.vrienden), familie: personen(g.familie) };
    Slot.aantal = records.length; Slot.gemaakt = kop.gemaakt || '';
    // de publieke versie heeft de spelcode in het pakket: de bron van elk script, in de volgorde waarin ze moeten draaien
    var lees = new TextDecoder('utf-8');
    spelBron = (Array.isArray(kop.scripts) ? kop.scripts : []).filter(function (s) {
      return s && typeof s.naam === 'string' && s.lengte > 0 && pak.begin + s.van + s.lengte <= pak.inhoud.byteLength;
    }).map(function (s) { return { naam: s.naam, tekst: lees.decode(new Uint8Array(pak.inhoud, pak.begin + s.van, s.lengte)) }; });
  }
  Slot.opnames = function () { return records; };
  /* Voor js/wolk.js. Geeft één keer { wolk: { repo, token, tak }, sleutel (AES-GCM), merk (HMAC, voor bestandsnamen), kop (versie, rondes, zout) }.
     De sleutels zijn niet uit te lezen (extractable: false). Een tweede aanroep geeft null. */
  Slot.kluis = function () {
    var w = wolkDeel, ruw = kluisRuw, kop = kluisKop;
    wolkDeel = null; kluisRuw = null; kluisKop = null;
    if (!w || !ruw || !kop || !kanRekenen()) return Promise.resolve(null);
    var S = window.crypto.subtle, voor = new TextEncoder().encode('letterspel-merk'), basis = new Uint8Array(voor.length + ruw.length);
    basis.set(voor); basis.set(ruw, voor.length);
    return Promise.all([
      S.importKey('raw', ruw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']),
      S.digest('SHA-256', basis).then(function (d) { return S.importKey('raw', d, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); })
    ]).then(function (k) { return { wolk: w, sleutel: k[0], merk: k[1], kop: kop }; }, function () { return null; });
  };

  // → 'goed' | 'fout' (code klopt niet) | 'net' (pakket niet te halen) | 'kan-niet' (browser zonder WebCrypto) | 'leeg'
  function probeerCode(code) {
    var c = normaliseer(code);
    if (!c) return Promise.resolve('leeg');
    if (!kanRekenen()) return Promise.resolve('kan-niet');
    return haalPakket().then(function (buf) {
      var u8 = new Uint8Array(buf), rondes = new DataView(buf).getUint32(1), zout = u8.slice(5, VAST_DEEL);
      if (rondes < 100000 || rondes > 20000000) return 'net';
      return sleutelUit(c, zout, rondes).then(function (ruw) {
        return ontsleutel(buf, ruw).then(function (pak) { neemOver(pak, ruw, buf); return bewaarSleutel(ruw, zout).then(function () { return 'goed'; }, function () { return 'goed'; }); }, function () { return 'fout'; });
      });
    }, function () { return 'net'; });
  }
  function probeerSleutel(k) {
    if (!kanRekenen()) return Promise.resolve('kan-niet');
    return haalPakket().then(function (buf) {
      var ruw; try { ruw = vanB64(k.s); } catch (e) { return 'fout'; }
      return ontsleutel(buf, ruw).then(function (pak) { neemOver(pak, ruw, buf); Slot.onthouden = true; return 'goed'; }, function () { return 'fout'; });
    }, function () { return 'net'; });
  }

  /* ---------- het spel laden, script voor script, in volgorde ----------
     Publieke versie: de bron van de scripts zit in het pakket (tools/bouw-publiek.py) en wordt hier uitgevoerd.
     Ontwikkelversie: de scripts staan als gewone regels in <template id="spel"> en komen van de server.
     Geeft een belofte die vervuld wordt als het laatste script gedraaid heeft (false = er was niets te laden). */
  var laadBelofte = null;
  function laadSpel() {
    if (laadBelofte) return laadBelofte;
    laadBelofte = new Promise(function (ok) {
      var uitPakket = spelBron, i = 0;
      spelBron = [];
      if (uitPakket.length) {
        Slot.bron = 'pakket';
        (function volgende() {
          if (i >= uitPakket.length) { ok(true); return; }
          var s = uitPakket[i]; uitPakket[i++] = null;
          var url = URL.createObjectURL(new Blob([s.tekst, '\n//# sourceURL=' + s.naam + '\n'], { type: 'text/javascript' }));
          var n = document.createElement('script');
          n.onload = n.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) { /* stil */ } volgende(); };
          n.src = url; document.body.appendChild(n);
        })();
        return;
      }
      var lijst = sjabloonScripts(), laatste = null;
      Slot.bron = 'map';
      Array.prototype.forEach.call(lijst, function (s) {
        laatste = document.createElement('script'); laatste.src = s.getAttribute('src'); laatste.async = false; document.body.appendChild(laatste);
      });
      if (!laatste) { Slot.bron = 'niets'; ok(false); return; }
      laatste.onload = laatste.onerror = function () { ok(true); };
    });
    return laadBelofte;
  }
  function gaOpen(proef) {
    if (Slot.open) return;
    if (proef) {
      Slot.proef = true;
      LS.Gezin = { vrienden: vraag.gezin === 'proef' ? PROEF_VRIENDEN.map(function (n) { return { naam: n, zeg: n }; }) : [], familie: [] };
    }
    Slot.open = true; Slot.staat = 'open';
    lsWis(MIS);
    var t0 = Date.now();
    if (wortel) {
      // het hangslot gaat open en de bolletjes blijven springen tot het spel er staat
      wortel.classList.add('open');
      try { veld.value = ''; veld.blur(); } catch (e) { /* stil */ }      // de code blijft niet in beeld staan
    } else if (!wachtTimer2 && !wachtEl) wachtTimer2 = setTimeout(toonWacht, 400);      // duurt het even, dan een rustig wachtbeeld
    laadSpel().then(function () {
      clearTimeout(wachtTimer2);
      setTimeout(function () {
        [wortel, wachtEl].forEach(function (e) {
          if (!e) return;
          e.classList.add('weg');
          setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 520);
        });
        wortel = null; wachtEl = null;
      }, wortel ? Math.max(60, 620 - (Date.now() - t0)) : 60);
    });
    meldKlaar(LS.Gezin);
  }
  // het wachtbeeld: dezelfde donkergroene achtergrond als het laadscherm van het spel, met het hangslot en drie bolletjes
  var wachtEl = null, wachtTimer2 = null;
  function toonWacht() {
    if (wachtEl || wortel || !document.body) return;
    wachtEl = el('div'); wachtEl.id = 'slot-wacht';
    wachtEl.innerHTML = HANGSLOT + '<span class="slot-bolletjes"><i></i><i></i><i></i></span>';
    document.body.appendChild(wachtEl);
  }

  // de sleutel van dit toestel wissen en opnieuw beginnen: daarna vraagt het spel hier weer om de code
  Slot.vergrendel = function () {
    return wisSleutel().then(function () { try { location.reload(); } catch (e) { /* stil */ } return true; });
  };

  /* ---------- het scherm ---------- */
  var wortel = null, paneel, veld, knop, melding, wachtTimer = null, netTimer = null;
  var HANGSLOT = '<svg class="slot-hang" viewBox="0 0 120 130" aria-hidden="true">' +
    '<defs><linearGradient id="slot-goud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE06A"/><stop offset=".55" stop-color="#FFC62B"/><stop offset="1" stop-color="#F29A2E"/></linearGradient>' +
    '<linearGradient id="slot-staal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9C0DA"/><stop offset=".5" stop-color="#F4F0FA"/><stop offset="1" stop-color="#B9AECF"/></linearGradient></defs>' +
    '<g class="slot-beugel"><path d="M36 64V44a24 24 0 0 1 48 0v20" fill="none" stroke="#3A2410" stroke-width="22" stroke-linecap="round"/>' +
    '<path d="M36 64V44a24 24 0 0 1 48 0v20" fill="none" stroke="url(#slot-staal)" stroke-width="11" stroke-linecap="round"/></g>' +
    '<rect x="13" y="54" width="94" height="70" rx="20" fill="url(#slot-goud)" stroke="#3A2410" stroke-width="6"/>' +
    '<path d="M27 68q4-7 14-7h34" fill="none" stroke="#FFF3B8" stroke-width="5" stroke-linecap="round" opacity=".85"/>' +
    '<path d="M60 74a10.500 10.500 0 0 1 6.500 18.700l3 14.300h-19l3-14.300A10.500 10.500 0 0 1 60 74z" fill="#3A2410"/></svg>';
  var PIJL = '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M6 17h20M18 8l9 9-9 9" fill="none" stroke="#3A2410" stroke-width="5.500" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '<span class="slot-bolletjes"><i></i><i></i><i></i></span>';

  function el(tag, klas, tekst) { var e = document.createElement(tag); if (klas) e.className = klas; if (tekst) e.textContent = tekst; return e; }
  function zeg(t) { if (melding) melding.textContent = t || ''; }
  // lange code: de letters worden iets kleiner, zodat de hele code in beeld blijft
  var meetDoek = null;
  function pasLetter() {
    if (!veld) return;
    var px = LETTER;
    try {
      meetDoek = meetDoek || document.createElement('canvas').getContext('2d');
      meetDoek.font = '700 ' + LETTER + 'px Andika, system-ui, sans-serif';
      var b = meetDoek.measureText(veld.value).width * 1.03, ruimte = veld.clientWidth - 30;
      if (b > ruimte && ruimte > 0) px = Math.max(15, Math.floor(LETTER * ruimte / b));
    } catch (e) { px = LETTER; }
    veld.style.fontSize = px + 'px';
  }
  function misStand() { var m = null; try { m = JSON.parse(lsLees(MIS) || 'null'); } catch (e) { m = null; } return m && typeof m.n === 'number' ? m : { n: 0, tot: 0 }; }
  function wachtNog() { return Math.max(0, Math.ceil((misStand().tot - Date.now()) / 1000)); }
  function zetBezig(aan) {
    Slot.staat = aan ? 'bezig' : 'slot';
    if (!wortel) return;
    wortel.classList.toggle('bezig', !!aan);
    var dicht = !!aan || wachtNog() > 0;
    // Het veld gaat alleen dicht tijdens het wachten na 5 missers. Tijdens het rekenen blijft het open:
    // op een iPhone verdwijnt anders het toetsenbord en komt het na een verkeerde code niet meer terug.
    veld.disabled = wachtNog() > 0; knop.disabled = dicht;
  }
  function telAf() {
    clearInterval(wachtTimer);
    var n = wachtNog();
    if (!n) { zetBezig(false); return; }
    zetBezig(false); zeg(TEKST.wacht(n));
    wachtTimer = setInterval(function () {
      var m = wachtNog();
      if (m) { zeg(TEKST.wacht(m)); return; }
      clearInterval(wachtTimer); zeg(''); zetBezig(false);
      if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) { try { veld.focus(); veld.select(); } catch (e) { /* stil */ } }
    }, 250);
  }
  // Na een verkeerde code: de tekst staat geselecteerd, zodat opnieuw typen hem vervangt. Op een telefoon nooit zelf
  // de focus zetten (iOS toont dan geen toetsenbord en een tik op het veld doet daarna niets meer): staat het veld
  // nog aan, dan blijft het toetsenbord staan; is het toetsenbord weg, dan haalt de eerstvolgende tik het terug.
  var tikHerstel = false;
  function naMis() {
    var fijn = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
    try {
      if (fijn) { veld.focus(); veld.select(); }
      else if (document.activeElement === veld) { veld.setSelectionRange(0, veld.value.length); tikHerstel = true; }
    } catch (e) { /* stil */ }
  }
  function schud() {
    paneel.classList.remove('schud'); void paneel.offsetWidth; paneel.classList.add('schud');
    setTimeout(function () { if (paneel) paneel.classList.remove('schud'); }, 600);
  }
  function verstuur() {
    if (!wortel || Slot.open || Slot.staat === 'bezig' || wachtNog() > 0) return;
    var code = veld.value;
    if (!normaliseer(code)) { schud(); return; }
    clearTimeout(netTimer); zeg(''); zetBezig(true);
    // één tel adem, zodat het hangslot al wiegt voordat het rekenwerk begint
    setTimeout(function () {
      probeerCode(code).then(function (uit) {
        if (uit === 'goed') { gaOpen(false); return; }
        zetBezig(false);
        if (uit === 'fout') {
          var m = misStand(); m.n++;
          if (m.n % MAX_MIS === 0) m.tot = Date.now() + WACHT_SEC * 1000;
          lsZet(MIS, JSON.stringify(m));
          schud();
          if (wachtNog() > 0) telAf(); else { zeg(TEKST.fout); naMis(); }
        } else zeg(uit === 'kan-niet' ? TEKST.kanNiet : TEKST.net);
      }, function () { zetBezig(false); zeg(TEKST.net); });
    }, 60);
  }
  /* ---------- een nieuwe versie ophalen terwijl het slot in beeld staat ----------
     Het aanmelden van de service worker (sw.js) en het overnemen van een nieuwe versie zit in js/bewaar.js, dus pas na het
     ontgrendelen. Wie op het slot staat (een nieuwe gezinscode, of een fout in het slot zelf) zou zo op de oude versie
     blijven hangen. Daarom kijkt het slot zelf: is er al een service worker van een eerdere keer, dan vraagt het om de
     nieuwste versie, laat die het overnemen en laadt de pagina één keer opnieuw. Op het slot is er geen spel bezig, dus
     dat kan altijd; alleen niet terwijl iemand typt (wacht tot het veld leeg is of 3 tellen stil) of terwijl het rekent.
     Na het ontgrendelen doet dit niets meer: dan regelt js/bewaar.js het, op een rustig moment in het spel. */
  var laatstGetypt = 0, kijktNaarVersie = false;
  function magHerladen() { return !Slot.open && !!wortel && Slot.staat === 'slot' && (!veld || !veld.value || Date.now() - laatstGetypt > 3000); }
  function haalNieuweVersie() {
    if (kijktNaarVersie || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
    kijktNaarVersie = true;
    var SW = navigator.serviceWorker, had = !!SW.controller, herladen = false;
    function alsHetKan(fn) {
      var kijk = setInterval(function () {
        if (Slot.open) { clearInterval(kijk); return; }                    // ontgrendeld: js/bewaar.js neemt het over
        if (magHerladen()) { clearInterval(kijk); fn(); }
      }, 300);
    }
    function neemOver(reg) { alsHetKan(function () { try { if (reg.waiting) reg.waiting.postMessage('neem-over'); } catch (e) { /* stil */ } }); }
    try {
      SW.addEventListener('controllerchange', function () {
        if (!had) { had = true; return; }                                   // de allereerste keer: niets herladen
        if (herladen || Slot.open) return;
        alsHetKan(function () { if (herladen) return; herladen = true; try { location.reload(); } catch (e) { /* stil */ } });
      });
      SW.getRegistration().then(function (reg) {
        if (!reg) return;
        if (reg.waiting && SW.controller) neemOver(reg);
        reg.addEventListener('updatefound', function () {
          var n = reg.installing; if (!n) return;
          n.addEventListener('statechange', function () { if (n.state === 'installed' && SW.controller) neemOver(reg); });
        });
        // nu kijken, en opnieuw als de app weer naar voren komt of het slot lang in beeld staat
        function kijk() { if (Slot.open) { clearInterval(elkeMinuut); return; } try { reg.update().catch(function () { /* geen internet: prima */ }); } catch (e) { /* stil */ } }
        var elkeMinuut = setInterval(kijk, 60000);
        document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') kijk(); });
        kijk();
      }).catch(function () { /* zonder service worker werkt het slot gewoon */ });
    } catch (e) { /* stil */ }
  }

  function toonSlot(eersteMelding) {
    Slot.staat = 'slot';
    haalNieuweVersie();
    clearTimeout(wachtTimer2); wachtTimer2 = null;
    if (wachtEl) { if (wachtEl.parentNode) wachtEl.parentNode.removeChild(wachtEl); wachtEl = null; }
    if (wortel) { zeg(eersteMelding || ''); return; }
    wortel = el('div'); wortel.id = 'slot';
    var kolom = el('div', 'slot-kolom');
    paneel = el('form', 'slot-paneel'); paneel.setAttribute('autocomplete', 'off'); paneel.noValidate = true;
    paneel.innerHTML = HANGSLOT;
    veld = el('input', 'slot-veld'); veld.type = 'text'; veld.id = 'slot-code'; veld.name = 'gezinscode-' + Date.now();
    veld.setAttribute('aria-label', 'Gezinscode'); veld.setAttribute('autocapitalize', 'none'); veld.setAttribute('autocorrect', 'off');
    veld.setAttribute('autocomplete', 'off'); veld.setAttribute('spellcheck', 'false'); veld.setAttribute('inputmode', 'text');
    veld.setAttribute('enterkeyhint', 'go'); veld.maxLength = 80;
    knop = el('button', 'slot-knop'); knop.type = 'submit'; knop.setAttribute('aria-label', 'Open het spel'); knop.innerHTML = PIJL;
    knop.addEventListener('mousedown', function (e) { e.preventDefault(); });      // een tik op de knop haalt het toetsenbord niet weg
    melding = el('p', 'slot-melding'); melding.setAttribute('aria-live', 'polite');
    var nunu = el('img', 'slot-nunu'); nunu.alt = ''; nunu.src = 'art/figuur/nunu_sleep.png'; nunu.onerror = function () { nunu.style.display = 'none'; };
    paneel.appendChild(veld); paneel.appendChild(knop); paneel.appendChild(el('p', 'slot-tekst', TEKST.uitleg)); paneel.appendChild(melding);
    kolom.appendChild(paneel); kolom.appendChild(nunu);
    wortel.appendChild(el('div', 'slot-bos')); wortel.appendChild(kolom);
    paneel.addEventListener('submit', function (e) { e.preventDefault(); verstuur(); });
    veld.addEventListener('input', function () { laatstGetypt = Date.now(); pasLetter(); if (Slot.staat === 'slot' && !wachtNog()) zeg(''); });
    var grof = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    // vangnet voor de iPhone: staat het veld nog 'aan' zonder toetsenbord, dan zet een tik het in dezelfde aanraking uit en weer aan
    veld.addEventListener('touchend', function () {
      if (!tikHerstel || veld.disabled) return;
      tikHerstel = false;
      if (document.activeElement === veld) { try { veld.blur(); veld.focus(); } catch (e) { /* stil */ } }
    });
    veld.addEventListener('focus', function () { if (grof && wortel) wortel.classList.add('typt'); });
    veld.addEventListener('blur', function () { if (wortel) wortel.classList.remove('typt'); });
    // het spel eronder krijgt niets mee van wat hier gebeurt
    ['touchstart', 'touchmove', 'touchend', 'pointerdown', 'keydown', 'keyup', 'contextmenu'].forEach(function (n) {
      wortel.addEventListener(n, function (e) { e.stopPropagation(); }, { passive: true });
    });
    (document.body || document.documentElement).appendChild(wortel);
    zeg(eersteMelding || '');
    if (wachtNog() > 0) telAf(); else zetBezig(false);
    if (!grof && !wachtNog()) { try { veld.focus(); } catch (e) { /* stil */ } }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(pasLetter, function () { });
  }

  /* ---------- opstarten ---------- */
  // een link met #code=...: de code meteen uit de adresbalk halen
  var uitLink = null;
  (function () {
    var m = /(?:^#|[#&])code=([^&]*)/.exec(location.hash || '');
    if (!m) return;
    try { uitLink = decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { uitLink = m[1]; }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { try { location.hash = ''; } catch (e2) { /* stil */ } }
  })();

  // Eerst kijken of dit toestel de sleutel al heeft (localStorage, anders IndexedDB): dat duurt een paar tellen van een seconde.
  // Zo komt het slot niet even in beeld op een toestel dat al ontgrendeld is. Blijft IndexedDB hangen, dan komt het slot toch.
  var snel = null; try { snel = JSON.parse(lsLees(OPSLAG) || 'null'); } catch (e) { snel = null; }
  if (!geldig(snel) && !uitLink && !magProef) setTimeout(function () { if (!Slot.open && !wortel && Slot.staat === 'bezig' && !gevonden) toonSlot(); }, 1200);
  var gevonden = false;
  // Heeft dit toestel de sleutel al (of komt de code uit een link), dan is er geen slot in beeld. Duurt het ophalen en
  // openmaken van het pakket langer dan een halve tel, dan komt er een rustig wachtbeeld tot het spel er staat.
  if (geldig(snel) || uitLink) wachtTimer2 = setTimeout(toonWacht, 400);
  if (kanRekenen()) haalPakket().catch(function () { /* komt bij het proberen wel terug */ });

  function metSleutel(k) {
    return probeerSleutel(k).then(function (uit) {
      if (uit === 'goed') { gaOpen(false); return true; }
      if (uit === 'fout') return wisSleutel().then(function () { return false; });      // het pakket heeft een nieuwe code gekregen
      if (uit === 'net') {
        // de sleutel is er, het pakket even niet: blijven proberen zonder de sleutel weg te gooien
        if (magProef) return false;
        toonSlot(TEKST.net);
        clearTimeout(netTimer); netTimer = setTimeout(function () { if (!Slot.open && Slot.staat === 'slot') metSleutel(k); }, 4000);
        return true;
      }
      return false;
    });
  }
  leesSleutel().then(function (k) {
    gevonden = !!k;
    return (k ? metSleutel(k) : Promise.resolve(false)).then(function (klaar) {
      if (klaar || Slot.open) return;
      if (!uitLink) { if (magProef) gaOpen(true); else toonSlot(); return; }
      return probeerCode(uitLink).then(function (uit) {
        if (uit === 'goed') { gaOpen(false); return; }
        if (magProef) { gaOpen(true); return; }
        toonSlot(uit === 'net' ? TEKST.net : uit === 'kan-niet' ? TEKST.kanNiet : TEKST.fout);
      });
    });
  }).catch(function () { if (magProef) gaOpen(true); else toonSlot(); });
  window.addEventListener('online', function () { if (!Slot.open && wortel && melding && melding.textContent === TEKST.net) zeg(''); });
})();
