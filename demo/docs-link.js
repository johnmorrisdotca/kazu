// Keep the native Docs pill aligned with the selected family language.
export function attachDocsLink() {
  const refresh = () => {
    const link = document.querySelector('[data-say="pageDocs"]');
    if (!link) return;
    const japanese = document.documentElement.lang === "ja";
    link.href = japanese ? "docs/ja/index.html" : "docs/index.html";
    link.textContent = japanese ? "ドキュメント" : "Docs";
  };
  document.querySelector("header")?.addEventListener("click", event => {
    if (event.target?.closest?.("button[data-lang]")) refresh();
  });
  refresh();
}
