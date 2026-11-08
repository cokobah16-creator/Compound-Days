// tools/reader-v41.cjs: prints section v41.3 of docs/READER_gist.md ("Every v41 line, as the game ships it") from the game's own copy tables:
// ADA41.LINES (dist/src/ada-v41.js), GIFT41.LINES (dist/src/gifts-v41.js) and DAILY41.LINES (dist/src/daily-v41.js, Today's own words), with
// the flat pieces and their things (ADA41.FLAT) and the neighbour pieces (GIFT41.NB). Each id's text is resolved as the game resolves it
// (fix round, C5): adaLine41 and giftLine41 take GIFT41.LINES first, then ADA41.LINES; Today's block reads DAILY41.LINES. The harness's check 11
// asserts that every row of the sheet reads what the game returns. The modules are run in an empty sandbox with v38's, v39's and v40's (no game, no browser): v41 installs nothing
// there (ADA41.on is false), and only its tables are read. Every string a player can see is printed once, with its id, who says it, when and
// where it is said (the condition is part of the line: v41/SPEC.md §9.1 and §13), the question in section v41.1 it belongs to, and what ships if
// the reader flags it, in the owner's order: the pieces and their prices, the gifts, the last polish, then the rest. A row with no speaker, no
// condition or an empty cell stops the script with an error, so no row reads "undefined".
// Usage: node tools/reader-v41.cjs > v41-lines.md   (then paste it over section v41.3 of the sheet)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'dist', 'src');
const ctx = vm.createContext({ HOTSPOT_HOOKS: [], ACT_HOOKS: [], console: { warn() {}, log() {} }, Math });
for (const f of ['found-v38.js', 'gist-v38.js', 'seller-v39.js', 'gist-v39.js', 'board-v40.js', 'mallam-v40.js', 'gist-v40.js', 'ada-v41.js', 'gifts-v41.js', 'daily-v41.js']) vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f });
const T = JSON.parse(vm.runInContext('JSON.stringify({A:ADA41.LINES,B:GIFT41.LINES,D:DAILY41.LINES,F:ADA41.FLAT,N:GIFT41.NB})', ctx));
const { A, B, D, F, N } = T;
// the text the game shows for an id: GIFT41 before ADA41 (adaLine41, giftLine41), DAILY41 for Today's own words
const text = id => typeof B[id] === 'string' ? B[id] : typeof A[id] === 'string' ? A[id] : D[id];
// when and where each line is said (spec §13's tables, the variants and the interface strings by their place); kept here so the sheet needs no spec
const WHEN = {
"ad41-bring-clock": "the clock surround ordered",
"ad41-bring-got": "a thing handed over (then `ad41-night`, at the Yard and on the veranda alike)",
"ad41-bring-glass-got": "the mirror glass handed over while the three shells are still owed (the piece still waits)",
"ad41-bring-hooks": "the kitchen shelf ordered",
"ad41-bring-letters": "the name board ordered",
"ad41-bring-like": "\"one like yours\" ordered",
"ad41-bring-lining": "the box ordered",
"ad41-bring-measure": "the writing table ordered",
"ad41-bring-mirror": "the mirror ordered, three or more shells kept",
"ad41-bring-mirror-few": "the mirror ordered, fewer than three kept",
"ad41-bring-photo": "the panel ordered",
"ad41-bring-print": "the frame ordered",
"ad41-bring-screws": "the door plate ordered",
"ad41-bring-sign": "the café sign ordered",
"ad41-brought": "the collection at the veranda station",
"ad41-care": "the end of the beat (alternating)",
"ad41-gift-pick": "a neighbour's piece ordered",
"ad41-guarantee": "the end of the beat (alternating)",
"ad41-next": "after the balance",
"ad41-night": "the thing handed over, at the Yard or the veranda station (or Mama Nkechi's message)",
"ad41-wall": "at the slate, later reads, a wall piece offered (her own remark; it answers nothing the player did)",
"ad41-nk-msg": "Mama Nkechi's message given",
"ad41-one": "the slate read while a piece is open",
"ad41-person": "at the slate, later reads (her own remark; it asks for no answer, finding 18)",
"ad41-polish": "before the beat",
"ad41-polish-b1": "sheen passes 0.3",
"ad41-polish-b2": "sheen passes 0.6",
"ad41-polish-skip": "\"Leave it to Ada\"",
"ad41-ready": "the collection",
"ad41-short-bench": "the purse short for a deposit, at the Yard before 18:00",
"ad41-short-collect": "the purse short for the balance, at the Yard",
"ad41-short-collect-v": "the same, at the veranda station (no claim about the hour she leaves, finding 7)",
"ad41-short-veranda": "the same, at the veranda station",
"ad41-slate-first": "the first read",
"ad41-slate-head": "the slate, always",
"ad41-terms": "at the order",
"ad41-wood-afara": "an afara piece (the kitchen shelf; the shells mirror, whose frame holds glass)",
"ad41-wood-iroko": "an iroko piece",
"ad41-wood-mahogany": "a mahogany piece (the carved panel; the writing table)",
"ad41-wood-obeche": "the box",
"gf41-ba-frame": "the frame given, wherever he is by the hour (\"can stand\": he has not hung it yet)",
"gf41-ba-gen": "to Mr. Bassey",
"gf41-ba-gen2": "the second copy given to Mr. Bassey, at his place by the hour",
"gf41-ba-gen3": "the third copy given to Mr. Bassey",
"gf41-ba-lagoon": "\"Ask for a lagoon photograph\", at his place by the hour",
"gf41-ba-lagoon2": "a second lagoon photograph asked of Mr. Bassey (a panel “like yours”), at his place by the hour",
"gf41-ba-lend": "\"Borrow the wedding print\", at his place by the hour",
"gf41-home-toast": "toast: a flat piece taken indoors ({where} is the piece’s place in the flat)",
"gf41-nk-ask": "\"Hear Mama Nkechi out\", at her shop",
"gf41-nk-bubble": "her ask due, a player within 6 m of the shop by day",
"gf41-nk-gen": "\"one like yours\" to Mama Nkechi",
"gf41-nk-gen2": "the second copy given to Mama Nkechi, at her shop (the three wordings take turns)",
"gf41-nk-gen3": "the third copy given to Mama Nkechi, at her shop",
"gf41-nk-pay": "the same panel",
"gf41-nk-return": "a day or two after a gift to her (cut item 1), at most once in fourteen days",
"gf41-nk-sign": "the sign given",
"gf41-nk-stool": "the stool given at her shop",
"gf41-nk-words": "\"Ask about the sign’s words\", at her shop",
"gf41-oy-gen": "to Mrs. Oyelaran, morning, from six, or after the gist",
"gf41-oy-gen2": "the second copy given to Mrs. Oyelaran, the courtyard, morning or from six",
"gf41-oy-gen3": "the third copy given to Mrs. Oyelaran, the courtyard, morning or from six",
"gf41-oy-measure": "\"Ask for the minutes book’s size\", the courtyard, morning or from six",
"gf41-oy-table": "the table given, morning, from six, or after the gist",
"gf41-shells-give": "toast: the three shells given at the station for the mirror",
"gf41-tu-board": "the name board given",
"gf41-tu-gen": "to Tunde",
"gf41-tu-gen2": "the second copy given to Tunde, the garden corner or the courtyard",
"gf41-tu-gen3": "the third copy given to Tunde",
"gf41-tu-letters": "\"Ask Tunde for his lettering\", the garden corner or the courtyard",
"gs41-ad-after": "[cond] a flat piece taken in today (she made its place; she would guess right)",
"gs41-ad-gift": "[hearsay] [place] a gift given today away from the Yard, receiver not a guest (finding 20)",
"gs41-ad-gift2": "another wording of gs41-ad-gift, on the same condition (each wording at most once in fourteen evenings)",
"gs41-ad-name": "[cond] the next flat piece in; her own remark (finding 18)",
"gs41-ad-ninth": "[cond] as above; the lateness joke stays on her own ninth piece (culture §7.7)",
"gs41-ad-nk": "[cond] her stool cut",
"gs41-ad-open": "[cond] a cut piece of the household's own or a paid gift; never Mama Nkechi's stool",
"gs41-ba-frame": "[place] the frame given today; he is never home by day, so \"tonight\" (finding 19)",
"gs41-ba-gen": "[place] given before 18:00 (he was at the photo corner, then the waterfront)",
"gs41-ba-gen-eve": "[place] given from 18:00, in the courtyard",
"gs41-ba-gen-eve2": "another wording of gs41-ba-gen-eve, on the same condition (given from six, in the courtyard)",
"gs41-ba-gen2": "another wording of gs41-ba-gen, on the same condition (given before six; he spent the day by the water)",
"gs41-ba-gen3": "another wording of gs41-ba-gen, on the same condition",
"gs41-ba-photo": "[place] a piece for your flat collected at the Yard's station after 08:15 today, not on a day Ada visits (never a neighbour's piece, Mama Nkechi's stool or a piece made for him)",
"gs41-ba-photo2": "another wording of gs41-ba-photo, on the same condition",
"gs41-nk-gen": "[place] \"one like yours\" given at her shop today",
"gs41-nk-gen2": "another wording of gs41-nk-gen, on the same condition",
"gs41-nk-gen3": "another wording of gs41-nk-gen, on the same condition",
"gs41-nk-open": "[hearsay] a piece for your flat being made tonight (cut today); \"that girl\" is her shipped word for Ada",
"gs41-nk-open2": "[hearsay] a piece for your flat open on Ada's bench (also the other wording of gs41-nk-open on its night)",
"gs41-nk-sign": "[place] given at her shop",
"gs41-nk-stool": "[place] the stool given at her shop before the gist",
"gs41-oy-gen": "[place] given in the morning only",
"gs41-oy-gen2": "another wording of gs41-oy-gen (“I came home at six”: given in the morning, before she went out)",
"gs41-oy-gen3": "another wording of gs41-oy-gen (“waited for me all afternoon while I was out”: given in the morning)",
"gs41-oy-saw": "[cond] a piece became ready this morning",
"gs41-oy-saw2": "another wording of gs41-oy-saw, on the same condition",
"gs41-oy-table": "[place] given in the morning, from six before the gist, or after the previous gist",
"gs41-tu-board": "[place] given at the garden corner before noon (finding 19)",
"gs41-tu-board-am": "[place] given after noon, in the courtyard",
"gs41-tu-gen": "[place] given before 15:00 (he is in the courtyard after noon)",
"gs41-tu-gen2": "another wording of gs41-tu-gen, on the same condition (given before three)",
"gs41-tu-gen3": "another wording of gs41-tu-gen, on the same condition",
"ui41-ask-letters": "prompt at Tunde when the name board is ordered",
"ui41-ask-measure": "prompt at Mrs. Oyelaran when the table is ordered (never 12:00–18:00)",
"ui41-ask-print": "prompt at Mr. Bassey when the frame is ordered",
"ui41-ask-words": "prompt at Mama Nkechi when the sign is ordered",
"ui41-back": "button in every v41 panel",
"ui41-bring": "under an offer: the thing to bring and where it comes from",
"ui41-bring-shells": "under the mirror’s offer",
"ui41-buy": "button in that block",
"ui41-collect": "prompt at the station with a piece ready",
"ui41-first": "album memory: the first piece made for the household",
"ui41-flat": "the slate’s offer for the flat",
"ui41-flat-done": "the slate after the sixth flat piece",
"ui41-give": "prompt at the receiver’s live figure, at their place by the hour, for “one like yours”",
"ui41-give-board": "prompt at Tunde with his name board",
"ui41-give-frame": "prompt at Mr. Bassey with his frame",
"ui41-give-nkstool": "prompt at Mama Nkechi with her stool",
"ui41-give-sign": "prompt at Mama Nkechi with her sign",
"ui41-give-table": "prompt at Mrs. Oyelaran with her table (the courtyard, morning, from six, or after the gist)",
"ui41-got": "after buying or being given a thing to bring (a toast after a buy; a note in a neighbour's ask panel)",
"ui41-hand": "prompt at the station with the thing to bring in the pocket",
"ui41-hear": "prompt at Mama Nkechi once her ask is due, by day",
"ui41-hush-watch": "the prompt pill during the last polish, within 2.5 m of the station and not at a standing point",
"ui41-hush-wrap": "the prompt pill for 2 s after the polish ends or after “Leave it to Ada”, within 2.5 m of the station (each tap starts the 2 s again)",
"ui41-inside": "prompt at the flat door with a flat piece in the hands",
"ui41-kicker": "the slate panel’s kicker",
"ui41-kicker-ask": "kicker of a neighbour’s ask panel",
"ui41-kicker-back": "kicker of the puff-puff panel",
"ui41-kicker-c": "the kicker of the hand-over, Mama Nkechi’s message and the collection at the Yard",
"ui41-kicker-v": "the same at the veranda station",
"ui41-kicker-give": "kicker of a neighbour’s thanks panel",
"ui41-kicker-nk": "kicker of Mama Nkechi’s word",
"ui41-later": "button in the collection panel, where “Pay the rest” was",
"ui41-leave": "button in the collection panel (the polish step): Ada polishes it",
"ui41-like": "the slate’s name for a copy (“a clock surround like yours”)",
"ui41-like-w": "the same, the woods again (“mahogany clock surround like yours”)",
"ui41-msg": "prompt at the station with Mama Nkechi’s message",
"ui41-nb": "the slate’s offer for a neighbour",
"ui41-nk-next": "the slate when her message is given while a piece is on the bench",
"ui41-nk-slate": "the slate while Mama Nkechi’s message waits",
"ui41-open-cut": "the slate with a piece cut tonight",
"ui41-open-ready": "the slate with a piece finished",
"ui41-open-wait": "the slate with a piece waiting for its thing",
"ui41-order": "button in the slate panel ({dep} is half the price)",
"ui41-pay": "button in the collection panel ({bal} is the rest)",
"ui41-photo": "prompt at Mr. Bassey when the lagoon photograph is wanted",
"ui41-plate": "prompt at the flat door with the door plate",
"ui41-polish": "prompt during the last polish",
"ui41-polish-btn": "button in the collection panel (the polish step)",
"ui41-price": "under an offer (prices in the interface only)",
"ui41-puff": "prompt at Mama Nkechi a day or two after a gift to her (at most once in fourteen days)",
"ui41-read": "prompt at Ada’s station (the Yard trestle, or beside her veranda chair on a visit day)",
"ui41-shells": "button in the slate panel when the mirror is ordered and three or more shells are kept",
"ui41-shop": "the block on the Palm Court Finds page and on Dayo’s stall, only while a thing sold there is wanted",
"ui41-shop-go": "Dayo’s block when the cloth is paid at his own stall",
"ui41-short": "the slate panel when the purse is short for the half",
"ui41-six": "album memory: the sixth flat piece home",
"ui41-take": "button in the collection panel for Mama Nkechi’s stool (nothing to pay)",
"ui41-tell": "button in Mama Nkechi’s panel",
"ui41-title": "the slate panel’s title",
"ui41-title-c": "the collection panel’s title",
"ui41-today-ask": "Today, a thing to ask a neighbour for",
"ui41-today-bring": "Today, a thing to bring from a shop or the store",
"ui41-today-coll": "Today, a paid piece waiting for its polish",
"ui41-today-cut": "Today, a piece cut tonight",
"ui41-today-hand": "Today, a flat piece in the hands",
"ui41-today-hand-plate": "Today, the door plate in the hands",
"ui41-today-tomorrow": "Today, after the ready line on a visit day with no room for Ada’s trestle on your veranda (the balcony full, or Aunty Bisi’s stop too near)",
"ui41-today-purse": "Today, after v40’s Mallam line (“Mallam is keeping two sticks for you tonight.”) when his order is kept and the purse holds less than his price",
"ui41-today-msg": "Today, her message not yet given",
"ui41-today-nb": "Today, a neighbour’s piece in the hands ({where}: the neighbour’s place by the hour)",
"ui41-today-nk": "Today, Mama Nkechi’s ask due",
"ui41-today-own": "Today, the same when the thing names the neighbour",
"ui41-today-oy": "{where} for Mrs. Oyelaran from 12:00 to 18:00 (after a sentence that names her)",
"ui41-today-pay": "Today, after the ready line, when the rest is due",
"ui41-today-ready": "Today, a piece ready",
"ui41-today-veranda": "Today, a piece ready on a visit day",
"ui41-turn": "prompt during the last polish, by Mallam’s turn rule: the first turn once the sheen holds at 0.6 (at 0.3 while the other player rubs); the second to a player who has not rubbed for 1.0 s, or after 2.0 s",
"ui41-where-wait": "{where} in the indoor toast for the box while the fridge is in storage",
"ui41-where-fridge": "{where} in the indoor toast for the box when the shells mirror does not hang over the fridge",
"ui41-shells-owed": "{thing} in the slate’s waiting line once the mirror glass is handed over and only the three shells are owed",
"gf41-plate-toast": "toast: the door plate put up (it goes on the outside of the door)",
"ad41-polish-own": "before the beat, after the owner's sentence: a piece for your flat",
"ad41-polish-gift": "before the beat, after the owner's sentence: a neighbour's piece",
"ui41-collect-nb": "prompt at the station with a neighbour's piece ready",
"ui41-title-nb": "the collection panel's title for a neighbour's piece",
"ui41-ordered": "the heading of the card for a piece just ordered (the collection's last step, or the slate)",
"ui41-ordered-nb": "the same for a neighbour's piece",
"ui41-keep": "the collection's second step, when a deposit would leave less than tonight's sellers ask (then \"Later\" is the default)",
"ui41-keep-mallam": "{what} in the line above: Mallam's sticks kept for tonight",
"ui41-keep-bisi": "{what} in the line above: Aunty Bisi's evening due and nothing bought from her yet",
"ui41-keep-and": "joins the two in the line above",
"ui41-today-slate": "Today (the integrator's block, `daily-v41.js`), only when nothing else applies and nothing is open: the slate's offers, e.g. “Ada’s slate: a kitchen shelf for your flat, or a name board for the garden corner, for Tunde.”",
"ui41-today-slate-flat": "the flat half of the line above",
"ui41-today-slate-nb": "the neighbour half of the line above",
"ui41-today-slate-or": "joins the two halves",
"ui41-today-ready-nb": "Today, a neighbour’s piece ready (Mama Nkechi’s stool or a gift; never “your” piece)",
"ui41-today-veranda-nb": "Today, the same on a day Ada sits on your veranda",
"ui41-today-cut-nb": "Today, a neighbour’s piece cut tonight",
"ui41-today-coll-nb": "Today, a neighbour’s piece paid for (or her stool taken) and waiting for its polish",
"ui41-today-pocket": "Today, a thing for Ada bought or given and not yet handed over",
"ui41-today-shells": "Today, the mirror's three shells still owed"
};
const NAME = { ada: 'Ada', nk: 'Mama Nkechi', ba: 'Mr. Bassey', tu: 'Tunde', oy: 'Mrs. Oyelaran' };
const speaker = id => { const m = /^(?:gf41|gs41)-(ad|nk|ba|tu|oy)-/.exec(id); if (/^ad41-/.test(id)) return 'Ada'; if (m) return NAME[m[1] === 'ad' ? 'ada' : m[1]]; throw new Error('reader-v41: no speaker for "' + id + '"'); };
const when = id => { if (!WHEN[id]) throw new Error('reader-v41: no condition for "' + id + '"'); return WHEN[id]; };
const cell = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const out = [], p = s => out.push(s);
const table = (head, rows) => { p('| ' + head.join(' | ') + ' |'); p('|' + head.map(() => '---').join('|') + '|'); for (const r of rows) { if (r.some(x => x === undefined || x === '' || /\bundefined\b/.test(String(x)))) throw new Error('reader-v41: an empty cell in ' + JSON.stringify(r)); p('| ' + r.map(cell).join(' | ') + ' |'); } p(''); };
const FB = {
  word: 'The reader’s wording.',
  price: 'The reader’s wording; the price band is the owner’s (decision 1) and goes back to the owner if the reader objects.',
  polish: 'The reader’s wording; the polish itself is the owner’s (decision 3).',
  gift: 'The reader’s wording; a line can be cut and the panel keeps the other wordings.',
  gist: 'Cut: the evening keeps the line it had.',
  wood: 'The reader’s wood, or the line cut (Ada names no wood).',
  ui: 'Plain wording from the reader.'
};
// the question in v41.1 each line belongs to, and its fallback
const Q = id => {
  if (/^ad41-(short-bench|short-veranda|short-collect)/.test(id) || /^ui41-(price|order|pay|short|today-pay|today-purse|shop|buy)$/.test(id)) return ['1', FB.price];
  if (/^ad41-(bring-(print|letters|measure|sign|like)|gift-pick)$/.test(id) || /^gf41-(ba-lend|tu-letters|oy-measure|nk-words)$/.test(id) || /^ui41-(give|like|ask-|kicker-ask|kicker-give|today-nb|today-ask|today-own|today-oy)/.test(id)) return ['2', FB.gift];
  if (/^ad41-(polish|care|guarantee)/.test(id) || /^ui41-(polish|turn|hush|leave)/.test(id) || /^gs41-ba-photo/.test(id)) return ['3', /^gs41/.test(id) ? FB.gist : FB.polish];
  if (/^ad41-wood-/.test(id)) return ['9', FB.wood];
  if (/^gf41-(nk-stool|ba-frame|tu-board|oy-table|nk-sign|nk-gen|ba-gen|tu-gen|oy-gen|nk-return)/.test(id) || /^ui41-(puff|kicker-back)$/.test(id)) return ['10', FB.gift];
  if (/^gs41-(nk-stool|ba-frame|tu-board|oy-table|nk-sign|nk-gen|ba-gen|tu-gen|oy-gen)/.test(id)) return ['10', FB.gist];
  if (/^gf41-nk-(bubble|ask|pay)$/.test(id) || /^ad41-nk-msg$/.test(id) || /^ui41-(hear|tell|kicker-nk|msg|nk-slate|nk-next|today-nk|today-msg|take)$/.test(id) || /^gs41-ad-nk$/.test(id)) return ['11', /^gs41/.test(id) ? FB.gist : FB.word];
  if (/^ad41-bring-(hooks|mirror|mirror-few|clock|lining|screws|photo|got|glass-got)$/.test(id) || /^gf41-(ba-lagoon|shells-give|home-toast|plate-toast)/.test(id) || /^ui41-(inside|plate|today-hand|today-pocket|today-shells|where-wait|where-fridge|shells|bring|photo|got|hand|shop-go)/.test(id)) return ['8', /^ui41/.test(id) ? FB.ui : FB.word];
  if (/^gs41-/.test(id)) return ['4', FB.gist];
  if (/^ui41-/.test(id)) return ['4', FB.ui];
  return ['4', FB.word];
};
const rows = (ids, withWho) => ids.map(id => { const t = text(id); const [q, fb] = Q(id); return withWho ? [id, speaker(id), t, when(id), q, fb] : [id, t, when(id), q, fb]; });
const all = Object.keys(A).concat(Object.keys(B).filter(k => A[k] === undefined), Object.keys(D).filter(k => A[k] === undefined && B[k] === undefined));
const used = new Set(), take = re => { const r = all.filter(id => re.test(id) && !used.has(id)); r.forEach(id => used.add(id)); return r; };
p('## v41.3 Every v41 line, as the game ships it');
p('');
p('Generated by `node tools/reader-v41.cjs` from the copy tables in `dist/src/ada-v41.js` (`ADA41.LINES`, `ADA41.FLAT`) and `dist/src/gifts-v41.js` (`GIFT41.LINES`, `GIFT41.NB`). Every string a player can see is below, once, with its id. **When and where** is part of the line: a line said outside it is a bug (the harness `check/verify-gist-v41.cjs` asserts it at the moment each gist line is said). **Q** is the question in v41.1 the row belongs to; **If it is wrong** is what ships if you flag it and give no wording. The slate, the panels’ buttons and Today are written interface in standard English; everything a person says is speech. Prices appear only in the interface, never in speech.');
p('');
p('### 1. The pieces, their prices and their things to bring (the tables behind the slate)');
p('');
table(['Piece', 'For', 'Wood', 'Price (half when you order, the rest when you collect)', 'Thing to bring', 'Q'], F.map(f => [f.name, 'your flat', f.wood, '₦' + f.price.toLocaleString('en-GB'), f.bring ? f.bring.thing + (f.bring.from === 'finds' ? ', Palm Court Finds' : f.bring.from === 'dayo' ? ', Dayo’s stall' : f.bring.from === 'bassey' ? ', from Mr. Bassey' : '') : 'nothing', '1, 7, 8']).concat(N.map(x => [x.name, NAME[{ nkechi: 'nk', bassey: 'ba', tunde: 'tu', oyelaran: 'oy' }[x.for]], x.wood, x.price ? '₦' + x.price.toLocaleString('en-GB') : 'nothing from the household (Mama Nkechi settles with Ada herself)', x.msg ? 'her message, given at Ada’s slate' : x.bring.thing + ', from ' + NAME[{ nkechi: 'nk', bassey: 'ba', tunde: 'tu', oyelaran: 'oy' }[x.bring.from]], x.msg ? '11' : '1, 2'])));
p('After the five neighbour pieces, “one like yours”: a copy of a flat piece the household has, for each neighbour in turn, at that piece’s price and with its thing to bring; when every pair is done, the woods again (“a mahogany clock surround like yours”).');
p('');
p('### 2. Ada at her slate and the order (at the station: from her bench, 2.5 m away, or from her veranda chair)');
p('');
table(['Id', 'Who', 'Line', 'When and where', 'Q', 'If it is wrong'], rows(take(/^ad41-(slate|person|wall|terms|night|one|wood|bring|short-bench|short-veranda|gift-pick|nk-msg)/), true));
p('### 3. Ada at the collection and the last polish (owner decision 3)');
p('');
table(['Id', 'Who', 'Line', 'When and where', 'Q', 'If it is wrong'], rows(take(/^ad41-/), true));
p('### 4. Mama Nkechi’s order, the neighbours’ things and their thanks (at their live places, by the hour)');
p('');
table(['Id', 'Who', 'Line', 'When and where', 'Q', 'If it is wrong'], rows(take(/^gf41-(nk|ba|tu|oy)-/), true));
p('### 5. At the gist (information; at most one v41 line a night, in a free reaction by the same speaker or a line v40’s repeat guard swapped in for them; each wording at most once in fourteen evenings and once for its piece)');
p('');
table(['Id', 'Who', 'Line', 'Said only when', 'Q', 'If it is wrong'], rows(take(/^gs41-/), true));
p('### 6. Toasts, the album, Today and the interface (plain English)');
p('');
table(['Id', 'Text', 'Where it shows', 'Q', 'If it is wrong'], rows(take(/./), false));
if (used.size !== all.length) throw new Error('reader-v41: lines left out');
process.stdout.write(out.join('\n') + '\n');
