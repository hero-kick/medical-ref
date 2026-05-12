# 医療参照ツール

療養型病院での日常確認用、個人向け医療参照PWAです。

- **公開URL**: <https://hero-kick.github.io/medical-ref/>
- ローカルでも `index.html` をブラウザで開くだけで動作します（オフライン対応）

---

## 使い方

1. URL を開く（またはローカルの `index.html` をダブルクリック）
2. 上部の検索欄にキーワードを入力すると項目が絞り込まれる
3. 項目をタップ（クリック）すると詳細が展開される

---

## スマホ／タブレットで使う方法（推奨：GitHub Pages）

iPhone / iPad / Android、すべて共通で同じ手順です。

1. ブラウザで <https://hero-kick.github.io/medical-ref/> を開く
2. **iOS Safari**: 共有ボタン → 「ホーム画面に追加」
   **Android Chrome**: メニュー → 「アプリをインストール」または「ホーム画面に追加」
3. 以後はホーム画面のアイコンをタップするだけで起動。一度開けばオフラインでも動きます（Service Worker がキャッシュ）

### 内容を更新したいとき
PCで `index.html` を編集 → `sw.js` の `CACHE_VERSION` を1上げる → `git push` するだけ。
GitHub Pages が自動でデプロイし、次回スマホでアプリを起動した時にキャッシュが更新されます。

```bash
git add index.html sw.js
git commit -m "update content"
git push
```

### スマホ側でうまく更新が反映されないとき
- アプリ（PWA）を一度終了 → 再起動
- それでもダメなら Safari の履歴・ウェブサイトデータをクリアし、URLからホーム画面に追加し直す

### 旧方式（iCloud Drive にスタンドアロンHTMLを置く）
`build_standalone.py` で生成する `医療参照ツール.html` を iCloud Drive 経由で配布する方式は廃止予定です。
現在も完全オフライン用バックアップとして残っていますが、通常運用は GitHub Pages を使ってください。

### ローカルサーバーを立てる場合（PCで PWA 動作確認したいとき）
```bash
python -m http.server 8000
# → http://localhost:8000 でアクセス
```

---

## 項目の追加方法

`index.html` を任意のテキストエディタで開き、`ITEMS` 配列の末尾（`];` の直前）に
以下のテンプレートをコピーして値を入力してください。**HTML は他の箇所を変更する必要はありません。**

```javascript
{
  id: "unique_id",           // 重複しない英数字ID（例: "kansen_taisaku"）
  title: "項目名",
  shortLabel: "一言説明",
  keywords: ["検索", "キーワード"],
  summary: `
    <p>要約をHTML形式で記述。表を使う場合は detail-table クラスを付与。</p>
  `,
  trickyPoints: `
    <ul>
      <li>迷いやすいポイント1</li>
      <li>迷いやすいポイント2</li>
    </ul>
  `,
  noteTemplate: "記録に使えるテンプレート文字列",
  sourceTitle: "出典資料名",
  sourceFile: "pdf/ファイル名.pdf",  // PDFを pdf/ フォルダに置いた場合
  sourcePages: "p.3〜7",
  updatedAt: "2026-xx-xx",
},
```

---

## PDF の追加・差し替え方法

1. `pdf/` フォルダを作成する（なければ）
2. PDF ファイルを `pdf/` フォルダに入れる（例: `pdf/iryo_kubun_2024.pdf`）
3. 対応する項目オブジェクトの `sourceFile` を更新する

```javascript
sourceFile: "pdf/iryo_kubun_2024.pdf",
```

4. `index.html` をブラウザで再読み込みすると「公式PDFを開く」ボタンが有効になる

---

## ファイル構成

```
MedicalStorage/
├── index.html     ← メインファイル（これだけで動く）
├── README.md      ← このファイル
└── pdf/           ← PDFを置くフォルダ（任意。なくても動く）
    └── *.pdf
```

---

## どこを書き換えればよいか

| やりたいこと | 場所 |
|---|---|
| 項目を追加する | `index.html` 内の `const ITEMS = [...]` 配列 |
| 既存項目の内容を修正 | 各項目オブジェクトの `summary` / `trickyPoints` 等 |
| PDF リンクを設定する | 各項目の `sourceFile` フィールド |
| アプリ名を変える | `<h1>` タグ内のテキスト |
| 免責文を変える | `<p id="disclaimer">` タグ内のテキスト |

---

## 免責

このツールは個人用の参照補助です。  
診療・ケアの判断は必ず最新の公式資料・施設基準・主治医の指示に従ってください。
