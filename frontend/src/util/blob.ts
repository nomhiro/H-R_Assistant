// BlobStorage
import {
    BlobServiceClient,
    StorageSharedKeyCredential
} from '@azure/storage-blob';
import sharp from 'sharp'; // 画像処理ライブラリを追加

// ファイルを取得する
// output: base64
export const getBase64File = async (file_path: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const sharedKeyCredential = new StorageSharedKeyCredential(
            process.env.AZURE_STORAGE_ACCOUNT_NAME!,
            process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY!
        );
        const blobServiceClient = new BlobServiceClient(
            `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
            sharedKeyCredential
        );
        const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME!);
        const blobClient = containerClient.getBlobClient(file_path);

        // blobからデータをダウンロード
        const downloadResponse = await blobClient.download(0);

        // データを文字列に
        if (downloadResponse.readableStreamBody) {
            const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);

            // 画像を縮小
            const resizedBuffer = await resizeImage(downloaded);

            const mimeType = getMimeType(file_path); // MIMEタイプを取得
            const encodedData = `data:${mimeType};base64,${resizedBuffer.toString('base64')}`;
            resolve(encodedData);
        } else {
            reject('readableStreamBody is undefined');
        }
    });
};

// BlobのURLを取得する
export const getBlobUrl = async (file_path: string): Promise<string> => {
    const sharedKeyCredential = new StorageSharedKeyCredential(
        process.env.AZURE_STORAGE_ACCOUNT_NAME!,
        process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY!
    );
    const blobServiceClient = new BlobServiceClient(
        `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
        sharedKeyCredential
    );
    const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME!);
    const blobClient = containerClient.getBlobClient(file_path);

    // BlobのURLを生成
    return blobClient.url;
};

// 画像を縮小する関数
async function resizeImage(buffer: Buffer): Promise<Buffer> {
    try {
        return await sharp(buffer)
            .resize({ width: 800 }) // 幅を800pxに縮小（必要に応じて調整）
            .toBuffer();
    } catch (error) {
        console.error('画像の縮小に失敗しました:', error);
        throw error;
    }
}

// ファイルパスからMIMEタイプを推測
function getMimeType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'txt':
            return 'text/plain';
        case 'pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream';
    }
}

async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks.map(chunk => Uint8Array.from(chunk))));
        });
        readableStream.on('error', reject);
    });
}