import { db, storage } from '@/config/firebase';
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import * as XLSX from 'xlsx';

export type AnalysisRecord = {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  date: string;
  chartType: string;
  status: 'completed' | 'processing' | 'failed';
  insights: number;
  columns: string[];
  data: any[];
  chartConfig?: any;
};

export type Insight = {
  id: string;
  analysisId: string;
  type: 'trend' | 'anomaly' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  action: string;
  createdAt: string;
};

// Upload file to Firebase Storage under uploads/{userId}/{timestamp}-{filename}
export const uploadFile = async (file: File, userId: string, onProgress?: (percent: number) => void): Promise<string> => {
  const filePath = `uploads/${userId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  const task = uploadBytesResumable(storageRef, file);
  return await new Promise<string>((resolve, reject) => {
    task.on('state_changed', (snapshot) => {
      if (onProgress) {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(pct);
      }
    }, (error) => {
      reject(error);
    }, async () => {
      try {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      } catch (e) {
        reject(e);
      }
    });
  });
};

// Parse the uploaded Excel file from its URL and return columns + data
export const processExcelFile = async (fileUrl: string): Promise<{ columns: string[], data: any[] }> => {
  const resp = await fetch(fileUrl);
  const arrayBuffer = await resp.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });
  const columns = json.length > 0 ? Object.keys(json[0]) : [];
  // Normalize keys by trimming whitespace
  const normalized = json.map((row) => {
    const out: any = {};
    Object.keys(row).forEach((k) => {
      const nk = String(k).trim();
      out[nk] = row[k];
    });
    return out;
  });
  return { columns, data: normalized };
};

// Save analysis to Firestore
export const saveAnalysis = async (analysis: Omit<AnalysisRecord, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'analyses'), {
    ...analysis,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get analyses for a user ordered by creation time desc
export const getUserAnalyses = async (userId: string): Promise<AnalysisRecord[]> => {
  const q = query(collection(db, 'analyses'), where('userId', '==', userId), orderBy('date', 'desc'), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const getAnalysis = async (analysisId: string): Promise<AnalysisRecord | null> => {
  const d = await getDoc(doc(db, 'analyses', analysisId));
  return d.exists() ? ({ id: d.id, ...(d.data() as any) }) : null;
};

export const updateAnalysisStatus = async (analysisId: string, status: AnalysisRecord['status']) => {
  await setDoc(doc(db, 'analyses', analysisId), { status }, { merge: true });
};

// Save insights to Firestore (batched via Promise.all)
export const saveInsights = async (insights: Omit<Insight, 'id'>[]): Promise<string[]> => {
  const writes = insights.map(insight => addDoc(collection(db, 'insights'), { ...insight, createdAt: serverTimestamp() }));
  const refs = await Promise.all(writes);
  return refs.map(r => r.id);
};

export const getAnalysisInsights = async (analysisId: string): Promise<Insight[]> => {
  const filterId = analysisId === 'recent' ? null : analysisId;
  if (filterId) {
    const q = query(collection(db, 'insights'), where('analysisId', '==', filterId), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any), createdAt: (d.data() as any).createdAt?.toDate?.().toISOString?.() || new Date().toISOString() }));
  }
  const q = query(collection(db, 'insights'), orderBy('createdAt', 'desc'), limit(25));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any), createdAt: (d.data() as any).createdAt?.toDate?.().toISOString?.() || new Date().toISOString() }));
};

export const deleteAnalysis = async (analysisId: string, _fileUrl: string) => {
  await setDoc(doc(db, 'analyses', analysisId), { deleted: true }, { merge: true });
};

// Keep AI generation mocked (short delay)
export const generateInsights = async (data: any[], columns: string[]): Promise<Omit<Insight, 'id' | 'analysisId' | 'createdAt'>[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      type: 'trend',
      priority: 'high',
      title: 'Revenue Growth Detected',
      description: 'Your data shows positive growth trends in revenue metrics.',
      confidence: 85,
      action: 'Review growth factors and maintain momentum'
    },
    {
      type: 'anomaly',
      priority: 'medium',
      title: 'Data Quality Alert',
      description: 'Some data points may require attention for accuracy.',
      confidence: 72,
      action: 'Review data quality and clean outliers'
    },
    {
      type: 'recommendation',
      priority: 'low',
      title: 'Optimization Opportunity',
      description: 'Consider segmenting your data for deeper insights.',
      confidence: 68,
      action: 'Create data segments for targeted analysis'
    }
  ];
};
