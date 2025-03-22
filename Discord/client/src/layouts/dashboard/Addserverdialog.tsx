import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Define the form schema
const schema = Yup.object().shape({
  serverName: Yup.string().required('Server Name is required'),
});

// Define the props for the dialog component
interface AddServerDialogProps {
  open: boolean;
  onClose: () => void;
  onAddServer: (serverName: string) => void;
}

const AddServerDialog: React.FC<AddServerDialogProps> = ({ open, onClose, onAddServer }) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      serverName: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = (data: { serverName: string }) => {
    onAddServer(data.serverName); // Pass the server name to the parent component
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add/Join Server</DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="serverName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Server Name"
                  margin="normal"
                  error={!!errors.serverName}
                  helperText={errors.serverName?.message}
                />
              )}
            />
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} color="primary">
          Add/Join
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddServerDialog;