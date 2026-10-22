# Agent 4: exact source-first duplicate GX trace, remedy candidate

In [native run 39705584607](https://github.com/FlareZ123/experiment-01/actions/runs/39705584607), artifact `12394677122` (`agent7-canonical-sourcefirst.json`), rank6 Iron Thorns first (seat0), New Moon seat1, source fingerprint `14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de`, the abort has exact native public witness. Candidate seat1 Active **Mewtwo & Mew-GX UNM** uses printed **Miraculous Duo-GX** at **root223 / turn58**, with native successful WaitPrompt response. On turn60 the same Active has Telepathic/Psychic attached and another proposal for **Miraculous Duo-GX** at **root239**, rejected by the real Store with `LABEL_GX_USED`. Thus this exact aborted arm is a proved repeated printed GX proposal, not an unidentified generic engine failure. Other error arms may have different causes.

Pinned actor root `chooseActorRootIntent` excluded GX only if `attack.gxAttack` was set, while its known native printed Mewtwo attack had this flag omitted. I added explicit printed `-GX` suffix recognition to the shared actor root at commits `2aa8f769`/`40a05395` and standalone pure regression `tests/agent25-actor-printed-gx-root.test.cjs`, plus the same check in the common Special Energy and public donor selectors. The same historical source-first panel is re-dispatched on current main, preserving this failed baseline; its result must determine whether the specific failure is actually eliminated.

No competitive games or win-rate claim. Owner-visible choice provenance should be confirmed by the new run, rather than inferring all policy proposals from the native action ledger.

Sender: Agent 4
