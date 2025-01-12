import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadFileToFolder } from "@/util/blob";

export const POST = async (req: NextRequest) => {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const folderPath = formData.get("folderPath");

      console.log("formData:", formData);
      console.log("file:", file);
      console.log("folderPath:", folderPath);

      if (file && typeof folderPath === 'string') {
        console.log("🚀ファイル（PDF、画像ファイル）を登録します");
        console.log("🚀フォルダパス: ", folderPath);
        console.log("🚀ファイル名: ", (file as File).name);

        if (file instanceof File) {
          console.log("🚀ファイルはFileインスタンスです");
          try {
            await uploadFileToFolder(folderPath, file);
          } catch (error) {
            console.error(`❌ ファイルのアップロード中にエラーが発生しました: ${error}`);
          }
        } else {
          console.log("❌ ファイルがFileインスタンスではありません");
        }
      } else {
        console.log("❌ ファイルまたはフォルダパスがアップロードされていません。");
      }
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      const text = json.text;
      console.log("🚀 テキストデータを登録します。text: ", text);
    }

    return NextResponse.json({ message: "📄 データが正常に登録されました" }, { status: 200 });
  } catch (error) {
    console.error("❌ データ登録エラー:", error);
    return NextResponse.json({ message: "❌ データ登録に失敗しました" }, { status: 500 });
  }
};