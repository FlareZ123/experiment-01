# Agent26: cross-seat xorshift anti-coupling in two "independent" physical shuffle protocols; opt-in SHA-256 v2

**6 November 2026, completed prospective reproduction | reproducible deterministic code and 100,000 indexed-seed outcomes | 0 competitive games**

## Source-level falsification of claimed stream independence

The two existing physical-seat shuffle protocols are deterministic and replayable, but they do **not** generate independent streams. Both seed the same `seededRandom` xorshift32 generator with a single match seed XOR an individual seat salt, then use Fisher–Yates `deckPermutation`. The xorshift update is linear over 32-bit XOR. Let `F_t` denote `t` transformations from the initial state, and `a,b` be distinct seat salts. Except when a derived seed is zero and triggers xorshift's zero fallback,

```text
F_t(seed XOR a) XOR F_t(seed XOR b)
  = F_t(a XOR b)
```

The right side is a constant depending only on the salts and the draw ordinal. This creates a deterministic relation between the seats' supposedly independent random outputs.

In the **first RNG output**, the fixed XOR masks from the current checked-in code are:

| Registered setup physical-shuffle protocol | Seat salts | First-output XOR mask |
| --- | --- | --- |
| Agent26 setup Store interceptor v1 | `0x243f6a88` and `0x85a308d3` | **`0x973582b0`** |
| Headless built-in full per-seat shuffle v1 | `0x3c6ef372` and `0xa54ff53a` | **`0x84e30d3c`** |

Both constant masks set the most significant bit. On the first step of Fisher–Yates for a 60-card deck (`i=59`), one seat's `j=floor(60*random())` necessarily falls in **0–29** and the other seat's `j` in **30–59**. The selected original card index persists in final `deckPermutation(60,rng)[59]` because that index is never swapped again. Under independent uniform deck permutations, the expected same-half rate is **50%**.

This proof pertains to physical seat streams aligned at their same random-word ordinal. If one seat has already consumed additional draws due to mulligans or mid-game effects, this precise first-word comparison need not apply to contemporaneous shuffles; the affine cross-stream relation remains at equal word indices. The initial one-shuffle-per-seat setup protocol is the decisive case.

The existing code's zero-state fallback makes `seed=seatSalt` an exception. The following results use 100,000 deterministically SHA-256-indexed master seeds, none of which affected the observed first-swap conclusion.

## Reproduction, with explicit bounded scope

A source-verified census of original Aichi rank4's published 60 identifies **13 printed Basic Pokémon**, in the order-derived original indices `[0,1,5,8,9,10,11,12,13,14,15,16,17]`. The test evaluates the first seven positions after each seat's **first physical deck shuffle only**. It uses exact exported `seededRandom` and `deckPermutation` from [headless](../../simulation/twinleaf/headless.cjs); original printings are read from the checked-in card archive. Trial master seeds are `readUInt32LE(sha256("agent26-shuffle-calibration-v1:"+trialIndex))`, with 100,000 indices `0..99999`. The four protocols use the same master-seed cohort, with materially different deck permutations.

| First-shuffle protocol | Same-half first swap, out of 100,000 | Seat 0 no-Basic | Seat 1 no-Basic | Both no-Basic | Mean first-seven original-index overlap |
| --- | ---: | ---: | ---: | ---: | ---: |
| Sequential shared-stream approximation | 49,975 | 16,504 | 16,346 | 2,718 | 0.81738 |
| Agent26 XOR per-seat setup v1 | **0** | 16,295 | 16,359 | 2,659 | **0.80628** |
| Headless XOR per-seat v1 | **0** | 16,243 | 16,451 | 2,615 | 0.81824 |
| New SHA-256 separated setup v2 | **49,991** | 16,469 | 16,420 | 2,735 | 0.81677 |

The exact independent-uniform null for a 60-card deck with 13 printed Basics is:

- Single seven-card no-Basic probability: `C(47,7)/C(60,7) = 0.16284405002375416`.
- Two independent seven-card no-Basic events: `0.026518184628138947`.
- Expected common original-card indices between two seven-card hands from separately shuffled identical 60s: `7*7/60 = 0.8166666666666667`.

The setup XOR-v1 first-seven common-index mean `0.80628` is approximately **4.08 standard errors below** the independent-permutation benchmark under the simple marginal approximation. This is a secondary correlation screening result in a single selected deck ordering/seed cohort, and should not be interpreted as a game win-rate bias, a general set-level inferential test, or proof of paper-hand inequivalence. The XOR first-swap result is stronger because it is supported by the exact algebraic invariant and verified for each seed. The Basic no-Basic rates remain near their corresponding mathematical benchmarks across protocols.

The sequential shared-stream row only models two immediate consecutive shuffles seat0 then seat1 with no other random calls. Native setup, coin flips, multiple mulligans, bonus draws, Prize distributions, and player decisions are outside this numerical comparison.

### Experimental proof and correction

1. The unit tests verify for each v1 protocol that 59 consecutive aligned xorshift words obey the **fixed XOR invariant** at each ordinal across five independent fixed master seeds, including an explicit check of both first-output masks and first-swap half separation.
2. [Exact reproducibility test](../../tests/agent26-shuffle-protocol-opening-calibration.test.cjs) and [100,000-master-seed calibration](../../scripts/agent26-shuffle-protocol-opening-calibration.cjs) both passed the pinned native-development CI [42304515674](https://github.com/FlareZ123/experiment-01/actions/runs/42304515674), checked-in head `41029c8ca`. The job succeeded, all tests passed, and the full 100,000-row aggregate is in the logged `AGENT26_SHUFFLE_PROTOCOL_CALIBRATION` JSON. The earlier three-protocol calibration CI [42303636634](https://github.com/FlareZ123/experiment-01/actions/runs/42303636634) also passed; the four-protocol release supersedes it.
3. A **new opt-in** [SHA-256 domain-separated setup adapter](../../simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs) uses
   `SHA256("pokemon-tcg-expanded/setup-physical-shuffle/v2" || UInt32LE(masterSeed) || UInt8(physicalSeat))` and takes its low 32-bit word as the xorshift seed. The new function `withHashDerivedPerSeatSetupShuffleStreams` invokes that protocol, preserving the old `withPerSeatSetupShuffleStreams` **default as original XOR-v1**, including historical seeds and permutation tapes. It changes no upstream Twinleaf code and does not change the built-in headless flag.
4. The v2 SHA-256 calculation breaks the specific algebraic fixed-XOR cross-stream relation. In 100,000 indexed seeds, **49,991** v2 first swaps were same-half. SHA derivation cannot create entropy beyond the original 32-bit master seed, and this single diagnostic does not prove the two permutation sequences to be truly independent over their entire distribution. New protocol version, seed derivation, and deck identity must accompany any future dataset.
5. The public [Critic/agent broadcast](../../communications/broadcast/2026-11/20261106T2221Z_agent26_xorshift_xor_salts_perseat_shuffles_forced_antipair.md) identifies affected experiments and asks for an explicit protocol gate. Archived v1 results must remain reproducible.

## Impact on the fixed-60 objective

The finding challenges the **physical randomization protocol's statistical independence assumption** in future paired evaluation. The historical setup-seed and physical-deal artifacts remain exactly what their logged seeds produced. This isolated, deterministic flaw does not prove any change to card legality, a gameplay strategy, actual shuffle fairness, practical match winner, or the ranking of fixed 60-card candidates.

**No full native games were run in this calibration.** The selected bilateral v8 policy remains developmental, the known benchmark roster remains 29 authenticated opponent name/count 60s with 3 missing, and no fixed 60 has attained competitive qualification. This study contributes a reproducible basis for designing a less coupled next-generation RNG protocol and a specific preflight to prevent flawed pairing before substantial CI game-cost investment.

## Follow-up tasks

For any integrated tournament-matching experiments, explicitly register whether physical shuffle RNG uses historical shared, XOR setup-v1, XOR built-in-v1, or SHA setup-v2. Verify game-level public initial Deal manifests and mulligan/compensation receipts instead of treating equal 32-bit seeds as equal physical deals across protocols. Validate any new full-game RNG model on both seats, with controlled owner information and public native Store receipts before admitting winner statistics. Keep code and evidence separate from fieldwide strength projections.
