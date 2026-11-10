# 原神 聖遺物マネージャー (Genshin Artifact Manager) ✨

原神の所持聖遺物を管理し、キャラクターごとの最適聖遺物の確認、装備シミュレーション、目標ステータスに対する過不足（ギャップ）分析が行える Next.js Webアプリケーションです。

スマホ・PC双方に最適化されたレスポンシブUI、全126キャラクター＆全63聖遺物セットの公式画像・データに対応しています。

---

## 🌟 主な機能

1. **聖遺物管理 (CRUD & CVスコア)**
   - 聖遺物の登録、編集、削除
   - 会心スコア (CV) の自動計算（会心ダメージ + 会心率 × 2）
   - 部位・聖遺物セット・装備状況による絞り込み・検索・ソート
   - JSONファイルによるエクスポート・インポート・バックアップ
2. **全キャラクター推奨ビルド & ガイド (全126キャラ)**
   - 最適聖遺物セット（2P/4P効果・写真付き）、時計・杯・冠の推奨メインステータス
   - 優先サブステータス、目標ステータス指標、運用・育成アドバイス
3. **装備シミュレーター & リアルタイムステータス計算**
   - 5部位（花・羽・砂・杯・冠）の装備付け替え
   - 2P/4Pセット効果の自動発動判定
   - キャラ推奨ビルドに基づく「最適自動装備」ワンクリック機能
4. **ステータス達成度 & ギャップ分析 (レーダーチャート)**
   - 目標ステータスとの過不足（不足/適正/過剰）をリアルタイム判定
   - SVGレスポンシブレーダーチャートと総合目標達成スコア (100点満点)
   - 聖遺物構成に対する具体的な改善アドバイス
5. **所持キャラクター設定 & 厳選満足マーク (👑)**
   - 全キャラから自分の「所持キャラ」のみを選択・一括管理
   - 厳選が完了した満足キャラクターに王冠マーク（👑）を付与
6. **マルチデバイス & クラウドDB永続化対応**
   - スマホ向け固定ボトムナビゲーション & タッチ最適化UI
   - ローカルSQLiteファイル (`data/genshin.db`) またはサーバーレスクラウドDB ([Turso](https://turso.tech/)) のシームレス両対応

---

## 🚀 ローカル起動方法

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動 (Webpackモード)
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## 📦 GitHub へのプッシュ手順

新規リポジトリを GitHub で作成した後、以下のコマンドでプッシュします：

```bash
# 1. リモートリポジトリの追加 (YOUR_USERNAME と REPO_NAME を置き換えてください)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 2. メインブランチをプッシュ
git branch -M main
git push -u origin main
```

---

## ☁️ Vercel へのデプロイ手順

### 1. Vercel と GitHub リポジトリを連携
1. [Vercel](https://vercel.com/) にログインし、**「Add New...」→「Project」** を選択します。
2. GitHub 上の該当リポジトリ（`gnsn-artifacts`）を **Import** します。
3. Framework Preset が `Next.js` になっていることを確認し、**「Deploy」** をクリックします。

### 2. データベースの永続化設定（Turso: 推奨・無料）
Vercelはサーバーレス環境のため、無料のクラウドSQLiteサービス [Turso](https://turso.tech/) を使うことで、ブラウザや端末（PC・スマホ）を問わずデータが完全に永続化・同期されます。

1. [Turso](https://turso.tech/) でアカウントを作成し、データベースを作成します：
   ```bash
   turso db create genshin-db
   turso db show genshin-db --url
   turso db tokens create genshin-db
   ```
2. Vercel のダッシュボードで **Project Settings → Environment Variables** に以下を追加します：
   - `TURSO_DATABASE_URL`: `libsql://genshin-db-xxxx.turso.io`
   - `TURSO_AUTH_TOKEN`: `eyJhbGci...`
3. 再デプロイすると、自動的にクラウドDBと連携されます。

※ Turso環境変数を設定しない場合でも、ブラウザの localStorage キャッシュにより快適にご利用いただけます。

---

## 🛠 技術スタック
- **Framework**: Next.js 16 (App Router)
- **UI / Styling**: React 19, Tailwind CSS 4, Lucide React
- **Database**: LibSQL (@libsql/client) - SQLite & Turso Cloud DB
- **Data Source**: genshin-db (v5.2.15) & Enka.Network UI CDN
