/* Manú's Letterspel · service worker: het spel werkt zonder internet.
   - Bij de eerste keer gaan alle spelbestanden (html, css, js, beeld, stem, lettertypen, de versleutelde pakketten) in de cache.
   - Daarna komt alles uit de cache. Het spel start dus ook in vliegtuigstand.
   - Nieuwe versie: het bouwscript vult VERSIE en BESTANDEN hieronder in.
     De browser ziet dat dit bestand veranderd is. De nieuwe versie haalt eerst de kern op (alles behalve geluid en
     plaatjes) in een eigen cache en neemt het dan over op een rustig moment (js/slot.js en js/bewaar.js zeggen wanneer);
     geluid en plaatjes volgen daarna. Wat niet veranderd is komt uit de cache van de vorige versie, zonder verzoek.
     Pas als de nieuwe cache compleet is gaat de oude weg.
   - De publicatiemap (tools/bouw-publiek.py) geeft per bestand een vingerafdruk mee (MERKEN): er komt dan alleen in de
     cache wat precies klopt met de bouw, en een installatie waarvan de kern niet compleet is neemt het niet over.
   - Vangnet, alleen in de ontwikkelmap (zonder vingerafdrukken): code (html, css, js, json) wordt na het tonen op de
     achtergrond ververst. Vergeet iemand het script, dan is de nieuwe code er bij de volgende keer openen toch.
   Berichten van het spel: 'neem-over', 'vul-aan', 'stop', 'versie' en 'stand' (antwoord over de meegegeven poort). Naar het
   spel: { soort: 'ls-voortgang', versie, fase: 'kern' | 'rest' | 'kern-klaar' | 'klaar' | 'mislukt', bytes, totaal }.
   Alle paden zijn relatief aan de map van dit bestand: het werkt onder /manus-letterspel/ en onder localhost. */
'use strict';

/* --- gegenereerd door tools/maak-cachelijst.py: niet met de hand wijzigen --- */
const VERSIE = '2026-11-26-e3bb303d1f';
const GEBOUWD = '2026-11-26T10:13:20Z';
const BESTANDEN = [
  "index.html",
  "css/ouders.css",
  "css/slot.css",
  "css/spel.css",
  "fonts/andika-latin-400-normal.woff2",
  "fonts/andika-latin-700-normal.woff2",
  "fonts/baloo-2-latin-800-normal.woff2",
  "fonts/baloo-2-latin-ext-800-normal.woff2",
  "js/slot.js",
  "art/boomhut/mama_sit.png",
  "art/boomhut/papa_run.png",
  "art/boomhut/papa_sit.png",
  "art/decor/cushion.png",
  "art/decor/log.png",
  "art/decor/stump.png",
  "art/figuur/kiam_run.png",
  "art/figuur/kiam_sit.png",
  "art/figuur/mama_run.png",
  "art/figuur/manu_run.png",
  "art/figuur/manu_sit.png",
  "art/figuur/nunu_run.png",
  "art/figuur/nunu_sit.png",
  "art/figuur/nunu_sleep.png",
  "art/hd/figuur/kiam_run.png",
  "art/hd/figuur/kiam_sit.png",
  "art/hd/figuur/mama_run.png",
  "art/hd/figuur/mama_sit.png",
  "art/hd/figuur/manu_run.png",
  "art/hd/figuur/manu_sit.png",
  "art/hd/figuur/nunu_run.png",
  "art/hd/figuur/nunu_sit.png",
  "art/hd/figuur/nunu_sleep.png",
  "art/hd/figuur/papa_sit.png",
  "art/hd/sticker/aap.png",
  "art/hd/sticker/bak.png",
  "art/hd/sticker/bal.png",
  "art/hd/sticker/been.png",
  "art/hd/sticker/beer.png",
  "art/hd/sticker/bek.png",
  "art/hd/sticker/bel.png",
  "art/hd/sticker/bij.png",
  "art/hd/sticker/bijl.png",
  "art/hd/sticker/boek.png",
  "art/hd/sticker/boom.png",
  "art/hd/sticker/boot.png",
  "art/hd/sticker/bos.png",
  "art/hd/sticker/bot.png",
  "art/hd/sticker/bus.png",
  "art/hd/sticker/deur.png",
  "art/hd/sticker/duif.png",
  "art/hd/sticker/duim.png",
  "art/hd/sticker/ei.png",
  "art/hd/sticker/envelop.png",
  "art/hd/sticker/fee.png",
  "art/hd/sticker/fiets.png",
  "art/hd/sticker/geit.png",
  "art/hd/sticker/haan.png",
  "art/hd/sticker/hart.png",
  "art/hd/sticker/hout.png",
  "art/hd/sticker/huis.png",
  "art/hd/sticker/hut.png",
  "art/hd/sticker/ijs.png",
  "art/hd/sticker/jan.png",
  "art/hd/sticker/jas.png",
  "art/hd/sticker/kaas.png",
  "art/hd/sticker/kap.png",
  "art/hd/sticker/kat.png",
  "art/hd/sticker/kip.png",
  "art/hd/sticker/koe.png",
  "art/hd/sticker/koek.png",
  "art/hd/sticker/kop.png",
  "art/hd/sticker/maan.png",
  "art/hd/sticker/man.png",
  "art/hd/sticker/mes.png",
  "art/hd/sticker/mier.png",
  "art/hd/sticker/mug.png",
  "art/hd/sticker/muis.png",
  "art/hd/sticker/mus.png",
  "art/hd/sticker/muur.png",
  "art/hd/sticker/neus.png",
  "art/hd/sticker/oog.png",
  "art/hd/sticker/oor.png",
  "art/hd/sticker/pan.png",
  "art/hd/sticker/pauw.png",
  "art/hd/sticker/peer.png",
  "art/hd/sticker/pen.png",
  "art/hd/sticker/pet.png",
  "art/hd/sticker/pin.png",
  "art/hd/sticker/pit.png",
  "art/hd/sticker/raam.png",
  "art/hd/sticker/rat.png",
  "art/hd/sticker/ring.png",
  "art/hd/sticker/rok.png",
  "art/hd/sticker/roos.png",
  "art/hd/sticker/slang.png",
  "art/hd/sticker/sok.png",
  "art/hd/sticker/tas.png",
  "art/hd/sticker/tong.png",
  "art/hd/sticker/trein.png",
  "art/hd/sticker/ui.png",
  "art/hd/sticker/uil.png",
  "art/hd/sticker/veer.png",
  "art/hd/sticker/vis.png",
  "art/hd/sticker/voet.png",
  "art/hd/sticker/vos.png",
  "art/hd/sticker/vuur.png",
  "art/hd/sticker/weg.png",
  "art/hd/sticker/wiel.png",
  "art/hd/sticker/zaag.png",
  "art/hd/sticker/zee.png",
  "art/hd/sticker/zon.png",
  "art/hd/wereld/bos-staand-780.jpg",
  "art/hd/wereld/bos-staand.jpg",
  "art/hd/wereld/feest-staand-780.jpg",
  "art/hd/wereld/feest-staand.jpg",
  "art/icoon/apple-touch-icon-180.png",
  "art/icoon/icon-192.png",
  "art/icoon/icon-512.png",
  "art/naam/kiam.png",
  "art/naam/mama.png",
  "art/naam/manu.png",
  "art/naam/nunu.png",
  "art/naam/papa.png",
  "art/reserve/appel.png",
  "art/reserve/auto.png",
  "art/reserve/banaan.png",
  "art/reserve/bank.png",
  "art/reserve/been.png",
  "art/reserve/bel.png",
  "art/reserve/bijl.png",
  "art/reserve/bot.png",
  "art/reserve/bril.png",
  "art/reserve/brood.png",
  "art/reserve/citroen.png",
  "art/reserve/duim.png",
  "art/reserve/egel.png",
  "art/reserve/fee.png",
  "art/reserve/fiets.png",
  "art/reserve/haai.png",
  "art/reserve/hoed.png",
  "art/reserve/hout.png",
  "art/reserve/kikker.png",
  "art/reserve/kiwi.png",
  "art/reserve/koek.png",
  "art/reserve/kroon.png",
  "art/reserve/leeuw.png",
  "art/reserve/melk.png",
  "art/reserve/mes.png",
  "art/reserve/mier.png",
  "art/reserve/mug.png",
  "art/reserve/muur.png",
  "art/reserve/oog.png",
  "art/reserve/paddenstoel.png",
  "art/reserve/pan.png",
  "art/reserve/pauw.png",
  "art/reserve/raket.png",
  "art/reserve/rat.png",
  "art/reserve/ring.png",
  "art/reserve/schoen.png",
  "art/reserve/slang.png",
  "art/reserve/sleutel.png",
  "art/reserve/ster.png",
  "art/reserve/taart.png",
  "art/reserve/tak.png",
  "art/reserve/tas.png",
  "art/reserve/tent.png",
  "art/reserve/tijger.png",
  "art/reserve/tong.png",
  "art/reserve/trein.png",
  "art/reserve/veer.png",
  "art/reserve/vlinder.png",
  "art/reserve/vuur.png",
  "art/reserve/weg.png",
  "art/reserve/wiel.png",
  "art/reserve/wolk.png",
  "art/reserve/wortel.png",
  "art/reserve/zaag.png",
  "art/reserve/zebra.png",
  "art/ui/locked.png",
  "art/ui/sparkles.png",
  "art/ui/speaker_high_volume.png",
  "art/ui/star.png",
  "art/wereld/bg_forest.jpg",
  "art/woord/aap.png",
  "art/woord/bal.png",
  "art/woord/beer.png",
  "art/woord/bij.png",
  "art/woord/boek.png",
  "art/woord/boom.png",
  "art/woord/boot.png",
  "art/woord/bus.png",
  "art/woord/deur.png",
  "art/woord/duif.png",
  "art/woord/duim.png",
  "art/woord/ei.png",
  "art/woord/geit.png",
  "art/woord/haan.png",
  "art/woord/huis.png",
  "art/woord/hut.png",
  "art/woord/ijs.png",
  "art/woord/jas.png",
  "art/woord/kaas.png",
  "art/woord/kat.png",
  "art/woord/kip.png",
  "art/woord/koe.png",
  "art/woord/maan.png",
  "art/woord/muis.png",
  "art/woord/neus.png",
  "art/woord/oor.png",
  "art/woord/peer.png",
  "art/woord/pen.png",
  "art/woord/pet.png",
  "art/woord/raam.png",
  "art/woord/roos.png",
  "art/woord/sok.png",
  "art/woord/ui.png",
  "art/woord/uil.png",
  "art/woord/vis.png",
  "art/woord/voet.png",
  "art/woord/vos.png",
  "art/woord/zee.png",
  "art/woord/zon.png",
  "audio/blad/1.mp3",
  "audio/blad/2.mp3",
  "audio/blad/3.mp3",
  "audio/blad/4.mp3",
  "audio/blad/5.mp3",
  "audio/blad/6.mp3",
  "audio/blad/7.mp3",
  "audio/blad/8.mp3",
  "audio/fx/akkoord.mp3",
  "audio/fx/avond.mp3",
  "audio/fx/bos1.mp3",
  "audio/fx/bos2.mp3",
  "audio/fx/bos3.mp3",
  "audio/fx/feest.mp3",
  "audio/fx/kern.mp3",
  "audio/fx/manifest.json",
  "audio/fx/tonen.mp3",
  "audio/fx/veld.mp3",
  "audio/fx/wereld.mp3",
  "audio/klank/a.mp3",
  "audio/klank/aa.mp3",
  "audio/klank/au.mp3",
  "audio/klank/b.mp3",
  "audio/klank/ch.mp3",
  "audio/klank/d.mp3",
  "audio/klank/e.mp3",
  "audio/klank/ee.mp3",
  "audio/klank/ei.mp3",
  "audio/klank/eu.mp3",
  "audio/klank/f.mp3",
  "audio/klank/g.mp3",
  "audio/klank/h.mp3",
  "audio/klank/i.mp3",
  "audio/klank/ie.mp3",
  "audio/klank/ij.mp3",
  "audio/klank/j.mp3",
  "audio/klank/k.mp3",
  "audio/klank/l.mp3",
  "audio/klank/m.mp3",
  "audio/klank/n.mp3",
  "audio/klank/ng.mp3",
  "audio/klank/o.mp3",
  "audio/klank/oe.mp3",
  "audio/klank/oo.mp3",
  "audio/klank/ou.mp3",
  "audio/klank/p.mp3",
  "audio/klank/r.mp3",
  "audio/klank/s.mp3",
  "audio/klank/t.mp3",
  "audio/klank/u.mp3",
  "audio/klank/ui.mp3",
  "audio/klank/uu.mp3",
  "audio/klank/v.mp3",
  "audio/klank/w.mp3",
  "audio/klank/z.mp3",
  "audio/manifest.json",
  "audio/tijden.json",
  "audio/traag/aap.mp3",
  "audio/traag/bak.mp3",
  "audio/traag/bal.mp3",
  "audio/traag/been.mp3",
  "audio/traag/beer.mp3",
  "audio/traag/bek.mp3",
  "audio/traag/bel.mp3",
  "audio/traag/bij.mp3",
  "audio/traag/bijl.mp3",
  "audio/traag/boek.mp3",
  "audio/traag/boom.mp3",
  "audio/traag/boot.mp3",
  "audio/traag/bos.mp3",
  "audio/traag/bot.mp3",
  "audio/traag/bus.mp3",
  "audio/traag/deur.mp3",
  "audio/traag/duif.mp3",
  "audio/traag/duim.mp3",
  "audio/traag/ei.mp3",
  "audio/traag/fee.mp3",
  "audio/traag/fiets.mp3",
  "audio/traag/geit.mp3",
  "audio/traag/haan.mp3",
  "audio/traag/hout.mp3",
  "audio/traag/huis.mp3",
  "audio/traag/hut.mp3",
  "audio/traag/ijs.mp3",
  "audio/traag/jan.mp3",
  "audio/traag/jas.mp3",
  "audio/traag/kaas.mp3",
  "audio/traag/kap.mp3",
  "audio/traag/kat.mp3",
  "audio/traag/kip.mp3",
  "audio/traag/koe.mp3",
  "audio/traag/koek.mp3",
  "audio/traag/kop.mp3",
  "audio/traag/kus.mp3",
  "audio/traag/maan.mp3",
  "audio/traag/man.mp3",
  "audio/traag/mes.mp3",
  "audio/traag/mier.mp3",
  "audio/traag/mug.mp3",
  "audio/traag/muis.mp3",
  "audio/traag/mus.mp3",
  "audio/traag/muur.mp3",
  "audio/traag/neus.mp3",
  "audio/traag/oog.mp3",
  "audio/traag/oor.mp3",
  "audio/traag/pan.mp3",
  "audio/traag/pauw.mp3",
  "audio/traag/peer.mp3",
  "audio/traag/pen.mp3",
  "audio/traag/pet.mp3",
  "audio/traag/pin.mp3",
  "audio/traag/pit.mp3",
  "audio/traag/raam.mp3",
  "audio/traag/rat.mp3",
  "audio/traag/ring.mp3",
  "audio/traag/rok.mp3",
  "audio/traag/roos.mp3",
  "audio/traag/slang.mp3",
  "audio/traag/sok.mp3",
  "audio/traag/tas.mp3",
  "audio/traag/tong.mp3",
  "audio/traag/trein.mp3",
  "audio/traag/ui.mp3",
  "audio/traag/uil.mp3",
  "audio/traag/veer.mp3",
  "audio/traag/vis.mp3",
  "audio/traag/voet.mp3",
  "audio/traag/vos.mp3",
  "audio/traag/vuur.mp3",
  "audio/traag/weg.mp3",
  "audio/traag/wiel.mp3",
  "audio/traag/zaag.mp3",
  "audio/traag/zee.mp3",
  "audio/traag/zon.mp3",
  "audio/woord/aap.mp3",
  "audio/woord/bak.mp3",
  "audio/woord/bal.mp3",
  "audio/woord/been.mp3",
  "audio/woord/beer.mp3",
  "audio/woord/bek.mp3",
  "audio/woord/bel.mp3",
  "audio/woord/bij.mp3",
  "audio/woord/bijl.mp3",
  "audio/woord/boek.mp3",
  "audio/woord/boom.mp3",
  "audio/woord/boot.mp3",
  "audio/woord/bos.mp3",
  "audio/woord/bot.mp3",
  "audio/woord/bus.mp3",
  "audio/woord/deur.mp3",
  "audio/woord/duif.mp3",
  "audio/woord/duim.mp3",
  "audio/woord/ei.mp3",
  "audio/woord/fee.mp3",
  "audio/woord/fiets.mp3",
  "audio/woord/geit.mp3",
  "audio/woord/haan.mp3",
  "audio/woord/hout.mp3",
  "audio/woord/huis.mp3",
  "audio/woord/hut.mp3",
  "audio/woord/ijs.mp3",
  "audio/woord/jan.mp3",
  "audio/woord/jas.mp3",
  "audio/woord/kaas.mp3",
  "audio/woord/kap.mp3",
  "audio/woord/kat.mp3",
  "audio/woord/kiam.mp3",
  "audio/woord/kip.mp3",
  "audio/woord/koe.mp3",
  "audio/woord/koek.mp3",
  "audio/woord/kop.mp3",
  "audio/woord/kus.mp3",
  "audio/woord/maan.mp3",
  "audio/woord/mama.mp3",
  "audio/woord/man.mp3",
  "audio/woord/manu.mp3",
  "audio/woord/mes.mp3",
  "audio/woord/mier.mp3",
  "audio/woord/mug.mp3",
  "audio/woord/muis.mp3",
  "audio/woord/mus.mp3",
  "audio/woord/muur.mp3",
  "audio/woord/neus.mp3",
  "audio/woord/nunu.mp3",
  "audio/woord/oog.mp3",
  "audio/woord/oor.mp3",
  "audio/woord/pan.mp3",
  "audio/woord/papa.mp3",
  "audio/woord/pauw.mp3",
  "audio/woord/peer.mp3",
  "audio/woord/pen.mp3",
  "audio/woord/pet.mp3",
  "audio/woord/pin.mp3",
  "audio/woord/pit.mp3",
  "audio/woord/raam.mp3",
  "audio/woord/rat.mp3",
  "audio/woord/ring.mp3",
  "audio/woord/rok.mp3",
  "audio/woord/roos.mp3",
  "audio/woord/slang.mp3",
  "audio/woord/sok.mp3",
  "audio/woord/tas.mp3",
  "audio/woord/tong.mp3",
  "audio/woord/trein.mp3",
  "audio/woord/ui.mp3",
  "audio/woord/uil.mp3",
  "audio/woord/veer.mp3",
  "audio/woord/vis.mp3",
  "audio/woord/voet.mp3",
  "audio/woord/vos.mp3",
  "audio/woord/vuur.mp3",
  "audio/woord/weg.mp3",
  "audio/woord/wiel.mp3",
  "audio/woord/zaag.mp3",
  "audio/woord/zee.mp3",
  "audio/woord/zon.mp3",
  "audio/zin/boek.mp3",
  "audio/zin/bouw.mp3",
  "audio/zin/dag.mp3",
  "audio/zin/doel.mp3",
  "audio/zin/eerst_deze.mp3",
  "audio/zin/geen_kleur.mp3",
  "audio/zin/hoi.mp3",
  "audio/zin/intro.mp3",
  "audio/zin/je_naam.mp3",
  "audio/zin/kiam.mp3",
  "audio/zin/kijk_letter.mp3",
  "audio/zin/komt_spelen.mp3",
  "audio/zin/lab_horen.mp3",
  "audio/zin/lab_start.mp3",
  "audio/zin/lab_uit.mp3",
  "audio/zin/lees_mee.mp3",
  "audio/zin/luister.mp3",
  "audio/zin/mem_bij.mp3",
  "audio/zin/mem_draai.mp3",
  "audio/zin/mem_hoe.mp3",
  "audio/zin/mem_jij.mp3",
  "audio/zin/mem_lees.mp3",
  "audio/zin/mem_vooraan.mp3",
  "audio/zin/mem_wie.mp3",
  "audio/zin/mem_wie2.mp3",
  "audio/zin/mem_woorden.mp3",
  "audio/zin/mem_zelfde.mp3",
  "audio/zin/pak_deze.mp3",
  "audio/zin/plant.mp3",
  "audio/zin/post.mp3",
  "audio/zin/spel_brievenbus.mp3",
  "audio/zin/spel_bultenbaan.mp3",
  "audio/zin/spel_gekkezinnen.mp3",
  "audio/zin/spel_klimboom.mp3",
  "audio/zin/spel_labyrint.mp3",
  "audio/zin/spel_leesslang.mp3",
  "audio/zin/spel_legowoord.mp3",
  "audio/zin/spel_lettervangst.mp3",
  "audio/zin/spel_memory.mp3",
  "audio/zin/spel_omdebeurt.mp3",
  "audio/zin/spel_raadsels.mp3",
  "audio/zin/spel_verfletters.mp3",
  "audio/zin/spel_voorleesboek.mp3",
  "audio/zin/spel_vrij.mp3",
  "audio/zin/spel_woordslang.mp3",
  "audio/zin/spel_zwemmen.mp3",
  "audio/zin/stenen.mp3",
  "audio/zin/vang.mp3",
  "audio/zin/veeg.mp3",
  "audio/zin/voor_wie.mp3",
  "audio/zin/welk_woord.mp3",
  "audio/zin/welke_klank.mp3",
  "audio/zin/zeg_het.mp3",
  "audio/zin/zwem_bellen.mp3",
  "audio/zin/zwem_horen.mp3",
  "audio/zin/zwem_snel.mp3",
  "audio/zin/zwem_start.mp3",
  "audio/zin/zwem_vis.mp3",
  "audio/zinwoord/de.mp3",
  "audio/zinwoord/een.mp3",
  "audio/zinwoord/eet.mp3",
  "audio/zinwoord/het.mp3",
  "audio/zinwoord/in.mp3",
  "audio/zinwoord/is.mp3",
  "audio/zinwoord/kust.mp3",
  "audio/zinwoord/op.mp3",
  "audio/zinwoord/pakt.mp3",
  "audio/zinwoord/ziet.mp3",
  "audio/zinwoord/zit.mp3",
  "manifest.webmanifest",
  "geheim.bin",
  "stem.bin",
  "code.bin"
];
const MERKEN = ["11ff50ca223247f3","505d5a90c4e3e09a","d90afb51a77e21a5","befbd15b02b0cfff","dd6bb7266c94cd2f","61c90acb5f966627","3e36c57e37bda5b5","d73eb61f07d8895c","772e5cdf810b5add","93ac4930d5757c49","7a2eb3a7981a29e5","5d5d4af29f69d374","aaffaa35c11953c5","f1f123b5f0f59b97","d01df1d0ddc6cfe5","43fa7704f3213ce0","4c14ef7c5afc73bf","e0c287063d76a83b","d6dcd975f9009955","3fbf00033c65be3e","c3359abc99e2c568","33f81497ed105b16","7a20c1dfdf44eef7","b0f4ad935d250010","438e62b22da35bfc","e48c04c1c22b7373","e98439f3bf11aea9","22e322a31a20e1b6","244bcdc7b818f78d","1fcc08a0e1720c1e","25f4bab28d1645aa","1d8211e908d41eba","43dae9a21ee4d792","87c48a8ef1d6e75c","1ebf29efc0a7b4da","b50eace33b0e4590","0e4b90a482666378","5fae34f0877bff3a","080b3a17b4e92e7c","b0d23f40f6a2f37a","b5a34efbe74649c1","de8fe83f233a4215","9711c963e5207dd3","5a4e890bcbe8667d","8478abfc0be8f1fd","1fb17bea69e95973","02b58d4b1df0666a","5c4a797840449899","92ef5e534d9e94ca","85a7682077faeebe","01979a3d5a3546ee","d2407b936f0af25c","86b634200877a875","d3b7541174044bb0","cba0e16183b0d0a9","39ca364a5425d42d","122d04e0cda417b2","579056b5fde9fb94","2cdb9fe013357674","7d444cf1d63a430c","723cc0d300ab3cb5","8db0b82cb90c3cc0","974b10a673a3daea","2d30bc79470f5e9b","bab31eaa6057b773","9bf010f1a7e6baf0","8b67b98e7a9585f7","073496d01c471c99","59f0723dea14a3c9","788f292c9b7d2929","f298e7e38a4188e7","efd5ba4a89ec213b","8c2ae165bede9107","8d554b2157fc2b8e","9c6165cb8a53da19","885b0b4e6a30713e","3b8b49a0593261fc","67c0d83d5aa86326","816e6791cc121abd","8c6200f472482de8","ad887726e2a0ad2d","f8052562c9a2f732","4cc3b95102f4bb0d","5ab07dc2f269a93a","76acc24f713a658e","449a4402bb7d18a9","c961503c97c77a4e","cf3faf539591d5e8","b015ece042222b97","ce24662c241fdfce","d45cc35696398da0","29cab1f05118b073","4050cd0b7f999dfc","eb5304d1cb5b3186","701d80970db1a050","7d0c71efc0e4a7ea","cb93f16bfaca0659","f503a49fda9e2f8a","28d8e8a72c532b44","8582f3af69a99611","660c66cac5cfb8a1","676b0ba916787bfa","d96ac4b978862312","d3387324741a5796","5ee7fd13b81789ec","8bed979d549d3759","30b7750cfa1c27e6","8dad66045294e0d4","ac09cdc9ff587a3c","7240a52060a59970","8017ebdd995fbfcf","5a8c705e6107380f","8276ad6dc92dcbbf","c797bfc532ee9338","20e0474ff3d26fc3","448508d3d5e8b20d","39eb91d8445fc70e","b6b7106755ad6842","1bab87f4cdac4ed5","775d9c948adb6ad3","0797afaa2bf67079","a04183061619f50c","5dd866aa093bed30","7e37f4ad4d227d28","0fabb870cfe90fb7","b82cd3cc7e56e700","8b1cd45d95963e75","601ec591fe231ab6","e1c9efed838326cb","c154d98003c6de6a","d022601ad86ed6a1","10a5cfe48753130c","648d935809d028ce","b0919ced1b7ae879","6c8a58409a16669e","5c0d9bdeb079fb46","f2589b990e78b8dd","69f1b75015c8cbdf","a60ab98d8fe5ee11","8e8cbb3755a01659","bfe38852c43fcd51","c7926ce26b085369","e9aa7668a2839b86","d3c5f5e2864d3178","817095bb1423468a","1f1cf0d0dd94915f","7ee5292b46edaa06","a44ee699b2073c6b","6c567df5af574862","12966e2665e985b7","9c4507e9ebfd7c81","72637d9098e49181","cd3d240093294db7","6cd6e6d2a80107bb","26b8b6d4430e47ba","4636925a1dfc76a4","1275c4c937385c83","eebc92da46a996d0","33cdf4673e2a909e","3d9ad552f970ebcf","ae59ce2b8dcfaa1a","b935cdf502b69054","5c5d6961fde0fa82","d3067e96989cb432","ec13a2f40d2e8c63","358343b871e0feb9","ebea0cb7d52cd5f1","e7598c10caa41206","4ee5fd92113fec82","44a0b99188849335","2ee52f94c6383daf","d56355132d73df17","59756e5f1241c1fc","08a93c505c0c5fc8","a4d4629711661a80","add5179377b74ccf","61a64f8bb4edb9d5","0048ee247960f872","8c8e9209b8420ac7","e4490c9ff74a3fd7","fd343b44a0fd2de6","b935cdf502b69054","026e2e94053f4d06","614fe6d45b2af454","bf8597110e987c13","8f108a036c28d253","7769854974b0fe9d","c6b7de9724d8ca47","3c13998c6b866d82","afac9f137599084a","d34d9d19e0d9f275","4c00d6d74d289a4e","67e415990e8286c4","6c8a58409a16669e","efc307f317a1b758","eaefcf17760065c1","c17448ec2b1e094f","0279b073321551b5","426ffe75bd6f841d","085679c473ca9e25","36b2c4951a94dbe7","66966a3b1f27f802","5d3fcbbfb0be45d9","78a069bc06c3e266","38ab704ca4ffc464","0a5b519239098378","8a75bd33bf8ec02a","555abbe0ec9f0ddf","58e87de248815160","1bf8e3a7dce44a91","7e451c9e33e6bd58","c0bca67c099cd419","6826ed43d4c2ec80","24a9794f108eb27d","45a0657c107c9e89","48716cb9e88ecfed","7dfcdcdebd599787","d219342f1f416f2a","20fbca5f711ada7b","1a3bc43212405fb0","b9e2164113966a33","c9bb15d03d4b1e61","34b6829ccf1431bf","509b13d1a66b5912","2f04057722a1a8b3","ecf4b8e3a3d47208","5091777506d933b3","17f5d996ae1b0b40","9e03e6fda5963033","009e631d66b5d68b","0392c65d20fb5bff","9a8070b8c5f71aa6","d9f695eb4d35b2c7","9da9ba69ac78e0c2","4ca9b6d288da04d6","7a7c2ec3a976cf6e","c8cc8665ad4a6932","5537d9679d660a60","cca28544de07a39f","78b96e500b85c871","8702cfbbfd4ebbfb","9701eacd043ec0ff","bf80ea8991197139","c834b98ec8f7b0ae","fffc5326c8ba584f","1883e87f6ca5b7ad","1efb89feb6371cb0","32524af2c4643fa3","a2c6164167067503","31f776c7c12f19dc","67c2e2b417e5e491","7157a336936da794","988e69747230d46c","146ffdcc5cb7ec6d","77ebdff028686418","164f395fd248633a","31f776c7c12f19dc","14bce67ca10f1c6d","1e00e7f04ecac869","d7a9e24b2111edcd","70a78ee1c0224f8f","df85135a1202acf4","e8f79f0ce6872bd7","6847dd498514906d","ca9528f6e35a53e5","01b8bedebf7ddbdd","c834b98ec8f7b0ae","e1a7e1bdfe02aa95","594ae21eb3abd1d5","ba6dd9c9912dfadf","71f7b9d98f17f565","dac77dcf977a8507","41280821e15108fc","34b7d51ea31a2cbe","684ad0fbf470bae9","31e42fe3cfa68db1","d4d56452d3fd043c","679d25e2b73b5788","5d7e3ed92329669b","e0850a7c29c95f26","d53cd49551fe161b","4c2e6d27a4e85cd0","858bb7829260016d","c27c86292a48f600","fa5b654328058fba","0fd75f2831e96fe9","f0a178efe0b618f3","adb06de717ac1e40","0eb027d57cefbcf0","767a1e1322d18a4f","2cb2639832c7f617","0ff1028d6e962fa9","2b0f6c9741cb5cae","2fbea97b772c6459","05c32e77ef903058","7d56f2755904ccc2","81180802fe1ba680","8426bc4251380e93","520df6618dce5bf8","e79e6ff60c024631","869115b432965f51","214647ee1f4c344c","10f76b2bd5a4d469","e4e0f6aa27554844","13cd8c5d9430adc4","c313c6d6e4fa79a1","884384440599c91e","57c9fa0b04c86a7c","4e172025cbc3b23d","9362a47ff5f8416e","73bb17efd16e3b36","120324ae0ddb7d1a","ff5718f5a6776427","b374c15868209210","7da00fc643005f04","3cd35f653e21492b","f596b54b7acad84f","ca1cc29d3f55d853","1ba4283f92bcddb2","7ff558982e908d84","eb5a831941f27877","41bdeb24a7ae1055","f193f9ac0f6a1387","dc1527ca876863ce","110c9d33d8e5a23e","947967f0fc8ac2b0","cf38974d0e1fddb5","826a59b8ad98aa71","103ffd721a44acbc","1184d1f1ad6f2f0f","a5c675e109044324","1fec2874e281e0d7","c9f61ef290b092da","44ea71fa111aad24","d449307e27cb6033","8c9682ff96ecd671","87c510f56b46847f","818c979c85adb670","d4aa65d1763b9252","416f95e8cd1e5336","fb618e7fe867b794","8ad90f9657562ba7","f3c39d0c5080f8ba","949b97266a5aa1bf","659377cb8d5e254a","ef35d6d3d45e51ff","0a0f5dd1d98806fb","b5bc79a99adf6261","ff24667bc2241b81","3ad926f8e7efc1f1","7f2181a1667ef833","1e15a1bd94e94a5f","a8be466748985811","8bf1b85d06013eec","f47923dd7e0d70b5","54d853ffee1177ee","d2a2d0e993a439fd","8cf74a12ae6bcdaf","26af901a6ab71fa6","656e7611011f9489","cb9788b18a2f23a1","ba204ba70d43087f","c99088177ccb4475","eb7aaa8055f98ef9","a4f6378d05b43554","2c7a0de1b8aac9f0","0a72f5d678fb042f","caa5cd6ab7c6951a","e146f47f1eb3ffb6","573b885de8f6f1d7","6ddfed5b8711a53f","455dc022e8defd5e","215ccf460d472741","3411025a642281d5","819f497e878b6d76","1f5bf42449f6eb7e","a590c0b39c31e350","1b2f5f92af9522a8","d01f4ce6273463f9","a7b433df0c34c48b","c8edd6282d702c68","68c1e6141bc4fcbf","59a8550f0d6ac744","07f6808b8786b8f8","fedaa07f0d24dc91","3924424a472595d8","306b7fb95a2e8a3c","7a97f73829f8f596","e459f7983238fd15","8f49a496312bd5cf","34db9224ea2358c2","14e08ee15d2946e9","be776b6249323ba1","5e31b1d0a812cb09","e07b4e4eb5a865d5","29999d71ee6d23d8","8b5e2dec4a3fc8eb","1642aea4f5c5f357","7490afda65ead1dd","e236640dd6bfdbea","89062f30255ac0b6","5eba8574b445d365","272bcb294e67386b","460cd337c4a52be1","5008b18b0b824700","aa6c2700111bc670","51d52536aee3405b","f7ed512a000dd551","85bea732bdd7f848","081a4dba0193cca3","6dad08cb98e74d44","55054ee753ada336","64a96a07f2ba88b6","62ece9ece94eb33b","e2551604fb1e31f8","f9f74db4b7fd63d7","7440834c49634824","354aee491c37f0c5","c576646283d1668e","d07bc6e5190b1fa2","61a42f029ff09e1c","b47b15c9fe603e4d","b1799497d97be2c2","dabf8fc39af1ed8b","a83f08251d6ee2eb","4173cb8c75b3b794","cb352f8d3a81121a","8bd50d9d83f0d409","bcf02342c947c00d","4051858666a78c8b","8abfbafe9680cff3","5838a410bc9fe621","5818ecd8535f6349","585085424372f572","c822a3d21ad0a2aa","0d66cd18084e76c6","71a11f256f857a1f","bc5d4ee63796b778","7bc5de2b8097bb35","d587d9001a87975e","7ad28f6453b182b0","c369d95e4d54b885","a6ab3cc59c6e0ac5","dfae518e381afba5","c65ca75639bf12ab","22d07468f4bb7b95","80ac549329d4962b","288d537b052197f8","cbe0db4be0c51fc6","d063c0684bbe5518","1d156981199132d2","36c54d079146f688","1193371ff89628d8","3eab4ffdf52dcb72","594507af8857804b","8f45b9893fd8aea6","63ff17661346df03","6f434cd923011b21","2af295dd2ad6d093","cfb6a3455900312e","576043cc492d47d9","d226b2c265518a10","cd31704d65375c1e","246a63dd08ba093b","921e7b23c148a00a","8e24266bcbf0b8e4","f9679c56023395d9","fb67c779d099ad3b","25fae706c7242eac","3e89c73a8e38da70","f990b7389a1d42a5","0d3f9fac930853e4","4a90c4d831b0427b","126402f6f8b9f8a3","83d8f90f1b27ae09","27fabbd551ffadeb","6afcc37a1932f28d","6ea3179f947b5d4a","ee9456e9324c33e4","a875165560510b4b","570b298c9d14abee","5c50b2b68b4d7c48","67eab00094e03cb6","c38ad16b85be8939","6bbae7558a75024b","0df8e1e412cee1c7","fc9edad98edf2331","5d4d05462b7e898c","ca052dc2f7575f8d","38a4e19de0024d81","0f29f0bf9a555775","f12f97d794e5e332","485b42928f9d67fb","02240de444541902","e6c3b675c5080743","58becf202574d749","6411bf9393809e1a","b539f2f968a8651a","9d73245ae73d7116","694da0555ec7bf13","33b9ca1617ba4eaa","226b48b41d418232","80e1c31e4da8bbf3","10dca56d194e0d89","ec2a95a407581636","09bad44a61fa29de","5d08588cc4c2c969","b1ba787394b6e957","4f0ce53c0ea119ef","8173d5e81228f327","499ad8b13306cb82"];
const MATEN = [3891,18658,7107,2410,19208,19472,18632,15068,47545,114645,62222,89105,144285,114647,98588,83530,84474,87885,97041,119252,90036,115129,98711,137022,140919,142436,199245,152791,171091,159123,201980,230889,137799,61898,60062,58852,33415,54869,36977,37127,50461,33031,29905,44121,26389,56310,40151,48003,27237,48513,45088,38258,33996,40773,46616,47967,52952,43742,36461,42420,31980,39565,150255,41430,36455,26973,56035,45431,51004,56805,49347,36969,54989,29701,56806,53205,51593,39022,46872,31789,55159,40127,47468,59310,49097,35758,33365,38714,53155,43366,53313,35407,30776,41846,52919,20274,42629,34226,48034,45863,52538,39193,46724,31204,53145,45610,43701,62980,28355,40736,48329,204546,357597,259766,444914,49486,55128,260844,60198,78267,67548,81071,62204,43984,33889,25891,25216,15587,25849,20263,24226,19990,33316,27587,26325,32095,29387,34013,32406,32662,25496,38651,40635,38365,32050,50059,26609,23592,32737,32938,48535,38754,23272,37590,45590,36274,37035,23270,31657,38393,22458,24449,41229,28828,32129,27397,32743,26847,41594,26880,60804,26826,52328,53018,18854,36928,19570,38543,30342,21948,28034,24449,158044,44634,47205,41872,33068,23903,28517,23031,42935,21739,35925,26325,19920,31083,37143,43007,30493,24921,36110,26839,33603,31613,32994,23957,34234,15397,25849,27723,27667,22608,33324,24568,27709,27502,38126,29593,16888,41966,32088,34812,70509,76077,72621,76653,72237,71469,77037,72237,108923,262906,354341,330503,278605,79005,97482,6450,114701,25523,69357,2349,5421,5421,1581,2541,1581,1965,5421,5421,5421,4269,4269,2349,2349,5421,5421,1773,2157,3117,4269,4461,4269,2349,5421,5421,5421,1965,4077,4269,2157,2349,5421,5421,3309,1773,4269,72762,2834,6957,7149,8685,9453,8685,6189,8109,5805,8877,8109,9069,7917,8493,6957,9069,8685,9453,9261,5421,6189,10413,9453,11373,8877,11757,9069,8493,10797,11373,9453,6765,7149,8493,10605,9069,6573,8685,11373,10605,10605,11181,10797,12141,10797,11565,11949,8301,8109,8109,9261,9069,7917,6573,8301,6957,10029,9645,10605,10221,11757,11757,9069,8685,8877,11949,5613,12525,10221,9837,9453,10989,10221,9453,13869,10989,8301,10989,5997,4269,4461,5997,5229,2733,4461,4653,5805,5613,5613,5421,5229,4653,5421,5421,4653,6189,4653,4269,7149,5805,6189,6189,6765,4845,6189,5229,5805,6573,5421,5037,8109,5037,4845,6189,5229,5613,6381,7725,5037,8301,5421,6189,3885,6765,5613,6189,6765,8109,5229,5421,4845,8109,4845,5421,4653,4653,4653,4653,6189,5229,4845,5037,6573,5997,4845,5421,4653,6765,5037,5997,5421,5037,5997,5421,5805,3501,6189,5421,4461,5421,16173,13485,10221,16173,8109,18669,7341,29421,11949,7341,11565,11565,21357,23853,19437,8301,8493,10989,10029,10029,5997,10797,10029,12909,8301,11757,12909,9261,10605,10413,7917,7917,8493,6765,7533,6573,7725,7917,7917,7149,10797,7917,8301,8493,6957,5421,12141,9453,9261,10797,10605,10797,10029,19629,21741,23469,18669,13293,4269,4269,5805,5037,4461,5229,5613,4461,5613,5613,4653,851,2097,3892619,809010];
/* --- einde gegenereerd --- */

const VOORVOEGSEL = 'letterspel-';
const CACHE = VOORVOEGSEL + VERSIE;
const BASIS = new URL('./', self.location.href).href;          // de map van het spel, met schuine streep
const CODE = /\.(html|css|js|json|webmanifest)$/;
// De publicatiemap (tools/bouw-publiek.py) geeft bij elk bestand een vingerafdruk mee: dan is deze cache precies die
// bouw. In de ontwikkelmap is de lijst zonder vingerafdrukken en werkt alles zoals voorheen (losser, met het vangnet).
const STRIKT = BESTANDEN.length > 0 && MERKEN.length === BESTANDEN.length;
const URLS = BESTANDEN.map(function (pad) { return new URL(pad, BASIS).href; });
const NUMMER = {}; URLS.forEach(function (url, i) { NUMMER[url] = i; });
const START = BASIS + 'index.html';
const STIL = 30000;                                             // zo lang mag een verzoek niets laten horen

function sleutel(url) {
  // zonder ?test=1 en dergelijke; de map zelf is index.html
  const u = new URL(url); u.search = ''; u.hash = '';
  return u.href === BASIS ? BASIS + 'index.html' : u.href;
}

// Wat er eerst moet zijn voordat een nieuwe versie het over mag nemen: alles behalve geluid en plaatjes (samen zo'n
// 19 van de 25 MB). Die komen daarna op de achtergrond (vulAan). Zo is een nieuwe versie in een paar tellen klaar in
// plaats van na het ophalen van alles, en breekt een telefoon die de app snel weer sluit de installatie niet steeds af.
const LATER = /^(audio|art)\//;
const KERN = [], ALLES = [];
BESTANDEN.forEach(function (pad, i) { ALLES.push(i); if (!LATER.test(pad)) KERN.push(i); });

function slaap(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }

// Een versie die is afgelost haalt niets meer op en ruimt niets meer op (in Safari loopt een afgeloste service worker
// nog even door: hij vulde dan zijn eigen cache weer aan terwijl de nieuwe versie die leeghaalde). De nieuwe baas zegt
// het over een eigen lijn; waar de browser het zelf bijhoudt (self.serviceWorker.state) telt dat ook.
// 'stop' van het spel (js/bewaar.js, als het vers wil beginnen): dan doet deze service worker helemaal niets meer.
let afgelost = false, gestopt = false, lijn = null;
try {
  lijn = new BroadcastChannel('letterspel-sw');
  lijn.onmessage = function (e) { if (e.data && e.data.baas && e.data.baas !== VERSIE) afgelost = true; };
} catch (e) { lijn = null; }
function isAfgelost() {
  try { if (self.serviceWorker && self.serviceWorker.state === 'redundant') return true; } catch (e) { /* stil */ }
  return afgelost || gestopt;
}
function anderen() {
  return caches.keys().then(function (namen) {
    return namen.filter(function (n) { return n.indexOf(VOORVOEGSEL) === 0 && n !== CACHE; }).sort().reverse();       // nieuwste eerst
  });
}
// Een cache van een andere versie openen als hij er nog is. caches.open maakt een cache die er niet is opnieuw aan: zo
// bleef er een lege cache van de vorige versie achter als die net was opgeruimd.
async function andere(naam) { return (await caches.has(naam)) ? caches.open(naam) : null; }
// De caches van oudere versies: alle andere, behalve de halve cache van een nieuwere bouw (een nieuwere versie die nog
// aan het installeren is, of waarvan de installatie de vorige keer niet afkwam: die gaat de volgende keer verder waar
// ze ophield). Elk bestand in de cache draagt het moment van zijn bouw (x-gebouwd) en van het ophalen (x-gehaald).
// Zo'n halve cache is hooguit 2 weken oud en is nooit de baas geweest. Een versie die het overneemt zet een teken bij
// haar index.html (x-baas, zie markeerBaas): een cache met dat teken is van een versie die de baas was en nu niet
// meer (ook als de publicatie is teruggezet naar een oudere bouw), en mag dus weg.
async function isNieuwer(naam) {
  if (!GEBOUWD) return false;
  try {
    const c = await andere(naam);
    if (!c) return false;
    const start = await c.match(START);
    if (start && start.headers.get('x-baas')) return false;
    let r = start;
    if (!r) { const k = await c.keys(); r = k.length ? await c.match(k[0]) : null; }
    const g = r ? r.headers.get('x-gebouwd') : null, t = r ? Date.parse(r.headers.get('x-gehaald') || '') : NaN;
    return !!g && g > GEBOUWD && Date.now() - t < 14 * 86400000;
  } catch (e) { return false; }
}
async function markeerBaas() {
  if (!STRIKT) return;
  try {
    const c = await caches.open(CACHE), r = await c.match(START);
    if (!r || r.headers.get('x-baas')) return;
    const kop = {}; r.headers.forEach(function (v, k) { kop[k] = v; }); kop['x-baas'] = '1';
    await c.put(START, new Response(await r.arrayBuffer(), { status: 200, headers: kop }));
  } catch (e) { /* stil */ }
}
async function ouderen() {
  const uit = [], namen = await anderen();
  for (let k = 0; k < namen.length; k++) if (!(await isNieuwer(namen[k]))) uit.push(namen[k]);
  return uit;
}

/* ---------- de pagina laten weten hoe ver het is (het balkje op het laadscherm en in het ouderscherm) ---------- */
let laatstGemeld = 0;
function meld(bericht, nu) {
  const t = Date.now();
  if (!nu && t - laatstGemeld < 200) return;
  laatstGemeld = t;
  bericht.soort = 'ls-voortgang'; bericht.versie = VERSIE;
  try {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (lijst) {
      lijst.forEach(function (c) { try { c.postMessage(bericht); } catch (e) { /* stil */ } });
    }).catch(function () { /* stil */ });
  } catch (e) { /* stil */ }
}
function nieuweStand(fase, indexen) {
  let totaal = 0;
  indexen.forEach(function (i) { totaal += MATEN[i] || 1; });
  return { fase: fase, af: 0, van: indexen.length, bytes: 0, totaal: totaal };
}
function meldStand(st, nu) { if (st) meld({ fase: st.fase, af: st.af, van: st.van, bytes: Math.min(st.bytes, st.totaal), totaal: st.totaal }, nu); }

/* ---------- ophalen ---------- */
async function merkVan(buf) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
  let s = '';
  for (let i = 0; i < 8; i++) s += (d[i] < 16 ? '0' : '') + d[i].toString(16);
  return s;
}
// Wat in de cache komt: de nagelopen inhoud, met het merk erbij. Een volgende versie neemt het dan over zonder te rekenen.
function bewaarbaar(buf, soort, merk) {
  return new Response(buf, { status: 200, headers: { 'Content-Type': soort || 'application/octet-stream', 'Content-Length': String(buf.byteLength), 'x-merk': merk, 'x-gebouwd': GEBOUWD, 'x-gehaald': new Date().toISOString() } });
}
// Een verzoek dat niet eeuwig mag blijven hangen: na STIL zonder een enkele byte wordt het afgebroken. De klok begint
// bij elk stuk opnieuw, zodat een groot bestand over een trage verbinding gewoon afkomt. → { buf, soort } of null
async function haalInhoud(url, wijze, bij) {
  let ctl = null, klok = null;
  function breek() { try { if (ctl) ctl.abort(); } catch (e) { /* stil */ } }
  function tik(n) { clearTimeout(klok); klok = setTimeout(breek, STIL); if (bij && n) bij(n); }
  try { ctl = new AbortController(); } catch (e) { ctl = null; }
  try {
    tik(0);
    const opties = { cache: wijze }; if (ctl) opties.signal = ctl.signal;
    const r = await fetch(new Request(url, opties));
    tik(0);
    if (!r.ok || r.redirected) {
      // een geweigerd antwoord (storing, te druk) netjes afsluiten: een antwoord dat niemand leest houdt de verbinding bezet
      try { if (r.body) r.body.cancel(); } catch (e) { /* stil */ }
      return null;
    }
    let buf;
    if (r.body && r.body.getReader) {
      const lezer = r.body.getReader(), stukken = []; let n = 0;
      for (;;) { const s = await lezer.read(); if (s.done) break; stukken.push(s.value); n += s.value.byteLength; tik(s.value.byteLength); }
      const alles = new Uint8Array(n); let op = 0;
      stukken.forEach(function (s) { alles.set(s, op); op += s.byteLength; });
      buf = alles.buffer;
    } else buf = await r.arrayBuffer();
    return { buf: buf, soort: r.headers.get('content-type'), etag: r.headers.get('etag') };
  } finally { clearTimeout(klok); }
}

// Een bestand zoeken in de caches van vorige versies, wat er ook in staat (de terugval zonder internet).
function uitOud(url) {
  return anderen().then(function (namen) {
    let i = 0;
    function volgende() {
      if (i >= namen.length) return null;
      return caches.match(url, { cacheName: namen[i++] }).then(function (hit) { return hit || volgende(); });
    }
    return volgende();
  }).catch(function () { return null; });
}
// Staat dit bestand met precies deze inhoud al in de cache van een andere versie? Dan hoeft het niet opnieuw van het
// internet te komen. Een cache van versie 1.4 en eerder heeft geen merk bij zijn bestanden: daar wordt de inhoud zelf
// nageteld. → een antwoord dat zo in de cache kan, of null
async function uitOudPrecies(url, merk) {
  const namen = await anderen();
  for (let k = 0; k < namen.length; k++) {
    const hit = await caches.match(url, { cacheName: namen[k] });
    if (!hit || !hit.ok) continue;
    const eigen = hit.headers.get('x-merk');
    if (eigen && eigen !== merk) continue;
    const buf = await hit.arrayBuffer();
    if (eigen || await merkVan(buf) === merk) return bewaarbaar(buf, hit.headers.get('content-type'), merk);
  }
  return null;
}
// Een bestand uit de caches van vorige versies halen (het staat nu in deze versie): zo groeit de opslag op de telefoon
// niet tot twee keer het spel, wat op een iPhone de grens kan raken.
function wisOud(url) {
  return ouderen().then(function (namen) {
    return Promise.all(namen.map(function (n) { return andere(n).then(function (c) { return c ? c.delete(url) : false; }); }));
  }).catch(function () { /* stil */ });
}
// Geluid en plaatjes die in meer dan één oude cache staan (een eerdere installatie die niet afkwam) maar één keer bewaren.
function ontdubbel() {
  return anderen().then(function (namen) {
    const gezien = {};
    let keten = Promise.resolve();
    namen.forEach(function (n) {
      keten = keten.then(function () { return andere(n); }).then(function (c) {
        return !c ? null : c.keys().then(function (lijst) {
          return Promise.all(lijst.map(function (r) {
            const pad = r.url.indexOf(BASIS) === 0 ? r.url.slice(BASIS.length) : '';
            if (!LATER.test(pad)) return null;
            if (gezien[r.url]) return c.delete(r);
            gezien[r.url] = 1; return null;
          }));
        });
      });
    });
    return keten;
  }).catch(function () { /* stil */ });
}

// Eén bestand van de lijst in de cache van deze versie zetten. → true als het erin staat
//  1. uit de cache van een vorige versie, als de inhoud precies klopt (geen verzoek);
//  2. anders van het internet, nagelopen tegen de vingerafdruk: een half bestand (verbinding verbroken) of een oud
//     bestand (de server liep nog achter op de nieuwe sw.js) komt er niet in. Het adres krijgt de vingerafdruk mee
//     (?m=...): dat adres hoort bij precies deze inhoud, dus wat de browser er zelf nog van heeft (bijvoorbeeld na een
//     installatie die niet afkwam) mag gebruikt worden. De tweede poging gaat langs elke tussenopslag heen.
const bezig = {};
function haalEen(cache, i, st, zonderOud) {
  const url = URLS[i];
  if (bezig[url]) return bezig[url];
  const werk = (async function () {
    const merk = MERKEN[i];
    if (await cache.match(url)) { if (st) st.bytes += MATEN[i] || 0; return true; }      // intussen al binnen (het spel vroeg erom)
    try {
      const oud = zonderOud ? null : await uitOudPrecies(url, merk);
      if (oud) { await cache.put(url, oud); if (st) st.bytes += MATEN[i] || 0; return true; }
    } catch (e) { /* dan van het internet */ }
    for (let poging = 0; poging < 2; poging++) {
      let binnen = 0;
      try {
        const r = await haalInhoud(poging ? url : url + '?m=' + merk, poging ? 'reload' : 'default', function (n) { binnen += n; if (st) { st.bytes += n; meldStand(st); } });
        if (r && await merkVan(r.buf) === merk) { await cache.put(url, bewaarbaar(r.buf, r.soort, merk)); return true; }
        if (!r) { if (st) st.bytes -= binnen; return false; }      // de server weigert (storing): de volgende ronde opnieuw, niet meteen nog een keer
      } catch (e) { /* verbinding weg of afgebroken */ }
      if (st) st.bytes -= binnen;                                 // telt niet mee: het komt opnieuw
    }
    return false;
  })();
  bezig[url] = werk;
  const klaar = function () { delete bezig[url]; };
  werk.then(klaar, klaar);
  return werk;
}
// Zonder vingerafdrukken (de ontwikkelmap): staat het bestand nog in de cache van een vorige versie, dan vraagt hij de
// server alleen of het veranderd is (If-None-Match); is het gelijk gebleven, dan wordt het overgenomen.
async function haalLos(cache, i) {
  const url = URLS[i];
  try {
    const oud = await uitOud(url), merk = oud && oud.ok && oud.headers ? oud.headers.get('etag') : null;
    if (merk) {
      const r = await fetch(new Request(url, { cache: 'no-store', headers: { 'If-None-Match': merk } }));
      if (r.status === 304) { await cache.put(url, oud); return true; }
      if (r.ok && !r.redirected) { await cache.put(url, r); return true; }
      try { if (r.body) r.body.cancel(); } catch (e) { /* stil */ }
      return false;
    }
    const r = await haalInhoud(url, 'reload', null);
    if (!r) return false;
    const kop = { 'Content-Type': r.soort || 'application/octet-stream' }; if (r.etag) kop.ETag = r.etag;
    await cache.put(url, new Response(r.buf, { status: 200, headers: kop }));
    return true;
  } catch (e) { return false; }
}
// Een lijst bestanden in de cache zetten, 6 tegelijk. Elk bestand apart: wat niet lukt blijft over voor de volgende
// ronde. → het aantal dat niet lukte
async function haalBinnen(cache, indexen, verhuis, st) {
  let k = 0, mis = 0;
  const alleen = !(await anderen()).length;                       // geen cache van een andere versie: niets over te nemen of op te ruimen
  async function baan() {
    while (k < indexen.length) {
      // het spel gaat voor: zolang er een antwoord aan het spel loopt wacht het verhuizen uit een vorige cache even
      // (hooguit 3 tellen). Bij de allereerste keer laden niet: dan komt alles van het net en is er niets te winnen.
      for (let w = 0; verhuis === 'beleefd' && drukte > 0 && w < 120; w++) await slaap(25);
      if (gestopt || (verhuis && isAfgelost())) { mis += indexen.length - k; k = indexen.length; break; }      // een installatie loopt altijd door
      const i = indexen[k++];
      let ok = false;
      try { ok = STRIKT ? await haalEen(cache, i, st, alleen) : await haalLos(cache, i); } catch (e) { ok = false; }
      if (ok && verhuis && !alleen) await wisOud(URLS[i]);
      if (!ok) mis++;
      if (st) { st.af++; meldStand(st); }
    }
  }
  const banen = []; for (let b = 0; b < 6; b++) banen.push(baan());
  await Promise.all(banen);
  return mis;
}
// Welke bestanden van de lijst staan nog niet in deze cache? Altijd op naam nagekeken: een andere versie kan de cache
// intussen hebben weggegooid.
async function ontbreekt(indexen) {
  const cache = await caches.open(CACHE), er = {};
  (await cache.keys()).forEach(function (r) { er[r.url] = 1; });
  return indexen.filter(function (i) { return !er[URLS[i]]; });
}

// De caches van vorige versies weggooien, maar pas als deze versie alles heeft: tot dan zijn ze de bron voor wat niet
// veranderd is en de terugval zonder internet. En nooit terwijl er een nieuwere versie aan het installeren is of
// klaarstaat (die ruimt zelf op zodra zij de baas is), en nooit de cache van een nieuwere bouw (zie ouderen).
async function ruimOp() {
  if (isAfgelost() || (await ontbreekt(ALLES)).length) return false;
  const reg = self.registration;
  if (reg && (reg.installing || reg.waiting)) return false;
  const namen = await ouderen();
  await Promise.all(namen.map(function (n) { return caches.delete(n); }));
  return true;
}
// Wat nog niet binnen is (geluid en plaatjes na een nieuwe versie, of een haperende verbinding) alsnog ophalen. Het spel
// vraagt hierom bij het openen (js/bewaar.js) en de nieuwe versie doet het zelf zodra hij het overneemt. Is alles er al,
// dan gaat er geen enkel verzoek de deur uit.
let vultAan = null;
function vulAan() {
  if (vultAan) return vultAan;
  vultAan = (async function () {
    try {
      let st = null;
      for (let ronde = 0; ronde < 2; ronde++) {                    // een tweede ronde voor wat de eerste keer haperde
        const mist = await ontbreekt(ALLES);
        if (!mist.length) break;
        if (!st) st = nieuweStand('rest', mist);
        await haalBinnen(await caches.open(CACHE), mist, (await anderen()).length ? 'beleefd' : true, st);
      }
      const schoon = await ruimOp();
      if (st || schoon) meld({ fase: 'klaar', compleet: !(await ontbreekt(ALLES)).length }, true);
    } catch (e) { /* stil */ }
    vultAan = null;
  })();
  return vultAan;
}

// Installeren: de kern moet er helemaal zijn, nagelopen. Lukt dat niet (verbinding weg, de app gesloten), dan mislukt
// de installatie en blijft de vorige versie de baas; wat al binnen is blijft in de cache staan en de volgende poging
// (bij het openen, of als het spel om de nieuwste versie vraagt) gaat verder waar deze ophield.
async function installeer() {
  await ontdubbel();
  let st = null;
  const rondes = STRIKT ? 4 : 1;
  for (let ronde = 0; ronde < rondes; ronde++) {
    const mist = await ontbreekt(KERN);
    if (!mist.length) break;
    if (!st) { st = nieuweStand('kern', mist); meldStand(st, true); }
    if (ronde) await slaap(1000 * ronde);
    await haalBinnen(await caches.open(CACHE), mist, false, st);
  }
  const over = await ontbreekt(KERN);
  if (STRIKT && over.length) { meld({ fase: 'mislukt', over: over.length }, true); throw new Error('de kern is niet compleet: ' + over.length + ' bestanden ontbreken'); }
  meld({ fase: 'kern-klaar' }, true);
}
self.addEventListener('install', function (e) { e.waitUntil(installeer()); });

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    // Vóór de pagina's overgaan de kern nog één keer nalopen: versie 1.4 gooide de cache van een nieuwere versie weg
    // terwijl die klaarstond. Zonder internet gaat dit meteen door; de vorige cache is dan de terugval.
    try {
      const mist = await ontbreekt(KERN);
      if (mist.length) await haalBinnen(await caches.open(CACHE), mist, false, null);
    } catch (e2) { /* stil */ }
    afgelost = false;
    await markeerBaas();
    await self.clients.claim();
    try { if (lijn) lijn.postMessage({ baas: VERSIE }); } catch (e3) { /* stil */ }
    vulAan();
  })());
});

// het spel zegt wanneer de nieuwe versie het over mag nemen (op een rustig moment), en vraagt hoe het ervoor staat
self.addEventListener('message', function (e) {
  const naar = e.ports && e.ports[0] ? e.ports[0] : e.source;
  if (e.data === 'neem-over') self.skipWaiting();
  else if (e.data === 'stop') gestopt = true;
  else if (e.data === 'vul-aan') e.waitUntil(vulAan());
  else if (e.data === 'versie') { if (naar) naar.postMessage({ versie: VERSIE, bestanden: BESTANDEN.length, gebouwd: GEBOUWD, strikt: STRIKT }); }
  else if (e.data === 'stand') {
    e.waitUntil(Promise.all([ontbreekt(ALLES), ontbreekt(KERN)]).then(function (m) {
      if (naar) naar.postMessage({ versie: VERSIE, bestanden: BESTANDEN.length, gebouwd: GEBOUWD, strikt: STRIKT, mist: m[0].length, kernMist: m[1].length, vult: !!vultAan });
    }).catch(function () { /* stil */ }));
  }
});

function ververs(cache, url) {
  return fetch(url).then(function (r) { if (r.ok && !r.redirected && r.type === 'basic') return cache.put(url, r); }).catch(function () { /* geen internet: prima */ });
}
function geenInternet(cache, req) {
  if (req.mode === 'navigate') return cache.match(BASIS + 'index.html').then(function (i) { return i || new Response('Geen internet', { status: 503 }); });
  return new Response('', { status: 504, statusText: 'geen internet' });
}
let drukte = 0;                                                   // antwoorden aan het spel die nu lopen
async function antwoord(e, req, url) {
  drukte++;
  try { return await antwoordNu(e, req, url); } finally { drukte--; }
}
async function antwoordNu(e, req, url) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(url);
  if (hit) {
    // het vangnet van de ontwikkelmap: code wordt na het tonen op de achtergrond ververst. In de publicatiemap niet:
    // daar is de cache precies één bouw, en komt nieuwe code alleen als hele nieuwe versie binnen.
    if (!STRIKT && CODE.test(url)) e.waitUntil(ververs(cache, url));
    return hit;
  }
  const i = NUMMER[url];
  // Geluid en plaatjes die nog niet in deze cache staan (vlak na een nieuwe versie komen ze pas daarna): meteen uit de
  // cache van een vorige versie als het daar staat, zonder eerst het net te proberen. Op een trage verbinding kwam de
  // stem anders te laat of niet. Het aanvullen loopt het bestand daarna op de achtergrond na en verhuist het (is het
  // in de nieuwe versie veranderd, dan klinkt het nieuwe vanaf de volgende keer). Alleen als geen enkele cache het
  // heeft gaat het naar het net. Voor code blijft deze cache leidend.
  if (i !== undefined && LATER.test(BESTANDEN[i])) {
    const vorig = await uitOud(url);
    if (vorig) {
      // nalopen en verhuizen kan even wachten: eerst het antwoord
      e.waitUntil(slaap(2500).then(function () { return STRIKT ? haalEen(cache, i, null) : haalLos(cache, i); }).then(null, function () { /* stil */ }));
      return vorig;
    }
  }
  if (STRIKT && i !== undefined) {
    // hoort bij deze versie maar is nog niet binnen (geluid of een plaatje vlak na een nieuwe versie): overnemen uit de
    // vorige cache als de inhoud klopt, anders ophalen en nalopen
    try { if (await haalEen(cache, i, null)) { const nu = await cache.match(url); if (nu) return nu; } } catch (e2) { /* verder */ }
    const oud = await uitOud(url);
    if (oud) return oud;                                           // zonder internet: liever dit bestand van de vorige versie dan niets
    try { return await fetch(req); } catch (e3) { return geenInternet(cache, req); }
  }
  try {
    const r = await fetch(req);
    if (r.ok && !r.redirected && r.type === 'basic') cache.put(url, r.clone());
    return r;
  } catch (e4) {
    // geen internet: misschien staat het nog in de cache van de vorige versie
    const oud = await uitOud(url);
    return oud || geenInternet(cache, req);
  }
}
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (gestopt || req.method !== 'GET' || req.url.indexOf(BASIS) !== 0) return;
  const url = sleutel(req.url);
  if (url === BASIS + 'sw.js') return;
  e.respondWith(antwoord(e, req, url));
});
