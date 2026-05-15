import './bootstrap';
import '../css/app.css';

import { createRoot, hydrateRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

createInertiaApp({

    resolve: (name: string) => {

        const pages = import.meta.glob<{ default: React.ComponentType<any> }>(
            './pages/**/*.tsx',
            { eager: true }
        );

        const tryPaths = [
            `./pages/${name}.tsx`,
            `./pages/${name}.jsx`,
            `./pages/${name}/index.tsx`,
            `./pages/${name}/index.jsx`,
        ];

        for (const p of tryPaths) {
            if (pages[p]) return pages[p].default;
        }

        throw new Error(`Page not found: ${name} (tried: ${tryPaths.join(', ')})`);
    },

    setup({ el, App, props }) {
        if (typeof window !== 'undefined' && el && (el as Element).nodeType === 1) {
            const container = el as Element;

            if (container.hasChildNodes()) {
                hydrateRoot(container, <App {...props} />);
            } else {
                createRoot(container).render(<App {...props} />);
            }
        }
    },
});