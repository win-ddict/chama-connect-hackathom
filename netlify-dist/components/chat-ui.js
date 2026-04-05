const quickReplies = {
    balance: {
        prompt: 'Check balance',
        response: 'Available balance is KES 160,000. Total contributions are KES 245,000 and active loans are KES 85,000.'
    },
    reminder: {
        prompt: 'Reminder',
        response: 'Reminder sent. Peter Kamau has a repayment due today and Mary Wanjiku is due tomorrow.'
    },
    loan: {
        prompt: 'Loan status',
        response: 'There are 3 active loans. Kevin Otieno is on track, Aisha Njeri is moderate, and Peter Kamau needs follow-up.'
    },
    member: {
        prompt: 'Member info',
        response: 'Trusted members: 2. Reliable borrowers: 2. One member needs closer follow-up this week.'
    }
};

function bubble(message, tone) {
    const align = tone === 'user' ? 'justify-end' : 'justify-start';
    const bubbleTone = tone === 'user'
        ? 'bg-emerald-600 text-white'
        : 'bg-white text-slate-900 ring-1 ring-slate-200';

    return `
        <div class="flex ${align}">
            <div class="max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${bubbleTone}">
                ${message}
            </div>
        </div>
    `;
}

export function createChatUI(config) {
    const { modal, openButton, closeButton, messagesRoot, input, sendButton, onReminder } = config;

    function addMessage(message, tone = 'bot') {
        messagesRoot.insertAdjacentHTML('beforeend', bubble(message, tone));
        messagesRoot.scrollTop = messagesRoot.scrollHeight;
    }

    function respond(text) {
        const lower = text.toLowerCase();

        if (lower.includes('balance')) {
            triggerAction('balance');
            return;
        }

        if (lower.includes('remind')) {
            triggerAction('reminder');
            return;
        }

        if (lower.includes('loan')) {
            triggerAction('loan');
            return;
        }

        if (lower.includes('member') || lower.includes('trust')) {
            triggerAction('member');
            return;
        }

        addMessage('Try asking about balance, reminders, loans, or members.');
    }

    function triggerAction(actionKey) {
        const action = quickReplies[actionKey];

        if (!action) return;

        addMessage(action.prompt, 'user');
        setTimeout(() => {
            addMessage(action.response);
            if (actionKey === 'reminder' && typeof onReminder === 'function') {
                onReminder();
            }
        }, 450);
    }

    function open() {
        modal.classList.remove('hidden');
    }

    function close() {
        modal.classList.add('hidden');
    }

    openButton.addEventListener('click', open);
    closeButton.addEventListener('click', close);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            close();
        }
    });

    document.querySelectorAll('[data-chat-action]').forEach((button) => {
        button.addEventListener('click', () => triggerAction(button.dataset.chatAction));
    });

    sendButton.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) return;
        addMessage(value, 'user');
        input.value = '';
        setTimeout(() => respond(value), 300);
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    addMessage('Hello. I can help with balance, reminders, loans, and member trust scores.');

    return {
        open,
        triggerAction
    };
}
