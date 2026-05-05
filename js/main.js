import { loadData, subscribe } from './state.js';
import { setupEventListeners, renderApp } from './ui.js';
import { initializeTables } from './components/table.js';
import { setupDynamicSectionEventListeners } from './components/dynamicSection.js';

/**
 * Initializes the application when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. 静的なUI要素を初期化
  initializeTables();

  // 2. 状態の変更を購読し、変更があるたびにUI全体を再描画
  subscribe(renderApp);

  // 3. イベントリスナーを設定して、ユーザー操作をActionに変換できるようにする
  setupEventListeners();
  setupDynamicSectionEventListeners();

  // 4. 初期データをロードする（これにより最初のレンダリングがトリガーされる）
  loadData();
});
