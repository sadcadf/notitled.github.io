import './css/style.css';
import { marked } from 'marked';

// Expose marked globally for compatibility with existing code
window.marked = marked;

import './js/core/app.js';
