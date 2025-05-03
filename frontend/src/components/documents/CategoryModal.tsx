import React, { useState, useEffect } from "react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryName: string) => void;
  initialCategory?: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCategory = "",
}) => {
  const [categoryName, setCategoryName] = useState(initialCategory);

  useEffect(() => {
    if (isOpen) {
      setCategoryName(initialCategory || "");
    }
  }, [isOpen, initialCategory]);

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      alert("カテゴリ名を入力してください。");
      return;
    }
    onSubmit(categoryName);
    setCategoryName("");
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
