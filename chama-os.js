(function () {
    const STORAGE_KEY = "chama-os-demo-state-v2";
    const QUEUE_KEY = "chama-os-offline-queue-v2";
    const GROUP_STORAGE_KEY = "chama_group_type";
    const GROUP_LABEL_STORAGE_KEY = "chama_group_type_label";

    const GROUPS = {
        sacco: {
            label: "SACCO",
            eyebrow: "Structured finance",
            description: "Track savings, loans, repayments, and available funds in one clear dashboard.",
            summary: "Built for disciplined savings groups with stronger governance and recurring contributions."
        },
        rosca: {
            label: "Rotating Savings (ROSCA)",
            eyebrow: "Rotation flow",
            description: "Follow the pot, see who receives next, and keep the cycle visible for every member.",
            summary: "Ideal for fixed contribution groups where one member receives the full pot each round."
        },
        table_banking: {
            label: "Table Banking",
            eyebrow: "Meeting-first workflow",
            description: "Record attendance, contributions, and meeting loans in a simple session-based view.",
            summary: "Designed for groups that collect and approve funds during scheduled meetings."
        },
        women_group: {
            label: "Women-led Group",
            eyebrow: "Simple and trust-first",
            description: "Use a calmer dashboard with trust score, financial tips, and friendly language.",
            summary: "Focused on clarity, trust, participation, and confidence for every member."
        }
    };

    const MEMBER_DIRECTORY = {
        john: "John Kamau",
        mary: "Mary Wanjiku",
        peter: "Peter Otieno",
        lucy: "Lucy Achieng",
        faith: "Faith Njeri"
    };

    const initialState = {
        groupName: "My Chama",
        totals: {
            contributions: 245000,
            activeLoans: 85000,
            availableBalance: 160000,
            repayments: 32000,
            dividendsReserve: 24000
        },
        members: [
            {
                id: "john",
                name: "John Kamau",
                role: "Treasurer",
                status: "Active",
                reputationScore: 94,
                loanReliabilityScore: 91,
                contributionConsistency: "Pays on time every month",
                repaymentHistory: "All loans cleared on time"
            },
            {
                id: "mary",
                name: "Mary Wanjiku",
                role: "Secretary",
                status: "Active",
                reputationScore: 76,
                loanReliabilityScore: 82,
                contributionConsistency: "Missed one contribution this quarter",
                repaymentHistory: "Usually pays on time"
            },
            {
                id: "peter",
                name: "Peter Otieno",
                role: "Member",
                status: "Not active",
                reputationScore: 49,
                loanReliabilityScore: 41,
                contributionConsistency: "Often pays late",
                repaymentHistory: "Two repayments are overdue"
            },
            {
                id: "lucy",
                name: "Lucy Achieng",
                role: "Chairlady",
                status: "Active",
                reputationScore: 88,
                loanReliabilityScore: 85,
                contributionConsistency: "Encourages timely saving",
                repaymentHistory: "Maintains clear follow-up notes"
            }
        ],
        activities: [
            {
                id: "act-1",
                type: "contribution",
                member: "John Kamau",
                amount: 5000,
                note: "Monthly contribution received",
                status: "trusted",
                time: "2 hours ago"
            },
            {
                id: "act-2",
                type: "loan",
                member: "Mary Wanjiku",
                amount: 15000,
                note: "Loan approved for school fees",
                status: "moderate",
                time: "Yesterday"
            },
            {
                id: "act-3",
                type: "reminder",
                member: "System",
                amount: 0,
                note: "Repayment reminder sent to late members",
                status: "risky",
                time: "2 days ago"
            }
        ],
        rosca: {
            fixedContribution: 2000,
            rotationOrder: ["mary", "john", "lucy", "peter"],
            currentCycleIndex: 1,
            cyclesCompleted: 5,
            totalCycles: 12,
            nextPayoutDate: "12 Apr 2026"
        },
        tableBanking: {
            nextMeetingDate: "09 Apr 2026",
            loansIssuedThisMonth: 32000,
            meetingContributionTotal: 54000,
            attendanceRate: 84,
            meetings: [
                {
                    id: "meeting-1",
                    meetingDate: "02 Apr 2026",
                    attendanceText: "18 / 20 members",
                    contributionAmount: 18000,
                    loansIssued: 12000
                },
                {
                    id: "meeting-2",
                    meetingDate: "26 Mar 2026",
                    attendanceText: "19 / 20 members",
                    contributionAmount: 20000,
                    loansIssued: 8000
                },
                {
                    id: "meeting-3",
                    meetingDate: "19 Mar 2026",
                    attendanceText: "17 / 20 members",
                    contributionAmount: 16000,
                    loansIssued: 12000
                }
            ]
        },
        womenGroup: {
            trustScore: 88,
            trustNote: "Members understand where funds are, who borrowed, and what happens next.",
            largeActions: [
                "Record contribution",
                "Check trust score",
                "Read today’s tip"
            ]
        }
    };

    function cloneInitialState() {
        return JSON.parse(JSON.stringify(initialState));
    }

    function mergeState(stored) {
        return {
            ...cloneInitialState(),
            ...stored,
            totals: {
                ...cloneInitialState().totals,
                ...(stored?.totals || {})
            },
            rosca: {
                ...cloneInitialState().rosca,
                ...(stored?.rosca || {})
            },
            tableBanking: {
                ...cloneInitialState().tableBanking,
                ...(stored?.tableBanking || {})
            },
            womenGroup: {
                ...cloneInitialState().womenGroup,
                ...(stored?.womenGroup || {})
            },
            activities: Array.isArray(stored?.activities) && stored.activities.length ? stored.activities : cloneInitialState().activities,
            members: Array.isArray(stored?.members) && stored.members.length ? stored.members : cloneInitialState().members
        };
    }

    function readState() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? mergeState(JSON.parse(stored)) : cloneInitialState();
        } catch (error) {
            return cloneInitialState();
        }
    }

    function writeState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function readQueue() {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    }

    function writeQueue(queue) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }

    function formatKES(amount) {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0
        }).format(Number(amount || 0)).replace("Ksh", "KES");
    }

    function normalizeGroupType(groupType = "") {
        const aliases = {
            "SACCOs": "sacco",
            "SACCO": "sacco",
            "Rotating savings (ROSCA)": "rosca",
            "Table Banking": "table_banking",
            "Women-led chamas": "women_group",
            "Women-led Group": "women_group"
        };

        const normalized = aliases[groupType] || groupType;
        return GROUPS[normalized] ? normalized : "sacco";
    }

    function getStoredGroupType() {
        return normalizeGroupType(localStorage.getItem(GROUP_STORAGE_KEY) || "sacco");
    }

    function getStoredGroupLabel(groupType) {
        return localStorage.getItem(GROUP_LABEL_STORAGE_KEY) || GROUPS[groupType].label;
    }

    function useGroupType() {
        const value = getStoredGroupType();
        const config = GROUPS[value];

        return {
            value,
            label: getStoredGroupLabel(value),
            config
        };
    }

    function saveGroupType(groupType) {
        const normalized = normalizeGroupType(groupType);
        localStorage.setItem(GROUP_STORAGE_KEY, normalized);
        localStorage.setItem(GROUP_LABEL_STORAGE_KEY, GROUPS[normalized].label);
        return normalized;
    }

    function memberNameById(memberId) {
        return MEMBER_DIRECTORY[memberId] || memberId;
    }

    function getRoscaCurrentRecipient(state) {
        const order = state.rosca.rotationOrder || [];
        if (!order.length) {
            return "No member selected";
        }

        const safeIndex = state.rosca.currentCycleIndex % order.length;
        return memberNameById(order[safeIndex]);
    }

    function getRoscaNextRecipient(state) {
        const order = state.rosca.rotationOrder || [];
        if (!order.length) {
            return "No member selected";
        }

        const safeIndex = (state.rosca.currentCycleIndex + 1) % order.length;
        return memberNameById(order[safeIndex]);
    }

    function getRoscaCurrentPot(state) {
        return (state.rosca.fixedContribution || 0) * state.members.length;
    }

    const TrustScore = {
        getLevel(score) {
            if (score >= 80) {
                return {
                    label: "Trusted",
                    barClass: "from-emerald-400 to-emerald-500",
                    pillClass: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/20"
                };
            }

            if (score >= 55) {
                return {
                    label: "Steady",
                    barClass: "from-amber-300 to-amber-400",
                    pillClass: "bg-amber-500/15 text-amber-100 border border-amber-300/20"
                };
            }

            return {
                label: "Needs support",
                barClass: "from-rose-400 to-rose-500",
                pillClass: "bg-rose-500/15 text-rose-100 border border-rose-300/20"
            };
        },

        renderSummary(state) {
            const averageScore = Math.round(
                state.members.reduce((sum, member) => sum + member.reputationScore, 0) / state.members.length
            );
            const reliableBorrowers = state.members.filter((member) => member.loanReliabilityScore >= 80).length;
            const followUps = state.members.filter((member) => member.reputationScore < 55 || member.loanReliabilityScore < 55).length;

            const items = [
                { label: "Trust score", value: `${averageScore}/100` },
                { label: "Reliable borrowers", value: reliableBorrowers },
                { label: "Need follow-up", value: followUps }
            ];

            return `
                <div class="grid gap-3 sm:grid-cols-3">
                    ${items.map((item) => `
                        <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">${item.label}</p>
                            <p class="mt-3 text-2xl font-extrabold text-white">${item.value}</p>
                        </div>
                    `).join("")}
                </div>
            `;
        },

        renderMembers(state) {
            return state.members.map((member) => {
                const reputation = this.getLevel(member.reputationScore);
                const reliability = this.getLevel(member.loanReliabilityScore);
                const memberStatusClass = member.status === "Active"
                    ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/20"
                    : "bg-rose-500/15 text-rose-100 border border-rose-300/20";

                return `
                    <article class="member-card">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <h4 class="text-base font-bold text-white">${member.name}</h4>
                                <p class="text-sm text-slate-400">${member.role}</p>
                            </div>
                            <span class="rounded-full px-3 py-1 text-xs font-semibold ${reputation.pillClass}">${reputation.label}</span>
                        </div>
                        <div class="mt-4 flex flex-wrap gap-2">
                            <span class="rounded-full px-3 py-1 text-xs font-semibold ${memberStatusClass}">${member.status}</span>
                            <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">${member.role}</span>
                        </div>
                        <div class="mt-4 space-y-3">
                            <div>
                                <div class="mb-2 flex items-center justify-between text-sm">
                                    <span class="text-slate-400">Reputation</span>
                                    <span class="font-semibold text-white">${member.reputationScore}/100</span>
                                </div>
                                <div class="progress-track"><span class="bg-gradient-to-r ${reputation.barClass}" style="width:${member.reputationScore}%"></span></div>
                                <p class="mt-2 text-xs text-slate-400">${member.contributionConsistency}</p>
                            </div>
                            <div>
                                <div class="mb-2 flex items-center justify-between text-sm">
                                    <span class="text-slate-400">Loan reliability</span>
                                    <span class="font-semibold text-white">${member.loanReliabilityScore}/100</span>
                                </div>
                                <div class="progress-track"><span class="bg-gradient-to-r ${reliability.barClass}" style="width:${member.loanReliabilityScore}%"></span></div>
                                <p class="mt-2 text-xs text-slate-400">${member.repaymentHistory}</p>
                            </div>
                        </div>
                    </article>
                `;
            }).join("");
        },

        renderMemberDirectory(state) {
            return state.members.map((member) => {
                const statusClass = member.status === "Active"
                    ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/20"
                    : "bg-rose-500/15 text-rose-100 border border-rose-300/20";

                return `
                    <article class="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <h4 class="text-base font-bold text-white">${member.name}</h4>
                                <p class="mt-1 text-sm text-slate-300">${member.role}</p>
                            </div>
                            <span class="rounded-full px-3 py-1 text-xs font-semibold ${statusClass}">${member.status}</span>
                        </div>
                    </article>
                `;
            }).join("");
        },

        renderPanel(state) {
            const trustScore = state.womenGroup.trustScore;
            const level = this.getLevel(trustScore);

            return `
                <div class="glass-panel p-6">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Trust Score</p>
                            <h3 class="mt-2 text-3xl font-extrabold text-white">${trustScore}/100</h3>
                        </div>
                        <span class="rounded-full px-3 py-1 text-xs font-semibold ${level.pillClass}">${level.label}</span>
                    </div>
                    <p class="mt-4 text-sm leading-7 text-slate-300">${state.womenGroup.trustNote}</p>
                    <div class="mt-4 progress-track"><span class="bg-gradient-to-r ${level.barClass}" style="width:${trustScore}%"></span></div>
                </div>
            `;
        }
    };

    const TipsSection = {
        items: {
            sacco: [
                "Keep dividend rules simple and written down before the year closes.",
                "Show total savings, loans out, and available funds after every update."
            ],
            rosca: [
                "Use one fixed contribution amount so each round feels predictable.",
                "Make the next recipient visible before the meeting starts."
            ],
            table_banking: [
                "Record attendance first. It keeps meeting decisions fair and easier to explain later.",
                "Capture contributions and loan decisions before members leave the room."
            ],
            women_group: [
                "Use short explanations and larger actions so every member can follow with confidence.",
                "Celebrate on-time saving. Positive visibility builds trust faster than pressure."
            ]
        },

        render(groupType) {
            const tips = this.items[groupType] || this.items.sacco;
            return `
                <div class="glass-panel p-6">
                    <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Tips</p>
                    <div class="mt-4 space-y-3">
                        ${tips.map((tip, index) => `
                            <article class="tip-card">
                                <span class="tip-kicker">Tip ${index + 1}</span>
                                <p class="mt-3 text-sm leading-7 text-slate-200">${tip}</p>
                            </article>
                        `).join("")}
                    </div>
                </div>
            `;
        }
    };

    const GroupTypeSelector = {
        render(currentGroup) {
            return `
                <div class="flex flex-wrap gap-3">
                    ${Object.entries(GROUPS).map(([value, config]) => `
                        <button
                            type="button"
                            class="group-switch ${value === currentGroup ? "is-active" : ""}"
                            data-switch-group="${value}"
                        >
                            ${config.label}
                        </button>
                    `).join("")}
                </div>
            `;
        }
    };

    const RotationTracker = {
        render(state) {
            const cyclesCompleted = state.rosca.cyclesCompleted;
            const totalCycles = state.rosca.totalCycles || 1;
            const progress = Math.min(Math.round((cyclesCompleted / totalCycles) * 100), 100);

            return `
                <section class="glass-panel p-6">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Rotation Tracker</p>
                            <h3 class="mt-2 text-2xl font-bold text-white">Next to receive: ${getRoscaNextRecipient(state)}</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-300">Each cycle one member receives the full pot. The order stays visible so everyone knows what comes next.</p>
                        </div>
                        <div class="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Current cycle</p>
                            <p class="mt-2 text-2xl font-extrabold text-white">${cyclesCompleted} / ${totalCycles}</p>
                        </div>
                    </div>
                    <div class="mt-5 progress-track"><span class="bg-gradient-to-r from-blue-400 to-emerald-400" style="width:${progress}%"></span></div>
                    <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        ${(state.rosca.rotationOrder || []).map((memberId, index) => `
                            <article class="rounded-3xl border ${index === state.rosca.currentCycleIndex ? "border-emerald-300/40 bg-emerald-500/10" : "border-white/10 bg-white/5"} p-4">
                                <p class="text-xs font-bold uppercase tracking-[0.22em] ${index === state.rosca.currentCycleIndex ? "text-emerald-200" : "text-slate-500"}">Position ${index + 1}</p>
                                <h4 class="mt-3 text-base font-bold text-white">${memberNameById(memberId)}</h4>
                                <p class="mt-2 text-sm text-slate-300">${index === state.rosca.currentCycleIndex ? "Receiving now" : "Waiting in queue"}</p>
                            </article>
                        `).join("")}
                    </div>
                </section>
            `;
        }
    };

    const MeetingManager = {
        render(state) {
            return `
                <section class="glass-panel p-6">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Meeting Manager</p>
                            <h3 class="mt-2 text-2xl font-bold text-white">Next meeting: ${state.tableBanking.nextMeetingDate}</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-300">Track attendance, what was collected, and how much was lent out in each sitting.</p>
                        </div>
                        <div class="rounded-3xl border border-blue-300/20 bg-blue-500/10 px-5 py-4">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Attendance rate</p>
                            <p class="mt-2 text-2xl font-extrabold text-white">${state.tableBanking.attendanceRate}%</p>
                        </div>
                    </div>
                    <div class="mt-6 space-y-3">
                        ${state.tableBanking.meetings.map((meeting) => `
                            <article class="activity-card">
                                <div>
                                    <p class="text-sm font-semibold text-white">${meeting.meetingDate}</p>
                                    <p class="mt-2 text-sm text-slate-300">${meeting.attendanceText}</p>
                                </div>
                                <div class="grid gap-2 text-right text-sm sm:text-base">
                                    <p class="text-slate-300">Collected: <span class="font-bold text-white">${formatKES(meeting.contributionAmount)}</span></p>
                                    <p class="text-slate-300">Loans issued: <span class="font-bold text-white">${formatKES(meeting.loansIssued)}</span></p>
                                </div>
                            </article>
                        `).join("")}
                    </div>
                </section>
            `;
        }
    };

    const OfflineManager = {
        queue: readQueue(),
        isOnline: navigator.onLine,
        syncing: false,

        init(app) {
            this.app = app;
            window.addEventListener("online", () => this.handleConnectivityChange());
            window.addEventListener("offline", () => this.handleConnectivityChange());
            this.handleConnectivityChange();
        },

        handleConnectivityChange() {
            this.isOnline = navigator.onLine;
            const indicator = document.getElementById("offline-indicator");

            if (!indicator) {
                return;
            }

            if (!this.isOnline) {
                indicator.textContent = "Offline Mode is on. Your contributions and loan requests will queue safely.";
                indicator.classList.remove("hidden");
                window.clearTimeout(this.hideIndicatorTimer);
                this.hideIndicatorTimer = window.setTimeout(() => {
                    indicator.classList.add("hidden");
                }, 3200);
            }

            if (this.isOnline && this.queue.length > 0) {
                this.sync();
            }
        },

        enqueue(action) {
            this.queue.push({
                ...action,
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                queuedAt: new Date().toISOString()
            });
            writeQueue(this.queue);
            this.handleConnectivityChange();
        },

        sync() {
            if (this.syncing || this.queue.length === 0) {
                return;
            }

            this.syncing = true;
            this.app.showToast(`Syncing ${this.queue.length} queued update${this.queue.length === 1 ? "" : "s"}...`, "success");

            window.setTimeout(() => {
                const queuedActions = [...this.queue];
                this.queue = [];
                writeQueue(this.queue);
                this.syncing = false;
                this.handleConnectivityChange();
                this.app.applySyncedActions(queuedActions);
                this.app.showToast("Queued updates synced.", "success");
            }, 1200);
        }
    };

    const ChatUI = {
        init(app) {
            this.app = app;
            this.modal = document.getElementById("chat-modal");
            this.messages = document.getElementById("chat-messages");

            document.getElementById("chat-btn").addEventListener("click", () => this.open());
            document.getElementById("close-chat").addEventListener("click", () => this.close());
            document.getElementById("check-balance-btn").addEventListener("click", () => this.sendBalance());
            document.getElementById("chat-reminder-btn").addEventListener("click", () => this.sendReminder());
            this.modal.addEventListener("click", (event) => {
                if (event.target === this.modal) {
                    this.close();
                }
            });

            this.reset();
        },

        reset() {
            const group = useGroupType();
            this.messages.innerHTML = "";
            this.addBotMessage(`Hello. I can help with quick ${group.config.label.toLowerCase()} updates like checking balance or sending a reminder.`);
        },

        open() {
            this.modal.classList.remove("hidden");
        },

        close() {
            this.modal.classList.add("hidden");
        },

        addMessage(text, type) {
            const row = document.createElement("div");
            row.className = `flex ${type === "user" ? "justify-end" : "justify-start"}`;

            const bubble = document.createElement("div");
            bubble.className = `chat-bubble ${type}`;
            bubble.textContent = text;

            row.appendChild(bubble);
            this.messages.appendChild(row);
            this.messages.scrollTop = this.messages.scrollHeight;
        },

        addBotMessage(text) {
            this.addMessage(text, "bot");
        },

        addUserMessage(text) {
            this.addMessage(text, "user");
        },

        sendBalance() {
            const state = this.app.state;
            const group = useGroupType();
            this.addUserMessage("Show today’s balance");
            window.setTimeout(() => {
                if (group.value === "rosca") {
                    this.addBotMessage(`Current pot is ${formatKES(getRoscaCurrentPot(state))}. ${getRoscaCurrentRecipient(state)} receives this cycle, and ${getRoscaNextRecipient(state)} is next.`);
                    return;
                }

                if (group.value === "table_banking") {
                    this.addBotMessage(`Meeting contributions this month are ${formatKES(state.tableBanking.meetingContributionTotal)}. Loans issued during meetings total ${formatKES(state.tableBanking.loansIssuedThisMonth)}.`);
                    return;
                }

                this.addBotMessage(`Available funds are ${formatKES(state.totals.availableBalance)}. Savings stand at ${formatKES(state.totals.contributions)} and active loans at ${formatKES(state.totals.activeLoans)}.`);
            }, 350);
        },

        sendReminder() {
            this.addUserMessage("Send a friendly reminder");
            window.setTimeout(() => {
                this.addBotMessage("Reminder prepared. Members with pending actions will receive a calm follow-up message.");
                this.app.sendReminder();
            }, 350);
        }
    };

    const DashboardApp = {
        state: readState(),

        init() {
            saveGroupType(getStoredGroupType());
            this.renderShell();
            this.cacheDom();
            this.bindEvents();
            OfflineManager.init(this);
            ChatUI.init(this);
            this.render();
        },

        renderShell() {
            const app = document.getElementById("app");

            app.innerHTML = `
                <div class="dashboard-shell min-h-screen">
                    <div id="offline-indicator" class="hidden fixed left-1/2 top-4 z-40 w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border border-amber-300/20 bg-amber-500/15 px-4 py-3 text-center text-sm font-semibold text-amber-100 shadow-xl backdrop-blur">
                        Offline Mode is on. Your contributions and loan requests will queue safely.
                    </div>

                    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <header class="glass-panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                            <div class="flex items-center gap-4">
                                <img src="images/chama-icon.png" alt="ChamaConnect logo" class="h-14 w-14 rounded-2xl ring-1 ring-white/10">
                                <div>
                                    <p class="text-sm font-bold uppercase tracking-[0.28em] text-slate-400">ChamaConnect</p>
                                    <h1 class="mt-2 text-2xl font-extrabold text-white">Chama OS Dashboard</h1>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-3">
                                <a href="onboarding.html" class="secondary-button">Change group setup</a>
                                <button id="chat-btn" type="button" class="primary-button">Open assistant</button>
                            </div>
                        </header>

                        <section class="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                            <div class="glass-panel p-6 sm:p-8">
                                <p id="dashboard-eyebrow" class="text-sm font-bold uppercase tracking-[0.28em] text-slate-400"></p>
                                <h2 id="dashboard-title" class="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl"></h2>
                                <p id="dashboard-copy" class="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg"></p>
                                <div id="group-type-selector" class="mt-6"></div>
                                <div id="quick-actions" class="mt-8 grid gap-3 sm:grid-cols-3"></div>
                            </div>

                            <aside id="group-highlight" class="glass-panel p-6 sm:p-8"></aside>
                        </section>

                        <section class="mt-8" id="summary-cards"></section>

                        <section class="mt-8 grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
                            <div class="space-y-6">
                                <div id="group-feature-area" class="space-y-6"></div>
                                <section class="glass-panel p-6">
                                    <div class="flex items-center justify-between gap-4">
                                        <div>
                                            <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Recent activity</p>
                                            <h3 class="mt-2 text-2xl font-bold text-white">Latest updates</h3>
                                        </div>
                                    </div>
                                    <div id="recent-activity" class="mt-5 space-y-3"></div>
                                </section>
                            </div>

                            <aside class="space-y-6">
                                <div id="trust-summary"></div>
                                <div id="tips-grid"></div>
                                <section class="glass-panel p-6">
                                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Members</p>
                                            <h3 class="mt-2 text-2xl font-bold text-white">List of users and members</h3>
                                            <p class="mt-2 text-sm leading-7 text-slate-300">See each member, whether they are active, and the role they hold in the group.</p>
                                        </div>
                                        <button type="button" class="primary-button">Add</button>
                                    </div>
                                    <div id="member-directory" class="mt-5 grid gap-3"></div>
                                </section>
                                <section class="glass-panel p-6">
                                    <div>
                                        <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Members</p>
                                        <h3 class="mt-2 text-2xl font-bold text-white">Group health</h3>
                                    </div>
                                    <div id="member-profiles" class="mt-5 space-y-4"></div>
                                </section>
                            </aside>
                        </section>
                    </main>

                    <div id="chat-modal" class="fixed inset-0 z-50 hidden bg-slate-950/70 p-4 backdrop-blur-sm">
                        <div class="mx-auto mt-12 max-w-lg rounded-[2rem] border border-white/10 bg-[#081120] p-5 shadow-2xl">
                            <div class="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <div>
                                    <p class="text-sm font-bold uppercase tracking-[0.22em] text-slate-400">Assistant</p>
                                    <h3 class="mt-2 text-xl font-bold text-white">Quick help for your group</h3>
                                </div>
                                <button id="close-chat" type="button" class="secondary-button !px-4 !py-2">Close</button>
                            </div>
                            <div id="chat-messages" class="chat-log mt-4 h-80 space-y-3 overflow-y-auto rounded-[1.5rem] border border-white/10 p-4"></div>
                            <div class="mt-4 grid gap-3 sm:grid-cols-2">
                                <button id="check-balance-btn" type="button" class="secondary-button">Check balance</button>
                                <button id="chat-reminder-btn" type="button" class="primary-button">Send reminder</button>
                            </div>
                        </div>
                    </div>

                    <div id="toast" class="hidden"></div>
                </div>
            `;
        },

        cacheDom() {
            this.root = document.getElementById("app");
            this.dashboardEyebrow = document.getElementById("dashboard-eyebrow");
            this.dashboardTitle = document.getElementById("dashboard-title");
            this.dashboardCopy = document.getElementById("dashboard-copy");
            this.groupTypeSelector = document.getElementById("group-type-selector");
            this.quickActions = document.getElementById("quick-actions");
            this.groupHighlight = document.getElementById("group-highlight");
            this.summaryCards = document.getElementById("summary-cards");
            this.groupFeatureArea = document.getElementById("group-feature-area");
            this.recentActivity = document.getElementById("recent-activity");
            this.memberDirectory = document.getElementById("member-directory");
            this.memberProfiles = document.getElementById("member-profiles");
            this.tipsGrid = document.getElementById("tips-grid");
            this.trustSummary = document.getElementById("trust-summary");
            this.toast = document.getElementById("toast");
        },

        bindEvents() {
            this.root.addEventListener("click", (event) => {
                const switchButton = event.target.closest("[data-switch-group]");
                if (switchButton) {
                    const nextGroup = saveGroupType(switchButton.dataset.switchGroup);
                    this.showToast(`${GROUPS[nextGroup].label} view selected.`, "success");
                    ChatUI.reset();
                    this.render();
                    return;
                }

                const actionButton = event.target.closest("[data-dashboard-action]");
                if (actionButton) {
                    this.handleDashboardAction(actionButton.dataset.dashboardAction);
                }
            });
        },

        render() {
            const group = useGroupType();

            this.dashboardEyebrow.textContent = group.config.eyebrow;
            this.dashboardTitle.textContent = `${this.state.groupName} runs as a ${group.config.label}.`;
            this.dashboardCopy.textContent = group.config.description;
            this.groupTypeSelector.innerHTML = GroupTypeSelector.render(group.value);
            this.quickActions.innerHTML = this.renderQuickActions(group.value);
            this.groupHighlight.innerHTML = this.renderGroupHighlight(group.value);
            this.summaryCards.innerHTML = this.renderSummaryCards(group.value);
            this.groupFeatureArea.innerHTML = this.renderGroupFeatureArea(group.value);
            this.recentActivity.innerHTML = this.renderActivities();
            this.memberDirectory.innerHTML = TrustScore.renderMemberDirectory(this.state);
            this.memberProfiles.innerHTML = TrustScore.renderMembers(this.state);
            this.trustSummary.innerHTML = this.renderTrustSection(group.value);
            this.tipsGrid.innerHTML = TipsSection.render(group.value);
        },

        renderQuickActions(groupType) {
            const actions = {
                sacco: [
                    { id: "record-contribution", label: "Record contribution" },
                    { id: "apply-loan", label: "Issue loan" },
                    { id: "record-repayment", label: "Record repayment" }
                ],
                rosca: [
                    { id: "record-contribution", label: "Save cycle contribution" },
                    { id: "advance-cycle", label: "Advance cycle" },
                    { id: "simulate-reminder", label: "Send reminder" }
                ],
                table_banking: [
                    { id: "record-meeting", label: "Log meeting" },
                    { id: "meeting-loan", label: "Issue meeting loan" },
                    { id: "mark-attendance", label: "Mark attendance" }
                ],
                women_group: [
                    { id: "record-contribution", label: "Save contribution" },
                    { id: "refresh-trust", label: "Refresh trust score" },
                    { id: "share-tip", label: "Share financial tip" }
                ]
            };

            return actions[groupType].map((action, index) => `
                <button
                    type="button"
                    class="${index === 0 ? "primary-button" : "secondary-button"} w-full justify-center"
                    data-dashboard-action="${action.id}"
                >
                    ${action.label}
                </button>
            `).join("");
        },

        renderGroupHighlight(groupType) {
            if (groupType === "rosca") {
                return `
                    <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Current round</p>
                    <h3 class="mt-3 text-3xl font-extrabold text-white">${getRoscaCurrentRecipient(this.state)}</h3>
                    <p class="mt-4 text-sm leading-7 text-slate-300">This member receives the full pot this cycle. Next payout date is ${this.state.rosca.nextPayoutDate}.</p>
                    <div class="mt-6 grid gap-4 sm:grid-cols-2">
                        <div class="summary-card">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Current pot</p>
                            <p class="mt-3 text-3xl font-extrabold text-white">${formatKES(getRoscaCurrentPot(this.state))}</p>
                        </div>
                        <div class="summary-card">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Fixed contribution</p>
                            <p class="mt-3 text-3xl font-extrabold text-white">${formatKES(this.state.rosca.fixedContribution)}</p>
                        </div>
                    </div>
                `;
            }

            if (groupType === "table_banking") {
                return `
                    <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Meeting snapshot</p>
                    <h3 class="mt-3 text-3xl font-extrabold text-white">${this.state.tableBanking.nextMeetingDate}</h3>
                    <p class="mt-4 text-sm leading-7 text-slate-300">Session records stay simple: who came, what was collected, and what was approved.</p>
                    <div class="mt-6 grid gap-4 sm:grid-cols-2">
                        <div class="summary-card">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Attendance</p>
                            <p class="mt-3 text-3xl font-extrabold text-white">${this.state.tableBanking.attendanceRate}%</p>
                        </div>
                        <div class="summary-card">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Loans this month</p>
                            <p class="mt-3 text-3xl font-extrabold text-white">${formatKES(this.state.tableBanking.loansIssuedThisMonth)}</p>
                        </div>
                    </div>
                `;
            }

            if (groupType === "women_group") {
                return `
                    <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Friendly overview</p>
                    <h3 class="mt-3 text-3xl font-extrabold text-white">${this.state.womenGroup.trustScore}/100 trust score</h3>
                    <p class="mt-4 text-sm leading-7 text-slate-300">${this.state.womenGroup.trustNote}</p>
                    <div class="mt-6 space-y-3">
                        ${this.state.womenGroup.largeActions.map((action) => `
                            <div class="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-white">${action}</div>
                        `).join("")}
                    </div>
                `;
            }

            return `
                <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Finance snapshot</p>
                <h3 class="mt-3 text-3xl font-extrabold text-white">${formatKES(this.state.totals.availableBalance)}</h3>
                <p class="mt-4 text-sm leading-7 text-slate-300">Funds currently available after loans out and recent contributions in.</p>
                <div class="mt-6 grid gap-4 sm:grid-cols-2">
                    <div class="summary-card">
                        <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Loan balance</p>
                        <p class="mt-3 text-3xl font-extrabold text-white">${formatKES(this.state.totals.activeLoans)}</p>
                    </div>
                    <div class="summary-card">
                        <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Dividends reserve</p>
                        <p class="mt-3 text-3xl font-extrabold text-white">${formatKES(this.state.totals.dividendsReserve)}</p>
                    </div>
                </div>
            `;
        },

        renderSummaryCards(groupType) {
            const cardsByGroup = {
                sacco: [
                    { label: "Contributions", value: formatKES(this.state.totals.contributions), hint: "All member savings received" },
                    { label: "Loans", value: formatKES(this.state.totals.activeLoans), hint: "Money currently lent out" },
                    { label: "Available funds", value: formatKES(this.state.totals.availableBalance), hint: "Ready for emergencies or new loans" },
                    { label: "Repayments", value: formatKES(this.state.totals.repayments), hint: "Money collected back from borrowers" }
                ],
                rosca: [
                    { label: "Current pot", value: formatKES(getRoscaCurrentPot(this.state)), hint: "Amount going out in this round" },
                    { label: "Next recipient", value: getRoscaNextRecipient(this.state), hint: "Who receives after this cycle" },
                    { label: "Cycle progress", value: `${this.state.rosca.cyclesCompleted}/${this.state.rosca.totalCycles}`, hint: "Completed rounds so far" },
                    { label: "Fixed contribution", value: formatKES(this.state.rosca.fixedContribution), hint: "Per member, per cycle" }
                ],
                table_banking: [
                    { label: "Meeting contributions", value: formatKES(this.state.tableBanking.meetingContributionTotal), hint: "Collected in recent sessions" },
                    { label: "Attendance", value: `${this.state.tableBanking.attendanceRate}%`, hint: "Average member turnout" },
                    { label: "Loans issued", value: formatKES(this.state.tableBanking.loansIssuedThisMonth), hint: "Approved during meetings" },
                    { label: "Available funds", value: formatKES(this.state.totals.availableBalance), hint: "Cash ready for the next session" }
                ],
                women_group: [
                    { label: "Balance", value: formatKES(this.state.totals.availableBalance), hint: "Money ready for the group" },
                    { label: "Trust score", value: `${this.state.womenGroup.trustScore}/100`, hint: "How clear and reliable the process feels" },
                    { label: "Savings", value: formatKES(this.state.totals.contributions), hint: "Total money saved together" },
                    { label: "Simple next step", value: "3 actions", hint: "Contribute, trust check, or read a tip" }
                ]
            };

            return `
                <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    ${cardsByGroup[groupType].map((card) => `
                        <article class="summary-card">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">${card.label}</p>
                            <p class="metric-value mt-4 text-white">${card.value}</p>
                            <p class="mt-3 text-sm leading-6 text-slate-300">${card.hint}</p>
                        </article>
                    `).join("")}
                </div>
            `;
        },

        renderGroupFeatureArea(groupType) {
            if (groupType === "rosca") {
                return RotationTracker.render(this.state);
            }

            if (groupType === "table_banking") {
                return MeetingManager.render(this.state);
            }

            if (groupType === "women_group") {
                return `
                    ${TrustScore.renderPanel(this.state)}
                    <section class="glass-panel p-6">
                        <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Friendly language</p>
                        <h3 class="mt-2 text-2xl font-bold text-white">Keep the dashboard easy to follow</h3>
                        <p class="mt-4 text-sm leading-7 text-slate-300">This version uses fewer words, bigger actions, and more reassurance so members can understand the group quickly.</p>
                    </section>
                `;
            }

            return `
                <section class="glass-panel p-6">
                    <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">SACCO overview</p>
                    <div class="mt-5 grid gap-4 sm:grid-cols-3">
                        <article class="summary-card">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Total savings</p>
                            <p class="mt-3 text-2xl font-extrabold text-white">${formatKES(this.state.totals.contributions)}</p>
                        </article>
                        <article class="summary-card">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Loan balance</p>
                            <p class="mt-3 text-2xl font-extrabold text-white">${formatKES(this.state.totals.activeLoans)}</p>
                        </article>
                        <article class="summary-card">
                            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Available funds</p>
                            <p class="mt-3 text-2xl font-extrabold text-white">${formatKES(this.state.totals.availableBalance)}</p>
                        </article>
                    </div>
                    <div class="mt-6 activity-card">
                        <div>
                            <p class="text-sm font-semibold text-white">Optional dividends reserve</p>
                            <p class="mt-2 text-sm leading-6 text-slate-300">Keep a reserve visible so dividends do not surprise your balance at year end.</p>
                        </div>
                        <p class="text-2xl font-extrabold text-white">${formatKES(this.state.totals.dividendsReserve)}</p>
                    </div>
                </section>
            `;
        },

        renderTrustSection(groupType) {
            if (groupType === "women_group") {
                return TrustScore.renderSummary(this.state);
            }

            return `
                <div class="glass-panel p-6">
                    <p class="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Why this setup fits</p>
                    <p class="mt-4 text-sm leading-7 text-slate-300">${GROUPS[groupType].summary}</p>
                </div>
            `;
        },

        renderActivities() {
            return this.state.activities.slice(0, 6).map((activity) => {
                const tone = this.activityTone(activity.status);
                return `
                    <article class="activity-card">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="status-dot ${tone.dotClass}"></span>
                                <p class="text-sm font-semibold text-white">${activity.member}</p>
                            </div>
                            <p class="mt-2 text-sm leading-7 text-slate-300">${activity.note}</p>
                            ${activity.amount ? `<p class="mt-2 text-sm font-semibold text-white">${formatKES(activity.amount)}</p>` : ""}
                        </div>
                        <div class="text-right">
                            <span class="rounded-full px-3 py-1 text-xs font-semibold ${tone.pillClass}">${tone.label}</span>
                            <p class="mt-2 text-xs text-slate-500">${activity.time}</p>
                        </div>
                    </article>
                `;
            }).join("");
        },

        activityTone(status) {
            if (status === "trusted") {
                return { label: "Trusted", dotClass: "bg-emerald-400", pillClass: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/20" };
            }

            if (status === "moderate") {
                return { label: "Moderate", dotClass: "bg-amber-300", pillClass: "bg-amber-500/15 text-amber-100 border border-amber-300/20" };
            }

            return { label: "Attention", dotClass: "bg-rose-400", pillClass: "bg-rose-500/15 text-rose-100 border border-rose-300/20" };
        },

        handleDashboardAction(actionType) {
            if (!OfflineManager.isOnline) {
                OfflineManager.enqueue({ type: actionType });
                this.showToast("Action saved offline and will sync later.", "warning");
                return;
            }

            this.applyAction({ type: actionType }, "Just now");
        },

        applySyncedActions(actions) {
            actions.forEach((action) => this.applyAction(action, "Synced now"));
        },

        applyAction(action, time) {
            switch (action.type) {
                case "record-contribution":
                    this.recordContribution(time);
                    break;
                case "apply-loan":
                    this.issueLoan(time);
                    break;
                case "record-repayment":
                    this.recordRepayment(time);
                    break;
                case "advance-cycle":
                    this.advanceCycle(time);
                    break;
                case "simulate-reminder":
                    this.sendReminder(time);
                    break;
                case "record-meeting":
                    this.recordMeeting(time);
                    break;
                case "meeting-loan":
                    this.issueMeetingLoan(time);
                    break;
                case "mark-attendance":
                    this.markAttendance(time);
                    break;
                case "refresh-trust":
                    this.refreshTrustScore(time);
                    break;
                case "share-tip":
                    this.shareTip(time);
                    break;
                default:
                    return;
            }

            writeState(this.state);
            this.render();
        },

        pushActivity(entry) {
            this.state.activities.unshift({
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                ...entry
            });
        },

        recordContribution(time) {
            const group = useGroupType().value;
            const amount = group === "rosca" ? this.state.rosca.fixedContribution : 2000;
            this.state.totals.contributions += amount;
            this.state.totals.availableBalance += group === "rosca" ? 0 : amount;
            if (group === "table_banking") {
                this.state.tableBanking.meetingContributionTotal += amount;
            }
            this.pushActivity({
                type: "contribution",
                member: "You",
                amount,
                note: group === "rosca" ? "Cycle contribution recorded for the current round" : "Contribution saved from dashboard",
                status: "trusted",
                time
            });
            this.showToast("Contribution recorded.", "success");
        },

        issueLoan(time) {
            const amount = 12000;
            this.state.totals.activeLoans += amount;
            this.state.totals.availableBalance -= amount;
            this.pushActivity({
                type: "loan",
                member: "You",
                amount,
                note: "Loan issued from SACCO dashboard",
                status: "moderate",
                time
            });
            this.showToast("Loan recorded.", "success");
        },

        recordRepayment(time) {
            const amount = 5000;
            this.state.totals.activeLoans = Math.max(0, this.state.totals.activeLoans - amount);
            this.state.totals.availableBalance += amount;
            this.state.totals.repayments += amount;
            this.pushActivity({
                type: "repayment",
                member: "You",
                amount,
                note: "Loan repayment added to balance",
                status: "trusted",
                time
            });
            this.showToast("Repayment recorded.", "success");
        },

        advanceCycle(time) {
            const orderLength = this.state.rosca.rotationOrder.length || 1;
            const recipient = getRoscaCurrentRecipient(this.state);
            this.state.rosca.currentCycleIndex = (this.state.rosca.currentCycleIndex + 1) % orderLength;
            this.state.rosca.cyclesCompleted = Math.min(this.state.rosca.cyclesCompleted + 1, this.state.rosca.totalCycles);
            this.pushActivity({
                type: "rotation",
                member: recipient,
                amount: getRoscaCurrentPot(this.state),
                note: `Full pot paid out to ${recipient}. ${getRoscaCurrentRecipient(this.state)} is now in the active slot.`,
                status: "trusted",
                time
            });
            this.showToast("Cycle advanced.", "success");
        },

        recordMeeting(time) {
            const contributionAmount = 18000;
            this.state.tableBanking.meetings.unshift({
                id: `${Date.now()}`,
                meetingDate: "Today",
                attendanceText: "18 / 20 members",
                contributionAmount,
                loansIssued: 0
            });
            this.state.tableBanking.meetingContributionTotal += contributionAmount;
            this.state.totals.contributions += contributionAmount;
            this.state.totals.availableBalance += contributionAmount;
            this.pushActivity({
                type: "meeting",
                member: "Meeting",
                amount: contributionAmount,
                note: "Meeting log created with today’s contributions",
                status: "trusted",
                time
            });
            this.showToast("Meeting logged.", "success");
        },

        issueMeetingLoan(time) {
            const amount = 10000;
            this.state.tableBanking.loansIssuedThisMonth += amount;
            this.state.totals.activeLoans += amount;
            this.state.totals.availableBalance -= amount;
            this.pushActivity({
                type: "loan",
                member: "Meeting committee",
                amount,
                note: "Loan issued during today’s meeting",
                status: "moderate",
                time
            });
            this.showToast("Meeting loan recorded.", "success");
        },

        markAttendance(time) {
            this.state.tableBanking.attendanceRate = Math.min(100, this.state.tableBanking.attendanceRate + 2);
            this.pushActivity({
                type: "attendance",
                member: "Secretary",
                amount: 0,
                note: "Attendance register updated for the current session",
                status: "trusted",
                time
            });
            this.showToast("Attendance updated.", "success");
        },

        refreshTrustScore(time) {
            this.state.womenGroup.trustScore = Math.min(100, this.state.womenGroup.trustScore + 2);
            this.pushActivity({
                type: "trust",
                member: "System",
                amount: 0,
                note: "Trust score refreshed after recent on-time contributions",
                status: "trusted",
                time
            });
            this.showToast("Trust score refreshed.", "success");
        },

        shareTip(time) {
            this.pushActivity({
                type: "tip",
                member: "Coach",
                amount: 0,
                note: "Shared a financial tip with the group in friendly language",
                status: "trusted",
                time
            });
            this.showToast("Tip shared.", "success");
        },

        sendReminder(time = "Just now") {
            this.pushActivity({
                type: "reminder",
                member: "System",
                amount: 0,
                note: "Friendly reminder prepared for members with pending actions",
                status: "moderate",
                time
            });
            writeState(this.state);
            this.render();
            this.showToast("Reminder prepared.", "success");
        },

        showToast(message, tone) {
            const toneClasses = {
                success: "bg-emerald-500",
                warning: "bg-amber-500",
                error: "bg-rose-500"
            };

            this.toast.textContent = message;
            this.toast.className = `fixed right-4 top-4 z-50 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-2xl ${toneClasses[tone] || "bg-slate-800"}`;
            this.toast.classList.remove("hidden");

            window.clearTimeout(this.toastTimer);
            this.toastTimer = window.setTimeout(() => {
                this.toast.classList.add("hidden");
            }, 2200);
        }
    };

    DashboardApp.init();
})();
