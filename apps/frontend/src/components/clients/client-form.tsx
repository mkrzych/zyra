'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  billingAddress: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: any; // Existing client for editing
  onSuccess: () => void;
}

export default function ClientForm({ client, onSuccess }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      billingAddress: client?.billingAddress || '',
      taxId: client?.taxId || '',
      notes: client?.notes || '',
      active: client?.active ?? true,
    },
  });

  const createClientMutation = useMutation({
    mutationFn: (data: ClientFormData) => clientsAPI.create(data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: (data: ClientFormData) => clientsAPI.update(client.id, data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      // Convert empty strings to undefined for optional fields
      const formattedData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        billingAddress: data.billingAddress || undefined,
        taxId: data.taxId || undefined,
        notes: data.notes || undefined,
      };

      if (client) {
        await updateClientMutation.mutateAsync(formattedData);
      } else {
        await createClientMutation.mutateAsync(formattedData);
      }
    } catch (error) {
      console.error('Client form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Client Name */}
      <div>
        <Label htmlFor="name">Client Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter client name"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="client@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="Street address, city, state, zip"
          rows={2}
        />
      </div>

      {/* Billing Address */}
      <div>
        <Label htmlFor="billingAddress">Billing Address</Label>
        <Textarea
          id="billingAddress"
          {...register('billingAddress')}
          placeholder="Billing address (if different from above)"
          rows={2}
        />
        <p className="text-sm text-gray-500 mt-1">
          Leave blank to use the same as main address
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tax ID */}
        <div>
          <Label htmlFor="taxId">Tax ID / VAT Number</Label>
          <Input
            id="taxId"
            {...register('taxId')}
            placeholder="Tax identification number"
          />
        </div>

        {/* Active Status */}
        <div>
          <Label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('active')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Active Client</span>
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            Inactive clients won&apos;t appear in project creation
          </p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes about the client..."
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>

      {/* Error Display */}
      {(createClientMutation.isError || updateClientMutation.isError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">
            {createClientMutation.error?.message || updateClientMutation.error?.message || 'An error occurred'}
          </p>
        </div>
      )}
    </form>
  );
}