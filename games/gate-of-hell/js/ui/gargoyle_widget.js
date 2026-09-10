/* gargoyle_widget.js - Sleeping Statue HUD widget (DOM). Form art is images/ui/sleeping_statue.webp + CSS filters. */

let _gwLastForm = -1;

/** Called each frame. Swaps the statue <img> CSS filter and form name when the form changes. */
function updateGargoyleWidget() {
    if (typeof getGargoyleForm !== 'function') return;
    const form = getGargoyleForm();
    if (form.form === _gwLastForm) return;
    _gwLastForm = form.form;

    const icon = document.getElementById('sleeping-statue-icon');
    if (icon) icon.setAttribute('data-form', String(form.form));

    const label = document.getElementById('sleeping-statue-name');
    if (label) { label.textContent = form.name; label.style.color = form.color; }
}

window.updateGargoyleWidget = updateGargoyleWidget;
