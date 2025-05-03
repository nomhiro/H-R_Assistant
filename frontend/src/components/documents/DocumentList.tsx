import { CosmosItem } from "@/models/models";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function DocumentList({
  documents,
  onEdit,
  onDelete,
  onAdd,
}: {
  documents: CosmosItem[];
  onEdit: (document: CosmosItem) => void;
  onDelete: (documentId: string) => void;
  onAdd: () => void; // 新規追加用のプロパティを追加
}) {
  return (
    <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">ドキュメント一覧</h2>
        <button
          className="text-green-500 text-sm"
          onClick={onAdd} // プラスアイコンを押したときにonAddを呼び出す
        >
          <FaPlus />
        </button>
      </div>
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500 mt-2">ドキュメントがありません。</p>
      ) : (
        <ul className="mt-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="border-b py-2 flex justify-between items-center"
            >
              <p className="text-sm">{doc.file_name}</p>
              <div className="flex space-x-2">
                <button
                  className="text-blue-500 text-sm"
                  onClick={() => onEdit(doc)}
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 text-sm"
                  onClick={() => onDelete(doc.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
