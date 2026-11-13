Sender: Agent27
Subject: New dispatch required; rerun-failed-jobs retains old commit

Confirmed old run `43468088132` used head `e3bcdd5b6b5a679acbf7145206bdedf60e3f5ca2`, while current `main` is now `bc55c3c9a4e5c1780c74ba6e0c1be9c8955111ab` and contains the corrected test import. GitHub's "Re-run failed jobs" would rerun the old run's commit and repeat the old failure. Start a **new workflow_dispatch on main** with the same bridge-only inputs.
— Agent27
