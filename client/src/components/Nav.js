import React from 'react';
import { Link } from 'react-router-dom';

export default function Nav() {
  const [open, setOpen] = React.useState(false);
  return (
    <nav className="nav">
      <Link to="/" style={{ fontWeight: 700 }}>
        توصيلة
      </Link>
      <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="القائمة">
        ☰
      </button>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        <Link to="/">الرئيسية</Link>
        <Link to="/post">نشر رحلة</Link>
        <Link to="/results">النتائج</Link>
      </div>
    </nav>
  );
}
