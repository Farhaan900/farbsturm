const pitems = [{
    p: 'Mitteldeutsche Zeitung',
    t: 'Graffiti schmücken Brücke — Das Duo Farbsturm hat typische Saale-Motive auf die alte Bausubstanz projiziert.'
}, {
    p: 'Wolmirstedter Kurier',
    t: 'Frische Farben für\'s "Team Maxim" — Künstler bringen neue Freude in die Gemeinschaft.'
}, {
    p: 'Bernburger Kurier',
    t: 'Neue Wandbilder sollen Stadt zum Landesfest verschönern.'
}, {
    p: 'Mitteldeutsche Zeitung',
    t: 'Rätselraten um Kunstwerk — Unbekannter Maler verschönert Saaleradweg.'
}, {
    p: 'Volksstimme',
    t: 'Graffiti zum Sachsen-Anhalt-Tag — Gemeinschaftsprojekt direkt am Markt.'
}, ];
const tick = document.getElementById('ticker');
[...pitems, ...pitems].forEach(i => {
    const el = document.createElement('div');
    el.className = 'titem';
    el.innerHTML = `<span class="tdot"></span><strong>${i.p}</strong>${i.t}`;
    tick.appendChild(el);
});

const rvObs = new IntersectionObserver(e => e.forEach(x => {
    if (x.isIntersecting) {
        x.target.classList.add('vis');
        rvObs.unobserve(x.target)
    }
}), {
    threshold: .08
});
document.querySelectorAll('.rv,.si').forEach(el => rvObs.observe(el));

let cS = false;

function aC(el, t, d = 1800) {
    let s = null;
    const step = ts => {
        if (!s) s = ts;
        const p = Math.min((ts - s) / d, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(e * t).toLocaleString('de-DE');
        if (p < 1) requestAnimationFrame(step)
    };
    requestAnimationFrame(step)
}
new IntersectionObserver(e => {
    if (e[0].isIntersecting && !cS) {
        cS = true;
        aC(document.getElementById('cntp'), 80);
        aC(document.getElementById('cntq'), 4800, 2200)
    }
}, {
    threshold: .4
}).observe(document.getElementById('counter'));

const bwrap = document.getElementById('baWrap');
const bbefore = document.getElementById('baBefore');
const bdiv = document.getElementById('baDivider');
let drag = false;
bbefore.style.clipPath = 'inset(0 50% 0 0)';

function setBA(x) {
    const r = bwrap.getBoundingClientRect();
    const p = Math.max(5, Math.min(95, ((x - r.left) / r.width) * 100));
    bdiv.style.left = p + '%';
    bbefore.style.clipPath = `inset(0 ${100-p}% 0 0)`
}
bwrap.addEventListener('mousedown', e => {
    drag = true;
    setBA(e.clientX)
});
bwrap.addEventListener('touchstart', e => {
    drag = true;
    setBA(e.touches[0].clientX)
}, {
    passive: true
});
window.addEventListener('mousemove', e => {
    if (drag) setBA(e.clientX)
});
window.addEventListener('touchmove', e => {
    if (drag) setBA(e.touches[0].clientX)
}, {
    passive: true
});
window.addEventListener('mouseup', () => drag = false);
window.addEventListener('touchend', () => drag = false);

function updateK(v) {
    v = parseInt(v) || 0;
    let lo, hi;
    if (v <= 10) {
        lo = 700;
        hi = 1000
    } else if (v <= 20) {
        lo = 900;
        hi = 2000
    } else if (v <= 50) {
        lo = 1800;
        hi = 3200
    } else if (v <= 100) {
        lo = 3000;
        hi = 4200
    } else if (v <= 200) {
        lo = 3900;
        hi = 9000
    } else if (v <= 400) {
        lo = 8000;
        hi = 18000
    } else {
        lo = 12000;
        hi = 25000
    }
    document.getElementById('krp').textContent = lo.toLocaleString('de-DE') + ' – ' + hi.toLocaleString('de-DE') + ' €'
}
updateK(80);

async function sendForm() {

    const n = document.getElementById('fn').value.trim();
    const c = document.getElementById('fk').value.trim();
    const m = document.getElementById('fmsg2').value.trim();

    if (!n || !c || !m) {
        alert('Bitte füllen Sie mindestens Name, Kontakt und Projektbeschreibung aus.');
        return;
    }

    const data = {
        name: n,
        org: document.getElementById('fo').value,
        contact: c,
        loc: document.getElementById('floc').value,
        type: document.getElementById('ftyp').value,
        area: document.getElementById('farea').value,
        msg: m
    };

    try {

        const response = await fetch('sendmail.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.text();

        alert(result);

        // clear form
        ['fn', 'fo', 'fk', 'floc', 'farea', 'fmsg2']
        .forEach(id => document.getElementById(id).value = '');

        document.getElementById('ftyp').value = '';

    } catch (err) {
        console.error(err);
        alert('Fehler beim Senden.');
    }
}

// gallery slider

fetch("assets/data/gallery.json")
    .then(res => res.json())
    .then(files => {

        const images = files.map(file => {
            const name = file.replace(/\.[^/.]+$/, "");
            const title = name.replace(/-/g, " ");

            return {
                src: `assets/images/gallery/${file}`,
                title
            };
        });

        initSlider(images);
    });

function initSlider(images) {
    let currentIndex = 0;

    const slide = document.getElementById("slide");
    const title = document.getElementById("title");

    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    const dotsContainer = document.getElementById("dots");
    const dots = [];

    // -------------------------
    // CREATE DOTS (IMPORTANT FIX)
    // -------------------------
    images.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");

        dot.addEventListener("click", () => {
            currentIndex = i;
            showImage(currentIndex);
        });

        dotsContainer.appendChild(dot);
        dots.push(dot);
    });

    // -------------------------
    // SHOW IMAGE
    // -------------------------
    function showImage(index) {
        const img = images[index];

        // restart animation
        slide.classList.remove("slide-in");
        void slide.offsetWidth;
        slide.classList.add("slide-in");

        slide.src = img.src;
        title.textContent = img.title;

        // update dots
        dots.forEach((d, i) => {
            d.classList.toggle("active", i === index);
        });
    }

    // -------------------------
    // NAVIGATION
    // -------------------------
    function nextSlide() {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    }

    nextBtn.addEventListener("click", nextSlide);
    prevBtn.addEventListener("click", prevSlide);

    // -------------------------
    // AUTO SLIDE
    // -------------------------
    let interval = setInterval(nextSlide, 4000);

    const slider = document.querySelector(".slide-content");

    slider.addEventListener("mouseenter", () => {
        clearInterval(interval);
    });

    slider.addEventListener("mouseleave", () => {
        interval = setInterval(nextSlide, 4000);
    });

    // initial render
    showImage(currentIndex);
}