import { buildTrustScores, educationTips, formatKES, getIconSvg } from "./chama-data.js";

export function hydrateIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((node) => {
        node.innerHTML = getIconSvg(node.dataset.icon);
    });
}

export function renderSummaryCards(totals) {
    const cards = [
        {
            title: "Total Contributions",
            value: formatKES(totals.contributions),
            helper: "Saved by members",
            trend: "Collections up",
            accent: "#1f8f5f",
            icon: "piggy"
        },
        {
            title: "Active Loans",
            value: formatKES(totals.activeLoans),
            helper: "Currently lent out",
            trend: "3 borrowers active",
            accent: "#0284c7",
            icon: "loan"
        },
        {
            title: "Available Balance",
            value: formatKES(totals.availableBalance),
            helper: "Ready for approved needs",
            trend: "Treasury ready",
            accent: "#c98b1d",
            icon: "balance"
        }
    ];

    return cards.map((card) => `
        <article class="summary-card rounded-[28px] bg-white p-5 shadow-soft" style="--card-accent:${card.accent}">
            <div class="metric-icon inline-flex rounded-2xl p-3 text-stone-700" style="background: color-mix(in srgb, ${card.accent} 14%, white); color: ${card.accent};">
                ${getIconSvg(card.icon)}
            </div>
            <div class="mt-5 flex items-start justify-between gap-3">
                <p class="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">${card.title}</p>
                <span class="metric-chip rounded-full px-3 py-1 text-xs font-semibold" style="background: color-mix(in srgb, ${card.accent} 10%, white); color: ${card.accent};">${card.trend}</span>
            </div>
            <p class="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">${card.value}</p>
            <p class="mt-2 text-sm text-stone-600">${card.helper}</p>
        </article>
    `).join("");
}

export function renderOfflineQueue(queue) {
    if (!queue.length) {
        return `
            <div class="rounded-[24px] border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
                No queued actions right now.
            </div>
        `;
    }

    return queue.map((action) => `
        <article class="queue-item rounded-[24px] p-4">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <p class="text-sm font-semibold text-ink">${action.type === "contribution" ? "Contribution" : "Loan request"}</p>
                    <p class="mt-1 text-sm text-stone-600">${formatKES(action.amount)} waiting on this device</p>
                    <p class="mt-2 text-xs text-stone-500">${new Date(action.queuedAt).toLocaleString("en-KE")}</p>
                </div>
                <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Queued</span>
            </div>
        </article>
    `).join("");
}

export function renderActivityList(activity, members) {
    return activity.map((item) => {
        const member = members.find((entry) => entry.id === item.memberId);
        const trust = buildTrustScores(member);

        return `
            <article class="activity-item flex items-start gap-4 p-4">
                <div class="mt-1 ${trust.level.ring} status-dot"></div>
                <div class="min-w-0 flex-1">
                    <p class="text-base font-semibold text-ink">${item.title}</p>
                    <p class="mt-1 text-sm text-stone-500">${item.time}</p>
                </div>
                <span class="trust-pill ${trust.level.soft} px-3 py-2 text-xs font-semibold">${trust.level.label}</span>
            </article>
        `;
    }).join("");
}

export function renderTrustSummary(members) {
    const tallies = members.reduce((counts, member) => {
        const level = buildTrustScores(member).level.label;
        counts[level] += 1;
        return counts;
    }, { Trusted: 0, Moderate: 0, Risky: 0 });

    return `
        <div class="space-y-3">
            <div class="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                <span class="text-sm font-semibold text-emerald-800">Trusted</span>
                <span class="text-lg font-black text-emerald-700">${tallies.Trusted}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                <span class="text-sm font-semibold text-amber-800">Moderate</span>
                <span class="text-lg font-black text-amber-700">${tallies.Moderate}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3">
                <span class="text-sm font-semibold text-rose-800">Risky</span>
                <span class="text-lg font-black text-rose-700">${tallies.Risky}</span>
            </div>
        </div>
    `;
}

export function renderMemberCards(members) {
    return members.map((member) => {
        const trust = buildTrustScores(member);

        return `
            <button class="member-item member-trigger flex w-full items-center justify-between p-4 text-left hover:bg-emerald-50/80" data-member-id="${member.id}">
                <div class="flex min-w-0 items-center gap-3">
                    <div class="member-avatar flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-brand-700 shadow-sm">${member.initials}</div>
                    <div class="min-w-0">
                        <p class="truncate text-base font-semibold text-ink">${member.name}</p>
                        <p class="text-sm text-stone-500">${member.role}</p>
                    </div>
                </div>
                <span class="trust-pill ${trust.level.soft} px-3 py-2 text-xs font-semibold">${trust.level.badge}</span>
            </button>
        `;
    }).join("");
}

export function renderMemberProfile(member) {
    const trust = buildTrustScores(member);

    return `
        <div class="space-y-5">
            <div class="flex items-start gap-4">
                <div class="flex h-16 w-16 items-center justify-center rounded-[22px] bg-brand-50 text-xl font-black text-brand-700">${member.initials}</div>
                <div>
                    <h3 class="text-2xl font-black text-ink">${member.name}</h3>
                    <p class="text-sm text-stone-500">${member.role}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                        <span class="trust-pill ${trust.level.soft} px-3 py-2 text-xs font-semibold">${trust.level.badge}</span>
                        <span class="trust-pill bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700">${member.badge}</span>
                    </div>
                </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
                <section class="rounded-[24px] bg-emerald-50 p-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Reputation score</p>
                    <p class="mt-2 text-3xl font-black text-emerald-800">${trust.reputationScore}</p>
                    <p class="mt-2 text-sm text-emerald-700">Based on contribution consistency.</p>
                </section>
                <section class="rounded-[24px] bg-sky-50 p-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Loan reliability</p>
                    <p class="mt-2 text-3xl font-black text-sky-800">${trust.loanReliabilityScore}</p>
                    <p class="mt-2 text-sm text-sky-700">Based on repayment history.</p>
                </section>
            </div>

            <section class="rounded-[24px] bg-stone-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Member summary</p>
                <div class="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                        <p class="text-sm text-stone-500">Overall trust</p>
                        <p class="text-xl font-black text-ink">${trust.overallScore}</p>
                    </div>
                    <div>
                        <p class="text-sm text-stone-500">Saved so far</p>
                        <p class="text-xl font-black text-ink">${formatKES(member.totalContributed)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-stone-500">Next due</p>
                        <p class="text-xl font-black text-ink">${member.nextDue}</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}

export function renderTipsPreview() {
    return educationTips.slice(0, 3).map((tip) => `
        <article class="tip-card rounded-[24px] p-4">
            <div class="mb-3 inline-flex rounded-2xl bg-white p-3 text-brand-700 shadow-sm">
                ${getIconSvg(tip.icon)}
            </div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">${tip.category}</p>
            <h3 class="mt-2 text-lg font-black text-ink">${tip.title}</h3>
            <p class="mt-3 text-sm leading-6 text-stone-600">${tip.copy}</p>
            <p class="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-brand-700">${tip.example}</p>
        </article>
    `).join("");
}

export function renderChatBubble(message, type = "bot") {
    return `
        <div class="flex ${type === "user" ? "justify-end" : "justify-start"}">
            <div class="chat-bubble ${type}">
                ${message}
            </div>
        </div>
    `;
}
