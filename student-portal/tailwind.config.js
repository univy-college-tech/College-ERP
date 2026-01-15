/** @type {import('tailwindcss').Config} */
const sharedConfig = require('../shared/styles/tailwind.config.js');

module.exports = {
    ...sharedConfig,
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './index.html',
        '../shared/components/src/**/*.{js,ts,jsx,tsx}',
    ],
};
