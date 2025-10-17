import React, { useRef, useEffect } from 'react';

// FIX: Define the Particle type for use in the ref.
// The class with the same shape is defined inside useEffect to close over canvas context.
interface Particle {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    checkBounds: () => void;
    draw: () => void;
}

export const AnimatedBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const lastScrollYRef = useRef<number>(0);
    const animationFrameIdRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const options = {
            particleColor: 'rgb(103, 232, 249)', // cyan-300
            lineColor: 'rgb(34, 211, 238)', // cyan-400
            particleAmount: 50, // Increased from 40
            defaultRadius: 2,
            variantRadius: 2,
            defaultSpeed: 0.1,
            variantSpeed: 0.2,
            linkRadius: 200, // Increased from 180
        };

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        lastScrollYRef.current = window.scrollY;

        class Particle {
            x: number;
            y: number;
            radius: number;
            vx: number;
            vy: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.radius = options.defaultRadius + Math.random() * options.variantRadius;
                const speed = options.defaultSpeed + Math.random() * options.variantSpeed;
                // Bias particles to move in a generally upward direction
                const directionAngle = (Math.random() * Math.PI) + Math.PI;
                this.vx = Math.cos(directionAngle) * speed;
                this.vy = Math.sin(directionAngle) * speed;
            }

            checkBounds() {
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                if(!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = options.particleColor;
                ctx.fill();
            }
        }

        const createParticles = () => {
            const particles: Particle[] = [];
            for (let i = 0; i < options.particleAmount; i++) {
                particles.push(new Particle());
            }
            particlesRef.current = particles;
        };
        
        const drawLines = () => {
             if(!ctx) return;
            const particles = particlesRef.current;
            let x1: number, y1: number, x2: number, y2: number, length: number, opacity: number;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    x1 = particles[i].x;
                    y1 = particles[i].y;
                    x2 = particles[j].x;
                    y2 = particles[j].y;
                    length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    if (length < options.linkRadius) {
                        opacity = 1 - length / options.linkRadius;
                        ctx.lineWidth = 0.5;
                        const rgbColor = options.lineColor.match(/\d+/g);
                        if (rgbColor) {
                           ctx.strokeStyle = `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, ${opacity})`;
                        }
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
        };

        const drawScene = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesRef.current.forEach(p => p.draw());
            drawLines();
        }

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const deltaY = currentScrollY - lastScrollYRef.current;
            lastScrollYRef.current = currentScrollY;

            if (Math.abs(deltaY) < 1) return;

            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = requestAnimationFrame(() => {
                const movementFactor = Math.min(Math.abs(deltaY), 50) * 2.0;

                particlesRef.current.forEach(p => {
                    p.x += p.vx * movementFactor;
                    p.y += p.vy * movementFactor;
                    p.checkBounds();
                });

                drawScene();
            });
        };
        
        const handleResize = () => {
            if(!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createParticles();
            drawScene();
        };

        createParticles();
        drawScene();
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationFrameIdRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, background: '#0f172a' }} />;
};