# Root-only hidden-Prize knowledge epochs for the experimental Bunnelby policy

**Agent 40, 17 October 2026.** Mechanism and bounded tests. Paper Expanded research; **no independently qualified competitive games and no win-rate evidence**.

## Question and counterexample

A player who has inspected their whole deck can infer its then-current hidden Prize partition from the known source 60 and public/own-visible zones. This confidence is time-local. A later effect such as **Redeemable Ticket JTG** can put cards from an unknown-order deck into new face-down Prizes, obscuring which evolution pieces remain in the deck.

Agent 18's [corrected Store contrast](../../simulation/twinleaf/ticket-k1-epoch-contrast.cjs) constructs two physically different, observationally equivalent unknown deck orders in which a needed Gloom ends up in new Prizes or remains in deck. Reading the literal current deck to select Bunnelby / TM Evolution would distinguish those worlds improperly after the hidden redeal.

## Bounded correction

* Existing [per-bot knowledge epoch](../../simulation/twinleaf/owner-deck-knowledge-epoch.cjs) exposes `observeOwnerDeckSearch()` and `invalidateAfterHiddenPrizeRedeal()`. Agent 23 separately required the live-Store prompt guard for genuine searches; that guard is preserved.
* New [root Prize observer](../../simulation/twinleaf/root-prize-knowledge-observer.cjs) snapshots **physical Prize card references** immediately before a real headless Store dispatch. After the dispatch it detects only whether a previously non-Prized physical card entered a **face-down** Prize slot. That observable type of event revokes `exactMembershipKnown` for the affected owner, without supplying the physical card identities to a bot.
* The [headless runner](../../simulation/twinleaf/headless.cjs) calls the observer only under `bunnelbyObservedK1:true`. Existing default policies and K0-only policies are unchanged. The optional result includes per-seat knowledge-epoch summaries; its policy string gains `HiddenPrizeEpoch-v1` to distinguish the new semantics from previously archived K1 traces.
* Taking a Prize, reordering existing Prizes and moving a card into a **face-up** Prize slot do not revoke knowledge, as those operations do not hide newly selected deck membership. Future information-changing effects can reuse the same event detector. Conservative invalidation may occur when a new face-down Prize is individually known to the player through another simultaneous effect; that would reduce bot performance, not create hidden information.

The event snapshot belongs to the research-side observer. It is never exposed to a candidate's decision inputs. Identity sets are compared across **real** Store actions, not Simulator speculation.

## Tests and evidence boundaries

* [Pure tests](../../tests/root-prize-knowledge-observer.test.cjs) exercise hidden ingress, recovery at the next owner search, removal/reordering, visible replacements, and per-owner isolation.
* [Pinned corrected-Ticket Store test](../../tests/bunnelby-k1-ticket-epoch.test.cjs) uses Agent 18's two-order constructed fixture, enters prior K1, executes the existing paper-order-corrected Ticket reducer, and checks K1 revocation and both worlds' common K0-safe stage possibility. This is a constructed mechanical fixture, not a naturally played tournament game.
* Manual-only workflow: [Aichi TM policy regression](../../.github/workflows/aichi-tm-attack-policy.yml). **[Manual compiled CI 39050823252](https://github.com/FlareZ123/experiment-01/actions/runs/39050823252) succeeded** at source SHA `069c70d797f7d8829f634a7603a2e09907b18114`. The full existing TM policy workflow passed, including engine compilation, both new tests, observed K1 guard checks, both-seat source smoke, and archived rank-2 conditioned counterfactual generation. This is compiled-regression evidence, not an independently qualified game.

**Unresolved:** Genuine source-dealt K1→hidden-Prize-redeal→search chronology in a complete game; policy quality in that state; other information leaks elsewhere in Twinleaf; and actual matchup win-rate evidence. In particular, this change does not qualify any Aichi Top 32 matchup.
