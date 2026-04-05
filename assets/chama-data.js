export const STORAGE_KEYS = {
    dashboard: "chama-os-dashboard",
    queue: "chama-os-offline-queue"
};

export const baseDashboardData = {
    totals: {
        contributions: 245000,
        activeLoans: 85000,
        availableBalance: 160000
    },
    members: [
        {
            id: "john",
            name: "John Mwangi",
            role: "Treasurer",
            initials: "JM",
            contributionStreak: 96,
            repaymentRate: 92,
            totalContributed: 48000,
            activeLoan: 25000,
            nextDue: "10 Apr",
            badge: "Trusted Member"
        },
        {
            id: "mary",
            name: "Mary Wanjiku",
            role: "Secretary",
            initials: "MW",
            contributionStreak: 82,
            repaymentRate: 88,
            totalContributed: 36000,
            activeLoan: 25000,
            nextDue: "12 Apr",
            badge: "Reliable Borrower"
        },
        {
            id: "peter",
            name: "Peter Otieno",
            role: "Member",
            initials: "PO",
            contributionStreak: 58,
            repaymentRate: 46,
            totalContributed: 22000,
            activeLoan: 35000,
            nextDue: "Overdue",
            badge: "Needs Follow-up"
        },
        {
            id: "sarah",
            name: "Sarah Achieng",
            role: "Member",
            initials: "SA",
            contributionStreak: 91,
            repaymentRate: 76,
            totalContributed: 28000,
            activeLoan: 0,
            nextDue: "No active loan",
            badge: "Trusted Member"
        }
    ],
    activity: [
        {
            id: 1,
            type: "contribution",
            memberId: "john",
            title: "John Mwangi saved KES 5,000",
            time: "2 hours ago"
        },
        {
            id: 2,
            type: "loan",
            memberId: "mary",
            title: "Mary Wanjiku loan repayment received",
            time: "Yesterday"
        },
        {
            id: 3,
            type: "reminder",
            memberId: "peter",
            title: "Payment reminder prepared for Peter Otieno",
            time: "Yesterday"
        },
        {
            id: 4,
            type: "contribution",
            memberId: "sarah",
            title: "Sarah Achieng saved KES 3,000",
            time: "3 days ago"
        }
    ]
};

export const educationTips = [
    {
        category: "How to run a chama",
        title: "Agree rules early and repeat them often",
        copy: "Set one meeting day, one contribution amount, and one clear process for late payments. Simple rules reduce conflict and build trust.",
        example: "Example: 20 members saving KES 1,000 each every month means KES 20,000 collected on one meeting day.",
        icon: "group"
    },
    {
        category: "Loan tips",
        title: "Only lend what the chama can comfortably recover",
        copy: "Check whether the borrower has a clear source of repayment before approving a loan. Friendly follow-up works better than pressure.",
        example: "Example: A KES 15,000 loan at 5% means KES 15,750 is paid back over the agreed period.",
        icon: "loan"
    },
    {
        category: "Saving strategies",
        title: "Small steady savings beat big irregular savings",
        copy: "Members who save a manageable amount every month usually stay consistent. Consistency grows confidence inside the group.",
        example: "Example: Saving KES 500 every month adds up to KES 6,000 in one year before any returns.",
        icon: "piggy"
    },
    {
        category: "How to run a chama",
        title: "Keep records clear enough for every member to follow",
        copy: "Use one balance view, one activity list, and short meeting notes. People trust what they can understand quickly.",
        example: "Example: Show total saved, total on loan, and available balance after each meeting.",
        icon: "book"
    },
    {
        category: "Loan tips",
        title: "Reward on-time repayment visibly",
        copy: "Members respond well when good repayment habits are recognized. A trusted borrower badge encourages healthy behavior.",
        example: "Example: Members with 90%+ on-time repayment can qualify for a slightly larger next loan.",
        icon: "badge"
    },
    {
        category: "Saving strategies",
        title: "Protect an emergency reserve",
        copy: "Keep part of the money untouched for urgent group needs. This helps the chama stay calm when something unexpected happens.",
        example: "Example: If the chama has KES 160,000, setting aside KES 30,000 as reserve gives breathing room.",
        icon: "shield"
    }
];

export function formatKES(value) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
    }).format(value);
}

export function getStoredDashboardData() {
    const stored = localStorage.getItem(STORAGE_KEYS.dashboard);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(baseDashboardData));
}

export function saveDashboardData(data) {
    localStorage.setItem(STORAGE_KEYS.dashboard, JSON.stringify(data));
}

export function getStoredQueue() {
    const stored = localStorage.getItem(STORAGE_KEYS.queue);
    return stored ? JSON.parse(stored) : [];
}

export function saveQueue(queue) {
    localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(queue));
}

export function getTrustLevel(score) {
    if (score >= 80) {
        return {
            label: "Trusted",
            badge: "Trusted Member",
            ring: "bg-emerald-500",
            soft: "bg-emerald-50 text-emerald-700"
        };
    }

    if (score >= 60) {
        return {
            label: "Moderate",
            badge: "Reliable Borrower",
            ring: "bg-amber-500",
            soft: "bg-amber-50 text-amber-700"
        };
    }

    return {
        label: "Risky",
        badge: "Needs Support",
        ring: "bg-rose-500",
        soft: "bg-rose-50 text-rose-700"
    };
}

export function buildTrustScores(member) {
    const reputationScore = member.contributionStreak;
    const loanReliabilityScore = member.repaymentRate;
    const overallScore = Math.round((reputationScore + loanReliabilityScore) / 2);

    return {
        reputationScore,
        loanReliabilityScore,
        overallScore,
        level: getTrustLevel(overallScore)
    };
}

export function getIconSvg(icon) {
    const icons = {
        plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/></svg>`,
        loan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10.5 12 4l9 6.5M5.25 9.75V19a1 1 0 0 0 1 1h11.5a1 1 0 0 0 1-1V9.75M9 20v-5h6v5"/></svg>`,
        balance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8V6.75A1.75 1.75 0 0 0 15.25 5H6.75A1.75 1.75 0 0 0 5 6.75v10.5C5 18.216 5.784 19 6.75 19h10.5c.966 0 1.75-.784 1.75-1.75V8.75A1.75 1.75 0 0 0 17.25 7H7"/><path stroke-linecap="round" stroke-linejoin="round" d="M16 13h3"/></svg>`,
        activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4 13h4l2-5 4 10 2-5h4"/></svg>`,
        group: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M18 19a4 4 0 0 0-8 0M16 7a3 3 0 1 1-6 0M20 18a3.5 3.5 0 0 0-3-3.465M16.5 4.535A3.5 3.5 0 0 1 20 8"/></svg>`,
        piggy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12a6 6 0 0 1 6-6h4a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-1.5l-1 2H11l-1-2H8a2 2 0 0 1-2-2v-2Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M10 10h.01"/></svg>`,
        book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M6 4.75A2.75 2.75 0 0 1 8.75 2H19v17H8.75A2.75 2.75 0 0 0 6 21.75m0-17v17"/></svg>`,
        badge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3 14.318 7.697l5.182.753-3.75 3.655.885 5.16L12 14.827l-4.635 2.438.885-5.16L4.5 8.45l5.182-.753L12 3Z"/></svg>`,
        shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3 5.5 5.5v5.75c0 4.3 2.725 8.133 6.5 9.75 3.775-1.617 6.5-5.45 6.5-9.75V5.5L12 3Z"/></svg>`,
        tips: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3a6 6 0 0 0-3.975 10.494c.62.56.975 1.346.975 2.18V16h6v-.326c0-.834.354-1.62.975-2.18A6 6 0 0 0 12 3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.5 19h5M10.5 22h3"/></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="m6 6 12 12M18 6 6 18"/></svg>`
    };

    return icons[icon] ?? icons.activity;
}
