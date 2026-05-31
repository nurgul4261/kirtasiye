import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Login.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Şifreler eşleşmiyor');
    }
    if (form.password.length < 6) {
      return toast.error('Şifre en az 6 karakter olmalı');
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Şifreniz güncellendi! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Link geçersiz veya süresi dolmuş');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <h2>Yeni Şifre</h2>
        <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>
          Yeni şifrenizi belirleyin.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Yeni Şifre</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="En az 6 karakter"
            />
          </div>
          <div className="form-group">
            <label>Şifre Tekrar</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              placeholder="Şifreyi tekrar girin"
            />
          </div>
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
}
