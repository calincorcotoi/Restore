import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Grid, Typography, Divider, TextField } from "@mui/material";
import { addCommentAsync, commentsSelectors, fetchCommentsAsync } from "./catalogSlice";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";

interface ProductCommentsProps {
    productId: string | undefined;
}

export default function ProductComments({ productId }: ProductCommentsProps) {
    
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.account);
    const {status}  = useAppSelector(state => state.catalog.comments);

    useEffect(() => {
        if(productId) dispatch(fetchCommentsAsync(parseInt(productId)))
    },[dispatch, productId]);

    const comments = useAppSelector(state => commentsSelectors.selectEntities(state));

    const [commentText, setCommentText] = useState("");

    function handleSubmitComment() {
        // Add comment
        if (productId && commentText.trim()) {
            dispatch(addCommentAsync({ productId: parseInt(productId), text: commentText }));
            setCommentText("");
        }
    }
    
    return (
        <Grid item xs={12}>
            <Typography variant='h5' gutterBottom>
                Comments for Product ID: {productId}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {user && 
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        value={commentText}
                        label="Add a comment"
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <LoadingButton
                        color="primary"
                        variant="contained"
                        size="large"
                        fullWidth    
                        onClick={handleSubmitComment}        
                        loading={status.includes('pendingaddComment')}            
                    >
                        Submit
                    </LoadingButton>
                </Grid>            
            </Grid>}

            <Grid container spacing={2} sx={{ mt: 2 }}>
                {comments && Object.values(comments).map(comment => (
                    <Grid item xs={12} key={comment!.id}>
                        <Typography variant='subtitle1'>
                            {comment!.userId}
                        </Typography>
                        <Typography variant='body2'>
                            {comment?.text}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                    </Grid>
                ))}
            </Grid>
        </Grid>
    );
}


