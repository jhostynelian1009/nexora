// Ref: RNF-001, RNF-002, ADR2-001
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('CSS Design System - Contract Test', () => {
  it('defines all required UI component classes in index.css', () => {
    const cssPath = path.resolve(__dirname, '../styles/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    const requiredClasses = [
      '.input-group',
      '.input-label',
      '.input-field',
      '.form-group',
      '.form-label',
      '.form-control',
      '.field-error',
      '.alert',
      '.alert-error',
      '.alert-success',
      '.btn',
      '.btn-primary',
      '.btn-secondary',
      '.btn-ghost',
      '.btn-danger',
      '.btn-icon',
      '.btn-link',
      '.btn-sm',
      '.badge',
      '.badge-primary',
      '.badge-secondary',
      '.badge-unread',
      '.typing-dots',
      '.typing-dot',
      '.ws-status-badge',
      '.toast-container',
      '.toast',
      '.modal-backdrop',
      '.modal-content',
      '.mobile-bottom-nav'
    ];

    requiredClasses.forEach((className) => {
      expect(cssContent).toContain(className);
    });
  });
});
