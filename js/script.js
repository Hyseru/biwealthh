const tableBody = document.getElementById('market-data');
const refreshBtn = document.getElementById('refresh-btn');

// Formatters
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: value < 1 ? 4 : 2,
        maximumFractionDigits: value < 1 ? 4 : 2
    }).format(value);
};

const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return formatCurrency(value);
};

// Render Skeleton Loading
function renderSkeletons() {
    tableBody.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        tableBody.innerHTML += `
            <tr>
                <td>
                    <div class="coin-cell">
                        <div class="skeleton skeleton-icon"></div>
                        <div class="coin-info" style="gap: 4px;">
                            <div class="skeleton skeleton-text" style="width: 50px;"></div>
                            <div class="skeleton skeleton-text" style="width: 80px;"></div>
                        </div>
                    </div>
                </td>
                <td><div class="skeleton skeleton-text" style="width: 100px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 80px; height: 32px; border-radius: 6px;"></div></td>
                <td class="desktop-only"><div class="skeleton skeleton-text" style="width: 120px;"></div></td>
                <td><div class="skeleton skeleton-text" style="width: 100px; height: 40px; border-radius: 8px;"></div></td>
            </tr>
        `;
    }
}

async function fetchMarketData() {
    try {
        if (refreshBtn) refreshBtn.classList.add('spinning');

        // Render skeletons if table is empty (first load)
        if (tableBody.children.length === 0 || tableBody.querySelector('.skeleton')) {
            renderSkeletons();
        }

        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Add small delay to show off the skeleton if network is too fast (optional, for aesthetics)
        setTimeout(() => {
            tableBody.innerHTML = '';

            data.forEach((coin, index) => {
                const priceChange = coin.price_change_percentage_24h || 0;
                const isPositive = priceChange >= 0;
                const changeClass = isPositive ? 'pos' : 'neg';
                const changeIcon = isPositive ? 'ph-trend-up' : 'ph-trend-down';

                const row = document.createElement('tr');
                row.className = 'fade-in';
                row.style.animationDelay = `${index * 0.05}s`;

                row.innerHTML = `
                    <td>
                        <div class="coin-cell">
                            <img src="${coin.image}" alt="${coin.name}" class="coin-icon">
                            <div class="coin-info">
                                <span class="coin-symbol">${coin.symbol.toUpperCase()}</span>
                                <span class="coin-name">${coin.name}</span>
                            </div>
                        </div>
                    </td>
                    <td class="price">${formatCurrency(coin.current_price)}</td>
                    <td>
                        <span class="change-badge ${changeClass}">
                            <i class="ph ${changeIcon}"></i>
                            ${Math.abs(priceChange).toFixed(2)}%
                        </span>
                    </td>
                    <td class="desktop-only market-cap">${formatMarketCap(coin.market_cap)}</td>
                    <td>
                        <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Negociar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            if (refreshBtn) refreshBtn.classList.remove('spinning');
        }, 300); // 300ms delay for visual effect

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--danger); padding: 2rem;">
                    <i class="ph ph-warning-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Falha ao carregar dados do mercado. Tente novamente mais tarde.</p>
                </td>
            </tr>
        `;
        if (refreshBtn) refreshBtn.classList.remove('spinning');
    }
}

// Event Listeners
if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchMarketData);
}

// Iniciar
fetchMarketData();
// Atualiza a cada 60 segundos
setInterval(fetchMarketData, 60000);

// Scroll Blob Effect and Active Menu
window.addEventListener('scroll', () => {
    // Calculate how far down the page the user has scrolled in percentage (0 to 1)
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = scrollTop / docHeight;

    // We want to map scrollPercent to CSS variables controlling the blobs
    // Initial State (top): primary = #6366f1, accent = #a855f7
    // Scrolled State (bottom): primary = #a855f7, accent = #a855f7 (all purple)
    const root = document.documentElement;
    root.style.setProperty('--scroll-purple-ratio', scrollPercent);

    // Navigation active state
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    if (current) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    } else {
        if (window.scrollY < 100) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks[0]) navLinks[0].classList.add('active');
        }
    }
});