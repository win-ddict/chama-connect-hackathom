(function () {
    const data = {
        summary: {
            totalContributions: 245000,
            activeLoans: 85000,
            availableBalance: 160000
        },
        members: [
            {
                id: 1,
                name: "John Doe",
                role: "Treasurer",
                status: "Active",
                joined: "Jan 2026",
                phone: "+254 712 345 678",
                contributionsConsistency: 96,
                repaymentHistory: 92,
                badges: ["Trusted Member", "Reliable Borrower"]
            },
            {
                id: 2,
                name: "Mary Wanjiku",
                role: "Secretary",
                status: "Active",
                joined: "Feb 2026",
                phone: "+254 723 678 220",
                contributionsConsistency: 78,
                repaymentHistory: 84,
                badges: ["Reliable Borrower"]
            },
            {
                id: 3,
                name: "Peter Kamau",
                role: "Member",
                status: "Not active",
                joined: "Nov 2025",
                phone: "+254 701 998 001",
                contributionsConsistency: 58,
                repaymentHistory: 49,
                badges: []
            },
            {
                id: 4,
                name: "Faith Achieng",
                role: "Member",
                status: "Active",
                joined: "Mar 2026",
                phone: "+254 745 300 122",
                contributionsConsistency: 89,
                repaymentHistory: 76,
                badges: ["Trusted Member"]
            }
        ],
        activity: [
            { text: "John Doe paid KES 5,000 contribution", time: "2 hours ago", tone: "trusted" },
            { text: "Mary Wanjiku repaid KES 4,500 loan instalment", time: "Yesterday", tone: "moderate" },
            { text: "Reminder prepared for Peter Kamau", time: "2 days ago", tone: "risky" },
            { text: "Faith Achieng joined the savings pot", time: "3 days ago", tone: "trusted" }
        ],
        tips: [
            {
                title: "How to run a chama",
                body: "Agree on one contribution day, write down every payment, and confirm the amount before everyone leaves the meeting."
            },
            {
                title: "Loan tips",
                body: "Before approving a KES 10,000 loan, agree on the repayment date and what the member will pay back in total."
            },
            {
                title: "Saving strategies",
                body: "If each member saves KES 500 every week, a 20-member chama can raise KES 40,000 in one month."
            },
            {
                title: "Emergency reserve",
                body: "Keep a small cash cushion for sickness, school needs, or urgent travel so the group is not forced into panic borrowing."
            },
            {
                title: "Meeting discipline",
                body: "Start meetings on time, keep them short, and read the balances aloud so every member feels informed and included."
            },
            {
                title: "Healthy borrowing",
                body: "Borrow for stock, school fees, or clear needs first. Avoid taking a loan when you do not yet know how you will repay it."
            }
        ]
    };

    const STORAGE_KEYS = {
        queue: "chamaOfflineQueue",
        activity: "chamaRecentActivity",
        chatHistory: "chamaChatHistory",
        botEnabled: "chamaBotEnabled",
        joinRequests: "chamaJoinRequests",
        approvedMembers: "chamaApprovedMembers"
    };

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0
        }).format(amount);
    }

    function getTrustMeta(score) {
        if (score >= 80) {
            return { label: "Trusted", tone: "trusted", className: "status-trusted", color: "#16a34a" };
        }
        if (score >= 60) {
            return { label: "Moderate", tone: "moderate", className: "status-moderate", color: "#d97706" };
        }
        return { label: "Risky", tone: "risky", className: "status-risky", color: "#dc2626" };
    }

    function averageScore(member) {
        return Math.round((member.contributionsConsistency + member.repaymentHistory) / 2);
    }

    function loadQueue() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.queue) || "[]");
        } catch (error) {
            return [];
        }
    }

    function saveQueue(queue) {
        localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(queue));
    }

    function loadActivity() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.activity) || "[]");
            return saved.length ? saved : data.activity;
        } catch (error) {
            return data.activity;
        }
    }

    function saveActivity(activity) {
        localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity.slice(0, 6)));
    }

    function loadChatHistory() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.chatHistory) || "[]");
            if (saved.length) {
                return saved;
            }
        } catch (error) {
            // Fall through to defaults.
        }

        return [
            {
                author: "bot",
                message: "Hello. Ask me about balance, reminders, loans, or member trust scores."
            },
            {
                author: "member",
                message: "Mary Wanjiku: Next meeting is on Thursday at 4 PM."
            },
            {
                author: "member",
                message: "John Doe: Please confirm contribution status before the meeting."
            }
        ];
    }

    function saveChatHistory(history) {
        localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(history.slice(-18)));
    }

    function isBotEnabled() {
        const saved = localStorage.getItem(STORAGE_KEYS.botEnabled);
        return saved === null ? true : saved === "true";
    }

    function saveBotEnabled(value) {
        localStorage.setItem(STORAGE_KEYS.botEnabled, String(value));
    }

    function loadJoinRequests() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.joinRequests) || "[]");
        } catch (error) {
            return [];
        }
    }

    function saveJoinRequests(requests) {
        localStorage.setItem(STORAGE_KEYS.joinRequests, JSON.stringify(requests));
    }

    function loadApprovedMembers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.approvedMembers) || "[]");
        } catch (error) {
            return [];
        }
    }

    function saveApprovedMembers(members) {
        localStorage.setItem(STORAGE_KEYS.approvedMembers, JSON.stringify(members));
    }

    function sameGroupName(left, right) {
        return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
    }

    function sameGroupType(left, right) {
        return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
    }

    function sameGroupContext(leftName, leftType, rightName, rightType) {
        if (!sameGroupName(leftName, rightName)) {
            return false;
        }

        if (!leftType || !rightType) {
            return true;
        }

        return sameGroupType(leftType, rightType);
    }

    function formatRequestDate(value) {
        return new Intl.DateTimeFormat("en-KE", {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(new Date(value));
    }

    function icon(name, className) {
        const icons = {
            wallet: "M2.25 8.25h19.5m-18 0h16.5A1.5 1.5 0 0 1 21.75 9.75v8.25A1.5 1.5 0 0 1 20.25 19.5H3.75a1.5 1.5 0 0 1-1.5-1.5V9.75a1.5 1.5 0 0 1 1.5-1.5Zm0 0V6A1.5 1.5 0 0 1 3.75 4.5h12A1.5 1.5 0 0 1 17.25 6v2.25m-2.25 6h.008v.008H15v-.008Z",
            loans: "M12 6v12m6-6H6",
            balance: "M12 8c-3.314 0-6 1.79-6 4s2.686 4 6 4 6-1.79 6-4-2.686-4-6-4Zm0 0V4m0 12v4",
            activity: "M3 13.5h4.5V21H3v-7.5Zm6.75-6h4.5V21h-4.5V7.5Zm6.75-4.5H21V21h-4.5V3Z",
            chat: "M7.5 10.5h9m-9 3h5.25M6.75 3h10.5A2.25 2.25 0 0 1 19.5 5.25v8.52a2.25 2.25 0 0 1-.659 1.591l-2.83 2.83a2.25 2.25 0 0 1-1.591.659H6.75A2.25 2.25 0 0 1 4.5 16.5V5.25A2.25 2.25 0 0 1 6.75 3Z",
            tips: "M12 18h.008v.008H12V18Zm-.75-13.5h1.5a3 3 0 0 1 2.207 5.032c-.5.53-.957 1.1-.957 1.968V12.75h-1.5v-1.25c0-1.225.64-2.05 1.365-2.818A1.5 1.5 0 0 0 12.75 6h-1.5A1.5 1.5 0 0 0 9.75 7.5H8.25A3 3 0 0 1 11.25 4.5Z",
            offline: "M1.5 1.5 22.5 22.5M8.25 8.25A6.733 6.733 0 0 1 12 7.125c3.025 0 5.587 1.977 6.466 4.712m-1.86 3.296A6.719 6.719 0 0 1 12 16.875a6.72 6.72 0 0 1-5.37-2.655",
            sync: "M16.023 9.348h4.992V4.356m-1.636 11.288A8.25 8.25 0 0 1 5.106 5.106m13.788 13.788A8.25 8.25 0 0 1 3.977 14.652",
            member: "M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
            send: "M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L6 12Zm0 0h7.5"
        };

        return (
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="' +
            className +
            '" aria-hidden="true"><path d="' +
            icons[name] +
            '"></path></svg>'
        );
    }

    function TrustScore(member) {
        const reputation = getTrustMeta(member.contributionsConsistency);
        const reliability = getTrustMeta(member.repaymentHistory);
        const overall = getTrustMeta(averageScore(member));

        return `
            <article class="member-row app-card p-5">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-3">
                            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                ${icon("member", "h-5 w-5")}
                            </div>
                            <div>
                                <h3 class="text-base font-semibold text-slate-900">${member.name}</h3>
                                <p class="text-sm text-slate-500">${member.role}</p>
                            </div>
                        </div>
                        <div class="mt-3 flex flex-wrap gap-2">
                            <span class="status-pill ${overall.className}">${overall.label}</span>
                            ${member.badges
                                .map(function (badge) {
                                    return '<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">' + badge + "</span>";
                                })
                                .join("")}
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Trust</p>
                        <p class="text-2xl font-black text-slate-900">${averageScore(member)}</p>
                    </div>
                </div>
                <div class="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                        <div class="mb-2 flex items-center justify-between text-sm">
                            <span class="font-medium text-slate-700">Reputation Score</span>
                            <span class="${reputation.className} rounded-full px-2.5 py-1 text-xs font-semibold">${member.contributionsConsistency}</span>
                        </div>
                        <div class="trust-meter"><span style="width:${member.contributionsConsistency}%;background:${reputation.color}"></span></div>
                        <p class="mt-2 text-xs text-slate-500">Based on contribution consistency</p>
                    </div>
                    <div>
                        <div class="mb-2 flex items-center justify-between text-sm">
                            <span class="font-medium text-slate-700">Loan Reliability</span>
                            <span class="${reliability.className} rounded-full px-2.5 py-1 text-xs font-semibold">${member.repaymentHistory}</span>
                        </div>
                        <div class="trust-meter"><span style="width:${member.repaymentHistory}%;background:${reliability.color}"></span></div>
                        <p class="mt-2 text-xs text-slate-500">Based on repayment history</p>
                    </div>
                </div>
            </article>
        `;
    }

    function MemberDirectory(member) {
        const isActive = member.status === "Active";
        return `
            <article class="member-directory-card">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h3 class="text-base font-semibold text-white">${member.name}</h3>
                        <p class="mt-1 text-sm text-slate-300">Role: ${member.role}</p>
                    </div>
                    <span class="status-pill ${isActive ? "status-trusted" : "status-risky"}">${member.status}</span>
                </div>
                <div class="member-directory-meta mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                    <div class="member-meta-chip">
                        <span class="member-meta-label">Role</span>
                        <span class="member-meta-value">${member.role}</span>
                    </div>
                    <div class="member-meta-chip">
                        <span class="member-meta-label">Status</span>
                        <span class="member-meta-value">${member.status}</span>
                    </div>
                    <div class="member-meta-chip">
                        <span class="member-meta-label">Joined</span>
                        <span class="member-meta-value">${member.joined}</span>
                    </div>
                </div>
                <div class="mt-4 grid gap-2 text-sm text-slate-300">
                    <p><span class="font-semibold text-white">Phone:</span> ${member.phone}</p>
                    <p><span class="font-semibold text-white">Trust:</span> ${averageScore(member)}/100</p>
                </div>
            </article>
        `;
    }

    function getMembersWithCurrentProfile() {
        const profileName = (localStorage.getItem("chama_profile_name") || "").trim();
        const profileRole = (localStorage.getItem("chama_profile_role") || "").trim() || "Member";
        const profilePhone = (localStorage.getItem("chama_profile_phone") || "").trim() || "Not provided";
        const groupName = (localStorage.getItem("chama_group_name") || "").trim();
        const groupType = (localStorage.getItem("chama_group_type") || "").trim();
        const approvedMembers = loadApprovedMembers().filter(function (member) {
            return !member.groupName || sameGroupContext(member.groupName, member.groupType, groupName, groupType);
        });
        let members = data.members.slice();

        if (!profileName) {
            return approvedMembers.concat(members);
        }

        const existingIndex = members.findIndex(function (member) {
            return member.name.toLowerCase() === profileName.toLowerCase();
        });

        const profileMember = {
            id: existingIndex >= 0 ? members[existingIndex].id : Date.now(),
            name: profileName,
            role: profileRole,
            status: "Active",
            joined: "You",
            phone: profilePhone,
            contributionsConsistency: existingIndex >= 0 ? members[existingIndex].contributionsConsistency : 88,
            repaymentHistory: existingIndex >= 0 ? members[existingIndex].repaymentHistory : 84,
            badges: existingIndex >= 0 ? members[existingIndex].badges : ["Your Profile"]
        };

        if (existingIndex >= 0) {
            members = members.map(function (member, index) {
                return index === existingIndex ? profileMember : member;
            });
        } else {
            members = [profileMember].concat(members);
        }

        return approvedMembers.concat(members);
    }

    function PendingJoinRequest(request, isChairman) {
        return `
            <article class="join-request-card">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h3 class="text-base font-semibold text-white">${request.name}</h3>
                        <p class="mt-1 text-sm text-slate-300">${request.phone}</p>
                    </div>
                    <span class="status-pill status-moderate">${request.status}</span>
                </div>
                <div class="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                    <p><span class="font-semibold text-white">Requested role:</span> ${request.role}</p>
                    <p><span class="font-semibold text-white">Referral:</span> ${request.referral || "Direct request"}</p>
                    <p><span class="font-semibold text-white">Date:</span> ${formatRequestDate(request.requestedAt)}</p>
                </div>
                ${isChairman
                    ? `
                        <div class="mt-4 flex flex-wrap gap-2">
                            <button data-approve-request="${request.id}" class="tap-target rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                                Approve
                            </button>
                            <button data-reject-request="${request.id}" class="tap-target rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/8">
                                Reject
                            </button>
                        </div>
                    `
                    : `
                        <p class="mt-4 text-sm text-slate-400">Waiting for the chairman to review this request.</p>
                    `}
            </article>
        `;
    }

    function MemberListItem(member) {
        const isActive = member.status === "Active";
        return `
            <article class="member-list-item">
                <div class="member-list-item__identity">
                    <div class="member-list-item__icon">
                        ${icon("member", "h-4 w-4")}
                    </div>
                    <div class="min-w-0">
                        <p class="member-list-item__name">${member.name}</p>
                        <p class="member-list-item__meta">Joined ${member.joined}</p>
                    </div>
                </div>
                <p class="member-list-item__role">${member.role}</p>
                <div class="member-list-item__status">
                    <span class="status-pill ${isActive ? "status-trusted" : "status-risky"}">${member.status}</span>
                </div>
            </article>
        `;
    }

    function TipsSection() {
        return `
            <section id="tips-section" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                ${data.tips
                    .map(function (tip) {
                        return `
                            <article class="tip-card app-card p-5">
                                <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                    ${icon("tips", "h-5 w-5")}
                                </div>
                                <h3 class="text-lg font-semibold text-slate-900">${tip.title}</h3>
                                <p class="mt-2 text-sm leading-6 text-slate-600">${tip.body}</p>
                            </article>
                        `;
                    })
                    .join("")}
            </section>
        `;
    }

    function renderSummaryCards(summary) {
        const cards = [
            {
                label: "Total Contributions",
                value: formatCurrency(summary.totalContributions),
                iconName: "wallet",
                bg: "from-emerald-500 to-green-600",
                note: "All member savings"
            },
            {
                label: "Active Loans",
                value: formatCurrency(summary.activeLoans),
                iconName: "loans",
                bg: "from-sky-500 to-blue-600",
                note: "Currently borrowed"
            },
            {
                label: "Available Balance",
                value: formatCurrency(summary.availableBalance),
                iconName: "balance",
                bg: "from-amber-400 to-orange-500",
                note: "Ready for approved needs"
            },
            {
                label: "Recent Activity",
                value: loadActivity().length + " items",
                iconName: "activity",
                bg: "from-slate-700 to-slate-900",
                note: "Latest chama updates"
            }
        ];

        return cards
            .map(function (card) {
                return `
                    <article class="metric-card rounded-[1.75rem] bg-gradient-to-br ${card.bg} p-5 text-white shadow-lg">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <p class="text-sm font-medium text-white/80">${card.label}</p>
                                <p class="mt-3 text-3xl font-black tracking-tight sm:text-4xl">${card.value}</p>
                                <p class="mt-2 text-sm text-white/80">${card.note}</p>
                            </div>
                            <div class="rounded-2xl bg-white/15 p-3">
                                ${icon(card.iconName, "h-6 w-6")}
                            </div>
                        </div>
                    </article>
                `;
            })
            .join("");
    }

    function renderActivity(activity) {
        return activity
            .map(function (item) {
                const meta = item.tone === "trusted"
                    ? getTrustMeta(90)
                    : item.tone === "moderate"
                        ? getTrustMeta(70)
                        : getTrustMeta(40);

                return `
                    <li class="flex items-start gap-3">
                        <div class="mt-2 h-2.5 w-2.5 rounded-full" style="background:${meta.color}"></div>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-slate-800">${item.text}</p>
                            <p class="mt-1 text-xs text-slate-500">${item.time}</p>
                        </div>
                        <span class="status-pill ${meta.className}">${meta.label}</span>
                    </li>
                `;
            })
            .join("");
    }

    function buildDashboard(root) {
        const organizationName = localStorage.getItem("chama_group_name") || "My Chama";
        const organizationType = localStorage.getItem("chama_group_type") || "";
        const profileRole = (localStorage.getItem("chama_profile_role") || "").toLowerCase();
        const isChairman = profileRole === "chairman";
        const members = getMembersWithCurrentProfile();
        const joinRequests = loadJoinRequests().filter(function (request) {
            return !request.groupName || sameGroupContext(request.groupName, request.groupType, organizationName, organizationType);
        });
        const trustedMembers = members.filter(function (member) {
            return averageScore(member) >= 80;
        }).length;

        const moderateMembers = members.filter(function (member) {
            const score = averageScore(member);
            return score >= 60 && score < 80;
        }).length;

        const riskyMembers = members.length - trustedMembers - moderateMembers;
        const activity = loadActivity();

        root.innerHTML = `
            <div class="app-shell text-slate-900">
                <div id="offline-banner" class="offline-banner fixed left-1/2 top-4 z-50 w-[min(92vw,40rem)] -translate-x-1/2 rounded-2xl border border-amber-300/20 bg-amber-500/15 px-4 py-3 text-white shadow-lg backdrop-blur-xl">
                    <div class="mx-auto flex items-center justify-center gap-4">
                        <div class="flex items-center gap-3 text-sm font-medium">
                            ${icon("offline", "h-5 w-5")}
                            <span>Offline Mode is on. Your contributions and loan requests will queue safely.</span>
                        </div>
                    </div>
                </div>

                <div id="toast-stack" class="toast-stack fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"></div>

                <header class="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
                    <div class="glass-topbar reveal is-visible flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Simple Money View</p>
                            <h1 class="text-2xl font-black tracking-tight text-white sm:text-3xl">Chama OS</h1>
                            <p class="mt-1 text-sm font-medium text-slate-300">${organizationName}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <a href="index.html" class="tap-target inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <span>Back Home</span>
                            </a>
                            <button id="open-chat" class="tap-target inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(16,185,129,0.2)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                ${icon("chat", "h-5 w-5")}
                                <span>Chat</span>
                            </button>
                            <a href="#learn" class="tap-target inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                ${icon("tips", "h-5 w-5")}
                                <span>Tips</span>
                            </a>
                        </div>
                    </div>
                </header>

                <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                    <section class="app-card reveal is-visible mb-6 overflow-hidden p-5 sm:p-7">
                        <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
                            <div>
                                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Today at a glance</p>
                                <h2 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">${organizationName}</h2>
                                <p class="mt-2 text-lg font-semibold text-slate-100">Clear money updates for every member</p>
                                <p class="mt-3 max-w-2xl text-base leading-7 text-slate-200">See what the group has saved, what is out on loan, who is trusted, and what needs action without technical terms or clutter.</p>
                            </div>
                            <div class="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                                <p class="text-sm font-semibold text-slate-100">Trust snapshot</p>
                                <div class="mt-4 grid grid-cols-3 gap-3 text-center">
                                    <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <p class="text-2xl font-black text-emerald-300">${trustedMembers}</p>
                                        <p class="mt-1 text-xs font-medium text-slate-300">Trusted</p>
                                    </div>
                                    <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <p class="text-2xl font-black text-amber-300">${moderateMembers}</p>
                                        <p class="mt-1 text-xs font-medium text-slate-300">Moderate</p>
                                    </div>
                                    <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <p class="text-2xl font-black text-rose-300">${riskyMembers}</p>
                                        <p class="mt-1 text-xs font-medium text-slate-300">Risky</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section aria-label="Dashboard summary" class="reveal grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        ${renderSummaryCards(data.summary)}
                    </section>

                    <section class="reveal mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <div class="app-card p-5 sm:p-6">
                            <div class="flex items-center justify-between gap-4">
                                <div>
                                    <h2 class="section-title">Recent Activity</h2>
                                    <p class="section-copy mt-1">Short, readable updates from the chama.</p>
                                </div>
                                <button id="simulate-reminder" class="tap-target rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/5">Send reminder</button>
                            </div>
                            <ul id="activity-list" class="mt-6 space-y-4">
                                ${renderActivity(activity)}
                            </ul>
                        </div>

                        <aside class="space-y-6">
                            <section class="app-card p-5 sm:p-6">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 class="section-title">Trust Summary</h2>
                                        <p class="section-copy mt-1">A simple way to spot reliable members.</p>
                                    </div>
                                    <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">${members.length} members</span>
                                </div>
                                <div class="mt-5 space-y-3">
                                    ${members
                                        .slice(0, 3)
                                        .map(function (member) {
                                            const meta = getTrustMeta(averageScore(member));
                                            return `
                                                <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                    <div class="flex items-center justify-between gap-4">
                                                        <div>
                                                            <p class="font-semibold text-white">${member.name}</p>
                                                            <p class="text-sm text-slate-300">${member.badges[0] || "Growing trust"}</p>
                                                        </div>
                                                        <span class="status-pill ${meta.className}">${meta.label}</span>
                                                    </div>
                                                </div>
                                            `;
                                        })
                                        .join("")}
                                </div>
                            </section>

                            <section class="app-card p-5 sm:p-6">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 class="section-title">Quick Actions</h2>
                                        <p class="section-copy mt-1">Large buttons for everyday tasks.</p>
                                    </div>
                                </div>
                                <div class="mt-5 grid gap-3">
                                    <button data-action="contribution" class="queue-action tap-target rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-4 text-left text-white transition hover:-translate-y-0.5">
                                        <span class="block text-base font-bold">Record contribution</span>
                                        <span class="mt-1 block text-sm text-emerald-50">Store KES 2,000 payment</span>
                                    </button>
                                    <button data-action="loan" class="queue-action tap-target rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-4 text-left text-white transition hover:-translate-y-0.5">
                                        <span class="block text-base font-bold">Request loan</span>
                                        <span class="mt-1 block text-sm text-sky-50">Queue KES 15,000 request</span>
                                    </button>
                                    <button id="open-tips-inline" class="tap-target rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/8">
                                        <span class="block text-base font-bold text-white">Open money tips</span>
                                        <span class="mt-1 block text-sm text-slate-300">Read simple chama guidance</span>
                                    </button>
                                </div>
                            </section>
                        </aside>
                    </section>

                    <section class="reveal mt-6 app-card p-5 sm:p-6">
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 class="section-title">Members</h2>
                                <p class="section-copy mt-1">See the full group member list with each person&apos;s role and whether they are active.</p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button id="add-member" class="tap-target rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                                    Add
                                </button>
                                ${isChairman
                                    ? `
                                        <button id="approve-join-request" class="tap-target rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                                            Approve join
                                        </button>
                                        <button id="mark-quit-request" class="tap-target rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/8">
                                            Mark quit
                                        </button>
                                    `
                                    : `
                                        <span class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
                                            Join and quit requests are handled by the chairman
                                        </span>
                                    `}
                            </div>
                        </div>
                        <div class="member-top-summary mt-6">
                            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p class="member-roster-kicker">At the top</p>
                                    <h3 class="member-roster-title">Member names in this group</h3>
                                </div>
                                <span class="member-roster-count">${members.length} members in the group</span>
                            </div>
                            <div class="member-top-names mt-4">
                                ${members.map(function (member) {
                                    return `
                                        <span class="member-top-chip">${member.name}</span>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                        <div class="join-flow-panel mt-6">
                            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p class="member-roster-kicker">New here?</p>
                                    <h3 class="member-roster-title">How new members join this group</h3>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">A new person sends a join request with their name, phone number, and role. The chairman reviews the request, then approves it into the active members list.</p>
                                </div>
                                <button id="open-join-request" class="tap-target rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15">
                                    Request to join
                                </button>
                            </div>
                            <div class="join-steps mt-4">
                                <span class="join-step-chip">1. Request</span>
                                <span class="join-step-chip">2. Pending approval</span>
                                <span class="join-step-chip">3. Chairman approves</span>
                                <span class="join-step-chip">4. Member becomes active</span>
                            </div>
                        </div>
                        <div class="member-roster-panel mt-6">
                            <div class="member-roster-heading">
                                <div>
                                    <p class="member-roster-kicker">Join requests</p>
                                    <h3 class="member-roster-title">Pending requests to join this group</h3>
                                </div>
                                <span class="member-roster-count">${joinRequests.length} pending</span>
                            </div>
                            <div class="mt-4 grid gap-3">
                                ${joinRequests.length
                                    ? joinRequests.map(function (request) {
                                        return PendingJoinRequest(request, isChairman);
                                    }).join("")
                                    : `
                                        <div class="empty-join-state">
                                            No pending join requests yet. New members can use the request button to ask to join this group.
                                        </div>
                                    `}
                            </div>
                        </div>
                        <div class="member-roster-panel mt-6">
                            <div class="member-roster-heading">
                                <div>
                                    <p class="member-roster-kicker">Group roster</p>
                                    <h3 class="member-roster-title">List of users and members in the group</h3>
                                </div>
                                <span class="member-roster-count">${members.length} members</span>
                            </div>
                            <div class="member-list-labels mt-4">
                                <span>Name</span>
                                <span>Role</span>
                                <span>Status</span>
                            </div>
                            <div class="mt-3 grid gap-3">
                                ${members.map(MemberListItem).join("")}
                            </div>
                        </div>
                        <div id="member-directory" class="mt-6 grid gap-4 lg:grid-cols-2">
                            ${members.map(MemberDirectory).join("")}
                        </div>
                    </section>

                    <section class="reveal mt-6 app-card p-5 sm:p-6">
                        <div class="flex items-center justify-between gap-4">
                            <div>
                                <h2 class="section-title">Member Profile Trust Scores</h2>
                                <p class="section-copy mt-1">Reputation comes from contribution consistency. Loan reliability comes from repayment history.</p>
                            </div>
                        </div>
                        <div id="member-profiles" class="mt-6 grid gap-4 lg:grid-cols-2">
                            ${members.map(TrustScore).join("")}
                        </div>
                    </section>

                    <section id="learn" class="reveal mt-6 app-card p-5 sm:p-6">
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 class="section-title">Financial Education</h2>
                                <p class="section-copy mt-1">Simple tips in everyday language with Kenyan examples.</p>
                            </div>
                            <p class="text-sm font-medium text-slate-500">Low-data reading for members and leaders</p>
                        </div>
                        <div class="mt-6">
                            ${TipsSection()}
                        </div>
                    </section>
                </main>

                <div id="chat-modal" class="fixed inset-0 z-50 hidden bg-slate-950/45 px-4 py-6">
                    <div class="mx-auto flex h-full max-w-md items-end sm:items-center">
                        <section class="flex h-[min(85vh,42rem)] w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#091320] shadow-2xl">
                            <header class="flex items-center justify-between bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-4 text-white">
                                <div class="flex items-center gap-3">
                                    <div class="rounded-2xl bg-white/15 p-2">
                                        ${icon("chat", "h-5 w-5")}
                                    </div>
                                    <div>
                                        <h2 class="text-sm font-bold">Chama Assistant</h2>
                                        <p id="chat-mode-label" class="text-xs text-emerald-50">Bot is on and group chat history is saved</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button id="toggle-bot" class="tap-target rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15">Turn bot off</button>
                                    <button id="close-chat" class="tap-target rounded-2xl px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10">Close</button>
                                </div>
                            </header>
                            <div id="chat-log" class="chat-log flex-1 overflow-y-auto px-4 py-4"></div>
                            <div class="border-t border-white/10 bg-[#091320] p-4">
                                <div class="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                                    <span>Members can communicate here in the group chat.</span>
                                    <span id="chat-history-count" class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">0 messages</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <button data-chat-quick="balance" class="chat-quick tap-target rounded-2xl bg-emerald-600 px-3 py-3 text-sm font-semibold text-white">Check Balance</button>
                                    <button data-chat-quick="reminder" class="chat-quick tap-target rounded-2xl bg-sky-600 px-3 py-3 text-sm font-semibold text-white">Reminder</button>
                                </div>
                                <div class="mt-3 flex gap-2">
                                    <label for="chat-input" class="sr-only">Type a message</label>
                                    <input id="chat-input" type="text" placeholder="Write a group message or ask the bot something" class="tap-target min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                                    <button id="send-chat" class="tap-target rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800">
                                        ${icon("send", "h-5 w-5")}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div id="join-request-modal" class="fixed inset-0 z-50 hidden bg-slate-950/55 px-4 py-6">
                    <div class="mx-auto flex h-full max-w-lg items-end sm:items-center">
                        <section class="join-request-modal-card w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#091320] shadow-2xl">
                            <header class="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-blue-500 px-5 py-4 text-white">
                                <div>
                                    <h2 class="text-base font-bold">Request to join this group</h2>
                                    <p class="mt-1 text-xs text-emerald-50">A chairman approves new members before they become active.</p>
                                </div>
                                <button id="close-join-request" class="tap-target rounded-2xl px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10">Close</button>
                            </header>
                            <form id="join-request-form" class="grid gap-4 p-5">
                                <div>
                                    <label for="join-name" class="sr-only">Full name</label>
                                    <input id="join-name" type="text" placeholder="Full name" class="join-input" required>
                                </div>
                                <div class="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label for="join-phone" class="sr-only">Phone number</label>
                                        <input id="join-phone" type="text" placeholder="Phone number" class="join-input" required>
                                    </div>
                                    <div>
                                        <label for="join-role" class="sr-only">Role</label>
                                        <select id="join-role" class="join-input" required>
                                            <option value="Chairman">Chairman</option>
                                            <option value="Member">Member</option>
                                            <option value="Secretary">Secretary</option>
                                            <option value="Treasurer">Treasurer</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label for="join-referral" class="sr-only">Referral</label>
                                    <input id="join-referral" type="text" placeholder="Who referred you? Optional" class="join-input">
                                </div>
                                <p class="text-sm leading-6 text-slate-300">Your request will appear in the pending list until the chairman approves it.</p>
                                <div class="flex flex-col gap-3 sm:flex-row">
                                    <button type="submit" class="tap-target rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                                        Send join request
                                    </button>
                                    <button id="cancel-join-request" type="button" class="tap-target rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/8">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        `;
    }

    function createToast(message, tone) {
        const stack = document.getElementById("toast-stack");
        const toneClasses = {
            success: "bg-emerald-600",
            info: "bg-slate-900",
            warning: "bg-amber-500"
        };

        const toast = document.createElement("div");
        toast.className = "toast-item pointer-events-auto rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-xl " + (toneClasses[tone] || toneClasses.info);
        toast.textContent = message;
        stack.appendChild(toast);

        setTimeout(function () {
            toast.remove();
        }, 2800);
    }

    function OnlineQueueManager() {
        const offlineBanner = document.getElementById("offline-banner");
        const offlineCount = document.getElementById("offline-count");
        let queue = loadQueue();
        let online = navigator.onLine;
        let syncing = false;

        function updateBanner() {
            if (offlineCount) {
                offlineCount.textContent = queue.length + " queued";
            }

            if (!offlineBanner) {
                return;
            }

            if (!online) {
                offlineBanner.classList.add("show");
                window.clearTimeout(updateBanner.hideTimer);
                updateBanner.hideTimer = setTimeout(function () {
                    offlineBanner.classList.remove("show");
                }, 3200);
            } else {
                offlineBanner.classList.remove("show");
            }
        }

        function addQueuedAction(type, payload) {
            const entry = {
                id: Date.now() + Math.random(),
                type: type,
                payload: payload,
                queuedAt: new Date().toISOString()
            };
            queue.unshift(entry);
            saveQueue(queue);
            updateBanner();
            return entry;
        }

        function appendActivity(text, tone) {
            const updated = [
                {
                    text: text,
                    time: "Just now",
                    tone: tone
                }
            ].concat(loadActivity());
            saveActivity(updated);
            document.getElementById("activity-list").innerHTML = renderActivity(loadActivity());
        }

        function syncQueuedActions() {
            if (!online || syncing || !queue.length) {
                return;
            }

            syncing = true;
            createToast("Syncing " + queue.length + " saved actions...", "info");

            setTimeout(function () {
                queue.forEach(function (entry) {
                    if (entry.type === "contribution") {
                        appendActivity("Queued contribution synced for " + formatCurrency(entry.payload.amount), "trusted");
                    }
                    if (entry.type === "loan") {
                        appendActivity("Queued loan request synced for " + formatCurrency(entry.payload.amount), "moderate");
                    }
                });

                queue = [];
                saveQueue(queue);
                syncing = false;
                updateBanner();
                createToast("Offline actions synced successfully.", "success");
            }, 1400);
        }

        window.addEventListener("online", function () {
            online = true;
            updateBanner();
            syncQueuedActions();
        });

        window.addEventListener("offline", function () {
            online = false;
            updateBanner();
            createToast("You are offline. New actions will be saved on this device.", "warning");
        });

        updateBanner();

        return {
            queueAction: function (type, payload, onlineMessage, queuedMessage) {
                if (!online) {
                    addQueuedAction(type, payload);
                    createToast(queuedMessage, "warning");
                    return;
                }

                appendActivity(onlineMessage, type === "contribution" ? "trusted" : "moderate");
                createToast("Saved successfully.", "success");
            },
            forceSync: syncQueuedActions
        };
    }

    function ChatUI(summary, members) {
        const modal = document.getElementById("chat-modal");
        const log = document.getElementById("chat-log");
        const input = document.getElementById("chat-input");
        const openButton = document.getElementById("open-chat");
        const closeButton = document.getElementById("close-chat");
        const sendButton = document.getElementById("send-chat");
        const toggleBotButton = document.getElementById("toggle-bot");
        const modeLabel = document.getElementById("chat-mode-label");
        const historyCount = document.getElementById("chat-history-count");
        let chatHistory = loadChatHistory();
        let botEnabled = isBotEnabled();

        if (!modal || !log || !input || !openButton || !closeButton || !sendButton || !toggleBotButton || !modeLabel || !historyCount) {
            return;
        }

        function updateChatMeta() {
            toggleBotButton.textContent = botEnabled ? "Turn bot off" : "Turn bot on";
            modeLabel.textContent = botEnabled
                ? "Bot is on and group chat history is saved"
                : "Bot is off. Members can still chat with each other";
            historyCount.textContent = chatHistory.length + (chatHistory.length === 1 ? " message" : " messages");
        }

        function addBubble(message, author) {
            const row = document.createElement("div");
            const isUser = author === "user";
            const isMember = author === "member";
            row.className = "mb-3 flex " + (isUser ? "justify-end" : "justify-start");

            const bubble = document.createElement("div");
            bubble.className = "chat-bubble " + (isUser ? "user" : isMember ? "member" : "bot");
            bubble.textContent = message;

            row.appendChild(bubble);
            log.appendChild(row);
            log.scrollTop = log.scrollHeight;
        }

        function addMessage(message, author) {
            chatHistory.push({ author: author, message: message });
            saveChatHistory(chatHistory);
            addBubble(message, author);
            updateChatMeta();
        }

        function renderHistory() {
            log.innerHTML = "";
            chatHistory.forEach(function (entry) {
                addBubble(entry.message, entry.author);
            });
            updateChatMeta();
        }

        function addTyping(callback) {
            const row = document.createElement("div");
            row.className = "mb-3 flex justify-start";
            row.id = "typing";

            const bubble = document.createElement("div");
            bubble.className = "chat-bubble bot";
            bubble.innerHTML = '<div class="flex gap-1"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
            row.appendChild(bubble);
            log.appendChild(row);
            log.scrollTop = log.scrollHeight;

            setTimeout(function () {
                row.remove();
                callback();
            }, 900);
        }

        function respond(kind) {
            const trustedCount = members.filter(function (member) {
                return averageScore(member) >= 80;
            }).length;

            const replies = {
                balance:
                    "Balance update\n\nAvailable balance: " +
                    formatCurrency(summary.availableBalance) +
                    "\nTotal contributions: " +
                    formatCurrency(summary.totalContributions) +
                    "\nActive loans: " +
                    formatCurrency(summary.activeLoans) +
                    "\n\nLast checked just now.",
                reminder:
                    "Reminder ready\n\nI have prepared a friendly reminder for members with upcoming payments.\n\n'Hello, please remember your chama payment this week. Thank you.'",
                loans:
                    "Loan update\n\n3 active loans are running.\nMost reliable borrower: John Doe.\nMember needing support: Peter Kamau.",
                members:
                    "Member summary\n\nTrusted members: " +
                    trustedCount +
                    "\nModerate members: 1\nRisky members: 1\n\nTop badge: Trusted Member"
            };

            addTyping(function () {
                addMessage(replies[kind] || "I can help with balance, reminders, loans, and member trust updates.", "bot");
            });
        }

        renderHistory();

        openButton.addEventListener("click", function () {
            modal.classList.remove("hidden");
        });

        closeButton.addEventListener("click", function () {
            modal.classList.add("hidden");
        });

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.classList.add("hidden");
            }
        });

        document.querySelectorAll(".chat-quick").forEach(function (button) {
            button.addEventListener("click", function () {
                const kind = button.getAttribute("data-chat-quick");
                addMessage("You: " + button.textContent.trim(), "user");
                if (botEnabled) {
                    respond(kind === "reminder" ? "reminder" : "balance");
                    return;
                }
                createToast("Bot is off. Turn it on for automated replies.", "info");
            });
        });

        function sendCustomMessage() {
            const message = input.value.trim();
            if (!message) {
                return;
            }

            addMessage("You: " + message, "user");
            input.value = "";

            if (!botEnabled) {
                createToast("Group message sent. The bot is currently off.", "info");
                return;
            }

            const lowered = message.toLowerCase();
            if (lowered.includes("balance") || lowered.includes("money")) {
                respond("balance");
                return;
            }
            if (lowered.includes("remind")) {
                respond("reminder");
                return;
            }
            if (lowered.includes("loan") || lowered.includes("borrow")) {
                respond("loans");
                return;
            }
            if (lowered.includes("member") || lowered.includes("trust")) {
                respond("members");
                return;
            }

            respond("help");
        }

        toggleBotButton.addEventListener("click", function () {
            botEnabled = !botEnabled;
            saveBotEnabled(botEnabled);
            updateChatMeta();
            createToast(botEnabled ? "Bot turned on." : "Bot turned off. Members can still chat.", "info");
        });

        sendButton.addEventListener("click", sendCustomMessage);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                sendCustomMessage();
            }
        });
    }

    function wireInteractions() {
        const offlineManager = OnlineQueueManager();
        ChatUI(data.summary, getMembersWithCurrentProfile());
        const joinRequestModal = document.getElementById("join-request-modal");
        const openJoinRequestButton = document.getElementById("open-join-request");
        const closeJoinRequestButton = document.getElementById("close-join-request");
        const cancelJoinRequestButton = document.getElementById("cancel-join-request");
        const joinRequestForm = document.getElementById("join-request-form");

        document.querySelectorAll(".queue-action").forEach(function (button) {
            button.addEventListener("click", function () {
                const action = button.getAttribute("data-action");

                if (action === "contribution") {
                    offlineManager.queueAction(
                        "contribution",
                        { amount: 2000, memberId: "current-user" },
                        "Contribution saved for KES 2,000.",
                        "Contribution saved offline. It will sync when you reconnect."
                    );
                }

                if (action === "loan") {
                    offlineManager.queueAction(
                        "loan",
                        { amount: 15000, purpose: "School fees" },
                        "Loan request saved for KES 15,000.",
                        "Loan request saved offline. It will sync when you reconnect."
                    );
                }
            });
        });

        document.getElementById("simulate-reminder").addEventListener("click", function () {
            createToast("Friendly reminder prepared for members with upcoming payments.", "info");
        });

        document.getElementById("open-tips-inline").addEventListener("click", function () {
            const section = document.getElementById("learn");
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });

        const approveJoinButton = document.getElementById("approve-join-request");
        if (approveJoinButton) {
            approveJoinButton.addEventListener("click", function () {
                const requests = loadJoinRequests();
                if (!requests.length) {
                    createToast("There are no pending join requests right now.", "info");
                    return;
                }

                approveJoinRequest(requests[0].id);
            });
        }

        const addMemberButton = document.getElementById("add-member");
        if (addMemberButton) {
            addMemberButton.addEventListener("click", function () {
                if (joinRequestModal) {
                    joinRequestModal.classList.remove("hidden");
                }
            });
        }

        const markQuitButton = document.getElementById("mark-quit-request");
        if (markQuitButton) {
            markQuitButton.addEventListener("click", function () {
                createToast("Quit request recorded by the chairman.", "info");
            });
        }

        if (openJoinRequestButton && joinRequestModal) {
            openJoinRequestButton.addEventListener("click", function () {
                joinRequestModal.classList.remove("hidden");
            });
        }

        if (closeJoinRequestButton && joinRequestModal) {
            closeJoinRequestButton.addEventListener("click", function () {
                joinRequestModal.classList.add("hidden");
            });
        }

        if (cancelJoinRequestButton && joinRequestModal) {
            cancelJoinRequestButton.addEventListener("click", function () {
                joinRequestModal.classList.add("hidden");
            });
        }

        if (joinRequestModal) {
            joinRequestModal.addEventListener("click", function (event) {
                if (event.target === joinRequestModal) {
                    joinRequestModal.classList.add("hidden");
                }
            });
        }

        if (joinRequestForm) {
            joinRequestForm.addEventListener("submit", function (event) {
                event.preventDefault();

                const request = {
                    id: Date.now(),
                    name: document.getElementById("join-name").value.trim(),
                    phone: document.getElementById("join-phone").value.trim(),
                    role: document.getElementById("join-role").value,
                    referral: document.getElementById("join-referral").value.trim(),
                    status: "Pending",
                    requestedAt: new Date().toISOString()
                };

                if (!request.name || !request.phone) {
                    createToast("Please enter the new member's name and phone number.", "warning");
                    return;
                }

                const requests = loadJoinRequests();
                requests.unshift(request);
                saveJoinRequests(requests);
                joinRequestForm.reset();
                joinRequestModal.classList.add("hidden");
                createToast("Join request sent. It is now waiting for approval.", "success");
                rerenderDashboard();
            });
        }

        document.querySelectorAll("[data-approve-request]").forEach(function (button) {
            button.addEventListener("click", function () {
                approveJoinRequest(button.getAttribute("data-approve-request"));
            });
        });

        document.querySelectorAll("[data-reject-request]").forEach(function (button) {
            button.addEventListener("click", function () {
                const requestId = button.getAttribute("data-reject-request");
                const requests = loadJoinRequests().filter(function (request) {
                    return String(request.id) !== String(requestId);
                });
                saveJoinRequests(requests);
                createToast("Join request rejected.", "info");
                rerenderDashboard();
            });
        });

        offlineManager.forceSync();
    }

    function approveJoinRequest(requestId) {
        const requests = loadJoinRequests();
        const request = requests.find(function (item) {
            return String(item.id) === String(requestId);
        });

        if (!request) {
            createToast("That join request could not be found.", "warning");
            return;
        }

        const approvedMembers = loadApprovedMembers();
        approvedMembers.unshift({
            id: request.id,
            name: request.name,
            role: request.role,
            status: "Active",
            joined: "Approved today",
            phone: request.phone,
            contributionsConsistency: 72,
            repaymentHistory: 70,
            badges: ["New Member"],
            groupName: request.groupName || localStorage.getItem("chama_group_name") || "My Chama",
            groupType: request.groupType || localStorage.getItem("chama_group_type") || ""
        });
        saveApprovedMembers(approvedMembers);
        saveJoinRequests(requests.filter(function (item) {
            return String(item.id) !== String(requestId);
        }));
        createToast(request.name + " has joined the group.", "success");
        rerenderDashboard();
    }

    function observeReveals() {
        const reveals = document.querySelectorAll(".reveal");
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        reveals.forEach(function (element) {
            revealObserver.observe(element);
        });
    }

    function rerenderDashboard() {
        const root = document.getElementById("app");
        if (!root) {
            return;
        }

        buildDashboard(root);
        wireInteractions();
        observeReveals();
    }

    function init() {
        const root = document.getElementById("app");
        if (!root) {
            return;
        }

        buildDashboard(root);
        wireInteractions();
        observeReveals();
    }

    document.addEventListener("DOMContentLoaded", init);
}());
