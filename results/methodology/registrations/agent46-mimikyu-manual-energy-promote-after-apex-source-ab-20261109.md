# Agent46 registered source Mimikyu manual-Energy and post-Apex Active promotion

**Registered:** 9 November 2026 at 09:05 UTC, before implementation.

**Decision problem:** Once Mimikyu is searched and placed on Bench, it must hold two Energy including Psychic, and it must become Active during the turn immediately following a declared opposing Apex Dragon to use Copycat. The original rank1 Shadow Rider Calyrex 60 contains eleven Psychic Energy, Shadow Rider VMAX Underworld Door and a one-of Mimikyu. The prior targeted Underworld study has produced two actual natural Copycat attacks in each arm, so an additional owner-only manual-attachment and response-promotion policy is a falsifiable mechanism.

Freeze original rank1/rank10 source 60s; unchanged both-seat native correction flags; 6 fresh independently randomly generated seeds `[2059253117,1055096635,538692660,589307622,1330764334,1965056889]`; candidate both physical seats, a baseline and treatment per seed/seat, **24 attempts, 12 source-matched pairs, `maxActions=180`**.

Control is the earlier Fog + Treasure + Underworld-target setup policy. Treatment retains exactly that policy and adds:
- Owner-only manual Basic Psychic Energy attachment onto Benched Mimikyu if opponent Regidrago is face-up, Mimikyu's physical attached Energy is fewer than two, owner still has its manual Energy attachment available, and owner holds a real basic Psychic Energy. Submit `PlayCardAction` through native Store, never direct movement.
- Owner-only choice of a physically attached, two-Energy Mimikyu to promote on a **native `CHOOSE_NEW_ACTIVE_POKEMON` prompt** if the public native opponent last attack is Apex Dragon. The physical Mimikyu recipient must be in `owner.bench`, pass the native `ChoosePokemonPrompt.validate`, and be valid for promotion.
- Owner-only legal retreat to funded Mimikyu following opposing Apex if there is no forced-promotion prompt. Validate action through pinned native action evaluator. If native action is not payable, leave baseline decision unchanged.
- No artificial Mimikyu, Energy, discard Dragon, attacker, Action acceptance or search, no hidden enemy-state inspection. Preserve all physical startup matches, capped attempts, native errors, actual attack traces, affected Prize counts and intervention callbacks. A policy callback is a proposal, not an accepted native card play.

Primary outcome: actual Mimikyu Copycat attacks following actual opposing Apex in the returned native attack trace. Record baseline/treatment per seed and status; intervention may harm normal SRC game plan, and all negative outcomes count. This is a bounded developmental source-bot experiment, not a competitive paper win-rate or justification for 99.5%. The existing pinned native Underworld Bench target type issue must be acknowledged separately; this frozen A/B uses identical existing corrections in both arms.
