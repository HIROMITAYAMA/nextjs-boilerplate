import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URLが必要です' },
        { status: 400 }
      );
    }

    // HTMLを取得
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (!response.ok) {
        return NextResponse.json(
          { error: `URLからHTMLを取得できませんでした（ステータス: ${response.status}）` },
          { status: 400 }
        );
      }
      html = await response.text();
    } catch (fetchError) {
      console.error('HTML取得エラー:', fetchError);
      return NextResponse.json(
        { error: `URLにアクセスできませんでした。CORSエラーやネットワークエラーの可能性があります。\nエラー: ${fetchError instanceof Error ? fetchError.message : '不明なエラー'}` },
        { status: 400 }
      );
    }

    // HTMLをパース
    const $ = cheerio.load(html);
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    const title = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    // Gemini APIキーの確認
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'Gemini APIキーが設定されていません。.env.localファイルにGEMINI_API_KEYを設定してください。' },
        { status: 500 }
      );
    }

    // Gemini APIで分析（直接fetch APIを使用）
    let analysisResult;
    try {
      const prompt = `
以下のLPの内容を分析してください。

タイトル: ${title}
説明: ${metaDescription}
本文: ${text.substring(0, 10000)}（最初の10000文字）

以下の項目を抽出してください：

1. **いいね**: 数値（見つからない場合はnull）
2. **コメント数**: 数値（見つからない場合はnull）
3. **刺さる言葉**: 読者の心に響く言葉やフレーズを配列で（最大10個）
4. **逆説**: 一般的な常識と逆の主張や表現を配列で（最大5個）
5. **読者の代弁**: 読者の気持ちや悩みを代弁している表現を配列で（最大5個）
6. **望み**: 読者が持っている願望や理想を表現している部分を配列で（最大5個）

JSON形式で返してください。以下の形式で：
{
  "likes": 数値またはnull,
  "comments": 数値またはnull,
  "impactfulWords": ["言葉1", "言葉2", ...],
  "paradoxes": ["逆説1", "逆説2", ...],
  "readerVoices": ["代弁1", "代弁2", ...],
  "desires": ["望み1", "望み2", ...]
}
`;

      // Gemini APIを呼び出す（gemini-2.5-flashを使用）
      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Gemini API error: ${apiResponse.status} - ${errorText}`);
      }

      const apiData = await apiResponse.json();
      const response_text = apiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // JSONを抽出（```json で囲まれている場合がある）
      let jsonText = response_text;
      const jsonMatch = response_text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        // ``` で囲まれている場合
        const codeMatch = response_text.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonText = codeMatch[1];
        }
      }

      // JSONパース
      try {
        analysisResult = JSON.parse(jsonText.trim());
      } catch (parseError) {
        console.error('JSONパースエラー:', parseError);
        console.error('レスポンステキスト:', response_text);
        return NextResponse.json(
          { error: `JSONパースに失敗しました。Gemini APIのレスポンスが不正です。\nレスポンス: ${response_text.substring(0, 200)}...` },
          { status: 500 }
        );
      }
    } catch (apiError: any) {
      console.error('Gemini APIエラー:', apiError);
      const errorMessage = apiError?.message || '不明なエラー';
      const errorStatus = apiError?.status || 500;
      
      // APIキー関連のエラーかチェック
      if (errorMessage.includes('API_KEY') || errorMessage.includes('api key') || errorStatus === 401 || errorStatus === 403) {
        return NextResponse.json(
          { error: `Gemini APIキーが無効です。APIキーを確認してください。\nエラー: ${errorMessage}` },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `Gemini API呼び出しに失敗しました。\nエラー: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Google Sheetsに保存（後で実装）
    // await saveToGoogleSheets(url, analysisResult);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('分析エラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '分析に失敗しました' },
      { status: 500 }
    );
  }
}
