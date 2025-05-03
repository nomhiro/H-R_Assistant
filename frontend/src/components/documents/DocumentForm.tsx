import { CosmosItem } from "@/models/models";

export default function DocumentForm({
  text,
  setText,
  isSubmitting,
  onSubmit,
  editingDocument,
}: {
  text: string;
  setText: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  editingDocument: CosmosItem | null;
}) {
  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("テキストを入力してください。");
      return;
    }

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
    } else {
      // 新規ドキュメントを登録
      onSubmit();
    }
  };

  return (
    <div className="w-full md:w-1/2 p-4">
      <h2 className="text-lg font-bold">
        {editingDocument ? "ドキュメントを修正" : "新規ドキュメントを登録"}
      </h2>
      <textarea
        className="border p-2 w-full mt-2"
        rows={4}
        placeholder="登録するテキストを入力してください"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className={`bg-blue-500 text-white px-4 py-2 mt-2 flex items-center justify-center ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
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
        {editingDocument ? "更新" : "登録"}
      </button>
    </div>
  );
}
