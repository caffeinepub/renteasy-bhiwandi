import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebaseConfig";

export async function uploadImages(files: File[], uid: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const path = `properties/${uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const snap = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snap.ref);
    urls.push(url);
  }
  return urls;
}

export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // Ignore if already deleted or not found
  }
}
