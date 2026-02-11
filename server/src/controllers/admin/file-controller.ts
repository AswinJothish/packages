import { Elysia, t } from "elysia";
import {  saveFile } from "../../lib/file";

export const FileController = new Elysia({
  prefix: "/files",
})
.get(
  "/view",
  async ({ set, query }) => {
    try {
      let { key } = query;

      const file = Bun.file(key);

      let buffer = await file.arrayBuffer();

      const blob = new Blob([buffer], {
        type: "image/png",
      });

      set.headers["Content-Type"] = "image/png";

      return blob;
    } catch (error: any) {
      set.status = 400;

      console.error(error);

      return {
        message: error.message,
        ok: false,
      };
    }
  },
  {
    query: t.Object({
      key: t.String(),
    }),
    detail: {
      tags: ["File"],
      description: "View a file",
    },
  }
)

.post(
  "/upload",
  async ({ set, body }) => {
    try {
      const { file } = body;

      const { ok, filename } = await saveFile(file, "admin");

      if (ok) {
        set.status = 200;
        return {
          message: "File uploaded",
          ok: true,
          filename,
        };
      }

      return {
        message: "Failed to upload file",
        ok: false,
      };
    } catch (error: any) {
      set.status = 400;

      console.error(error);

      return {
        message: "Failed to upload file",
        ok: false,
      };
    }
  },
  {
    body: t.Object({
      file: t.File(),
    }),
    detail: {
      tags: ["File"],
      description: "Upload a file",
    },
  }
)
  // .get(
  //   "/view",
  //   async ({ set, query }) => {
  //     let { ok, data } = await deliverFile(query.key);

  //     if (ok) {
  //       const blob = new Blob([data as Uint8Array], {
  //         type: "image/png",
  //       });

  //       set.headers["Content-Type"] = "image/png";

  //       return blob;
  //     }

  //     return {
  //       message: "File not found",
  //       ok: false,
  //     };
  //   },
  //   {
  //     query: t.Object({
  //       key: t.String(),
  //     }),
  //     detail: {
  //       tags: ["File"],
  //       description: "View a file",
  //     },
  //   }
  // );
