import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Giriş başarılı!');
      } else {
        await register(form.name, form.email, form.password, form.phone);
        toast.success('Kayıt başarılı!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <h2>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Ad Soyad</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Telefon</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
          )}
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Lütfen bekleyin...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
          {isLogin && (
            <p style={{ textAlign: 'center', marginTop: 12 }}>
              <Link to="/forgot-password" style={{ color: 'var(--text-light)', fontSize: 13, textDecoration: 'none' }}>
                Şifremi unuttum
              </Link>
            </p>
          )}
        </form>
        <p className="toggle-text">
          {isLogin ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}
          <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </div>
    </div>
  );
}
