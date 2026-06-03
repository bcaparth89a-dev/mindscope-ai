import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function embed() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "knowledge-base.txt"
  );

  const rawText = fs.readFileSync(
    filePath,
    "utf-8"
  );

  const splitter =
    new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 80,
    });

  const chunks =
    await splitter.splitText(rawText);

  console.log(`Chunks: ${chunks.length}`);

  for (const chunk of chunks) {
    const { error } =
      await supabase
        .from("documents")
        .insert({
          content: chunk,
          metadata: {
            source: "mindscope-ai",
          },
        });

    if (error) {
      console.error(error);
    } else {
      console.log("Inserted");
    }
  }

  console.log("Done");
}

embed();