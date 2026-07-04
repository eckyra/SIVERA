'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ScanWajah() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Memuat sistem AI...');
  const [faceapi, setFaceapi] = useState(null);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);

  // 1. Load library face-api.js secara dinamis khusus di Client-side
  useEffect(() => {
    import('face-api.js').then((mod) => {
      setFaceapi(mod);
    }).catch(err => setStatus('Gagal memuat modul AI: ' + err.message));
  }, []);

  // 2. Jika library sudah siap, load model dari folder public dan data Supabase
  useEffect(() => {
    if (!faceapi) return;

    async function initSystem() {
      try {
        setStatus('Mengunduh bobot model wajah...');
        // Ubah dari /models menjadi ./models jika masih eror setelah kamera diizinkan
await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
        
        setStatus('Sinkronisasi data wajah karyawan...');
        const { data, error } = await supabase.from('teknisi').select('nik, nama_teknisi, face_embedding');
        
        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data
            .filter(t => t.face_embedding)
            .map(t => {
              const embeddingArray = new Float32Array(JSON.parse(t.face_embedding));
              return new faceapi.LabeledFaceDescriptors(t.nik, [embeddingArray]);
            });
          setLabeledDescriptors(formatted);
          setStatus('Sistem siap. Silakan posisikan wajah Anda.');
        } else {
          setStatus('Sistem siap. (Belum ada data wajah teknisi terdaftar).');
        }

        // Aktifkan Kamera
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;

      } catch (err) {
        console.error(err);
        setStatus('Eror sistem: Pastikan folder /models/ sudah benar atau izinkan akses kamera.');
      }
    }

    initSystem();
  }, [faceapi]);

  const handleAbsen = async () => {
    if (!faceapi || labeledDescriptors.length === 0) {
      setStatus('Sistem/Data belum siap sepenuhnya.');
      return;
    }
    setStatus('Sedang memindai wajah Anda...');

    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      setStatus('Wajah tidak terdeteksi. Silakan sesuaikan posisi wajah.');
      return;
    }

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    const bestMatch = faceMatcher.findBestMatch(detections.descriptor);

    if (bestMatch.label === 'unknown') {
      setStatus('Wajah Tidak Dikenali!');
      return;
    }

    const nikTerdeteksi = bestMatch.label;
    setStatus(`Wajah cocok! NIK: ${nikTerdeteksi}. Mencatat log absen...`);

    const { data: teknisi } = await supabase.from('teknisi').select('*').eq('nik', nikTerdeteksi).single();

    if (teknisi) {
      try {
        await fetch(process.env.NEXT_PUBLIC_GAS_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nik: teknisi.nik,
            nama_teknisi: teknisi.nama_teknisi,
            unit: teknisi.unit,
            service_area: teknisi.service_area,
            action: 'absen'
          })
        });
        setStatus(`Absen Berhasil! Terima kasih, ${teknisi.nama_teknisi}.`);
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

        <div className="p-3 rounded-lg text-sm font-medium mb-6 bg-slate-700/50 text-slate-300">
          {status}
        </div>

        <button onClick={handleAbsen} className="w-full py-3 bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20">
          Ambil Absen
        </button>
      </div>
    </div>
  );
}
