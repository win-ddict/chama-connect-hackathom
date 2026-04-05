export function renderTipsSection(target, tips) {
    target.innerHTML = tips.map((tip) => {
        return `
            <article class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-sm font-medium text-slate-500">Practical Tip</p>
                <h4 class="mt-2 text-xl font-bold">${tip.title}</h4>
                <p class="mt-3 text-sm leading-6 text-slate-600">${tip.description}</p>
                <div class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    ${tip.example}
                </div>
            </article>
        `;
    }).join('');
}
