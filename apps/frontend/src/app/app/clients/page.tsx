'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Trash2, 
  Building,
  Users
} from 'lucide-react';
import { clientsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ClientForm from '@/components/clients/client-form';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingClient, setDeletingClient] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsAPI.getAll({ search }),
  });

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => clientsAPI.delete(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setDeletingClient(null);
    },
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships and contact information</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client profile with contact details and billing information.
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
              onSuccess={() => {
                setIsCreateModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['clients'] });
              }}
            />
          </DialogContent>
        </Dialog>
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
          <CardContent className="py-12 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
            <p className="text-gray-500 mt-2">
              {search ? 'Try adjusting your search criteria.' : 'Get started by adding your first client.'}
            </p>
            {!search && (
              <div className="mt-6">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Client
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client: any) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {client.active ? (
                      <Badge variant="success" className="mt-1">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="mt-1">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingClient(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingClient(client)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                )}
                
                {client.taxId && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Tax ID:</span>
                    <span className="ml-1 text-gray-600">{client.taxId}</span>
                  </div>
                )}
                
                {client.notes && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <p className="text-gray-600 mt-1 line-clamp-2">{client.notes}</p>
                  </div>
                )}
                
                {/* Project Count (if available) */}
                {client._count?.projects !== undefined && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{client._count.projects} project{client._count.projects !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 text-xs text-gray-400">
                  Added {new Date(client.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Client Dialog */}
      {editingClient && (
        <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update client information and contact details.
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
              client={editingClient}
              onSuccess={() => {
                setEditingClient(null);
                queryClient.invalidateQueries({ queryKey: ['clients'] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Client Dialog */}
      {deletingClient && (
        <Dialog open={!!deletingClient} onOpenChange={() => setDeletingClient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deletingClient.name}&quot;? 
                This action cannot be undone and may affect related projects.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setDeletingClient(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteClientMutation.mutate(deletingClient.id)}
                disabled={deleteClientMutation.isPending}
              >
                {deleteClientMutation.isPending ? 'Deleting...' : 'Delete Client'}
              </Button>
            </div>
            
            {deleteClientMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                <p className="text-sm text-red-600">
                  {deleteClientMutation.error?.message || 'Failed to delete client'}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}