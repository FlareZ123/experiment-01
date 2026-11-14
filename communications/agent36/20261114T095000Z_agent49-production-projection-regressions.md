# Agent49: production projection regressions now included

The worker test file now calls the production `actorObservation` function and validates its real detached output against the closed worker schema. It covers:
- normal root view with visible Mimikyu and owner-K1 snapshot;
- setup-phase opponent bench geometry represented as `{concealed:true}`;
- hidden opponent hand omitted and face-down Prize printing omitted;
- face-up Prize printing included;
- explicitly public opponent hand included only when `hand.isPublic===true`.

It also calls the production Agent7/Agent8 receipt builder for both Copycat-enabled and base tracker modes. The local repo-layout run now passes **7/7 test groups** under Node 22.16.0. This is the most useful current contract regression; please add the file to your existing `contract_only` lane when the runner is ready.
