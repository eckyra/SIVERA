'use client';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function TambahTeknisi() {
  const [form, setForm] = useState({ nik: '', nama: '', unit: '', area: '' });
  const [status, setStatus] = useState('Memuat model AI...');
  const [faceapi, setFaceapi] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const videoRef = useRef(null);

  // 1. Load library secara dinamis (Anti-404 Vercel)
  useEffect(() => {
    import('face-api.js')
      .then((mod) => setFaceapi(mod))
      .catch((err) => setStatus('Gagal memuat modul AI: ' + err.message));
  }, []);

  // 2. Wajib: Load model AI sebelum bisa scan pendaftaran
  useEffect(() => {
    if (!faceapi) return;

    async function loadModels() {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setIsModelLoaded(true);
        setStatus('Sistem Siap. Isi data dan aktifkan kamera untuk mendaftar.');
      } catch (err) {
        setStatus('Gagal memuat model: ' + err.message);
      }
    }
    loadModels();
  }, [faceapi]);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => setStatus('Gagal mengakses kamera.'));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!isModelLoaded || !faceapi) {
      setStatus('Sabar, model AI masih dimuat...');
      return;
    }

    setStatus('Sedang menganalisis dan mengekstrak vektor wajah...');

    try {
      // Menggunakan inputSize 224 agar proses analisis jauh lebih cepat dan ringan
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
      )
      .withFaceLandmarks()
      .withFaceDescriptor(); // Mengambil 128 titik vektor wajah

      if (!detection) {
        setStatus('Gagal mendeteksi wajah. Pastikan wajah terlihat jelas tanpa masker/kacamata gelap.');
        return;
      }

      // Konversi vektor menjadi format JSON String untuk dimasukkan ke Supabase
      const embeddingString = JSON.stringify(Array.from(detection.descriptor));

      const { error } = await supabase.from('teknisi').insert({
        nik: form.nik,
        nama_teknisi: form.nama,
        unit: form.unit,
        service_area: form.area,
        face_embedding: embeddingString
      });

      if (error) {
        setStatus(`Gagal menyimpan ke database: ${error.message}`);
      } else {
        setStatus('✅ Teknisi dan Wajah Berhasil Didaftarkan!');
        setForm({ nik: '', nama: '', unit: '', area: '' });
      }
    } catch (err) {
      setStatus('Terjadi eror saat scanning: ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6">Pendaftaran Teknisi Baru</h2>
      <form onSubmit={handleRegister} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">NIK</label>
            <input type="text" required value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Nama Lengkap</label>
            <input type="text" required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Unit</label>
            <input type="text" required placeholder="Contoh: CCAN" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Service Area</label>
            <input type="text" required placeholder="Contoh: Probolinggo" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500" />
          </div>
        </div>

        <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/50">
          <p className="text-xs text-slate-400 font-medium mb-2">Registrasi Biometrik Wajah</p>
          <div className="aspect-video w-full max-w-sm bg-black rounded-lg overflow-hidden mb-3 mx-auto relative">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100" />
          </div>
          <button type="button" onClick={startCamera} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 block mx-auto transition">
            📸 Aktifkan Kamera
          </button>
        </div>

        <div className={`p-3 border text-xs rounded-xl text-center font-medium ${status.includes('Berhasil') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 border-slate-700 text-teal-400'}`}>
          {status}
        </div>

        <button 
          type="submit" 
          disabled={!isModelLoaded}
          className={`w-full py-2.5 font-bold rounded-xl shadow-lg transition ${isModelLoaded ? 'bg-teal-500 hover:bg-teal-600 text-slate-950' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
          Simpan Data & Vektor Wajah
        </button>
      </form>
    </div>
  );
}
