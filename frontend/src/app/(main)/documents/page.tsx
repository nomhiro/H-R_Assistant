"use client";

import { useState, useEffect, Suspense } from "react";
import { FaTrash } from "react-icons/fa";
import { CategoryItem, CosmosItem } from "@/models/models";
import CategoryDropdown from "../../../components/documents/CategoryDropdown";
import DocumentForm from "../../../components/documents/DocumentForm";
import DocumentList from "../../../components/documents/DocumentList";
import CategoryModal from "@/components/documents/CategoryModal";

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [documents, setDocuments] = useState<CosmosItem[]>([]);
  const [text, setText] = useState("");
  const [editingDocument, setEditingDocument] = useState<CosmosItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category");
      if (response.ok) {
        const data: CategoryItem[] = await response.json();
        setCategories(data);
      } else {
        alert("カテゴリの取得に失敗しました。");
      }
    } catch (error) {
      console.error("エラー:", error);
      alert("エラーが発生しました。");
    }
  };

  const fetchDocuments = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/category/getbycategoryid?categoryId=${categoryId}`);
      if (response.ok) {
        const data: CosmosItem[] = await response.json();
        setDocuments(data);
      } else {
        const errorData = await response.json();
        alert(`ドキュメントの取得に失敗しました: ${errorData.message}`);
      }
    } catch (error) {
      console.error("エラー:", error);
      alert("エラーが発生しました。");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setDocuments([]);
    fetchDocuments(categoryId);
  };

  const handleCategorySubmit = async (categoryName: string) => {
    const method = editingCategory ? "PATCH" : "POST";
    const url = `/api/category`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCategory?.id, category: categoryName }),
      });

      if (response.ok) {
        const newCategory = await response.json(); // 新しいカテゴリ情報を取得
        setEditingCategory(null);
        setIsCategoryModalOpen(false);
        fetchCategories();
        setSelectedCategory(newCategory.id); // 追加したカテゴリを選択
        setDocuments([]); // ドキュメント一覧をクリア
        setText(""); // ドキュメント登録更新フォームをクリア
        setEditingDocument(null); // 編集状態をリセット
      } else {
        alert(editingCategory ? "カテゴリの更新に失敗しました。" : "カテゴリの追加に失敗しました。");
      }
    } catch (error) {
      console.error("エラー:", error);
      alert("エラーが発生しました。");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("このカテゴリを削除しますか？")) return; // 確認ダイアログを追加

    try {
      const response = await fetch(`/api/category`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoryId }),
      });

      if (response.ok) {
        setDocuments([]); // ドキュメントリストもクリア
        await fetchCategories(); // カテゴリリストを更新
        setSelectedCategory(""); // カテゴリ選択をクリア
      } else {
        const errorData = await response.json();
        alert(errorData.message || "カテゴリの削除に失敗しました。");
      }
    } catch (error) {
      console.error("エラー:", error);
      alert("エラーが発生しました。");
    }
  };

  return (
    <main className="flex flex-col text-gray-800 w-full h-full overflow-y-auto">
      <h1 className="text-xl font-bold text-center">ドキュメント管理</h1>
      <div className="flex justify-center items-center p-4 space-x-2">
        <Suspense fallback={<p>カテゴリを取得中...</p>}>
          <CategoryDropdown
            categories={categories}
            onCategoryChange={handleCategoryChange}
            onAddCategory={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            value={selectedCategory} // ドロップダウンの選択状態をバインド
          />
        </Suspense>
        {selectedCategory && (
          <button
            className="bg-red-500 text-white p-2 rounded-full"
            onClick={() => handleDeleteCategory(selectedCategory)}
          >
            <FaTrash />
          </button>
        )}
      </div>
      {selectedCategory && (
        <div className="flex flex-col md:flex-row flex-1">
          <DocumentForm
            text={text}
            setText={setText}
            isSubmitting={isSubmitting}
            onSubmit={async () => {
              if (!text.trim()) return alert("テキストを入力してください。");
              if (!selectedCategory) return alert("カテゴリを選択してください。");

              setIsSubmitting(true);
              try {
                const method = editingDocument ? "PATCH" : "POST";
                const url = `/api/document`;

                const payload = {
                  category_id: selectedCategory,
                  content: text,
                };

                const response = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });

                if (response.ok) {
                  alert(editingDocument ? "更新が成功しました！" : "登録が成功しました！");
                  setText("");
                  setEditingDocument(null);
                  fetchDocuments(selectedCategory);
                } else {
                  alert(editingDocument ? "更新に失敗しました。" : "登録に失敗しました。");
                }
              } catch (error) {
                console.error("エラー:", error);
                alert("エラーが発生しました。");
              } finally {
                setIsSubmitting(false);
              }
            }}
            editingDocument={editingDocument}
          />
          <DocumentList
            documents={documents}
            onEdit={(doc) => {
              setEditingDocument(doc);
              setText(doc.content);
            }}
            onDelete={async (docId) => {
              if (!confirm("本当にこのドキュメントを削除しますか？")) return;

              try {
                const response = await fetch(`/api/document`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: docId }),
                });

                if (response.ok) {
                  alert("削除が成功しました！");
                  fetchDocuments(selectedCategory);
                } else {
                  const errorData = await response.json();
                  alert(`削除に失敗しました: ${errorData.message}`);
                }
              } catch (error) {
                console.error("エラー:", error);
                alert("エラーが発生しました。");
              }
            }}
          />
        </div>
      )}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCategorySubmit}
        initialCategory={editingCategory?.category}
      />
    </main>
  );
}
