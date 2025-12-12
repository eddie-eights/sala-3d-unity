# テスト計画と結果

## 概要

`apps/web` に Vitest + Testing Library を使用したサービスレイヤーテストと UI コンポーネントテストを導入。

---

## テスト構成

### 依存関係

```
vitest @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @vitejs/plugin-react
```

### 設定ファイル

- `vitest.config.ts` - Vitest 設定（jsdom 環境、パスエイリアス）
- `vitest.setup.ts` - jest-dom matchers

### 実行コマンド

```bash
cd apps/web && pnpm test      # テスト実行
cd apps/web && npx vitest run # ワンショット実行
```

---

## テストケース

### サービスレイヤーテスト

#### `/api/chat/route.test.ts` (3 テスト)

| テスト                           | 説明                            |
| -------------------------------- | ------------------------------- |
| 有効なメッセージで正常レスポンス | POST リクエストで AI 応答を返す |
| メッセージ未指定で 400 エラー    | バリデーションエラー            |
| 会話履歴を含むリクエスト         | history 付きリクエストの処理    |

#### `/api/profile/route.test.ts` (5 テスト)

| テスト                            | 説明                          |
| --------------------------------- | ----------------------------- |
| GET: 未認証で 401                 | セッションなしで Unauthorized |
| GET: 認証済みでユーザーデータ返却 | 正常なプロフィール取得        |
| GET: ユーザー未発見で 404         | DB にユーザーがない場合       |
| PUT: 未認証で 401                 | セッションなしで Unauthorized |
| PUT: 正常にプロフィール更新       | 更新成功で success: true      |

---

### UI コンポーネントテスト

#### `button.test.tsx` (9 テスト)

- children 付きレンダリング
- クリックイベントハンドリング
- disabled 状態
- default バリアント
- ghost バリアント
- outline バリアント
- small サイズ (h-8)
- large サイズ (h-10)
- asChild でリンクとしてレンダリング

#### `input.test.tsx` (9 テスト)

- textbox としてレンダリング
- プレースホルダー表示
- disabled 状態
- disabled スタイリング
- value 変更ハンドリング
- カスタム className 適用
- ref 転送
- email タイプ
- password タイプ

---

## テスト結果

**実行日時**: 2025-12-12 11:44

```
 ✓ app/api/chat/route.test.ts (3 tests) 35ms
 ✓ components/ui/input.test.tsx (9 tests) 188ms
 ✓ components/ui/button.test.tsx (9 tests) 217ms
 ✓ app/api/profile/route.test.ts (5 tests) 381ms

 Test Files  4 passed (4)
      Tests  26 passed (26)
   Duration  1.24s
```

**結果**: ✅ 全 26 テストパス
