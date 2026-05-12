# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

療養型病院向けの個人用オフライン医療参照PWA。インストール不要で `index.html` をブラウザで開くだけで動く。

## ビルド・配布

### スタンドアロン版の生成（iOS Safari / iCloud Drive 向け）

```bash
python build_standalone.py
```

- `index.html` を変換して `医療参照ツール.html` を生成
- PWA/Service Worker 関連のコードを除去し、PDF リンクを無効化したラベルに差し替える
- Node.js で JS 構文チェック（`node --check _check.js`）を自動実行
- `C:\Users\hiron\iCloudDrive\` が存在すればそこへ自動コピー

### ローカル確認（PWA・Service Worker が必要な場合）

```bash
python -m http.server 8000
# → http://localhost:8000 でアクセス
```

ファイルを直接開いた場合は SW は登録されないため、PWA 機能のテストはローカルサーバー経由が必要。

## アーキテクチャ

**単一ファイル構成が基本原則。** `index.html` に CSS・データ・ロジックをすべて内包する。

### `index.html`（メインファイル）

- `const ITEMS = [...]` — 全参照項目データ（HTML文字列を含むオブジェクト配列）
- `renderItem(item)` — 各項目を `<details>` カード要素として DOM に追加
- `buildPdfLink(item)` — `sourceFile` の有無でPDFボタン／無効ラベルを切り替え
- `#search` の `input` イベント — `data-search` 属性（title + keywords の結合）で絞り込み
- 末尾の IIFE — Service Worker 登録 + インストールバナー制御（`build_standalone.py` で除去対象）

### `build_standalone.py`

`index.html` に対して以下の変換を行う：
1. `manifest.json` リンクを削除
2. `buildPdfLink` 関数を「常に無効ラベルを返す」実装に置換
3. PWA/SW の IIFE ブロックをコメントに置換
4. `sw-status` 要素に `hidden` 属性を付加

### `sw.js`（Service Worker）

キャッシュ優先（Cache First）戦略。`CACHE_VERSION` を変更すると次回アクセス時に旧キャッシュが破棄される。`index.html` や PDF を更新したら `CACHE_VERSION` の番号を上げる。

### `build_nojs.js` / `_items_tmp.js`

JS なしの静的 HTML を Node.js で生成する旧スクリプト。現在の主流は `build_standalone.py`。`_items_tmp.js` は `_check.js` と同様に作業用の中間ファイル。

## 項目データの構造

`ITEMS` 配列の各オブジェクトのフィールド：

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | 重複しない英数字スネークケース |
| `title` | string | 表示タイトル |
| `shortLabel` | string | サブタイトル1行 |
| `keywords` | string[] | 検索用キーワード（`title` と結合して検索対象） |
| `summary` | HTML string | 要約（`<table class="detail-table">` 等を使用可） |
| `trickyPoints` | HTML string | 迷いやすいポイント（`<ul><li>` 形式が多い） |
| `noteTemplate` | string | 記録メモのテンプレート（`<pre>` 表示、エスケープ済みで渡す） |
| `sourceTitle` | string | 出典資料名 |
| `sourceFile` | string | `pdf/` 以下のパス（なければ空文字） |
| `sourcePages` | string | 該当ページ表記 |
| `updatedAt` | string | 更新日（`YYYY-MM-DD（備考）` 形式） |

## PDF 管理

- `pdf/` フォルダに配置し、対応項目の `sourceFile` を `"pdf/ファイル名.pdf"` に設定
- `sw.js` の `FILES_TO_CACHE` にも追加するとオフラインで開けるようになる
- スタンドアロン版（`医療参照ツール.html`）は PDF リンクを表示しない仕様

## スタイルガイド

- CSS 変数（`--accent`, `--warn`, `--bg` 等）でダーク/ライトモード対応済み
- テーブルには `class="detail-table"` を付与（既存のテーブルスタイルが適用される）
- `<strong>` で強調、`<u>` で下線（重要な数値の区切り等）
- `color:var(--warn)` で改定差分等の注意表記
