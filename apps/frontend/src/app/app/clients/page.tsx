'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Mail, Phone } from 'lucide-react';
import { clientsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  const [search, setSearch] = useState('');

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsAPI.getAll({ search, limit: 50 }),
  });

  const clients = clientsData?.data?.items || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No clients found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg">{client.name}</span>
                  {!client.active && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Inactive
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span>
                      <p className="mt-1">{client.address}</p>
                    </div>
                  )}
                  
                  {client.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span>
                      <p className="mt-1 line-clamp-2">{client.notes}</p>
                    </div>
                  )}
                </div>
                
                {client._count && (
                  <div className="flex gap-4 mt-4 pt-3 border-t text-xs text-gray-500">
                    <span>{client._count.projects || 0} projects</span>
                    <span>{client._count.invoices || 0} invoices</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}