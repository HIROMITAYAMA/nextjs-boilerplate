# LPリサーチ分析ツール

Gemini 3.0を使ってLPを分析し、スプレッドシートに保存するツールです。

## 機能

- LPのURLを入力して分析
- Gemini 3.0で以下の項目を抽出：
  - いいね（数）
  - コメント数
  - 刺さる言葉
  - 逆説
  - 読者の代弁
  - 望み
- 分析結果をGoogle Sheetsに保存（実装中）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下を設定：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Gemini APIキーの取得方法**：
1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. APIキーを生成
3. `.env.local` に設定

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使い方

1. LPのURLを入力
2. 「分析開始」ボタンをクリック
3. 分析結果が表示されます
4. （今後）自動的にGoogle Sheetsに保存されます

## 技術スタック

- **Next.js 16** - Reactフレームワーク
- **Gemini 3.0** - AI分析
- **Cheerio** - HTMLパース
- **Google Sheets API** - データ保存（実装中）

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
