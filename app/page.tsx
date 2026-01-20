'use client';

import { useState } from 'react';

interface AnalysisResult {
  likes?: number;
  comments?: number;
  impactfulWords: string[];
  paradoxes: string[];
  readerVoices: string[];
  desires: string[];
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url) {
      setError('URLを入力してください');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '分析に失敗しました' }));
        throw new Error(errorData.error || `分析に失敗しました（ステータス: ${response.status}）`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('分析エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            LPリサーチ分析ツール
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Gemini 1.5 FlashでLPを分析し、スプレッドシートに保存します
          </p>

          {/* URL入力フォーム */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LPのURL
            </label>
            <div className="flex gap-4">
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/lp"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? '分析中...' : '分析開始'}
              </button>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* 分析結果表示 */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">分析結果</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {result.likes !== undefined && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">いいね</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.likes}</p>
                  </div>
                )}
                {result.comments !== undefined && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">コメント数</h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.comments}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {result.impactfulWords.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">刺さる言葉</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.impactfulWords.map((word, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.paradoxes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">逆説</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {result.paradoxes.map((paradox, index) => (
                        <li key={index}>{paradox}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.readerVoices.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">読者の代弁</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {result.readerVoices.map((voice, index) => (
                        <li key={index}>{voice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.desires.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">望み</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {result.desires.map((desire, index) => (
                        <li key={index}>{desire}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
