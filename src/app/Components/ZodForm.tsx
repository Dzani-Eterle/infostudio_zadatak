'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import { DevTool } from '@hookform/devtools';
import { supabase } from 'app/lib/supabase';
import { useState } from 'react';

const orderSchema = z.object({
  product_name: z.string().min(1),
  customer: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive({message:'Price must be greater than 0'}),
  delivery_address: z.string().min(1),
  status: z.enum(['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED']),
});

type OrderFormData = z.infer<typeof orderSchema>;

const ZodForm = () => {
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      product_name: '',
      customer: '',
      quantity: 1,
      price: 0,
      delivery_address: '',
      status: 'CREATED',
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    const { error } = await supabase
      .from('orders')
      .insert({ ...data, created_at: new Date().toISOString() });

    if (error) {
      console.error('Insert error:', error);
      setErrorMsg(error.message);
      setOpen(true);
    } else {
      reset();
      setErrorMsg('');
      setOpen(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Product Name"
          {...register('product_name')}
          fullWidth
          margin="normal"
          error={!!errors.product_name}
          helperText={errors.product_name?.message}
        />
        <TextField
          label="Customer"
          {...register('customer')}
          fullWidth
          margin="normal"
          error={!!errors.customer}
          helperText={errors.customer?.message}
        />
        <TextField
          type="number"
          label="Quantity"
          {...register('quantity', { valueAsNumber: true })}
          fullWidth
          margin="normal"
          error={!!errors.quantity}
          helperText={errors.quantity?.message}
        />
        <TextField
          type="number"
          label="Price"
          {...register('price', { valueAsNumber: true })}
          fullWidth
          margin="normal"
          error={!!errors.price}
          helperText={errors.price?.message}
        />
        <TextField
          label="Delivery Address"
          {...register('delivery_address')}
          fullWidth
          margin="normal"
          error={!!errors.delivery_address}
          helperText={errors.delivery_address?.message}
        />
        <TextField
          label="Status"
          select
          fullWidth
          margin="normal"
          defaultValue='CREATED'
          {...register('status')}
          error={!!errors.status}
          helperText={errors.status?.message}
        >
          {['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'].map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>

        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Submit Order
          </Button>
        </Box>
      </form>

      <DevTool control={control} /> {/* 👈 Shows the hook form devtools */}

      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        {errorMsg ? (
          <Alert severity="error" onClose={() => setOpen(false)}>
            {`Error: ${errorMsg}`}
          </Alert>
        ) : (
          <Alert severity="success" onClose={() => setOpen(false)}>
            Order submitted successfully!
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default ZodForm;
