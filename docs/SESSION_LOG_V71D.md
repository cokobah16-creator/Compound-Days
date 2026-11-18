# v71d: the session log and the build check

Two-phone play has only been checked on one machine: in the Node rig (`check/two-phones.cjs`) and in browsers
talking to each other locally. The first sessions on real phones will go wrong in ways nobody has seen, and without
a record of what each phone saw there is nothing to work from. `dist/src/session-v71d.js` (and `.css`) adds that
record, and a warning for the one mistake that is easy to make when testing: two phones on different versions.

## For players: sending a log

1. On each phone, open **Menu** and tap **Session log**. It is also on the title screen while a phone has a log, and
   on the "Could not join" and "Could not reconnect" panels, where a session can fail before the Menu exists.
2. Tap **Save as a file**, or **Share** where the phone offers it (then pick mail or a chat), or **Copy**.
3. Send both phones' logs, and say roughly when the problem happened. Times in the log are UTC; the first line of a
   session gives the phone's time zone.

The log stays on the phone. Nothing is sent anywhere unless you save, share or copy it. **Clear the log** empties it,
and lines older than seven days are dropped when the page opens.

## What is in a log

The log starts the first time a phone starts or joins a two-phone household, and records only while that phone is in
a two-phone room or joining one. One-phone and companion play are never recorded, and a phone that never plays on two
phones writes nothing.

| | Lines |
| --- | --- |
| The page | `session log on`: build, site, screen, touch, network type, time zone, browser; `page opened` (a reload), `page hidden`/`page shown` (a phone locking), `page closing`, `no frame for 42.0 s (the page was paused or busy)`, `browser: offline`/`online`, every page error, and `error caught:` for the errors the two-phone code catches quietly (an action that throws when replayed, a household that throws while applied) |
| The room | `room: ...` for every line the room code logs, with this phone's room id on `joined` and `holding`; `room: looking for the meeting point`, `trying to hold`, `could not join (reason)`, `trying again in 3.1 s (attempt 4)`; `nothing heard from the other phone for 6 s` and `heard from the other phone again` |
| Who is who | `this phone is P2: follows the host’s household, joined the meeting point` (or `writes the household`, `holds the meeting point`), written once the room has said which seat this phone has; `partner here`/`away`; `partner P1 on the same build (...), room id ...` or on another build or site; `more than one other device in the room` |
| Joining | `joining household palm-**** (14 characters typed)`, `in the room after 942 ms`, or `join failed after ... ms:` with the reason |
| Play | `sent buy #7` and, on the other phone, `got buy #7 from P2` (the same number); `P2 started a new session: its action numbers start again`; `household rev 12 count 9 not taken: ...` with why; `caught up with the host's household ...; never reached the host: buy #3`; `offered this phone's household as the newer copy`; `took the other phone's household ... over this phone's ...`; every toast and panel title this phone showed |
| Every 30 s | `status:` who is who, partner here or away, when it was last heard, its clock against this phone's, phase and day, the household's revision and count, actions not yet heard by the host, and since the last status: sent, received, written, taken, refused while this phone's own action was on the way, refused, frames per second |

A burst of one busy action (pushing the crate sends one every 0.12 s) is one line when it ends
(`sent pushpos x120 over 15.2 s`); the host's frequent writes, and households a guest refuses only because its own
last action is still on the way, are counted in the status line; at most a dozen received actions are listed per
second; a line repeated within ten seconds gets a count (`panel: The room is open (x3)`). A phone keeps the newest
1500 lines and at most about 180 KB in `localStorage` under `cd3-session71d`; the saved file says how many older lines
were dropped. Storage is written by the log's own one-second timer, never inside a game call: within a second of a
room event, an error, a toast, a panel or a household decision, at most every 30 seconds otherwise, and at once when
the page is hidden or closed.

**Masked** before a line is kept: every household code the phone knows (the one being joined, the one typed, the
stored place and the stored copies) as a word, and its secret part (the letters after `palm-`) wherever it appears;
anything shaped like a household code, in any separator form or letter case; the meeting point's name, which contains
the code. Panel titles that show the typed code ("Joining ...") are named, not quoted. **Not masked:** the players'
names (they appear in toasts), the site, the browser's description and the screen size.

**From the other phone** only what this build knows is kept: actions by name only if this build has that action
(the rest are counted), a build only if it looks like a build name, a site only if it looks like a host name, and no
control characters, so the other phone cannot add lines of its own to the saved file or fill the log.

## The build check

Each phone's presence now carries its build, its site and its clock. The preview and the live site use the same
rooms, so two phones can meet on different builds, which neither the checks nor the two-phone code expect. When a
phone sees its partner on another build, on another site, or on a build from before this check (no build in its
presence), it shows a one-line notice at the top right, clear of the player card and the mission card:
"Different versions", "Different sites", "Other phone is older" or "Unknown version". **Details** opens the whole
message and what to do, for example:

> Bola's phone is running a different version of the game (this phone: v71-..., that one: v71-...). Reload the page on
> both phones, then tap Continue together.

When the sites differ it asks to open the same address on both phones; when the partner is the older one it says the
partner should reload. Reload is offered only where reloading this phone helps. It is in the log too. It never blocks
play, toasts are drawn below it, and once hidden it stays away until the page reloads.

## Checks

- `check/verify-session-v71d.cjs` (7 checks on the two-phone rig): one-phone play leaves no trace; a normal session is
  logged on both phones with matching action numbers, no refused household, a caught replay error, nothing written
  inside a game call, and nothing kept, shown or saved containing the code or its secret part; a phone locked for
  forty seconds, a reload, a device turned away, two phones that both acted apart (the lost action is named) and a
  guest that acted alone (its offer, and the host taking it) are logged; codes typed in other forms and odd text from
  the other phone are never kept; the size limits, the seven-day expiry and later one-phone play; different builds and
  different sites; and a partner on the real build before this check (its page taken from git history, so the clone
  needs that commit; CI fetches full history). `check/two-phones.cjs` can now give a phone another build's page.
- `check/bench-session-v71d.cjs` (real headless Chromium, phone-sized, over WebRTC with the local signalling server):
  Save as a file gives a real download with the right content and no code; the title screen still offers the log; the
  notice shows on both phones as one line inside the screen, its Details name both builds, a toast is drawn below it,
  and it hides.

## Not checked

Real phones: Share and saving a file on iOS and Android, a phone's download folder, the browser clearing storage,
locked screens and mobile networks.
