'use client';
import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as faceapi from 'face-api.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function TambahTeknisi() {
  const [form, setForm] = useState({ nik: '', nama: '', unit: '', area: '' });
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch((err) => console.error(err));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus('Sedang menganalisis wajah...');

    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceRecognition68Descriptor();

    if (!detection) {
      setStatus('Gagal mendeteksi wajah. Pastikan wajah terlihat jelas di kamera.');
      return;
    }

    // Ubah Float32Array deskriptor menjadi string JSON untuk disimpan ke PostgreSQL vector
    const embeddingString = JSON.stringify(Array.from(detection.descriptor));

    const { error } = await supabase.from('teknisi').insert({
      nik: form.nik,
      nama_teknisi: form.nama,
      unit: form.unit,
      service_area: form.area,
      face_embedding: embeddingString
    });

    if (error) {
      setStatus(`Gagal mendaftar: ${error.message}`);
    } else {
      setStatus('Teknisi & Wajah Berhasil Didaftarkan ke database Supabase!');
      setForm({ nik: '', nama: '', unit: '', area: '' });
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
            <input type="text" required placeholder="Contoh: CCAN, IOAN" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Service Area</label>
            <input type="text" required placeholder="Contoh: Probolinggo" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500" />
          </div>
        </div>

        <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/50">
          <p className="text-xs text-slate-400 font-medium mb-2">Registrasi Biometrik Wajah</p>
          <div className="aspect-video w-full max-w-sm bg-black rounded-lg overflow-hidden mb-3 mx-auto">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform -scale-x-100" />
          </div>
          <button type="button" onClick={startCamera} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 block mx-auto">
            Aktifkan Kamera
          </button>
        </div>

        {status && <div className="p-3 bg-slate-900 border border-slate-700 text-xs rounded-xl text-teal-400 text-center">{status}</div>}

        <button type="submit" className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl shadow-lg transition">
          Simpan Data & Vektor Wajah
        </button>
      </form>
    </div>
  );
}
