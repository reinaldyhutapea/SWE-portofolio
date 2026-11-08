document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initExperienceTabs();
    initCredentialTabs();
    initProjectFilters();
});

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initNavigation() {
    const siteHeader = document.getElementById('siteHeader');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = Array.from(document.querySelectorAll('section[id]'));

    const setActiveSection = (id) => {
        navLinks.forEach(link => {
            const active = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    };

    const closeMenu = () => {
        if (!navMenu || !menuToggle) return;
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
    };

    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = document.getElementById(href.slice(1));
            if (!target) return;
            event.preventDefault();
            const headerOffset = window.matchMedia('(max-width: 768px)').matches
                ? 0
                : siteHeader ? siteHeader.getBoundingClientRect().height : 0;
            window.scrollTo({
                top: Math.max(0, target.offsetTop - headerOffset),
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
            history.pushState(null, '', href);
            setActiveSection(target.id);
            closeMenu();
        });
    });

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        });
    }

    const updateScrollState = () => {
        if (siteHeader) siteHeader.classList.toggle('scrolled', window.scrollY > 20);
        const bottomReached = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
        let current = bottomReached ? 'contact' : 'home';
        sections.forEach(section => {
            if (window.scrollY + 140 >= section.offsetTop) current = section.id;
        });
        setActiveSection(current);
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            updateScrollState();
            ticking = false;
        });
    }, { passive: true });

    window.addEventListener('popstate', () => {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target) {
            window.scrollTo({ top: target.offsetTop, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            setActiveSection(target.id);
        }
    });
    updateScrollState();
}

function initTabs(buttons, switchTab) {
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
        button.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            let nextIndex = index;
            if (event.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
            if (event.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = buttons.length - 1;
            buttons[nextIndex].focus();
            switchTab(buttons[nextIndex].dataset.tab);
        });
    });
}

function initExperienceTabs() {
    const buttons = [
        document.getElementById('tabCorporate'),
        document.getElementById('tabLeadership')
    ].filter(Boolean);
    buttons.forEach(button => {
        button.dataset.tab = button.id === 'tabCorporate' ? 'corporate' : 'leadership';
    });
    initTabs(buttons, switchExpTab);
}

function switchExpTab(tabKey) {
    const tabs = { corporate: document.getElementById('tabCorporate'), leadership: document.getElementById('tabLeadership') };
    const panels = { corporate: document.getElementById('panelCorporate'), leadership: document.getElementById('panelLeadership') };
    if (!tabs[tabKey] || !panels[tabKey]) return;
    Object.keys(tabs).forEach(key => {
        const active = key === tabKey;
        tabs[key].classList.toggle('active', active);
        tabs[key].setAttribute('aria-selected', String(active));
        tabs[key].setAttribute('tabindex', active ? '0' : '-1');
        panels[key].style.display = active ? 'flex' : 'none';
        panels[key].setAttribute('aria-hidden', String(!active));
    });
}

function initCredentialTabs() {
    const tabs = [
        document.getElementById('tabCredentialsFocus'),
        document.getElementById('tabCredentialsAllTime'),
        document.getElementById('tabCredentialsEvidence')
    ].filter(Boolean);
    tabs.forEach(tab => {
        tab.dataset.tab = tab.id === 'tabCredentialsFocus' ? 'focus'
            : tab.id === 'tabCredentialsAllTime' ? 'all-time' : 'evidence';
    });
    initTabs(tabs, switchCredentialTab);
}

function switchCredentialTab(tabKey) {
    const tabs = {
        focus: document.getElementById('tabCredentialsFocus'),
        'all-time': document.getElementById('tabCredentialsAllTime'),
        evidence: document.getElementById('tabCredentialsEvidence')
    };
    const panels = {
        focus: document.getElementById('panelCredentialsFocus'),
        'all-time': document.getElementById('panelCredentialsAllTime'),
        evidence: document.getElementById('panelCredentialsEvidence')
    };
    if (!tabs[tabKey] || !panels[tabKey]) return;
    Object.keys(tabs).forEach(key => {
        const active = key === tabKey;
        tabs[key].classList.toggle('active', active);
        tabs[key].setAttribute('aria-selected', String(active));
        tabs[key].setAttribute('tabindex', active ? '0' : '-1');
        panels[key].style.display = active ? 'block' : 'none';
        panels[key].setAttribute('aria-hidden', String(!active));
    });
}

function initProjectFilters() {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => filterProjects(button.getAttribute('data-filter')));
    });
}

function filterProjects(category) {
    if (!category) return;
    document.querySelectorAll('.filter-btn').forEach(button => {
        const active = button.getAttribute('data-filter') === category;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
    const flagship = document.querySelector('.flagship-card');
    if (flagship) flagship.style.display = category === 'all' || flagship.getAttribute('data-category') === category ? 'grid' : 'none';
    document.querySelectorAll('.project-card').forEach(card => {
        const visible = category === 'all' || card.getAttribute('data-category') === category;
        card.classList.toggle('hidden', !visible);
    });
}
