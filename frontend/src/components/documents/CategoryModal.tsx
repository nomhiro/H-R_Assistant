import React, { useState, useEffect } from "react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryName: string) => Promise<void>;
  initialCategory?: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCategory = "",
}) => {
  const [categoryName, setCategoryName] = useState(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false); // 処理中状態を管理

  useEffect(() => {
    if (isOpen) {
      setCategoryName(initialCategory || "");
    }
  }, [isOpen, initialCategory]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      alert("カテゴリ名を入力してください。");
      return;
    }

    setIsSubmitting(true); // ボタンを非活性にする
    try {
      await onSubmit(categoryName);
      setCategoryName("");
    } catch (error) {
      console.error("エラー:", error);
    } finally {
      setIsSubmitting(false); // 処理終了後にボタンを有効化
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">カテゴリを{initialCategory ? "編集" : "追加"}</h2>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="カテゴリ名を入力"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
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
            ) : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
