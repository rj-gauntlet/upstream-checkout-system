import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address_line1: user.profile?.address_line1 || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        zip_code: user.profile?.zip_code || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        profile: {
          phone: formData.phone,
          address_line1: formData.address_line1,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ocean-deeper mb-8 font-[family-name:'Playfair_Display']">My Account</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-ocean/5 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
          />
        </div>

        <div>
          <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            value={formData.address_line1}
            onChange={handleChange}
            className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
            />
          </div>
          <div>
            <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Profile updated successfully!</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-current-accent hover:bg-current-dark disabled:bg-gray-300 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
