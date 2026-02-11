import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: process.env.REGION || "ap-south-1",

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "secret",
  },
});

const bucketName = process.env.BUCKET_NAME || "prathap-constructions";

export const saveFile = async (
  blob: Blob | undefined,
  parentFolder: string,
  keyString = ""
) => {
  try {
    if (!blob) {
      return { ok: false, filename: "" };
    }

    let hash =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    let currentDateString = new Date().toISOString().split("T")[0];

    let extension = blob.type.split("/")[1];
    let filename =
      "uploads/" +
      parentFolder +
      "/" +
      currentDateString +
      "/" +
      blob.name +
      "." +
      hash +
      `${keyString ? `-${keyString}` : ""}` +
      "." +
      extension;
    // @ts-ignore
    const stream = Readable.from(blob.stream());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        ContentLength: blob.size,
        Key: filename,
        Body: stream,
      })
    );
    return { ok: true, filename };
  } catch (error) {
    console.error(error);

    return { ok: false, filename: "" };
  }
};

export const deleteFile = (filename: any) => {
  try {
    const parts = filename.split("/");
    const parentFolder = parts[1];
    const uploadedFileNameWithHash = parts[parts.length - 1];

    const uploadedFileNameParts = uploadedFileNameWithHash.split(".");
    const originalFileName = uploadedFileNameParts.slice(0, -2).join(".");
    const hash = uploadedFileNameParts[uploadedFileNameParts.length - 2];

    const reconstructedFilename = `uploads/${parentFolder}/${originalFileName}.${hash}.png`;

    s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: reconstructedFilename,
      })
    );
  } catch (error) {
    console.error(error);
  }
};

export const deliverFileOld = async (filename: any) => {
  try {
    let { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: filename,
      })
    );

    if (!Body) {
      return {
        ok: false,
        data: [],
      };
    }

    let buffer = await Body?.transformToByteArray();

    return {
      data: buffer,
      ok: true,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      data: [],
    };
  }
};

export const deliverFile = async (filename: any) => {
  try {
    let url = await getSignedUrl(
      // @ts-ignore
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: filename,
        ResponseContentDisposition: "inline",
        ResponseContentType: "image/png",
      }),
      {
        expiresIn: 3600, // 1 hour
      }
    );

    if (!url) {
      return {
        ok: false,
        data: [],
      };
    }

    return {
      data: url,
      ok: true,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      data: [],
    };
  }
};
