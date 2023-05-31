export function fixVritualKeyboardHiddenScroll() {
  let scrollElement = null;
  const scrollElements = document.querySelectorAll("[style*=overflow]");
  for (let i = scrollElements.length; i > 0; i--) {
    let se = scrollElements.item(i - 1);
    let style = getComputedStyle(se);
    if (style.overflowY != "hidden") {
      scrollElement = se;
      break;
    }
  }
  if (!scrollElement) {
    scrollElement = document.scrollingElement || document.body || document.documentElement;
  }
  scrollElement.scrollTo = 0;
}
