import { CosmosItem } from "@/models/models";
import { useEffect, useRef } from "react"; // useEffectを追加

export default function DocumentForm({
  text,
  setText,
  isSubmitting,
  setIsSubmitting,
  onSubmit,
  editingDocument,
}: {
  text: string;
  setText: (value: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onSubmit: () => void;
  editingDocument: CosmosItem | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null); // テキストエリアの参照を作成

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // 高さをリセット
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 内容に応じた高さを設定
    }
  };

  useEffect(() => {
    adjustTextareaHeight(); // 編集時に高さを調整
  }, [text]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustTextareaHeight(); // 入力変更時に高さを調整
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("テキストを入力してください。");
      return;
    }

    setIsSubmitting(true); // ボタンを非活性にする
    try {
      if (editingDocument) {
        // ドキュメントを更新
        await fetch(`/api/document`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingDocument.id,
            category_id: editingDocument.category_id, // 必要なカテゴリIDを含める
            content: text,
          }),
        });
        await onSubmit(); // ドキュメントリストを再取得
      } else {
        // 新規ドキュメントを登録
        await onSubmit();
      }
    } catch (error) {
      console.error("エラー:", error);
    } finally {
      setIsSubmitting(false); // 処理終了後にボタンを有効化
    }
  };

  return (
    <div className="w-full md:w-1/2 p-4">
      <h2 className="text-lg font-bold text-center"> {/* 中央揃えに変更 */}
        {editingDocument ? "ドキュメントを修正" : "新規ドキュメントを登録"}
      </h2>
      <textarea
        ref={textareaRef} // テキストエリアに参照を設定
        className="border p-2 w-full mt-2 resize-none overflow-hidden text-sm" // 文字サイズを小さめに変更
        rows={4}
        placeholder="登録するテキストを入力してください"
        value={text}
        onChange={handleInputChange} // 入力変更時に高さを調整
      />
      <div className="flex justify-center mt-4"> {/* ボタンを中央に配置 */}
        <button
          className={`bg-blue-500 text-white px-4 py-2 flex items-center justify-center rounded-full ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`} // rounded-fullを追加して角を丸くする
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <svg
              className="animate-spin h-5 w-5 text-white mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : null}
          {isSubmitting ? "処理中..." : editingDocument ? "更新" : "登録"}
        </button>
      </div>
    </div>
  );
}
