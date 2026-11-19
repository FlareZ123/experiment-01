#include <algorithm>
#include <array>
#include <cstdint>
#include <functional>
#include <iomanip>
#include <iostream>
#include <string>

using U128 = unsigned __int128;

static constexpr int N = 10;
static const std::array<int, N> C = {
    1, 2, 4, 4, 4, 1, 1, 10, 2, 31
};

// Category indices:
// 0 Enamorus V (1)
// 1 Stealthy Hood (2)
// 2 Shadow Rider Calyrex V (4)
// 3 Shadow Rider Calyrex VMAX (4)
// 4 Fog Crystal (4)
// 5 Arven (1)
// 6 Hisuian Heavy Ball (1)
// 7 other Basic Pokémon (10)
// 8 other Pokémon Tools: Float Stone + Forest Seal Stone (2)
// 9 all other cards (31)
//
// This is a hypothetical 60: Enamorus replaces one non-Item Trainer.
// The 31-card residual group includes 11 Psychic Energy and 20 other
// Trainers. The model preserves the candidate's 16 Item cards, so at most
// 15 unavailable cards (7 opening + 6 Prizes + 2 draws) cannot exhaust
// every Arven Item target.

U128 choose(int n, int k) {
    if (k < 0 || k > n) return 0;
    if (k > n - k) k = n - k;
    U128 result = 1;
    for (int i = 1; i <= k; ++i) {
        result = result * (n - k + i) / i;
    }
    return result;
}

std::string u128_string(U128 value) {
    if (value == 0) return "0";
    std::string out;
    while (value > 0) {
        out.push_back(char('0' + value % 10));
        value /= 10;
    }
    std::reverse(out.begin(), out.end());
    return out;
}

void generate_compositions(
    int index,
    int remaining,
    const std::array<int, N>& capacities,
    std::array<int, N>& current,
    const std::function<void(const std::array<int, N>&)>& callback
) {
    if (index == N - 1) {
        if (remaining >= 0 && remaining <= capacities[index]) {
            current[index] = remaining;
            callback(current);
        }
        return;
    }

    const int limit = std::min(remaining, capacities[index]);
    for (int quantity = 0; quantity <= limit; ++quantity) {
        current[index] = quantity;
        generate_compositions(
            index + 1, remaining - quantity, capacities, current, callback
        );
    }
}

struct Totals {
    U128 valid_openings = 0;
    U128 anchor_without_arven_dual = 0;
    U128 anchor_with_arven_dual = 0;
    U128 core = 0;
    U128 joint_without_arven_dual = 0;
    U128 joint_with_arven_dual = 0;
};

struct Outcomes {
    bool anchor_without_arven_dual;
    bool anchor_with_arven_dual;
    bool core;
    bool joint_without_arven_dual;
    bool joint_with_arven_dual;
};

bool valid_opening(const std::array<int, N>& hand) {
    // A Basic opening can be Enamorus, Shadow Rider V, or another Basic.
    return hand[0] + hand[2] + hand[7] > 0;
}

Outcomes evaluate(
    const std::array<int, N>& hand,
    const std::array<int, N>& prizes,
    const std::array<int, N>& draw1,
    const std::array<int, N>& draw2,
    bool going_second
) {
    if (!valid_opening(hand)) return {false, false, false, false, false};

    // Going first: no draw on own turn 1, so V must be in the opening 7.
    // Going second: one draw on own turn 1, so V may be in opening + draw1.
    const int v_by_turn1 = hand[2] + (going_second ? draw1[2] : 0);

    // VMAX must be available by the start of own turn 2.
    const int vmax_by_turn2 = hand[3] + draw1[3] + draw2[3];
    const bool core = v_by_turn1 > 0 && vmax_by_turn2 > 0;

    std::array<int, N> seen{};
    std::array<int, N> deck{};
    for (int i = 0; i < N; ++i) {
        seen[i] = hand[i] + draw1[i] + draw2[i];
        deck[i] = C[i] - hand[i] - prizes[i] - draw1[i] - draw2[i];
    }

    // Direct or one-card search routes that do not require a discard:
    // - Enamorus directly in hand;
    // - Fog Crystal if Enamorus remains in deck;
    // - Heavy Ball if Enamorus is Prized.
    const bool enamorus_without_arven =
        seen[0] > 0 ||
        (deck[0] > 0 && seen[4] > 0) ||
        (prizes[0] > 0 && seen[6] > 0);

    // Arven searches one Tool and one Item. It can fetch:
    // - Hood + Fog Crystal when Enamorus remains in deck; or
    // - Hood + Heavy Ball when Enamorus is Prized.
    // If Hood is already in hand, Float Stone / Forest Seal Stone can be
    // the Tool target. Their remaining-deck availability is tracked.
    const bool tool_remains = deck[1] + deck[8] > 0;
    const bool arven_can_fetch_enamorus =
        seen[5] > 0 &&
        tool_remains &&
        (
            (deck[0] > 0 && deck[4] > 0) ||
            (prizes[0] > 0 && deck[6] > 0)
        );

    const bool hood_accessible =
        seen[1] > 0 ||
        (seen[5] > 0 && deck[1] > 0);

    const bool anchor_without_arven_dual =
        enamorus_without_arven && hood_accessible;
    const bool anchor_with_arven_dual =
        (enamorus_without_arven || arven_can_fetch_enamorus) &&
        hood_accessible;

    return {
        anchor_without_arven_dual,
        anchor_with_arven_dual,
        core,
        anchor_without_arven_dual && core,
        anchor_with_arven_dual && core
    };
}

int main() {
    const U128 prize_ways = choose(53, 6);
    Totals first;
    Totals second;

    std::array<int, N> hand{};
    std::array<int, N> prizes{};
    std::array<int, N> draw1{};
    std::array<int, N> draw2{};

    generate_compositions(
        0, 7, C, hand,
        [&](const std::array<int, N>& opening) {
            if (!valid_opening(opening)) return;

            U128 hand_ways = 1;
            for (int i = 0; i < N; ++i) {
                hand_ways *= choose(C[i], opening[i]);
            }

            first.valid_openings += hand_ways;
            second.valid_openings += hand_ways;

            std::array<int, N> after_hand{};
            for (int i = 0; i < N; ++i) {
                after_hand[i] = C[i] - opening[i];
            }

            generate_compositions(
                0, 6, after_hand, prizes,
                [&](const std::array<int, N>& prize_cards) {
                    U128 prize_ways_for_state = 1;
                    std::array<int, N> after_prizes{};

                    for (int i = 0; i < N; ++i) {
                        prize_ways_for_state *=
                            choose(after_hand[i], prize_cards[i]);
                        after_prizes[i] = after_hand[i] - prize_cards[i];
                    }
                    if (prize_ways_for_state == 0) return;

                    // Going first: no own-turn-1 draw, then one own-turn-2 draw.
                    for (int i = 0; i < N; ++i) {
                        if (after_prizes[i] == 0) continue;

                        draw1.fill(0);
                        draw2.fill(0);
                        draw1[i] = 1;

                        const U128 ways =
                            hand_ways * prize_ways_for_state *
                            static_cast<U128>(after_prizes[i]);

                        const Outcomes outcome = evaluate(
                            opening, prize_cards, draw1, draw2, false
                        );

                        if (outcome.anchor_without_arven_dual)
                            first.anchor_without_arven_dual += ways;
                        if (outcome.anchor_with_arven_dual)
                            first.anchor_with_arven_dual += ways;
                        if (outcome.core) first.core += ways;
                        if (outcome.joint_without_arven_dual)
                            first.joint_without_arven_dual += ways;
                        if (outcome.joint_with_arven_dual)
                            first.joint_with_arven_dual += ways;
                    }

                    // Going second: one draw on own turn 1 and one on turn 2.
                    // Keep the two draws ordered because V must be present by T1.
                    for (int i = 0; i < N; ++i) {
                        if (after_prizes[i] == 0) continue;

                        draw1.fill(0);
                        draw2.fill(0);
                        draw1[i] = 1;

                        for (int j = 0; j < N; ++j) {
                            const int second_available =
                                after_prizes[j] - (i == j ? 1 : 0);
                            if (second_available <= 0) continue;

                            draw2.fill(0);
                            draw2[j] = 1;

                            const U128 ways =
                                hand_ways * prize_ways_for_state *
                                static_cast<U128>(after_prizes[i]) *
                                static_cast<U128>(second_available);

                            const Outcomes outcome = evaluate(
                                opening, prize_cards, draw1, draw2, true
                            );

                            if (outcome.anchor_without_arven_dual)
                                second.anchor_without_arven_dual += ways;
                            if (outcome.anchor_with_arven_dual)
                                second.anchor_with_arven_dual += ways;
                            if (outcome.core) second.core += ways;
                            if (outcome.joint_without_arven_dual)
                                second.joint_without_arven_dual += ways;
                            if (outcome.joint_with_arven_dual)
                                second.joint_with_arven_dual += ways;
                        }
                    }
                }
            );
        }
    );

    const U128 first_denominator =
        first.valid_openings * prize_ways * 47;
    const U128 second_denominator =
        second.valid_openings * prize_ways * 47 * 46;

    const long double valid_opening_probability =
        static_cast<long double>(first.valid_openings) /
        static_cast<long double>(choose(60, 7));

    auto print_rate = [](const char* label, U128 numerator, U128 denominator) {
        const long double rate =
            static_cast<long double>(numerator) /
            static_cast<long double>(denominator);
        std::cout << label << "=" << std::setprecision(12)
                  << static_cast<double>(rate) << "\n";
    };

    std::cout << std::setprecision(12)
              << "valid_opening_probability="
              << static_cast<double>(valid_opening_probability) << "\n";

    print_rate("anchor_without_arven_dual_going_first",
               first.anchor_without_arven_dual, first_denominator);
    print_rate("anchor_without_arven_dual_going_second",
               second.anchor_without_arven_dual, second_denominator);
    print_rate("anchor_with_arven_dual_going_first",
               first.anchor_with_arven_dual, first_denominator);
    print_rate("anchor_with_arven_dual_going_second",
               second.anchor_with_arven_dual, second_denominator);
    print_rate("core_V_by_T1_and_VMAX_by_T2_going_first",
               first.core, first_denominator);
    print_rate("core_V_by_T1_and_VMAX_by_T2_going_second",
               second.core, second_denominator);
    print_rate("joint_without_arven_dual_going_first",
               first.joint_without_arven_dual, first_denominator);
    print_rate("joint_without_arven_dual_going_second",
               second.joint_without_arven_dual, second_denominator);
    print_rate("joint_with_arven_dual_going_first",
               first.joint_with_arven_dual, first_denominator);
    print_rate("joint_with_arven_dual_going_second",
               second.joint_with_arven_dual, second_denominator);

    std::cout << "joint_going_first_fraction="
              << u128_string(first.joint_with_arven_dual) << "/"
              << u128_string(first_denominator) << "\n";
    std::cout << "joint_going_second_fraction="
              << u128_string(second.joint_with_arven_dual) << "/"
              << u128_string(second_denominator) << "\n";
}
