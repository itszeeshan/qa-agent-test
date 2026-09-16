import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'index.html');
const cssPath = path.join(__dirname, '..', 'styles.css');
const scriptPath = path.join(__dirname, '..', 'script.js');

let dom;
let document;
let window;

beforeAll(async () => {
    let html = fs.readFileSync(htmlPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

    // Inline the external stylesheet and script so JSDOM can load everything
    // from a single in-memory document, without needing a real HTTP server.
    html = html.replace('<link rel="stylesheet" href="styles.css">', `<style>${css}</style>`);
    html = html.replace('<script src="script.js"></script>', `<script>${scriptContent}</script>`);

    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
    window = dom.window;
    document = dom.window.document;

    // Wait for the document (and its DOMContentLoaded-driven script) to finish loading.
    await new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
});

describe('Pallet Ross landing page markup', () => {
    it('has the correct page title', () => {
        expect(document.title).toBe('Pallet Ross');
    });

    it('shows the brand name in the header', () => {
        const brand = document.querySelector('.brand-name');
        expect(brand).not.toBeNull();
        expect(brand.textContent.trim()).toBe('Pallet Ross');
    });

    it('has all expected navigation links', () => {
        const navText = Array.from(document.querySelectorAll('.main-nav a')).map((a) => a.textContent.trim());
        expect(navText).toEqual([
            'Get Started',
            'Create strategy',
            'Pricing',
            'Contact',
            'Solution',
            'E-Commerce',
        ]);
    });

    it('has the two header icon buttons', () => {
        const buttons = document.querySelectorAll('.header-actions .icon-button');
        expect(buttons.length).toBe(2);
    });

    it('renders the hero headline text', () => {
        const heading = document.querySelector('.hero-title');
        expect(heading).not.toBeNull();
        expect(heading.textContent.replace(/\s+/g, ' ').trim()).toBe('A place to display your masterpiece.');
    });

    it('renders seven cards in the card stack', () => {
        const cards = document.querySelectorAll('.art-card');
        expect(cards.length).toBe(7);
    });

    it('renders the hero subtext with a faded portion', () => {
        const subtext = document.querySelector('.hero-subtext');
        expect(subtext.textContent).toContain('Artists can display their masterpieces');
        const fade = subtext.querySelector('.fade-in');
        expect(fade).not.toBeNull();
        expect(fade.textContent.trim()).toBe('discover and');
    });

    it('renders the join CTA button with correct price text', () => {
        const button = document.querySelector('.cta-button');
        expect(button).not.toBeNull();
        expect(button.textContent.trim()).toBe('Join for $9.99/m');
    });

    it('renders a read more link next to the CTA', () => {
        const readMore = document.querySelector('.read-more');
        expect(readMore).not.toBeNull();
        expect(readMore.textContent.trim()).toBe('Read more');
    });
});

describe('Pallet Ross interactivity', () => {
    it('shows a welcome message when the join button is clicked', () => {
        const button = document.getElementById('joinButton');
        const message = document.getElementById('message');
        button.dispatchEvent(new window.Event('click', { bubbles: true }));
        expect(message.innerText).toMatch(/Welcome aboard/i);
    });

    it('toggles the dark theme class on the body when the theme button is clicked', () => {
        const themeToggle = document.getElementById('themeToggle');
        const hadClassBefore = document.body.classList.contains('dark-theme');
        themeToggle.dispatchEvent(new window.Event('click', { bubbles: true }));
        const hasClassAfter = document.body.classList.contains('dark-theme');
        expect(hasClassAfter).toBe(!hadClassBefore);
    });

    it('shows an account message when the account icon is clicked', () => {
        const accountButton = document.getElementById('accountButton');
        const message = document.getElementById('message');
        accountButton.dispatchEvent(new window.Event('click', { bubbles: true }));
        expect(message.innerText).toMatch(/Account menu/i);
    });
});
