function normalizeTone(score) {
    if (score >= 80) return 'green';
    if (score >= 55) return 'yellow';
    return 'red';
}

export function getTrustTone(input) {
    const tone = typeof input === 'number' ? normalizeTone(input) : input;

    return {
        green: {
            label: 'Trusted',
            dotClass: 'bg-emerald-500',
            badgeClass: 'bg-emerald-100 text-emerald-800',
            cardClass: 'border-emerald-200 bg-emerald-50'
        },
        yellow: {
            label: 'Moderate',
            dotClass: 'bg-amber-400',
            badgeClass: 'bg-amber-100 text-amber-900',
            cardClass: 'border-amber-200 bg-amber-50'
        },
        red: {
            label: 'Risky',
            dotClass: 'bg-rose-500',
            badgeClass: 'bg-rose-100 text-rose-800',
            cardClass: 'border-rose-200 bg-rose-50'
        }
    }[tone];
}

function scoreRow(label, score) {
    const tone = getTrustTone(score);

    return `
        <div class="rounded-2xl bg-white/80 p-3">
            <div class="mb-2 flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">${label}</span>
                <span class="rounded-full px-2 py-1 text-xs font-semibold ${tone.badgeClass}">${tone.label}</span>
            </div>
            <div class="flex items-end justify-between gap-3">
                <span class="text-2xl font-bold">${score}</span>
                <div class="h-2 flex-1 rounded-full bg-slate-200">
                    <div class="h-2 rounded-full ${tone.dotClass}" style="width: ${score}%"></div>
                </div>
            </div>
        </div>
    `;
}

export function renderTrustSummary(target, members) {
    const trustedMembers = members.filter((member) => member.contributionScore >= 80).length;
    const reliableBorrowers = members.filter((member) => member.loanScore >= 80).length;
    const moderateMembers = members.filter((member) => member.contributionScore >= 55 && member.contributionScore < 80).length;

    const cards = [
        {
            title: 'Trusted Members',
            value: trustedMembers,
            tone: 'green'
        },
        {
            title: 'Reliable Borrowers',
            value: reliableBorrowers,
            tone: 'green'
        },
        {
            title: 'Need Follow Up',
            value: moderateMembers,
            tone: 'yellow'
        }
    ];

    target.innerHTML = cards.map((card) => {
        const tone = getTrustTone(card.tone);
        return `
            <div class="rounded-[24px] border p-4 ${tone.cardClass}">
                <p class="text-sm font-medium text-slate-600">${card.title}</p>
                <p class="mt-2 text-3xl font-bold">${card.value}</p>
                <p class="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">${tone.label}</p>
            </div>
        `;
    }).join('');
}

export function renderMemberCards(target, members) {
    target.innerHTML = members.map((member) => {
        const contributionTone = getTrustTone(member.contributionScore);
        const loanTone = getTrustTone(member.loanScore);

        return `
            <article class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div class="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <p class="text-lg font-semibold">${member.name}</p>
                        <p class="text-sm text-slate-500">${member.role}</p>
                    </div>
                    <div class="rounded-full px-3 py-1 text-xs font-semibold ${contributionTone.badgeClass}">
                        ${contributionTone.label}
                    </div>
                </div>
                <div class="space-y-3">
                    ${scoreRow('Reputation Score', member.contributionScore)}
                    ${scoreRow('Loan Reliability', member.loanScore)}
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                    <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">${member.badge}</span>
                    <span class="rounded-full px-3 py-1 text-xs font-semibold ${loanTone.badgeClass}">${member.borrowerBadge}</span>
                </div>
            </article>
        `;
    }).join('');
}
