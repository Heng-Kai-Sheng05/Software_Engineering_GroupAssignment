(function(){
    'use strict';

    // Helpers: avoid UTC drift by formatting/parsing dates in local time.
    function toISOLocal(d){
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    function parseISOLocal(iso){
        if (!iso) return null;
        const parts = String(iso).split('-').map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return null;
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    // Minimal two-month range datepicker attached to inputs with IDs checkIn/checkOut
    class DateRangePicker {
        constructor(opts = {}){
            this.inputs = (opts.inputs || ['checkIn','checkOut']).map(id => document.getElementById(id)).filter(Boolean);
            this.container = null;
            this.start = null; // Date object
            this.end = null;
            this.base = new Date(); // month shown for left panel
            this.weekStart = 1; // Monday
            this.activeInput = null;
            this._onDocumentClick = this._onDocumentClick.bind(this);
            this._init();
        }

        _init(){
            if (!this.inputs.length) return;
            this._build();
            this.inputs.forEach(inp => {
                inp.readOnly = true;
                inp.addEventListener('focus', (e) => this.openFor(e.target));
                inp.addEventListener('click', (e) => this.openFor(e.target));
                // wire calendar toggle button if present
                try {
                    const wrapper = inp.closest('.date-input');
                    if (wrapper) {
                        const btn = wrapper.querySelector('.date-toggle');
                        if (btn) btn.addEventListener('click', (ev) => { ev.stopPropagation(); this.openFor(inp); });
                    }
                } catch (e) {}
            });

            // ensure form submits ISO date strings (convert human display back to ISO)
            const form = document.getElementById('quickSearchForm');
            if (form) {
                form.addEventListener('submit', (ev) => {
                    this.inputs.forEach(inp => {
                        const iso = inp.dataset.iso;
                        if (iso) inp.value = iso;
                    });
                });
            }
        }

        _build(){
            this.container = document.createElement('div');
            this.container.className = 'datepicker';
            this.container.style.display = 'none';

            // two panels
            this.leftPanel = document.createElement('div');
            this.leftPanel.className = 'datepicker-panel';
            this.rightPanel = document.createElement('div');
            this.rightPanel.className = 'datepicker-panel';

            this.container.appendChild(this.leftPanel);
            this.container.appendChild(this.rightPanel);
            document.body.appendChild(this.container);

            document.addEventListener('click', this._onDocumentClick);
        }

        openFor(input){
            this.activeInput = input;
            // set base month according to input value if present
            const val = input.value;
            if (val) {
                const d = new Date(val);
                if (!isNaN(d)) this.base = new Date(d.getFullYear(), d.getMonth(), 1);
            }
            this._render();
            this._positionNear(input);
            this.container.style.display = 'flex';
        }

        close(){
            this.container.style.display = 'none';
            this.activeInput = null;
        }

        _onDocumentClick(e){
            if (this.container.contains(e.target)) return;
            if (this.inputs.some(i => i === e.target)) return;
            this.close();
        }

        _positionNear(input){
            const rect = input.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            const left = rect.left + window.pageXOffset;
            const top = rect.bottom + scrollY + 8;

            // estimate picker width (panels * 308 + gaps + padding)
            const panelCount = this.container.querySelectorAll('.datepicker-panel').length || 2;
            const gap = 16; // 1rem gap assumed (root font-size 16px)
            const paddingTotal = 32; // 1rem left + 1rem right
            const pickerW = panelCount * 308 + (panelCount - 1) * gap + paddingTotal;
            const viewportW = window.innerWidth || document.documentElement.clientWidth;
            let clampedLeft = left;
            if (left + pickerW + 8 > viewportW) {
                clampedLeft = Math.max(8, viewportW - pickerW - 8);
            }

            this.container.style.left = clampedLeft + 'px';
            this.container.style.top = top + 'px';
        }

        _render(){
            this.leftPanel.innerHTML = '';
            this.rightPanel.innerHTML = '';
            this._renderPanel(this.leftPanel, this.base);
            const next = new Date(this.base.getFullYear(), this.base.getMonth()+1, 1);
            this._renderPanel(this.rightPanel, next);
        }

        _renderPanel(panel, date){
            // header
            const header = document.createElement('div');
            header.className = 'datepicker-header';

            if (panel === this.leftPanel) {
                const prev = document.createElement('div');
                prev.className = 'nav-arrow';
                prev.innerHTML = '&#8592;';
                prev.title = 'Previous month';
                prev.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.base = new Date(this.base.getFullYear(), this.base.getMonth()-1, 1);
                    this._render();
                });
                header.appendChild(prev);
            } else {
                const spacer = document.createElement('div');
                spacer.style.width = '36px';
                header.appendChild(spacer);
            }

            const title = document.createElement('div');
            title.className = 'month-title';
            title.textContent = date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
            header.appendChild(title);

            if (panel === this.rightPanel) {
                const next = document.createElement('div');
                next.className = 'nav-arrow';
                next.innerHTML = '&#8594;';
                next.title = 'Next month';
                next.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.base = new Date(this.base.getFullYear(), this.base.getMonth()+1, 1);
                    this._render();
                });
                header.appendChild(next);
            } else {
                const spacer2 = document.createElement('div');
                spacer2.style.width = '36px';
                header.appendChild(spacer2);
            }

            panel.appendChild(header);

            // weekdays
            const wk = document.createElement('div');
            wk.className = 'weekday-row';
            const labels = ['Mo','Tu','We','Th','Fr','Sa','Su'];
            for (let i=0;i<7;i++){ const el = document.createElement('div'); el.className='weekday'; el.textContent = labels[i]; wk.appendChild(el);} 
            panel.appendChild(wk);

            // days grid
            const grid = document.createElement('div');
            grid.className = 'datepicker-grid';

            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            // compute index where Monday=0 per our labels
            let startIndex = (firstDay.getDay() + 6) % 7; // convert Sun=0..Sat=6 to Mon=0..Sun=6
            // fill blanks
            for (let i=0;i<startIndex;i++){ const blank = document.createElement('div'); blank.className='datepicker-day disabled'; grid.appendChild(blank); }

            const daysInMonth = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
            const today = new Date();
            today.setHours(0,0,0,0);

            // When picking check-out, disable any date on/before the chosen check-in.
            const activeId = this.activeInput && this.activeInput.id;
            const minDate = (activeId === 'checkOut' && this.start) ? this.start : null;

            for (let d=1; d<=daysInMonth; d++){
                const dt = new Date(date.getFullYear(), date.getMonth(), d);
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'datepicker-day';
                cell.textContent = d;
                cell.dataset.date = toISOLocal(dt);

                const dtZero = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
                const isPast = dtZero < today;
                const beforeCheckIn = minDate && dtZero.getTime() <= minDate.getTime();
                if (isPast || beforeCheckIn) {
                    cell.classList.add('disabled');
                } else {
                    cell.addEventListener('click', (e) => { e.stopPropagation(); this._onDayClick(dt); });
                }

                if (dtZero.getTime() === today.getTime()) cell.classList.add('today');

                grid.appendChild(cell);
            }

            panel.appendChild(grid);

            // after rendering, apply selection classes
            this._applySelection(panel);
        }

        _onDayClick(date){
            const clicked = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const activeId = this.activeInput && this.activeInput.id;

            if (activeId === 'checkOut') {
                if (!this.start) {
                    // No check-in yet — treat this click as setting check-in,
                    // then switch focus to check-out for the next click.
                    this.start = clicked;
                    this.end = null;
                    const co = document.getElementById('checkOut');
                    if (co) this.activeInput = co;
                } else {
                    // Must be strictly after check-in (same-day disallowed).
                    if (clicked.getTime() <= this.start.getTime()) return;
                    this.end = clicked;
                }
            } else {
                // Setting check-in (or fallback)
                this.start = clicked;
                if (this.end && this.end.getTime() <= clicked.getTime()) {
                    this.end = null;
                }
                // After picking check-in, expect the user to pick check-out next.
                const co = document.getElementById('checkOut');
                if (co) this.activeInput = co;
            }

            this._updateInputsFromSelection();
            this._render();
            if (this.start && this.end) {
                this.close();
            }
        }

        _updateInputsFromSelection(){
            const setInput = (inp, iso) => {
                if (!inp) return;
                inp.dataset.iso = iso;
                inp.value = iso;
                // Programmatic value assignment does not fire input/change events.
                // Dispatch them so listeners (persistSearchCriteria, applyFilter, etc.) run.
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                inp.dispatchEvent(new Event('change', { bubbles: true }));
            };

            if (this.start) {
                setInput(document.getElementById('checkIn'), toISOLocal(this.start));
            }
            if (this.end) {
                setInput(document.getElementById('checkOut'), toISOLocal(this.end));
            }
            // if only start selected, set checkOut to next day default (displayed)
            if (this.start && !this.end){
                const next = new Date(this.start.getTime()); next.setDate(next.getDate()+1);
                setInput(document.getElementById('checkOut'), toISOLocal(next));
            }
        }

        _applySelection(panel){
            if (!panel) return;
            const cells = panel.querySelectorAll('.datepicker-day');
            cells.forEach(c => {
                c.classList.remove('in-range','start','end');
                const dstr = c.dataset.date;
                if (!dstr) return;
                const d = parseISOLocal(dstr);
                if (!d) return;
                if (this.start && this.end){
                    if (d.getTime() === this.start.getTime()) c.classList.add('start');
                    else if (d.getTime() === this.end.getTime()) c.classList.add('end');
                    else if (d > this.start && d < this.end) c.classList.add('in-range');
                } else if (this.start && !this.end){
                    if (d.getTime() === this.start.getTime()) c.classList.add('start');
                }
            });
        }
    }

    // instantiate on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        window.DateRangePicker = new DateRangePicker();
    });
})();
