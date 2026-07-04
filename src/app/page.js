'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as faceapi from 'face-api.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ScanWajah() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Menginisialisasi kamera & model AI...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);

  useEffect(() => {
    async function loadModelsAndData() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setModelsLoaded(true);
      setStatus('Model AI Siap. Mengambil data wajah dari server...');
      
      // Ambil data embedding semua teknisi dari Supabase
      const { data, error } = await supabase.from('teknisi').select('nik, nama_teknisi, face_embedding');
      if (!error && data) {
        const formatted = data.filter(t => t.face_embedding).map(t => {
          const embeddingArray = new Float32Array(JSON.parse(t.face_embedding));
          return new faceapi.LabeledFaceDescriptors(t.nik, [embeddingArray]);
        });
        setLabeledDescriptors(formatted);
        setStatus('Sistem siap. Silakan posisikan wajah Anda di depan kamera.');
      }
      startVideo();
    }
    loadModelsAndData();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.error("Gagal akses kamera: ", err));
  };

  const handleAbsen = async () => {
    if (!modelsLoaded || labeledDescriptors.length === 0) return;
    setStatus('Memindai wajah...');

    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      setStatus('Wajah tidak terdeteksi. Coba lagi.');
      return;
    }

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // Threshold kemiripan 60%
    const bestMatch = faceMatcher.findBestMatch(detections.descriptor);

    if (bestMatch.label === 'unknown') {
      setStatus('Wajah Tidak Dikenali! Harap hubungi Admin.');
      return;
    }

    const nikTerdeteksi = bestMatch.label;
    setStatus(`Mencocokkan sukses! NIK: ${nikTerdeteksi}. Mencatat ke Google Sheets...`);

    // Ambil data lengkap teknisi
    const { data: teknisi } = await supabase.from('teknisi').select('*').eq('nik', nikTerdeteksi).single();

    if (teknisi) {
      // Tembak data ke Google Apps Script milik Mas Ecky
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_GAS_URL, {
          method: 'POST',
          mode: 'no-cors', // Atasi CORS issue pada Apps Script
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nik: teknisi.nik,
            nama_teknisi: teknisi.nama_teknisi,
            unit: teknisi.unit,
            service_area: teknisi.service_area,
            action: 'absen' // Logika masuk/pulang di-handle di backend/GAS Anda
          })
        });
        setStatus(`Absen Berhasil! Terima kasih ${teknisi.nama_teknisi}.`);
      } catch (err) {
        setStatus('Gagal mengirim data ke Google Sheets.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-teal-400 mb-2 tracking-wide">PresenSight</h1>
        <p className="text-sm text-slate-400 mb-6">Scan Wajah untuk Melakukan Absensi</p>
        
        <div className="relative rounded-xl overflow-hidden border-2 border-slate-700 bg-black aspect-video mb-6">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100" />
        </div>

        <div className={`p-3 rounded-lg text-sm font-medium mb-6 ${status.includes('Berhasil') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/50 text-slate-300'}`}>
          {status}
        </div>

        <button onClick={handleAbsen} className="w-full py-3 bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20">
          Ambil Absen
        </button>
      </div>
    </div>
  );
}
