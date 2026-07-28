Design system - DAYDAY'S FANCY (Minimal pack)\n\nBut: livraison rapide pour développement mobile-first. Contenu: tokens JSON, CSS vars, et spécifications d'implémentation.\n\nRésumé d'implémentation rapide:\n1) Intégration tokens\n   - importer design-system.tokens.json dans le pipeline (Style Dictionary / tokens transform) ou consommer design-system.tokens.css directement via <link>.\n\n2) Théming\n   - toggler theme via document.documentElement.setAttribute('data-theme','dark'|'light')\n\n3) Images & assets\n   - utiliser .webp responsive, LQIP, et srcset; priorité mobile 360-480 width variants.\n\n4) Components (mobile-first) - guidelines\n   - Header: .header-floating + .u-glass; hide on scroll down, reveal on up; search expands to full-screen modal.
   - Bottom nav: .bottom-nav + .u-glass; 5 icons; center primary CTA (circle) using --color-accent and subtle --color-gold ring.
   - Product card: use large image (1:1), rounded radius-md, touch ripple on press, quick-preview modal.
   - Smart Discount Card: pre-click state uses .smart-discount--pre; on tap, add .smart-discount--expanded and animate details (use clip-path or scale). Show savings string from tokens JSON.

5) Motion & perf
   - Respect prefers-reduced-motion. Use will-change for transform on animated elements. Keep JS to minimal for interactions; prefer CSS transitions where possible.

6) Accessibility
   - Ensure text contrast AA; provide aria-labels for nav icons; keyboard focus styles: outline with --color-accent-strong.

Next minimal deliverables (pick one):\n- generate CSS tokens bundle + simple HTML demo (fast)\n- mobile wireframes (homepage + product)\n- Figma tokens import (requires more credits)\n\nDiscuter/prioriser la prochaine étape.\n