// BlobStorage
import {
    BlobServiceClient,
    StorageSharedKeyCredential
} from '@azure/storage-blob';


const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME!,
    process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY!
);
const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
);
const imageContainerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME_IMAGE!);
const docsContainerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME_DOCS!);

// ファイルを取得する
// output: base64
export const getBase64File = async (file_path: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const blobClient = imageContainerClient.getBlobClient(file_path);

        //blobからデータをダウンロード
        const downloadResponse = await blobClient.download(0);

        //データを文字列に
        let encodedData = '';
        if (downloadResponse.readableStreamBody) {
            const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
            encodedData = downloaded.toString('base64');
            resolve(encodedData);
        } else {
            reject('readableStreamBody is undefined');
        }

        resolve(encodedData);

    });
};

async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Uint8Array ? data : new Uint8Array(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

/**
 * 指定されたフォルダ（階層構造あり）にファイルをアップロードする
 * @param folderPath フォルダパス
 * @param file ファイル
 */
export const uploadFileToFolder = (folderPath: string, file: File): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const blockBlobClient = docsContainerClient.getBlockBlobClient(`${folderPath}/${file.name}`);

            console.log("🚀ファイルのarrayBufferを取得します");
            const arrayBuffer = await (file as File).arrayBuffer();
            console.log("🚀arrayBuffer取得成功");

            await blockBlobClient.uploadData(new Uint8Array(arrayBuffer));

            console.log(`🚀Upload success: ${folderPath}/${file.name}`);
            resolve();
        } catch (error) {
            console.error(`❌Upload error: ${folderPath}/${file.name}`, error);
            reject(error);
        }
    });
}