import { unlinkSync } from "node:fs";

export const saveFile = (blob: Blob | undefined, parentFolder: string) => {
  try {
    if (!blob) {
      return { ok: false, filename: "" };
    }

    const newBlob = new Blob([blob], {
      type: "image/png",
    });

    let hash =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    let filename =
      "uploads/" + parentFolder + "/" + hash + "." + blob.name.split('.').pop();

    Bun.write(filename, newBlob);

    return { ok: true, filename };
  } catch (error) {
    console.error(error);
    return { ok: false, filename: "" };
  }
};


  // export const deliverFile = (filename: any) => {
  // return  `http://localhost:4000/view`;
  // };

export const deleteFile = (filename: any) => {
  try {
    const parts = filename.split("/");
    const parentFolder = parts[1];
    const uploadedFileNameWithHash = parts[parts.length - 1];

    const uploadedFileNameParts = uploadedFileNameWithHash.split(".");
    const originalFileName = uploadedFileNameParts.slice(0, -2).join(".");
    const hash = uploadedFileNameParts[uploadedFileNameParts.length - 2];

    const reconstructedFilename = `uploads/${parentFolder}/${originalFileName}.${hash}.png`;

    unlinkSync(reconstructedFilename);
  } catch (error) {
    console.error(error);
  }
};

