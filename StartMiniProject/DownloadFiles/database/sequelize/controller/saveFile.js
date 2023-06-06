import { File } from "../models/File.js";
import consoleColor from "../../../helper/consoleColor.js";

const saveFile = async (data) => {
  try {
    // Create file record
    const file = await File.create({
      id: data.id,
      gid: data.gid,
      url: data.url,
      alt: data.alt,
      name: data.name,
    });

    console.log(
      consoleColor(
        data.id,
        `Saved! Shopify ID: ${data.id}`
      )
    );
    return "Saved!";
  } catch (error) {
    console.error(`Error saving product: ${error}`);
    throw error;
  }
};

export default saveFile;
