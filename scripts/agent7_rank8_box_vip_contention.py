"""Rank-8 original Secret Box / Battle VIP Pass K0 contention experiment.

Same deterministic 200,000 physically sampled opening/prize/draw allocations
as agent44-box-firstturn-handmodel.py. The alternative uses exactly one
unprized Basic from the owner's deck via a hypothetical earlier first-turn
Battle VIP Pass, then re-checks the existing Box K0 and K1 predicates.
It is an opportunity comparison, not a bot simulation or a win-rate test.
"""

from collections import Counter
import importlib.util
import json
from pathlib import Path
import random


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "simulation" / "analytical" / "agent44-box-firstturn-handmodel.py"
MODEL_BLOB_SHA = "81e9973a9b34d53c25cdff39b7686af5431d40bc"
PLANNER_BLOB_SHA = "7bb693b8d7962a8d1802a5a4cf3480e96d458646"


def load_model():
    spec = importlib.util.spec_from_file_location("agent44_box_handmodel", MODEL_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def prefer_unprized_basic(model, live_deck, in_play):
    """Choose one legitimate hypothetical VIP Bench target, if any."""
    if not in_play["Trubbish"] and live_deck["Trubbish"]:
        return "Trubbish"
    return next((name for name in model.ACTIVE_PRIORITY
                 if name in model.BASICS and live_deck[name]), None)


# Preserve Agent44's originally prioritized payment order, while comparing
# identical physical payments across hypothetical first-turn action orders.
BOX_PAYMENT_PRIORITY = (
    "Battle VIP Pass", "Dark Patch", "Quick Ball", "VS Seeker",
    "Mysterious Treasure", "Iono", "Carmine", "Ultra Ball"
)


def payable_after_vip(hand, in_play):
    """Return an explicit three-card Box payment after a prior VIP play.

    This is a narrowly scoped physical witness under Agent44's source
    K0 reserves, rather than an asserted legal native Store action.
    """
    available = Counter(hand)
    assert available["Secret Box"] >= 1
    assert available["Battle VIP Pass"] == 0
    available["Secret Box"] -= 1
    searcher_payment = 0
    if not in_play["Trubbish"]:
        if available["Trubbish"]:
            available["Trubbish"] -= 1
        elif available["Quick Ball"]:
            available["Quick Ball"] -= 1
            searcher_payment = 1
        elif available["Ultra Ball"]:
            available["Ultra Ball"] -= 1
            searcher_payment = 2
        else:
            return None
    if available["Float Stone"]:
        available["Float Stone"] -= 1
    elif available["Muscle Band"]:
        available["Muscle Band"] -= 1
    physical = sorted((name for name, n in available.items()
                       for _ in range(n) if n > 0),
                      key=lambda name: (BOX_PAYMENT_PRIORITY.index(name)
                                        if name in BOX_PAYMENT_PRIORITY
                                        else len(BOX_PAYMENT_PRIORITY)))
    if len(physical) < 3 + searcher_payment:
        return None
    return physical[:3]


def prove_commuted_box_first(hand, deck, vip_basic, payment):
    """The exact same up-front Box payment remains in hand before VIP.

    Box searches Item/Tool, while the VIP subsequently searches a Basic.
    This proof concerns physical card-zone cardinality and the two search
    categories, assuming no intervening opponent action. Actual native
    prompt resolution and future draws are separately tested.
    """
    before = Counter(hand)
    chosen = Counter(payment)
    assert len(payment) == 3
    assert not chosen["Secret Box"] and not chosen["Battle VIP Pass"]
    assert not chosen - before, "A payment card is absent before VIP"
    assert before["Secret Box"] and before["Battle VIP Pass"]
    assert deck[vip_basic] > 0, "The same Basic must remain searchable"
    post_box = before - chosen
    assert post_box["Secret Box"] >= 1
    assert post_box["Battle VIP Pass"] >= 1
    return True


def measure(trials=200_000, seed=44_110_207):
    model = load_model()
    deck = [name for name, count in model.COUNTS.items()
            for _ in range(count)]
    assert len(deck) == 60
    rng = random.Random(seed)
    results = {
        "bench-none": Counter(),
        "bench-all-other-basics": Counter(),
    }
    for _ in range(trials):
        exposed = rng.sample(deck, 14)
        opener = exposed[:7]
        if not any(name in model.BASICS for name in opener):
            continue
        active = next(name for name in model.ACTIVE_PRIORITY if name in opener)
        other = opener.copy()
        other.remove(active)
        live = Counter(deck) - Counter(exposed)  # 7 hand, 6 prizes, 1 draw excluded

        for strategy, counts in results.items():
            bench = ([name for name in other if name in model.BASICS][:5]
                     if strategy == "bench-all-other-basics" else [])
            hand = other.copy()
            for pokemon in bench:
                hand.remove(pokemon)
            hand.append(exposed[13])
            in_play = Counter([active] + bench)
            counts["valid_opener"] += 1
            box_k0, box_k1 = model.condition(hand, in_play, live, flexible=True)
            if not box_k0:
                continue
            counts["box_k0"] += 1
            counts["box_k1"] += int(box_k1)
            if "Battle VIP Pass" not in hand:
                continue
            counts["box_k0_with_held_vip"] += 1
            counts["box_k1_with_held_vip"] += int(box_k1)
            # Baseline source setup mode determines whether one VIP Basic
            # actually creates an extra Bench Pokemon beyond Box-first.
            mode = ("already-in-play" if in_play["Trubbish"] else
                    "held-basic" if "Trubbish" in hand else "held-searcher")
            counts["held_vip_k0_mode_" + mode] += 1
            # At the referenced native planner revision, VIP is the first
            # unreserved physical payment by DISCARD_ORDER index 0.
            # The planner reserves Box/Trubbish/Tool/searcher, never VIP.
            counts["planner_discards_vip"] += 1
            if len(bench) >= 5:
                continue
            vip_target = prefer_unprized_basic(model, live, in_play)
            if vip_target is None:
                continue
            counts["vip_root_basic_available"] += 1
            after_hand = hand.copy()
            after_hand.remove("Battle VIP Pass")
            # Alternative interleaving: retain the VIP in hand until after
            # Box resolves, so Box's upfront three-discard cost cannot use it.
            # Test affordability using the same Box predicate and original
            # pre-VIP Bench, without claiming this is a native policy.
            keep_vip_box_k0, keep_vip_box_k1 = model.condition(
                after_hand, in_play, live, flexible=True
            )
            counts["box_first_preserve_vip_k0"] += int(keep_vip_box_k0)
            counts["box_first_preserve_vip_k1"] += int(keep_vip_box_k1)
            after_in_play = in_play + Counter([vip_target])
            after_live = live - Counter([vip_target])
            next_k0, next_k1 = model.condition(
                after_hand, after_in_play, after_live, flexible=True
            )
            if next_k0:
                counts["vip_first_then_box_k0"] += 1
            if next_k1:
                counts["vip_first_then_box_k1"] += 1
                payment = payable_after_vip(after_hand, after_in_play)
                assert payment is not None, (
                    "Agent44 K1 payer had no explicit three-discard witness"
                )
                assert prove_commuted_box_first(
                    hand, live, vip_target, payment
                )
                counts["box_first_postvip_same_payment_k1"] += 1
                if not keep_vip_box_k1:
                    counts["prior_boxfirst_planner_reservation_artifact"] += 1
                if "Trubbish" in payment:
                    counts["commuted_boxfirst_discarded_held_trubbish"] += 1
                if ("Quick Ball" in payment or
                        "Ultra Ball" in payment):
                    counts["commuted_boxfirst_discarded_basic_searcher"] += 1
                # VIP may merely replace the Trubbish normally fetched or
                # benched by Box-first, without adding another Basic to play.
                extra = mode == "already-in-play" or vip_target != "Trubbish"
                if extra:
                    counts["vip_first_k1_extra_basic"] += 1
                else:
                    counts["vip_first_k1_trubbish_substitution"] += 1
            if box_k1 and next_k1:
                counts["both_box_k1_and_vip_first_box_k1"] += 1
            if keep_vip_box_k1 and next_k1:
                counts["vip_first_and_box_first_preserve_vip_k1"] += 1
            if next_k1 and not keep_vip_box_k1:
                counts["vip_first_only_vs_box_first_preserve_vip_k1"] += 1

    output = {}
    for strategy, counts in results.items():
        n = counts["valid_opener"]
        b = counts["box_k0"]
        v = counts["box_k0_with_held_vip"]
        output[strategy] = {
            **{name: counts[name] for name in [
                "valid_opener", "box_k0", "box_k1",
                "box_k0_with_held_vip", "box_k1_with_held_vip",
                "planner_discards_vip", "vip_root_basic_available",
                "vip_first_then_box_k0", "vip_first_then_box_k1",
                "both_box_k1_and_vip_first_box_k1",
                "held_vip_k0_mode_already-in-play",
                "held_vip_k0_mode_held-basic",
                "held_vip_k0_mode_held-searcher",
                "vip_first_k1_extra_basic",
                "vip_first_k1_trubbish_substitution",
                "box_first_preserve_vip_k0",
                "box_first_preserve_vip_k1",
                "vip_first_and_box_first_preserve_vip_k1",
                "vip_first_only_vs_box_first_preserve_vip_k1",
                "box_first_postvip_same_payment_k1",
                "prior_boxfirst_planner_reservation_artifact",
                "commuted_boxfirst_discarded_held_trubbish",
                "commuted_boxfirst_discarded_basic_searcher",
            ]},
            "box_k0_fraction_of_valid_openers": b / n,
            "vip_overlap_fraction_of_box_k0": v / b,
            "both_k1_fraction_of_box_k0": (
                counts["both_box_k1_and_vip_first_box_k1"] / b
            ),
        }
    return {
        "schema": "agent7-rank8-box-vip-firstturn-alternative-v4-commuted-box-first",
        "source_original_rank": 8,
        "source_printed_60_sha256": model.SOURCE_SHA256,
        "source_handmodel_git_blob": MODEL_BLOB_SHA,
        "native_k0_planner_git_blob": PLANNER_BLOB_SHA,
        "seed": seed,
        "uniform_fourteen_card_samples": trials,
        "first_seven_basic_valid_only": True,
        "box_vip_discard_priority": "VIP first among unreserved cards",
        "vip_first_counterfactual": (
            "One original held Battle VIP Pass used for one currently "
            "unprized deck Basic and one open Bench slot before Box; "
            "then recompute original flexible K0 and unprized K1. "
            "No extra draws, lock changes, opponent decisions or game claims."
        ),
        "bench_strategies": output,
        "competitive_qualified_games": 0,
    }


if __name__ == "__main__":
    print(json.dumps(measure(), indent=2))
