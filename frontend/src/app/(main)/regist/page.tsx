"use client";

import { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import axios from "axios";

export default function AssistantPage() {
  const [file, setFile] = useState<File | null>(null);
  const [folderPath, setFolderPath] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFolderPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderPath(e.target.value);
  };

  const handleFileUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderPath", folderPath);
      setIsUploading(true);

      try {
        await axios.post("/api/data/regist", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("ファイルがアップロードされました");
      } catch (error) {
        console.error("ファイルアップロードエラー:", error);
        alert("ファイルアップロードに失敗しました");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // const handleTextUpload = async () => {
  //   if (text.trim() === "") {
  //     alert("テキストを入力してください");
  //     return;
  //   } else if (folderPath.trim() === "") {
  //     alert("フォルダパスを入力してください");
  //     return;
  //   }

  //   setIsUploading(true);
  //   try {
  //     await axios.post("/api/data/regist", { text });
  //     alert("テキストがアップロードされました");
  //   } catch (error) {
  //     console.error("テキストアップロードエラー:", error);
  //     alert("テキストアップロードに失敗しました");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full p-4 gap-4">
      <Tabs className="w-full">
        <TabList className="flex justify-center gap-4 mb-4">
          <Tab>ファイル登録</Tab>
          <Tab>テキスト登録</Tab>
        </TabList>

        <TabPanel>
          <div className="flex flex-col items-center w-full">
            <div className="flex flex-col items-start gap-4 w-1/2"> {/* 中央部分で左揃え */}
              <input
                type="text"
                value={folderPath}
                onChange={handleFolderPathChange}
                placeholder="フォルダパスを入力（最初と最後の/は不要）"
                className="p-2 border rounded w-full"
              />
              <input type="file" onChange={handleFileChange} className="p-2 border rounded w-full" />
              <button
                className="bg-blue-500 text-white rounded p-2 w-fit"
                onClick={handleFileUpload}
                disabled={isUploading}
              >
                {isUploading ? "アップロード中..." : "アップロード"}
              </button>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-start gap-4 w-1/2"> {/* 中央部分で左揃え */}
              {/* <input
                type="text"
                value={folderPath}
                onChange={handleFolderPathChange}
                placeholder="フォルダパスを入力（最初と最後の/は不要）"
                className="p-2 border rounded w-full"
              />
              <textarea value={text} onChange={handleTextChange} className="p-2 border rounded w-full h-40" />
              <button
                className="bg-blue-500 text-white rounded p-2 w-fit"
                onClick={handleTextUpload}
                disabled={isUploading}
              >
                {isUploading ? "アップロード中..." : "アップロード"}
              </button> */}
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}