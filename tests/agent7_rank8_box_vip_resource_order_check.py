"""Guard the exact preregistered rank8 Box/VIP sample's alternative accounting.

Use after scripts/agent7_rank8_box_vip_contention.py wrote JSON. This
checker does not resample, access any owner's hidden cards, or claim games.
"""
import json
from pathlib import Path
import sys


def verify(path):
    report = json.loads(Path(path).read_text(encoding="utf-8"))
    assert report["competitive_qualified_games"] == 0
    assert report["uniform_fourteen_card_samples"] == 200_000
    cases = (
        ("bench-none", 148_137, 10_620, 2_117,
         (651, 393, 1_073), 1_799, (632, 1_167), 1_369, 430),
        ("bench-all-other-basics", 148_137, 9_620, 1_957,
         (983, 61, 913), 1_619, (826, 793), 1_184, 435),
    )
    for (strategy, valid, box, held, modes, vip_k1, board,
         protected_box_k1, vip_only) in cases:
        row = report["bench_strategies"][strategy]
        assert (
            row["valid_opener"], row["box_k0"],
            row["box_k0_with_held_vip"]
        ) == (valid, box, held), (strategy, row)
        got_modes = tuple(row["held_vip_k0_mode_" + key] for key in
                          ("already-in-play", "held-basic", "held-searcher"))
        assert got_modes == modes, (strategy, got_modes)
        assert sum(modes) == held
        got_board = (
            row["vip_first_k1_extra_basic"],
            row["vip_first_k1_trubbish_substitution"],
        )
        assert got_board == board, (strategy, got_board)
        assert sum(board) == vip_k1
        assert row["vip_first_then_box_k1"] == vip_k1
        assert row["box_first_preserve_vip_k1"] == protected_box_k1
        assert row["vip_first_and_box_first_preserve_vip_k1"] == (
            protected_box_k1
        )
        assert row["vip_first_only_vs_box_first_preserve_vip_k1"] == (
            vip_only
        )
        assert protected_box_k1 + vip_only == vip_k1
        assert row["box_first_postvip_same_payment_k1"] == vip_k1, (
            strategy, "failed symmetric upfront-payment witness"
        )
        assert row["prior_boxfirst_planner_reservation_artifact"] == vip_only
        for name in (
            "commuted_boxfirst_discarded_held_trubbish",
            "commuted_boxfirst_discarded_basic_searcher",
            "commuted_boxfirst_discards_spare_vip",
        ):
            assert 0 <= row[name] <= vip_k1, (strategy, name, row[name])
    return {"status": "EXACT_RANK8_BOX_VIP_ACCOUNTING_PASSED",
            "source": "fixed seed 44110207; 200000 attempts",
            "qualifiedGames": 0}


if __name__ == "__main__":
    print(json.dumps(verify(sys.argv[1]), indent=2))
