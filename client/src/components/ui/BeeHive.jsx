import { useEffect, useRef } from 'react';

export default function BeeHive({ width = 400, height = 300 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const HEX_SIZE = 22;
    const hexes = [];
    let bee = { x: 0, y: 0, targetIdx: 0, progress: 0, angle: 0 };
    let path = [];

    const KOVAN_PATTERN = [
      [0,1],[0,2],[0,3],[0,4],[0,5],[1,3],[2,2],[2,4],[3,1],[3,5],
      [5,2],[5,3],[5,4],[6,1],[6,5],[7,0],[7,6],[8,1],[8,5],[9,2],[9,3],[9,4],
      [11,1],[11,2],[12,3],[12,4],[13,3],[13,2],[14,1],
      [16,5],[16,4],[16,3],[16,2],[17,1],[18,2],[18,3],[18,4],[18,5],[17,3],
      [20,5],[20,4],[20,3],[20,2],[20,1],[21,2],[22,3],[23,2],[23,1],[23,3],[23,4],[23,5],
    ];

    function hexCenter(col, row) {
      const w = HEX_SIZE * Math.sqrt(3);
      const h = HEX_SIZE * 2;
      const offsetX = (row % 2) * (w / 2);
      const x = 16 + col * w + offsetX;
      const y = 20 + row * h * 0.75;
      return { x, y };
    }

    function hexPath(cx, cy, size) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        const px = cx + size * Math.cos(angle);
        const py = cy + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    KOVAN_PATTERN.forEach(([col, row]) => {
      const { x, y } = hexCenter(col, row);
      hexes.push({ col, row, x, y, filled: false, fillProgress: 0 });
    });

    function buildPath() {
      const shuffled = [...hexes].sort(() => Math.random() - 0.5);
      path = shuffled.map(h => hexes.indexOf(h));
    }
    buildPath();

    bee.x = hexes[path[0]].x;
    bee.y = hexes[path[0]].y;

    function drawHex(h) {
      hexPath(h.x, h.y, HEX_SIZE - 2);
      if (h.filled) {
        const alpha = Math.min(h.fillProgress, 1);
        ctx.fillStyle = `rgba(230,170,50,${alpha * 0.9})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(180,110,10,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (alpha > 0.6) {
          hexPath(h.x, h.y, HEX_SIZE * 0.45);
          ctx.fillStyle = `rgba(255,220,100,${(alpha - 0.6) * 1.5 * 0.6})`;
          ctx.fill();
        }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function drawBee(x, y, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
      grad.addColorStop(0, 'rgba(245,200,66,0.35)');
      grad.addColorStop(1, 'rgba(245,200,66,0)');
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      const flap = Math.sin(Date.now() * 0.03) * 4;
      ctx.beginPath();
      ctx.ellipse(-3, -7 + flap, 5, 3.5, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,230,255,0.75)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(160,200,240,0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(3, -7 + flap, 5, 3.5, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,230,255,0.75)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(160,200,240,0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f5c842';
      ctx.fill();
      ctx.strokeStyle = '#7a5010';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      [-2.5, 0, 2.5].forEach(xOff => {
        ctx.beginPath();
        ctx.moveTo(xOff, -5.5);
        ctx.lineTo(xOff, 5.5);
        ctx.strokeStyle = 'rgba(80,40,0,0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.arc(6.5, -1.5, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(7, -2, 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(5, -5);
      ctx.quadraticCurveTo(9, -11, 11, -13);
      ctx.strokeStyle = '#7a5010';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(11, -13, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f5c842';
      ctx.fill();

      ctx.restore();
    }

    let lastTime = 0;
    const SPEED = 0.018;
    let animId;

    function animate(ts) {
      const dt = Math.min(ts - lastTime, 50);
      lastTime = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hexes.forEach(h => drawHex(h));

      bee.progress += SPEED * (dt / 16);

      if (bee.progress >= 1) {
        const curIdx = path[bee.targetIdx % path.length];
        hexes[curIdx].filled = true;
        bee.targetIdx++;
        if (bee.targetIdx >= path.length) {
          setTimeout(() => {
            hexes.forEach(h => { h.filled = false; h.fillProgress = 0; });
            bee.targetIdx = 0;
            buildPath();
          }, 1500);
        }
        bee.progress = 0;
      }

      const fromIdx = path[(bee.targetIdx - 1 + path.length) % path.length];
      const toIdx = path[bee.targetIdx % path.length];
      const from = hexes[fromIdx];
      const to = hexes[toIdx];

      if (from && to) {
        const t = bee.progress;
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        bee.x = from.x + (to.x - from.x) * eased;
        bee.y = from.y + (to.y - from.y) * eased;
        bee.angle = Math.atan2(to.y - from.y, to.x - from.x);
      }

      hexes.forEach(h => {
        if (h.filled && h.fillProgress < 1) h.fillProgress += 0.03;
      });

      drawBee(bee.x, bee.y, bee.angle);
      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', maxWidth: '100%' }}
    />
  );
}
