import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTransition } from 'react';

const deliveryAddressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  address_line1: z.string().min(5, 'Address line 1 is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/County is required'),
  postal_code: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>;

interface DeliveryAddressFormProps {
  onSubmit: (data: DeliveryAddressFormData) => Promise<void>;
}

export function DeliveryAddressForm({ onSubmit }: DeliveryAddressFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryAddressFormData>({
    resolver: zodResolver(deliveryAddressSchema),
  });

  const onSubmitForm = async (data: DeliveryAddressFormData) => {
    try {
      startTransition(async () => {
        await onSubmit(data);
      });
    } catch (error) {
      toast.error('Failed to save delivery address');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            {...register('full_name')}
            className="mt-1"
            error={errors.full_name?.message}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1"
            error={errors.email?.message}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            className="mt-1"
            error={errors.phone?.message}
          />
        </div>

        <div>
          <Label htmlFor="address_line1">Address Line 1</Label>
          <Input
            id="address_line1"
            {...register('address_line1')}
            className="mt-1"
            error={errors.address_line1?.message}
          />
        </div>

        <div>
          <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
          <Input
            id="address_line2"
            {...register('address_line2')}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register('city')}
              className="mt-1"
              error={errors.city?.message}
            />
          </div>

          <div>
            <Label htmlFor="state">State/County</Label>
            <Input
              id="state"
              {...register('state')}
              className="mt-1"
              error={errors.state?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              {...register('postal_code')}
              className="mt-1"
              error={errors.postal_code?.message}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register('country')}
              className="mt-1"
              error={errors.country?.message}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Processing...' : 'Continue to Payment'}
      </Button>
    </form>
  );
} 