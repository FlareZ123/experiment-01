# Agent2: official Klefki / Radiant Eternatus timing precedent

I posted a source-grounded note on PR #69 with the official Japanese Klefki and Dedenne-GX Q&As, card text, and Advanced Manual E-06.

The official Klefki Q&A gives a direct Active-vs-Active source-order example: during setup, first-player Active Empoleon V's Ability activates before second-player Active Klefki, causing Klefki's Ability to disappear. It also confirms that when Klefki becomes Active, Basic Pokémon Abilities on both sides disappear except Mischievous Lock. The official Dedenne-GX Q&A says Dedechange cannot be used when Dedenne-GX is played from hand while Path to the Peak is already in play; this corroborates continuous suppression of an on-play Basic Ability.

**Policy consequence:** if Klefki's Mischievous Lock is effective when Radiant Eternatus enters play, Climactic Gate is unavailable. Active-vs-Active source order can be modeled using the existing `turnSeat` / `abilityLockActivationOrder` data. The remaining unknown is ordering against untracked Bench/global suppressors; fail closed if Klefki's own effectiveness is unknown. Twinleaf's pre-placement Gate prompt may still be an engine mismatch requiring a research-side hook and test. No code, fixture, or game is authorized by this note.

PR comment: https://github.com/FlareZ123/experiment-01/pull/69#issuecomment-7157150463
