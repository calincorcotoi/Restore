import { useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import { Grid, Typography, Divider, TextField } from "@mui/material";
import { commentsSelectors, fetchCommentsAsync } from "./catalogSlice";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";

interface ProductCommentsProps {
    productId: string | undefined;
}

export default function ProductComments({ productId }: ProductCommentsProps) {
    
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.account);

    useEffect(() => {
       if(productId) dispatch(fetchCommentsAsync(parseInt(productId)))
    });

    const comments = useAppSelector(state => commentsSelectors.selectEntities(state));
    // const [comments, setComments] = useState(Object.values(commentsFromStore).map(comment => ({
    //     ...comment,
    //     isEditing: false
    // })));

    // const handleEditClick = (id: number) => {
    //     setComments(comments.map(comment => 
    //         comment.id === id ? { ...comment, isEditing: !comment.isEditing } : comment
    //     ));
    // };

    // const handleTextChange = (id: number, text: string) => {
    //     setComments(comments.map(comment => 
    //         comment.id === id ? { ...comment, text } : comment
    //     ));
    // };

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
                        label="Add a comment"
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <LoadingButton
                        color="primary"
                        variant="contained"
                        size="large"
                        fullWidth
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

