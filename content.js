(() => {
  "use strict";

  let markerY = null;
  let markerEl = null;
  let toastTimer = null;
  let scrollContainer = null;
  let savedPosition = null; // original CSS position of scroll container

  // ── Find the actual scrolling container ──
  // Must be wide enough to be the main content area (not a sidebar)
  function isScrollable(el) {
    if (el.scrollHeight <= el.clientHeight + 100) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < Math.min(480, window.innerWidth * 0.4)) return false;
    const style = getComputedStyle(el);
    const ov = style.overflowY;
    return ov === "auto" || ov === "scroll";
  }

  function findScrollContainer() {
    const semantic = document.querySelectorAll(
      "main, [role='main'], [role='log'], .overflow-y-auto, .overflow-auto"
    );
    for (const el of semantic) {
      if (isScrollable(el)) return el;
    }

    let best = null;
    let bestScore = 0;
    for (const el of document.querySelectorAll("div, section, article")) {
      if (!isScrollable(el)) continue;
      const score = el.scrollHeight - el.clientHeight;
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }
    return best;
  }

  function getScrollContainer() {
    if (scrollContainer && document.contains(scrollContainer) && isScrollable(scrollContainer)) {
      return scrollContainer;
    }
    scrollContainer = findScrollContainer();
    return scrollContainer;
  }

  function refreshScrollContainer() {
    scrollContainer = null;
    return getScrollContainer();
  }

  function getScrollTop() {
    const c = getScrollContainer();
    return c ? c.scrollTop : (window.scrollY || document.documentElement.scrollTop);
  }

  function getViewHeight() {
    const c = getScrollContainer();
    return c ? c.clientHeight : window.innerHeight;
  }

  function smoothScrollTo(y) {
    const c = getScrollContainer();
    const target = Math.max(0, y - getViewHeight() * 0.35);
    if (c) {
      c.scrollTo({ top: target, behavior: "smooth" });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  }

  // ── Toast (only accepts trusted internal strings) ──
  function toast(trustedHTML, duration = 2500) {
    let el = document.querySelector(".rm-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "rm-toast";
      document.body.appendChild(el);
    }
    el.innerHTML = trustedHTML;
    clearTimeout(toastTimer);
    el.classList.remove("rm-show");
    void el.offsetWidth;
    el.classList.add("rm-show");
    toastTimer = setTimeout(() => el.classList.remove("rm-show"), duration);
  }

  // ── Marker ──
  function placeMarker(y) {
    const c = getScrollContainer();
    const parent = c || document.body;

    if (markerEl && markerEl.parentElement !== parent) {
      markerEl.remove();
      markerEl = null;
    }

    if (!markerEl) {
      markerEl = document.createElement("div");
      markerEl.className = "rm-marker-line";
      // Ensure parent has positioning context; save original value for restore
      if (c && getComputedStyle(c).position === "static") {
        savedPosition = c.style.position;
        c.style.position = "relative";
      }
      parent.appendChild(markerEl);
    }
    markerEl.style.top = y + "px";
    markerY = y;
  }

  function removeMarker() {
    if (markerEl) {
      // Restore original position style on parent
      const parent = markerEl.parentElement;
      if (parent && savedPosition !== null) {
        parent.style.position = savedPosition;
        savedPosition = null;
      }
      markerEl.remove();
      markerEl = null;
    }
    markerY = null;
  }

  function isNearMarker() {
    if (markerY === null) return false;
    const scrollTop = getScrollTop();
    const viewH = getViewHeight();
    return markerY >= scrollTop - 50 && markerY <= scrollTop + viewH + 50;
  }

  // ── Core toggle logic ──
  function toggleMarker() {
    refreshScrollContainer();

    const scrollTop = getScrollTop();
    const viewH = getViewHeight();

    if (markerY === null) {
      const y = scrollTop + viewH * 0.35;
      placeMarker(y);
      toast("📌 已标记  ·  再按 <kbd>Alt+B</kbd> 跳回  ·  <kbd>Esc</kbd> 取消");
      return;
    }

    if (isNearMarker()) {
      const y = scrollTop + viewH * 0.35;
      placeMarker(y);
      toast("📌 标记已更新  ·  滑走后按 <kbd>Alt+B</kbd> 跳回");
      return;
    }

    smoothScrollTo(markerY);
    toast("↩ 已跳回书签  ·  按 <kbd>Alt+B</kbd> 更新  ·  <kbd>Esc</kbd> 取消");
  }

  // ── Listen for command from background service worker ──
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggle-marker") {
      toggleMarker();
    }
  });

  // ── Keyboard fallback (for pages that don't block Alt keys) ──
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && markerY !== null) {
      removeMarker();
      toast("标记已清除");
      return;
    }

    if (e.code === "KeyB" && e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleMarker();
    }
  }, true);

  // ── Scroll container tracking ──
  window.addEventListener("scroll", onScroll, true);

  let lastContainer = null;
  let mutationTimer = null;
  const observer = new MutationObserver(() => {
    // Debounce: SPA pages mutate DOM rapidly
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => {
      const c = getScrollContainer();
      if (c && c !== lastContainer) {
        if (lastContainer) lastContainer.removeEventListener("scroll", onScroll);
        c.addEventListener("scroll", onScroll);
        lastContainer = c;
      }
    }, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  function onScroll() {
    // intentionally lightweight — no heavy work on scroll
  }

  // Wait for SPA framework to finish initial render before attaching
  setTimeout(() => {
    const c = getScrollContainer();
    if (c) {
      c.addEventListener("scroll", onScroll);
      lastContainer = c;
    }
  }, 1000);
})();
