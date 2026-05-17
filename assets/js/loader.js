(function() {
    var canvas = document.getElementById('fs-splatter');
    var ctx = canvas.getContext('2d');
    var loader = document.getElementById('fs-loader');
    var bar = document.getElementById('fs-progress-bar');
    var pctEl = document.getElementById('fs-pct');
    var eyebrow = document.querySelector('.fs-eyebrow');
    var sub = document.querySelector('.fs-sub');

    var GREY = ['#1a1a1a', '#222', '#2d2d2d', '#333', '#3a3a3a', '#282828'];
    var VIVID = ['#FF2D00', '#FF5500', '#FF9900', '#FFE600', '#00C853', '#1d5961', '#09214f', '#3a2e55', '#CC00FF', '#FF007A', '#FF4081', '#aeaeae'];

    var W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function splat(cx, cy, r, color, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        var pts = 10 + Math.floor(Math.random() * 8);
        for (var i = 0; i < pts; i++) {
            var angle = (i / pts) * Math.PI * 2;
            var jitter = r * (0.55 + Math.random() * 0.65);
            var x = cx + Math.cos(angle) * jitter,
                y = cy + Math.sin(angle) * jitter;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        for (var d = 0; d < 2 + Math.floor(Math.random() * 4); d++) {
            var a2 = Math.random() * Math.PI * 2,
                dist = r * (0.4 + Math.random() * 0.8);
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a2) * dist, cy + Math.sin(a2) * dist, r * (0.08 + Math.random() * 0.22), 0, Math.PI * 2);
            ctx.fill();
        }
        for (var s = 0; s < 12 + Math.floor(Math.random() * 20); s++) {
            var a3 = Math.random() * Math.PI * 2,
                d2 = r * (0.9 + Math.random() * 1.8);
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a3) * d2, cy + Math.sin(a3) * d2, Math.random() * (r * 0.08), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function lerpColor(a, b, t) {
        var ha = parseInt(a.replace('#', ''), 16),
            hb = parseInt(b.replace('#', ''), 16);
        var r1 = (ha >> 16) & 255,
            g1 = (ha >> 8) & 255,
            b1 = ha & 255;
        var r2 = (hb >> 16) & 255,
            g2 = (hb >> 8) & 255,
            b2 = hb & 255;
        return 'rgb(' + Math.round(r1 + (r2 - r1) * t) + ',' + Math.round(g1 + (g2 - g1) * t) + ',' + Math.round(b1 + (b2 - b1) * t) + ')';
    }

    var progress = 0,
        colorPhase = 0,
        lastTime = null,
        queue = [];

    function planSplats() {
        queue = [];
        var margin = 60;
        var COUNT = 15;
        for (var i = 0; i < COUNT; i++) {
            queue.push({
                t: i / COUNT,
                x: margin + Math.random() * (W - margin * 2),
                y: margin + Math.random() * (H - margin * 2),
                r: 22 + Math.random() * 60,
                ci: Math.floor(Math.random() * VIVID.length),
                gi: Math.floor(Math.random() * GREY.length),
                fired: false
            });
        }
    }
    planSplats();

    function tick(ts) {
        if (!lastTime) lastTime = ts;
        var dt = ts - lastTime;
        lastTime = ts;
        progress = Math.min(100, progress + dt * (100 / 3000));
        if (progress > 35) colorPhase = Math.min(1, (progress - 35) / 55);
        var p01 = progress / 100;
        queue.forEach(function(s) {
            if (!s.fired && p01 >= s.t) {
                s.fired = true;
                var grey = GREY[s.gi],
                    vivid = VIVID[s.ci];
                var color = colorPhase < 0.01 ? grey : lerpColor(grey, vivid, Math.min(1, colorPhase * 1.4));
                splat(s.x, s.y, s.r, color, 0.55 + Math.random() * 0.4);
            }
        });
        bar.style.width = progress + '%';
        if (colorPhase > 0.05) bar.style.background = 'hsl(' + (progress * 3.6) + ',90%,55%)';
        pctEl.textContent = String(Math.floor(progress)).padStart(3, '0') + '%';
        if (colorPhase > 0.15) {
            eyebrow.style.color = 'hsl(' + (progress * 2.5) + ',80%,65%)';
            sub.style.color = 'hsl(' + (progress * 3) + ',80%,60%)';
            pctEl.style.color = 'hsl(' + (progress * 4) + ',90%,60%)';
        }
        if (progress < 100) {
            requestAnimationFrame(tick);
        } else {
            setTimeout(function() {
                loader.classList.add('done');
            }, 1000);
        }
    }
    requestAnimationFrame(tick);
})();