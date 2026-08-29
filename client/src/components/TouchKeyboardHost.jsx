import React, { useEffect, useState, useCallback } from 'react';
import { OnScreenKeyboard } from './OnScreenKeyboard';

const IS_TOUCH = (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

// Skip inputs that don't need a text keyboard.
const SKIP_TYPES = new Set(['checkbox', 'radio', 'file', 'color', 'range', 'button', 'submit', 'reset', 'hidden', 'image']);

// Global on-screen keyboard host. On touch devices, automatically shows the
// keyboard whenever a text input or textarea is focused, and routes typed
// characters into the focused element via document.execCommand.
export function TouchKeyboardHost() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!IS_TOUCH) return;

    const onFocusIn = (e) => {
      const el = e.target;
      if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
      if (el.closest && el.closest('[data-no-global-keyboard]')) return;
      const type = (el.type || 'text').toLowerCase();
      if (SKIP_TYPES.has(type)) return;
      setVisible(true);
    };

    const onFocusOut = (e) => {
      const el = e.target;
      if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
      const next = e.relatedTarget;
      if (next && (next.tagName === 'INPUT' || next.tagName === 'TEXTAREA')) return;
      setVisible(false);
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const handleKey = useCallback((key) => {
    const el = document.activeElement;
    if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
    try { el.focus(); } catch (err) { /* ignore */ }
    if (key === 'BACKSPACE') {
      document.execCommand('delete', false);
    } else if (key === 'SPACE') {
      document.execCommand('insertText', false, ' ');
    } else if (key === 'ENTER') {
      setVisible(false);
      try { el.blur(); } catch (err) { /* ignore */ }
    } else {
      document.execCommand('insertText', false, key);
    }
  }, []);

  const handleHide = useCallback(() => {
    setVisible(false);
    const el = document.activeElement;
    if (el && el.blur) { try { el.blur(); } catch (err) { /* ignore */ } }
  }, []);

  if (!IS_TOUCH || !visible) return null;

  return <OnScreenKeyboard onKey={handleKey} onHide={handleHide} />;
}
