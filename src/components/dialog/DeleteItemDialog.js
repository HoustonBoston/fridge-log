import { Dialog, DialogActions, Typography, Button, DialogContent, DialogTitle, DialogContentText } from '@mui/material'

export default function DeleteItemDialog({ open, itemName, onDeleteClick, onCancelClick }) {
    return (
        <Dialog open={open} onClose={onCancelClick}>
            <DialogTitle>{`Delete ${itemName}?`}</DialogTitle>
            <DialogContent>
                <DialogContentText>You will not be able to restore this item.</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancelClick}>
                    <Typography color='blue'>Cancel</Typography>
                </Button>
                <Button onClick={onDeleteClick}>
                    <Typography color='red'>Delete</Typography>
                </Button>
            </DialogActions>
        </Dialog>
    )
}