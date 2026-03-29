const baseUrl = 'https://wtvehiclesapi.duckdns.org/api';
let versionTimer;
const version1Select = document.getElementById('version1');
const version2Select = document.getElementById('version2');
const identifierInput = document.getElementById('identifier');
const identifierSuggestions = document.getElementById('identifier-suggestions');

function populateDatalist(ids) {
    console.log("Clearing old versions...");
    version1Select.innerHTML = '<option value="">--Please choose a version--</option>';
    version2Select.innerHTML = '<option value="">--Please choose a version--</option>';

    console.log("Adding versions...");
    (ids || []).slice(0, 200).forEach(v => {
        console.log("Adding version " + v);

        const opt1 = document.createElement('option');
        opt1.value = v;
        opt1.text = v;

        const opt2 = document.createElement('option');
        opt2.value = v;
        opt2.text = v;

        version1Select.add(opt1);
        version2Select.add(opt2);
    });
}

function populateIdentifierSuggestions(ids) {
    identifierSuggestions.innerHTML = '';
    (ids || []).slice(0, 25).forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        identifierSuggestions.appendChild(opt);
    });
}

// helper: fill meta and thumbnail
async function fillMetaFromVehicle(vehicle, queryFallback) {
    document.getElementById('meta-id').textContent = vehicle.identifier || queryFallback || '—';
    document.getElementById('meta-country').textContent = vehicle.country || '—';
    document.getElementById('meta-type').textContent = vehicle.vehicle_type || '—';
    document.getElementById('meta-br').textContent = `${vehicle.arcade_br ?? '—'} / ${vehicle.realistic_br ?? '—'} / ${vehicle.simulator_br ?? '—'}`;
    document.getElementById('meta-mass').textContent = vehicle.mass ?? '—';
    document.getElementById('meta-mods').textContent = (vehicle.modifications || []).length;

    const thumb = document.getElementById('vehicleThumb');
    if (vehicle.images && vehicle.images.image) {
        thumb.innerHTML = '';
        const img = document.createElement('img'); img.src = vehicle.images.image; img.alt = vehicle.identifier || 'vehicle';
        thumb.appendChild(img);
    } else {
        thumb.innerHTML = '<span style="color:var(--muted)">No image</span>';
    }

    // also populate versions list if available
    const versions = vehicle.versions || vehicle.availableVersions || [];
    if (versions.length) populateDatalist(versions);
}

// Try to fetch full vehicle by id and fill meta (safe wrapper)
async function fetchVehicleMeta(identifier) {
    if (!identifier) return;
    try {
        const res = await fetch(`${baseUrl}/vehicles/${encodeURIComponent(identifier)}`);
        if (!res.ok) return;
        const vehicle = await res.json();
        await fillMetaFromVehicle(vehicle, identifier);
    } catch (err) {
        console.error('Error fetching vehicle:', err);
    }
}

// Use the search endpoint to help find identifiers as the user types.
// The search endpoint may return different shapes (array of strings, array of objects, or an object with results).
identifierInput.addEventListener('input', e => {
    clearTimeout(versionTimer);
    versionTimer = setTimeout(async () => {
        const q = e.target.value.trim();
        if (!q) {
            populateIdentifierSuggestions([]);
            return;
        }
        try {
            // prefer the search endpoint
            const searchUrl = `${baseUrl}/vehicles/search/${encodeURIComponent(q)}`;
            const sres = await fetch(searchUrl);
            if (sres.ok) {
                const results = await sres.json();
                let ids = [];
                if (Array.isArray(results)) {
                    if (results.length && typeof results[0] === 'string') ids = results;
                    else ids = results.map(r => (r && (r.identifier || r.name || r.id)) || (typeof r === 'string' ? r : null)).filter(Boolean);
                } else if (results && typeof results === 'object') {
                    const arr = results.results || results.items || results.data || [];
                    ids = (Array.isArray(arr) ? arr.map(r => (r && (r.identifier || r.name || r.id)) || (typeof r === 'string' ? r : null)).filter(Boolean) : []);
                }

                populateIdentifierSuggestions(ids);

                // if the typed query exactly matches a result, fetch full vehicle metadata
                const exact = ids.find(x => x.toLowerCase() === q.toLowerCase());
                if (exact) await fetchVehicleMeta(exact);
            } else {
                // fallback: try direct vehicle fetch by id (old behaviour)
                try {
                    const res = await fetch(`${baseUrl}/vehicles/${encodeURIComponent(q)}`);
                    if (res.ok) {
                        const vehicle = await res.json();
                        const versions = vehicle.versions || vehicle.availableVersions || [];
                        populateDatalist(versions);
                        await fillMetaFromVehicle(vehicle, q);
                    }
                } catch (e) {
                    // ignore
                }
            }
        } catch (err) {
            console.error('Error searching vehicles:', err);
        }
    }, 350);
});

document.getElementById('compareForm').addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('identifier').value.trim();
    const v1 = document.getElementById('version1').value.trim();
    const v2 = document.getElementById('version2').value.trim();
    compareVersions(id, v1, v2);
});

async function compareVersions(id, v1, v2) {
    const url1 = `${baseUrl}/vehicles/${encodeURIComponent(id)}?version=${encodeURIComponent(v1)}`;
    const url2 = `${baseUrl}/vehicles/${encodeURIComponent(id)}?version=${encodeURIComponent(v2)}`;
    try {
        const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
        if (!res1.ok || !res2.ok) throw new Error('One or both versions not found');
        const data1 = await res1.json();
        const data2 = await res2.json();
        renderComparison(data1, data2, v1, v2);
    } catch (err) {
        document.getElementById('comparison').innerHTML = `<p style="color:red;text-align:center">Error: ${err.message}</p>`;
    }
}

function createDiffPatcher() {
    const priority = "name"; // use 'name' as unique key for arrays
    return jsondiffpatch.create({
        objectHash: function (obj, index) {
            if (!obj || typeof obj !== 'object') return '$$' + String(obj) + ':' + index;
            if (obj.name) return obj.name; // use name if available
            if (obj.identifier) return obj.identifier;
            if (obj.id) return obj.id;
            return '$$index:' + index;
        },
        arrays: {
            detectMove: document.getElementById('detectMove').checked,
            includeValueOnMove: false,
        },
        textDiff: { minLength: 60 }
    });
}


function renderComparison(a, b, v1, v2) {
    const container = document.getElementById('comparison');
    document.getElementById('diffTitle').textContent = `Differences ${v1} ↔ ${v2}`;

    const diffpatcher = createDiffPatcher();
    const delta = diffpatcher.diff(a, b);

    if (!delta) {
        container.innerHTML = `<div style="padding:1rem;text-align:center;color:var(--success)">No differences found 🎉</div>`;
        return;
    }

    const formatter = jsondiffpatch.formatters.html;
    // format will produce a DOM string
    const diffHtml = formatter.format(delta, a);
    container.innerHTML = diffHtml;

    // toggle hide unchanged
    toggleHideUnchanged();

    // attach download button
    document.getElementById('btnDownload').onclick = (ev) => {
        ev.preventDefault();
        const blob = new Blob([JSON.stringify(delta, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const aLink = document.createElement('a');
        aLink.href = url; aLink.download = `${v1}_vs_${v2}_delta.json`;
        document.body.appendChild(aLink); aLink.click(); aLink.remove(); URL.revokeObjectURL(url);
    };
}

function toggleHideUnchanged() {
    const shouldHide = document.getElementById('hideUnchanged').checked;
    const root = document.querySelector('#comparison');
    if (shouldHide) root.classList.add('hide-unchanged'); else root.classList.remove('hide-unchanged');
}

// UI event handlers
document.getElementById('hideUnchanged').addEventListener('change', toggleHideUnchanged);
document.getElementById('detectMove').addEventListener('change', () => {
    // if we already have left/right loaded, re-run compare to apply new settings
    const id = document.getElementById('identifier').value.trim();
    const v1 = document.getElementById('version1').value.trim();
    const v2 = document.getElementById('version2').value.trim();
    if (id && v1 && v2) compareVersions(id, v1, v2);
});