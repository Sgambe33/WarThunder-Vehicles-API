/* ─────────────────────────────────────────────
           Helpers
        ───────────────────────────────────────────── */
        function fmt(n) {
            if (n === undefined || n === null) return '—';
            if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
            if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
            return n.toLocaleString();
        }
        function fmtFull(n) { return (n || 0).toLocaleString(); }
        function compareVersions(a, b) {
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        }

        /* ─────────────────────────────────────────────
           Chart defaults
        ───────────────────────────────────────────── */
        Chart.defaults.color = '#8b949e';
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.font.size = 11;

        const AMBER = '#e6a817';
        const PALETTE = ['#e6a817', '#58a6ff', '#3fb950', '#da3633', '#bc8cff', '#39d353', '#f78166', '#56d364', '#79c0ff', '#d2a8ff', '#ffa657', '#ff7b72'];

        const gridOpts = {
            color: 'rgba(42,48,64,0.8)',
        };
        const tickOpts = { color: '#8b949e' };

        function barOpts(horizontal = false) {
            return {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: horizontal ? 'y' : 'x',
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: gridOpts, ticks: { ...tickOpts, maxRotation: 35 }, border: { color: '#2a3040' } },
                    y: { grid: gridOpts, ticks: tickOpts, border: { color: '#2a3040' } }
                }
            };
        }

        const chartInstances = {};
        function destroyCharts() {
            Object.values(chartInstances).forEach(c => c?.destroy());
            Object.keys(chartInstances).forEach(k => delete chartInstances[k]);
        }

        /* ─────────────────────────────────────────────
           Counter animation
        ───────────────────────────────────────────── */
        function animateCounter(el, target, formatter = fmtFull, duration = 600) {
            const start = performance.now();
            el.classList.add('counting');
            const step = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - t, 3);
                el.textContent = formatter(Math.round(ease * target));
                if (t < 1) requestAnimationFrame(step);
                else { el.textContent = formatter(target); el.classList.remove('counting'); }
            };
            requestAnimationFrame(step);
        }

        /* ─────────────────────────────────────────────
           Fetch
        ───────────────────────────────────────────── */
        async function fetchData(version = '') {
            const base = 'http://localhost:3000/api/vehicles/stats';
            const url = version ? `${base}?version=${encodeURIComponent(version)}` : base;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        }

        /* ─────────────────────────────────────────────
           Render
        ───────────────────────────────────────────── */
        let versionsLoaded = false;

        function renderStats(data) {
            const pairs = [
                ['s-techtree', data.total_techtree_vehicles],
                ['s-premium', data.total_premium_vehicles],
                ['s-pack', data.total_pack_vehicles],
                ['s-market', data.total_marketplace_vehicles],
                ['s-mktprem', data.total_marketplace_premium_vehicles],
                ['s-squadron', data.total_squadron_vehicles],
                ['s-sl', data.total_sl_required],
                ['s-rp', data.total_rp_required],
                ['s-ge', data.total_ge_required],
                ['s-srp', data.total_srp_required]
            ];
            pairs.forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el) animateCounter(el, val || 0, fmt);
            });
        }

        function renderCharts(data) {
            destroyCharts();

            // Types doughnut
            const typeEntries = Object.entries(data.categories).sort((a, b) => b[1] - a[1]);
            chartInstances.types = new Chart(document.getElementById('chartTypes'), {
                type: 'doughnut',
                data: {
                    labels: typeEntries.map(([k]) => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
                    datasets: [{ data: typeEntries.map(([, v]) => v), backgroundColor: PALETTE, borderWidth: 0, hoverOffset: 6 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '62%',
                    plugins: {
                        legend: { position: 'right', labels: { color: '#8b949e', boxWidth: 10, padding: 10, font: { size: 10 } } }
                    }
                }
            });

            // Nations bar
            const nations = [...data.countries].sort((a, b) => b.total_vehicles - a.total_vehicles);
            const natLabels = nations.map(c => c.country.toUpperCase());

            chartInstances.nations = new Chart(document.getElementById('chartNations'), {
                type: 'bar',
                data: {
                    labels: natLabels,
                    datasets: [{ data: nations.map(c => c.total_vehicles), backgroundColor: AMBER, borderRadius: 2 }]
                },
                options: barOpts()
            });

            chartInstances.sl = new Chart(document.getElementById('chartSL'), {
                type: 'bar',
                data: {
                    labels: natLabels,
                    datasets: [{ data: nations.map(c => c.total_value), backgroundColor: '#58a6ff', borderRadius: 2 }]
                },
                options: barOpts()
            });

            chartInstances.rp = new Chart(document.getElementById('chartRP'), {
                type: 'bar',
                data: {
                    labels: natLabels,
                    datasets: [{ data: nations.map(c => c.total_req_exp), backgroundColor: '#3fb950', borderRadius: 2 }]
                },
                options: barOpts()
            });

            chartInstances.ge = new Chart(document.getElementById('chartGE'), {
                type: 'bar',
                data: {
                    labels: natLabels,
                    datasets: [{ data: nations.map(c => c.total_ge_cost), backgroundColor: '#da3633', borderRadius: 2 }]
                },
                options: barOpts()
            });
        }

        function renderCountries(data) {
            const list = document.getElementById('countryList');
            list.innerHTML = '';

            const sorted = [...data.countries].sort((a, b) => b.total_vehicles - a.total_vehicles);

            sorted.forEach(country => {
                const row = document.createElement('div');
                row.className = 'country-row';

                const sortedTypes = Object.entries(country.vehicle_types || {})
                    .sort((a, b) => b[1].count - a[1].count);

                row.innerHTML = `
      <button class="country-toggle" aria-expanded="false">
        <div class="country-flag-placeholder">${country.country.slice(0, 3).toUpperCase()}</div>
        <span class="country-name-text">${country.country}</span>
        <div class="country-summary">
          <span class="country-pill"><strong>${fmtFull(country.total_vehicles)}</strong> vehicles</span>
          <span class="country-pill"><strong>${fmt(country.total_value)}</strong> SL</span>
          <span class="country-pill"><strong>${fmt(country.total_req_exp)}</strong> RP</span>
          <span class="country-pill"><strong>${fmt(country.total_ge_cost)}</strong> GE</span>
        </div>
        <span class="chevron">▼</span>
      </button>
      <div class="country-detail">
        <div class="detail-stats">
          <div class="detail-stat">
            <div class="detail-stat-label">Total Vehicles</div>
            <div class="detail-stat-value">${fmtFull(country.total_vehicles)}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">SL Required</div>
            <div class="detail-stat-value">${fmt(country.total_value)}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">RP Required</div>
            <div class="detail-stat-value">${fmt(country.total_req_exp)}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">GE Cost</div>
            <div class="detail-stat-value">${fmt(country.total_ge_cost)}</div>
          </div>
        </div>
        <div class="type-grid">
          ${sortedTypes.map(([type, d]) => `
            <div class="type-row">
              <span class="type-name-text">${type.replace(/_/g, ' ')}</span>
              <span class="type-count-badge">${d.count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

                row.querySelector('.country-toggle').addEventListener('click', () => {
                    const open = row.classList.toggle('open');
                    row.querySelector('.country-toggle').setAttribute('aria-expanded', open);
                });

                list.appendChild(row);
            });
        }

        function populateVersions(versions) {
            if (versionsLoaded) return;
            const sel = document.getElementById('versionSelect');
            [...versions].sort((a, b) => compareVersions(b, a)).forEach(v => {
                const opt = document.createElement('option');
                opt.value = v; opt.textContent = v;
                sel.appendChild(opt);
            });
            versionsLoaded = true;
        }

        /* ─────────────────────────────────────────────
           Load
        ───────────────────────────────────────────── */
        async function load() {
            const sel = document.getElementById('versionSelect');
            const dot = document.getElementById('statusDot');
            const err = document.getElementById('errorBanner');

            sel.disabled = true;
            dot.className = 'status-dot loading';
            err.classList.remove('visible');

            try {
                const data = await fetchData(sel.value);
                renderStats(data);
                renderCharts(data);
                renderCountries(data);
                if (Array.isArray(data.versions)) populateVersions(data.versions);
                dot.className = 'status-dot';
            } catch (e) {
                err.textContent = `Failed to load data: ${e.message}`;
                err.classList.add('visible');
                dot.className = 'status-dot';
                dot.style.background = 'var(--red)';
                dot.style.boxShadow = '0 0 6px var(--red)';
            } finally {
                sel.disabled = false;
            }
        }

        document.getElementById('versionSelect').addEventListener('change', load);
        load();