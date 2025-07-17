import { useState } from 'react';

interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

interface ShippingAddressFormProps {
  onSubmit: (address: ShippingAddress) => void;
  onCancel: () => void;
}

export default function ShippingAddressForm({ onSubmit, onCancel }: ShippingAddressFormProps) {
  const [address, setAddress] = useState<ShippingAddress>({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(address);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6">
      <h2 className="text-xl font-bold text-secondary mb-4">Shipping Address</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-secondary">
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            value={address.full_name}
            onChange={handleChange}
            className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="address_line1" className="block text-sm font-medium text-secondary">
            Address Line 1 *
          </label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            required
            value={address.address_line1}
            onChange={handleChange}
            className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="address_line2" className="block text-sm font-medium text-secondary">
            Address Line 2
          </label>
          <input
            type="text"
            id="address_line2"
            name="address_line2"
            value={address.address_line2}
            onChange={handleChange}
            className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-secondary">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              value={address.city}
              onChange={handleChange}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-secondary">
              State/Province *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              required
              value={address.state}
              onChange={handleChange}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-secondary">
              Postal Code *
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              required
              value={address.postal_code}
              onChange={handleChange}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-secondary">
              Country *
            </label>
            <input
              type="text"
              id="country"
              name="country"
              required
              value={address.country}
              onChange={handleChange}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-secondary">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={address.phone}
            onChange={handleChange}
            className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-secondary bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-hover-primary"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
} 