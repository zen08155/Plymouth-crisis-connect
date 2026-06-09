import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({
    firstName: '',
    surname: '',
    countryCode: '+44',
    phone: '',
    dob: '',
    homeAddress: '',
    workAddress: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nieuwe gebruiker -> registreren en daarna de welcome/onboarding doen
    register(`${form.firstName} ${form.surname}`.trim());
    navigate('/welcome');
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">

        <h1 className="register-title">Register</h1>
        <p className="register-subtitle">Create A account</p>

        <form onSubmit={handleSubmit} className="register-form">

          <div className="form-group">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="register-row">
            <div className="form-group">
              <label htmlFor="surname">Surname</label>
              <input
                id="surname"
                name="surname"
                type="text"
                value={form.surname}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <div className="phone-row">
                <select name="countryCode" value={form.countryCode} onChange={handleChange} className="country-select">
                  <option value="+44">+44</option>
                  <option value="+1">+1</option>
                  <option value="+90">+90</option>
                  <option value="+49">+49</option>
                  <option value="+33">+33</option>
                </select>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="07..."
                  value={form.phone}
                  onChange={handleChange}
                />
                <button type="submit" className="create-btn">Create</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <input
              name="dob"
              type="text"
              placeholder="Date of Birth"
              value={form.dob}
              onChange={handleChange}
            />
          </div>

          <hr className="form-divider" />

          <div className="form-group">
            <label htmlFor="homeAddress">Home address</label>
            <textarea
              id="homeAddress"
              name="homeAddress"
              rows={3}
              value={form.homeAddress}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workAddress">Work address</label>
            <textarea
              id="workAddress"
              name="workAddress"
              rows={3}
              value={form.workAddress}
              onChange={handleChange}
            />
          </div>

        </form>
      </div>
    </div>
  );
}
