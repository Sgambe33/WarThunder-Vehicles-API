// Helper function to format numbers
function formatNumber(num) {
    return num.toLocaleString();
}

function compareVersions(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function fetchData(targetVersion = '') {
    const baseUrl = 'https://wtvehiclesapi.duckdns.org/api/vehicles/stats';
    const url = targetVersion ? `${baseUrl}?version=${encodeURIComponent(targetVersion)}` : baseUrl;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
    }

    return response.json();
}

const chartInstances = {};
let versionsInitialized = false;

function destroyCharts() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
        }
    });
}

function populateVersionDropdown(versions) {
    const versionSelect = document.getElementById('versionSelect');
    const sortedVersions = [...versions].sort((a, b) => compareVersions(b, a));

    sortedVersions.forEach(version => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;
        option.style.color = '#000';
        versionSelect.appendChild(option);
    });

    versionsInitialized = true;
}

function renderDashboard(data) {
    destroyCharts();

    // Update stats cards
    document.getElementById('totalVehicles').textContent = formatNumber(data.total_techtree_vehicles);
    document.getElementById('totalPremium').textContent = formatNumber(data.total_premium_vehicles);
    document.getElementById('totalSL').textContent = formatNumber(data.total_sl_required);
    document.getElementById('totalRP').textContent = formatNumber(data.total_rp_required);
    document.getElementById('totalGE').textContent = formatNumber(data.total_ge_required);

    // Chart colors
    const chartColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
        '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];

    // Categories Chart
    const categoriesLabels = Object.keys(data.categories).map(cat =>
        cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    const categoriesData = Object.values(data.categories);

    chartInstances.categories = new Chart(document.getElementById('categoriesChart'), {
        type: 'doughnut',
        data: {
            labels: categoriesLabels,
            datasets: [{
                data: categoriesData,
                backgroundColor: chartColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#fff',
                        font: { size: 11 }
                    }
                }
            }
        }
    });

    // Countries by Vehicles Chart
    const countryNames = data.countries.map(c => c.country.toUpperCase());
    const countryVehicles = data.countries.map(c => c.total_vehicles);

    chartInstances.countries = new Chart(document.getElementById('countriesChart'), {
        type: 'bar',
        data: {
            labels: countryNames,
            datasets: [{
                label: 'Total Vehicles',
                data: countryVehicles,
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });

    // SL by Country Chart
    const countrySL = data.countries.map(c => c.total_value);

    chartInstances.slByCountry = new Chart(document.getElementById('slByCountryChart'), {
        type: 'bar',
        data: {
            labels: countryNames,
            datasets: [{
                label: 'Total SL Required',
                data: countrySL,
                backgroundColor: '#FFCE56'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });

    // RP by Country Chart
    const countryRP = data.countries.map(c => c.total_req_exp);

    chartInstances.rpByCountry = new Chart(document.getElementById('rpByCountryChart'), {
        type: 'bar',
        data: {
            labels: countryNames,
            datasets: [{
                label: 'Total RP Required',
                data: countryRP,
                backgroundColor: '#4BC0C0'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });

    const countryGE = data.countries.map(c => c.total_ge_cost);
    chartInstances.geByCountry = new Chart(document.getElementById('geByCountryChart'), {
        type: 'bar',
        data: {
            labels: countryNames,
            datasets: [{
                label: 'Total GE Cost',
                data: countryGE,
                backgroundColor: '#FF9F40'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });

    // Top Vehicle Types Chart
    const sortedCategories = Object.entries(data.categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    chartInstances.topVehicles = new Chart(document.getElementById('topVehiclesChart'), {
        type: 'bar',
        data: {
            labels: sortedCategories.map(c => c[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
            datasets: [{
                label: 'Vehicle Count',
                data: sortedCategories.map(c => c[1]),
                backgroundColor: '#9966FF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });



    // Create country detail sections
    const countriesContainer = document.getElementById('countriesContainer');
    countriesContainer.innerHTML = '';

    data.countries.forEach(country => {
        const section = document.createElement('div');
        section.className = 'country-section';

        const header = document.createElement('div');
        header.className = 'country-header';
        header.innerHTML = `
                <div class="country-name">${country.country.toUpperCase()}</div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span>${formatNumber(country.total_vehicles)} vehicles</span>
                    <span class="toggle-arrow">▼</span>
                </div>
            `;

        const content = document.createElement('div');
        content.className = 'country-content';

        const stats = document.createElement('div');
        stats.className = 'country-stats';
        stats.innerHTML = `
                <div class="country-stat">
                    <label>Total SL Required</label>
                    <div class="value">${formatNumber(country.total_value)}</div>
                </div>
                <div class="country-stat">
                    <label>Total RP Required</label>
                    <div class="value">${formatNumber(country.total_req_exp)}</div>
                </div>
                <div class="country-stat">
                    <label>Total GE Cost</label>
                    <div class="value">${formatNumber(country.total_ge_cost)}</div>
                </div>
                <div class="country-stat">
                    <label>Total Vehicles</label>
                    <div class="value">${formatNumber(country.total_vehicles)}</div>
                </div>
            `;

        const vehicleTypes = document.createElement('div');
        vehicleTypes.className = 'vehicle-types';

        // Generate vehicle type list from existing data
        let typesHTML = '';
        if (country.vehicle_types && Object.keys(country.vehicle_types).length > 0) {
            const sortedTypes = Object.entries(country.vehicle_types)
                .sort((a, b) => b[1].count - a[1].count);

            typesHTML = sortedTypes.map(([type, data]) => `
                        <div class="type-item">
                            <span class="type-name">${type.replace(/_/g, ' ').toUpperCase()}</span>
                            <span class="type-count">${data.count}</span>
                        </div>
                    `).join('');
        } else {
            typesHTML = '<div style="grid-column: 1/-1; text-align: center; color: #b8c6db;">No data available</div>';
        }

        vehicleTypes.innerHTML = `
                    <h3>Vehicle Distribution by Type</h3>
                    <div class="type-list">${typesHTML}</div>
                `;

        content.appendChild(stats);
        content.appendChild(vehicleTypes);

        // Toggle functionality
        header.addEventListener('click', () => {
            const arrow = header.querySelector('.toggle-arrow');
            const isExpanded = content.classList.contains('expanded');

            if (!isExpanded) {
                content.classList.add('expanded');
                arrow.classList.add('expanded');
            } else {
                content.classList.remove('expanded');
                arrow.classList.remove('expanded');
            }
        });

        section.appendChild(header);
        section.appendChild(content);
        countriesContainer.appendChild(section);
    });
}

async function loadDashboardForSelection() {
    const versionSelect = document.getElementById('versionSelect');

    try {
        versionSelect.disabled = true;
        const data = await fetchData(versionSelect.value);
        renderDashboard(data);

        if (!versionsInitialized && Array.isArray(data.versions)) {
            populateVersionDropdown(data.versions);
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    } finally {
        versionSelect.disabled = false;
    }
}

const versionSelect = document.getElementById('versionSelect');
versionSelect.addEventListener('change', loadDashboardForSelection);

// Initialize dashboard with latest data
loadDashboardForSelection();