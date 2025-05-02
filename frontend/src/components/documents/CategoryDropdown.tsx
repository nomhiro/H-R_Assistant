import { FaPlus } from "react-icons/fa";
import { CategoryItem } from "@/models/models";

interface CategoryDropdownProps {
  categories: CategoryItem[];
  onCategoryChange: (categoryId: string) => void;
  onAddCategory: () => void;
  value: string; // 選択状態を制御するためのプロパティを追加
}

export default function CategoryDropdown({
  categories,
  onCategoryChange,
  onAddCategory,
  value,
}: CategoryDropdownProps) {
  return (
    <div className="flex items-center space-x-2">
      <select
        className="border p-2 min-w-[150px] max-w-full"
        onChange={(e) => onCategoryChange(e.target.value)}
        value={value} // 親コンポーネントから渡された選択状態を使用
      >
        <option value="" disabled>
          カテゴリを選択してください
        </option>
        {categories.map(({ id, category }) => (
          <option key={id} value={id}>
            {category}
          </option>
        ))}
      </select>
      <button
        className="bg-blue-500 text-white p-2 rounded-full"
        onClick={onAddCategory}
        aria-label="カテゴリを追加"
      >
        <FaPlus />
      </button>
    </div>
  );
}
