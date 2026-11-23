# Licentie van de effecten en de muziek in deze map

Alle mp3-bestanden in `audio/fx/` zijn gemaakt met `tools/maak-fx.py`. Het script speelt eigen noten af op de
instrumentklanken van één soundfont en neemt het resultaat op. De soundfont zelf staat niet in het spel.

## Soundfont: GeneralUser GS 2.0.3

- Maker: S. Christian Collins, https://www.schristiancollins.com
- Bron: https://github.com/mrbumpy409/GeneralUser-GS (bestand `GeneralUser-GS.sf2`, 32,3 MB, opgehaald op 23 november 2026)
- SHA-256 van het gebruikte bestand: `9575028c7a1f589f5770fccc8cff2734566af40cd26ed836944e9a5152688cfe`
- Licentie: GeneralUser GS License v2.0. De volledige tekst staat hieronder, ongewijzigd.

Wat de licentie toestaat en wat wij doen: de soundfont mag zonder beperking gebruikt worden om eigen muziek te maken,
privé of commercieel, en de opnamen daarvan mogen verspreid worden. Wij verspreiden alleen zulke opnamen (korte
effecten en vier muziekstukjes), in een gratis spel. De soundfont zelf verspreiden wij niet.

Een kanttekening die de maker zelf plaatst: een deel van de samples komt uit andere vrij verkrijgbare soundfonts en hij
kan de herkomst niet van elk sample met zekerheid noemen. Hij heeft sinds 2000 nooit een klacht gekregen. Voor een gratis
spel voor eigen gebruik is dat ruim voldoende; wie het spel ooit commercieel uitbrengt, leest deze alinea nog eens na.

Gebruikte klanken (bank:programma): Marimba 0:12, Xylophone 0:13, Kalimba 0:108, Celeste 0:8, Glockenspiel 0:9,
Music Box 0:10, Orchestral Harp 0:46, Pizzicato Strings 0:45, Ukulele 8:24, Acoustic Bass 0:32, Wood Block 0:115
en uit het slagwerk (128:0, Standard 1): bongo's, houtblok, claves, shaker, cabasa, side stick, surdo.

## Wat van onszelf is

- De noten: de vier muziekstukjes (Bospad, Huppel, Schommel, Avond), de fanfare, de ta-daa en alle andere
  loopjes zijn voor dit spel geschreven. Er is geen bestaand liedje gebruikt.
- Twee klanken komen niet uit de soundfont maar uit eigen rekenwerk in `tools/maak-fx.py`: `woesj` (gefilterde ruis)
  en `mrrp` (Nunu's triller).
- De galm en alle nabewerking zijn eigen rekenwerk.

## Gereedschap (niet meegeleverd)

- tinysoundfont (Python, MIT) met TinySoundFont van Bernhard Schelling (MIT): speelt de soundfont af.
- ffmpeg met LAME: maakt de mp3's.
- numpy en scipy (BSD).

## GeneralUser GS License v2.0 (volledige tekst)

```
*** GeneralUser GS v2.0.3 ***
***      License v2.0     ***

** License of the complete work **
You may use GeneralUser GS without restriction for your own music creation,
private or commercial. This SoundFont bank is provided to the community free of
charge. Please feel free to use it in your software projects, and to modify the
SoundFont bank or its packaging to suit your needs.

** License of contained samples **
GeneralUser GS inherits the usage rights of the samples contained within, all of
which allow full use in music production, including the ability to make profit
from musical recordings created with GeneralUser GS.

Many of the samples are original, but some were taken from other banks freely
(and legally) available on the Internet from various SoundFont websites. Because
GeneralUser GS originated as a personal project with no intention for
publication, I cannot be 100% sure where all of the samples originated, although
I do know that none of them came from commercially published SoundFont packages
or sample CDs. Regardless, many "free" SoundFonts available on the web may
indeed contain samples of questionable origin. My understanding of the
copyrights of all samples is only as good as the information provided by the
original sources. If you become aware of any restricted samples being used in
GeneralUser GS, please let me know so I can replace them.

This uncertainty may concern you if you intend to use GeneralUser GS in a
commercial software product. That being said, I have never received any
complaint regarding sample ownership since I published the original GeneralUser
GS back in 2000, and as far as I am aware, neither have any of the companies
creating commercial software products using GeneralUser GS.

** More info **
If you plan to feature GeneralUser GS on your own website, please do not link
directly to my download files. Either link to my website, or provide your own
local copy instead.

I hope you enjoy GeneralUser GS! This SoundFont bank is the product of many
years of hard work.

You can find updates to GeneralUser GS and more of my virtual instruments at:
http://www.schristiancollins.com

I can be reached via the contact page on my website here:
https://www.schristiancollins.com/contact

Thank you!
-~Chris
```
