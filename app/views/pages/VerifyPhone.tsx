import React, { useState } from 'react';

export default function VerifyPhone() {
  const [country, setCountry] = useState('GB');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setCodeSent(true);
  }

  const countries = [
    { code: 'GB', flag: '🇬🇧', dial: '+44' },
    { code: 'US', flag: '🇺🇸', dial: '+1' },
    { code: 'TR', flag: '🇹🇷', dial: '+90' },
    { code: 'DE', flag: '🇩🇪', dial: '+49' },
  ];

  const selected = countries.find((c) => c.code === country) ?? countries[0];

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1 className="verify-title">Verify Phone</h1>
        <p className="verify-subtitle">log in with phone number</p>

        <form onSubmit={handleSend} className="verify-form">
          <div className="phone-input-row">
            <div className="flag-select-wrapper">
              <span className="flag-emoji">{selected.flag}</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="flag-select"
                aria-label="Country"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <span className="flag-arrow">▼</span>
            </div>

            <input
              type="tel"
              className="phone-input"
              placeholder="000 - 000 - 000 - 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-btn verify-send-btn">
            Send in code
          </button>
        </form>

        <input
          type="text"
          className="code-input"
          placeholder="Type in the code..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!codeSent}
        />

      </div>
    </div>
  );
}
