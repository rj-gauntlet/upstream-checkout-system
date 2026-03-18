interface CheckoutFormData {
  email: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
}

interface CheckoutFormProps {
  data: CheckoutFormData;
  onChange: (data: CheckoutFormData) => void;
}

export default function CheckoutForm({ data, onChange }: CheckoutFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ocean-deeper">Shipping Information</h3>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={data.email}
          onChange={handleChange}
          required
          className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="shipping_first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="shipping_first_name"
            name="shipping_first_name"
            value={data.shipping_first_name}
            onChange={handleChange}
            required
            className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="shipping_last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="shipping_last_name"
            name="shipping_last_name"
            value={data.shipping_last_name}
            onChange={handleChange}
            required
            className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="shipping_address_line1" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          id="shipping_address_line1"
          name="shipping_address_line1"
          value={data.shipping_address_line1}
          onChange={handleChange}
          required
          className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="shipping_address_line2" className="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2 <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          id="shipping_address_line2"
          name="shipping_address_line2"
          value={data.shipping_address_line2}
          onChange={handleChange}
          className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="shipping_city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="shipping_city"
            name="shipping_city"
            value={data.shipping_city}
            onChange={handleChange}
            required
            className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="shipping_state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            id="shipping_state"
            name="shipping_state"
            value={data.shipping_state}
            onChange={handleChange}
            required
            className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="shipping_zip_code" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            id="shipping_zip_code"
            name="shipping_zip_code"
            value={data.shipping_zip_code}
            onChange={handleChange}
            required
            className="w-full border border-ocean/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-current-accent focus:border-current-accent outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

export type { CheckoutFormData };
