# Apex Lockdown — structural research challenger

Fixed 60-card proposal, 22 Pokémon / 28 Trainer / 10 Energy. [Manifest](agent1-apex-lockdown-v1.json). No native or qualified games; not a replacement for the frozen Hood/Lockbridge evaluation.

## Strategic rationale
- Megaton Blower followed by copied Chaos Wheel simultaneously strips Special Energy/Tools/Stadium and prohibits re-playing those categories from hand on the next opposing turn. This is conditional attack denial, not an automatic win.
- Noivern ex Dominating Echo offers higher damage but does not prevent Tool replay; Haxorus Axe Blast handles Basic targets; Mega Dragalge offers repeatable resource stripping; Palkia-GX Zero Vanish can shuffle even Basic Energy off the board, but consumes the GX attack instead of Timeless-GX. These are conditional options sharing the same Apex attack action.
- Electrode-GX can attach Special Energy from discard despite the play-from-hand restriction. Pokémon Ranger can remove the attack restriction. Neither line is modeled as defeated merely because its resources are exposed.
- Three missing field lists remain 23/25/28. No full-field win-rate inference is justified.

## Restricted causal setup tests
The policy is a two-own-turn setup proxy, not gameplay. It deals physical opening hands/Prizes, pays search costs, exposes deck membership only through searches, tracks hand/discard/attachment zones, uses deterministic decision rules, and conserves cards. No opponent damage, prize-taking, hand disruption, KO-triggered Raihan/Fezandipiti, or complete attack/retreat dynamics. Locks and energy loss are stylized scenarios. Results below are opportunity counts only; not matchup probabilities.

### First comparison
[Raw results](agent1-apex-lockdown-proxy-first-results.json) — 24,000 trials.

| Profile / policy | Start | Scenario | Apex ready | Wipe + lock | N |
|---|---|---|---:|---:|---:|
| wide | first | clean | 961 | 400 | 2000 |
| wide | first | t2-item | 709 | 0 | 2000 |
| wide | first | rulebox | 465 | 88 | 2000 |
| wide | second | clean | 1236 | 597 | 2000 |
| wide | second | t2-item | 972 | 0 | 2000 |
| wide | second | rulebox | 798 | 198 | 2000 |
| source12 | first | clean | 761 | 109 | 2000 |
| source12 | first | t2-item | 460 | 0 | 2000 |
| source12 | first | rulebox | 197 | 6 | 2000 |
| source12 | second | clean | 1080 | 232 | 2000 |
| source12 | second | t2-item | 731 | 0 | 2000 |
| source12 | second | rulebox | 404 | 19 | 2000 |

### Multi-slot screen
[Raw results](agent1-apex-lockdown-engine-screen.json) — 46,200 trials.

| Profile / policy | Start | Scenario | Apex ready | Wipe + lock | N |
|---|---|---|---:|---:|---:|
| wide | first | clean | 313 | 127 | 700 |
| wide | first | rulebox | 180 | 46 | 700 |
| wide | first | t2-item | 223 | 0 | 700 |
| wide | second | clean | 436 | 194 | 700 |
| wide | second | rulebox | 306 | 65 | 700 |
| wide | second | t2-item | 316 | 0 | 700 |
| arven-crobat | first | clean | 329 | 158 | 700 |
| arven-crobat | first | rulebox | 192 | 61 | 700 |
| arven-crobat | first | t2-item | 239 | 0 | 700 |
| arven-crobat | second | clean | 464 | 246 | 700 |
| arven-crobat | second | rulebox | 304 | 111 | 700 |
| arven-crobat | second | t2-item | 363 | 0 | 700 |
| arven-lillie | first | clean | 338 | 155 | 700 |
| arven-lillie | first | rulebox | 204 | 61 | 700 |
| arven-lillie | first | t2-item | 247 | 0 | 700 |
| arven-lillie | second | clean | 482 | 263 | 700 |
| arven-lillie | second | rulebox | 329 | 120 | 700 |
| arven-lillie | second | t2-item | 382 | 0 | 700 |
| tenacity-arven | first | clean | 334 | 153 | 700 |
| tenacity-arven | first | rulebox | 197 | 61 | 700 |
| tenacity-arven | first | t2-item | 241 | 0 | 700 |
| tenacity-arven | second | clean | 468 | 246 | 700 |
| tenacity-arven | second | rulebox | 314 | 109 | 700 |
| tenacity-arven | second | t2-item | 363 | 0 | 700 |
| noivern-to-arven | first | clean | 366 | 134 | 700 |
| noivern-to-arven | first | rulebox | 200 | 37 | 700 |
| noivern-to-arven | first | t2-item | 269 | 0 | 700 |
| noivern-to-arven | second | clean | 459 | 209 | 700 |
| noivern-to-arven | second | rulebox | 295 | 71 | 700 |
| noivern-to-arven | second | t2-item | 354 | 0 | 700 |
| elixir-ramp | first | clean | 321 | 111 | 700 |
| elixir-ramp | first | rulebox | 161 | 29 | 700 |
| elixir-ramp | first | t2-item | 224 | 0 | 700 |
| elixir-ramp | second | clean | 431 | 163 | 700 |
| elixir-ramp | second | rulebox | 256 | 47 | 700 |
| elixir-ramp | second | t2-item | 341 | 0 | 700 |
| elixir-ramp2 | first | clean | 317 | 127 | 700 |
| elixir-ramp2 | first | rulebox | 165 | 28 | 700 |
| elixir-ramp2 | first | t2-item | 228 | 0 | 700 |
| elixir-ramp2 | second | clean | 416 | 191 | 700 |
| elixir-ramp2 | second | rulebox | 258 | 50 | 700 |
| elixir-ramp2 | second | t2-item | 319 | 0 | 700 |
| loto-tenacity | first | clean | 339 | 152 | 700 |
| loto-tenacity | first | rulebox | 174 | 35 | 700 |
| loto-tenacity | first | t2-item | 248 | 0 | 700 |
| loto-tenacity | second | clean | 434 | 212 | 700 |
| loto-tenacity | second | rulebox | 282 | 76 | 700 |
| loto-tenacity | second | t2-item | 328 | 0 | 700 |
| tag-ggend | first | clean | 325 | 95 | 700 |
| tag-ggend | first | rulebox | 180 | 35 | 700 |
| tag-ggend | first | t2-item | 243 | 0 | 700 |
| tag-ggend | second | clean | 443 | 166 | 700 |
| tag-ggend | second | rulebox | 315 | 58 | 700 |
| tag-ggend | second | t2-item | 363 | 0 | 700 |
| heavy-arven | first | clean | 336 | 155 | 700 |
| heavy-arven | first | rulebox | 196 | 62 | 700 |
| heavy-arven | first | t2-item | 245 | 0 | 700 |
| heavy-arven | second | clean | 472 | 249 | 700 |
| heavy-arven | second | rulebox | 308 | 111 | 700 |
| heavy-arven | second | t2-item | 368 | 0 | 700 |
| compressor-arven | first | clean | 360 | 166 | 700 |
| compressor-arven | first | rulebox | 204 | 60 | 700 |
| compressor-arven | first | t2-item | 258 | 0 | 700 |
| compressor-arven | second | clean | 472 | 251 | 700 |
| compressor-arven | second | rulebox | 318 | 109 | 700 |
| compressor-arven | second | t2-item | 356 | 0 | 700 |

### Sequencing screen
[Raw results](agent1-apex-lockdown-policy-screen.json) — 32,000 trials.

| Profile / policy | Start | Scenario | Apex ready | Wipe + lock | N |
|---|---|---|---:|---:|---:|
| wide/greedy | first | clean | 454 | 168 | 1000 |
| wide/greedy | first | rulebox | 226 | 43 | 1000 |
| wide/greedy | first | t2-item | 335 | 0 | 1000 |
| wide/greedy | first | lose-energy | 40 | 12 | 1000 |
| wide/greedy | second | clean | 622 | 283 | 1000 |
| wide/greedy | second | rulebox | 411 | 98 | 1000 |
| wide/greedy | second | t2-item | 503 | 0 | 1000 |
| wide/greedy | second | lose-energy | 283 | 129 | 1000 |
| wide/joint | first | clean | 490 | 192 | 1000 |
| wide/joint | first | rulebox | 259 | 58 | 1000 |
| wide/joint | first | t2-item | 375 | 0 | 1000 |
| wide/joint | first | lose-energy | 40 | 12 | 1000 |
| wide/joint | second | clean | 641 | 293 | 1000 |
| wide/joint | second | rulebox | 429 | 104 | 1000 |
| wide/joint | second | t2-item | 530 | 0 | 1000 |
| wide/joint | second | lose-energy | 285 | 126 | 1000 |
| source12/greedy | first | clean | 388 | 38 | 1000 |
| source12/greedy | first | rulebox | 84 | 1 | 1000 |
| source12/greedy | first | t2-item | 222 | 0 | 1000 |
| source12/greedy | first | lose-energy | 35 | 0 | 1000 |
| source12/greedy | second | clean | 527 | 99 | 1000 |
| source12/greedy | second | rulebox | 185 | 4 | 1000 |
| source12/greedy | second | t2-item | 343 | 0 | 1000 |
| source12/greedy | second | lose-energy | 231 | 42 | 1000 |
| source12/joint | first | clean | 391 | 38 | 1000 |
| source12/joint | first | rulebox | 84 | 1 | 1000 |
| source12/joint | first | t2-item | 223 | 0 | 1000 |
| source12/joint | first | lose-energy | 35 | 0 | 1000 |
| source12/joint | second | clean | 528 | 99 | 1000 |
| source12/joint | second | rulebox | 187 | 4 | 1000 |
| source12/joint | second | t2-item | 344 | 0 | 1000 |
| source12/joint | second | lose-energy | 232 | 42 | 1000 |

## Decision
Retain the print-locked wide proposal as an unqualified structural challenger. Do not nominate a proxy-selected variant or claim superiority on full games. The required next step is actual symmetric policy competence and legal native game evidence after owner approval. The candidate and proxy have not modified the frozen worker or dispatched live fixtures.


## New falsifying field counterplay screen (28 November 2026)

[Executable original-29 source census and adversarial action forks](agent1-apex-lock-counterplay-screen-20261128.md) uses the 29 unchanged original Aichi printed 60s and identifies seven all-Special-Energy ranks (4/5/6/7/17/24/29), AOR Item-lock obstacles at 2/15, and the exact four printed Garbotoxin Tool-restart ranks 8/11/16/22 where Chaos Wheel and Dominating Echo materially differ. Three all-Special Iron Thorns lists (6/24/29) have neither named Ranger nor Electrode-GX, but that does **not** prove an inevitable lock. Printed 230HP Iron Thorns also creates a 2-hit Echo versus 3-hit Chaos damage frontier absent modifiers/recovery. This improves which **actual counterplay states to test** and what would falsify the concept, not its measured game strength. Source screen plus six V8 stand-in cases passed; Node/native games remain unexecuted.
