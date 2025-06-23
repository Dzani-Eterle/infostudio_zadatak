'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Order } from '../types/order';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<Order> | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditClick = (order: Order) => {
    setCurrentOrder(order);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentOrder(null);
  };

  const handleEditSave = async () => {
    if (!currentOrder?.id) return;

    const { error } = await supabase
      .from('orders')
      .update({
        product_name: currentOrder.product_name,
        customer: currentOrder.customer,
        quantity: currentOrder.quantity,
        price: currentOrder.price,
        delivery_address: currentOrder.delivery_address,
        status: currentOrder.status,
      })
      .eq('id', currentOrder.id);

    if (error) {
      console.error('Update failed:', error);
    } else {
      await fetchOrders();
      handleEditClose();
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this order?');
    if (!confirmed) return;

    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('Delete failed:', error);
    } else {
      await fetchOrders();
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'product_name', headerName: 'Product Name', width: 150 },
    { field: 'customer', headerName: 'Customer', width: 130 },
    { field: 'quantity', headerName: 'Quantity', width: 100 },
    { field: 'price', headerName: 'Price', width: 100 },
    { field: 'delivery_address', headerName: 'Address', width: 200 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'created_at', headerName: 'Created At', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => handleEditClick(params.row)}>
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ height: 500, width: '100%', mb:6 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <h2>Orders</h2>
          <Button variant="contained" onClick={fetchOrders} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
        <DataGrid
          rows={orders}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        />
      </Box>

      {/* ✨ Edit Modal */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Product Name"
            fullWidth
            value={currentOrder?.product_name || ''}
            onChange={(e) =>
              setCurrentOrder((prev) => ({ ...prev!, product_name: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Customer"
            fullWidth
            value={currentOrder?.customer || ''}
            onChange={(e) =>
              setCurrentOrder((prev) => ({ ...prev!, customer: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={currentOrder?.quantity || 0}
            onChange={(e) =>
              setCurrentOrder((prev) => ({
                ...prev!,
                quantity: Number(e.target.value),
              }))
            }
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={currentOrder?.price || 0}
            onChange={(e) =>
              setCurrentOrder((prev) => ({
                ...prev!,
                price: Number(e.target.value),
              }))
            }
          />
          <TextField
            margin="dense"
            label="Delivery Address"
            fullWidth
            value={currentOrder?.delivery_address || ''}
            onChange={(e) =>
              setCurrentOrder((prev) => ({
                ...prev!,
                delivery_address: e.target.value,
              }))
            }
          />
          <TextField
            margin="dense"
            label="Status"
            select
            fullWidth
            value={currentOrder?.status || 'CREATED'}
            onChange={(e) =>
              setCurrentOrder((prev) => ({
                ...prev!,
                status: e.target.value as Order['status'],
              }))
            }
          >
            {['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'].map(
              (status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              )
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
