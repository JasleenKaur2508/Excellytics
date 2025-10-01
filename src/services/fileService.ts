import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db } from '@/config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export interface FileData {
  id?: string;
  name: string;
  url: string;
  userId: string;
  uploadedAt: Date;
  size: number;
  type: string;
}

export const uploadFile = async (file: File, userId: string): Promise<FileData> => {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `uploads/${userId}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Create file data for Firestore
    const fileData: FileData = {
      name: file.name,
      url: downloadURL,
      userId,
      uploadedAt: new Date(),
      size: file.size,
      type: file.type,
    };

    // Save file metadata to Firestore
    const docRef = await addDoc(collection(db, 'files'), fileData);
    
    return { ...fileData, id: docRef.id };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getUserFiles = async (userId: string): Promise<FileData[]> => {
  try {
    const q = query(collection(db, 'files'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FileData[];
  } catch (error) {
    console.error('Error getting user files:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string, filePath: string): Promise<void> => {
  try {
    // Delete file from storage
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    
    // Delete file reference from Firestore
    await deleteDoc(doc(db, 'files', fileId));
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const analyzeExcel = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Basic analysis
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);
        
        const analysis = {
          totalRows: rows.length,
          totalColumns: headers.length,
          headers,
          columnStats: {},
          sampleData: rows.slice(0, 5), // First 5 rows as sample
        };
        
        // Generate basic stats for each column
        headers.forEach((header, colIndex) => {
          const columnData = rows.map(row => row[colIndex]);
          const numericValues = columnData.filter(val => !isNaN(parseFloat(val)));
          
          analysis.columnStats[header] = {
            type: numericValues.length > 0 ? 'number' : 'string',
            total: numericValues.length,
            unique: new Set(columnData).size,
            numericValues: numericValues.length > 0 ? {
              min: Math.min(...numericValues),
              max: Math.max(...numericValues),
              sum: numericValues.reduce((a, b) => a + b, 0),
              avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            } : null
          };
        });
        
        resolve(analysis);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};
