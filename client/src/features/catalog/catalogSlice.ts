import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Product, ProductParams } from "../../app/models/product";
import { RootState } from '../../app/store/configureStore';
import { MetaData } from '../../app/models/pagination';
import { Comment } from "../../app/models/comment";
interface CatalogState {
    productsLoaded: boolean;
    filtersLoaded: boolean;
    status: string;
    brands: string[];
    types: string[];
    productParams: ProductParams;
    metaData: MetaData | null;
}

/**
 * An adapter for managing the normalized state of `Product` entities.
 * This adapter provides a set of functions for performing CRUD operations
 * on the `Product` entities within the Redux state.
 */
const productsAdapter = createEntityAdapter<Product>();
const commentsAdapter = createEntityAdapter<Comment>();

function getAxiosParams(productParams: ProductParams) {
    const params = new URLSearchParams();
    params.append('pageNumber', productParams.pageNumber.toString());
    params.append('pageSize', productParams.pageSize.toString());
    params.append('orderBy', productParams.orderBy);
    if (productParams.searchTerm) params.append('searchTerm', productParams.searchTerm);
    if (productParams.types.length > 0) params.append('types', productParams.types.toString());
    if (productParams.brands.length > 0) params.append('brands', productParams.brands.toString());
    return params;
}

export const fetchCommentsAsync = createAsyncThunk<Comment[], number>(
    'catalog/fetchCommentsAsync',
    async (productId, thunkAPI) => {
        try {
            const comments = await agent.Catalog.getCommentsForProduct(productId);
            return comments;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data })
        }
    }   
)

export const fetchProductsAsync = createAsyncThunk<Product[], void, {state: RootState}>(
    'catalog/fetchProductsAsync',
    async (_, thunkAPI) => {
        const params = getAxiosParams(thunkAPI.getState().catalog.products.productParams);
        try {
            const response = await agent.Catalog.list(params);
            thunkAPI.dispatch(setMetaData(response.metaData));
            return response.items;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data })
        }
    }
)

export const fetchProductAsync = createAsyncThunk<Product, number>(
    'catalog/fetchProductAsync',
    async (productId, thunkAPI) => {
        try {
            const product = await agent.Catalog.details(productId);
            return product;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.data })
        }
    }
)

export const fetchFilters = createAsyncThunk(
    'catalog/fetchFilters',
    async (_, thunkAPI) => {
        try {
            return agent.Catalog.fetchFilters();
        } catch (error: any) {
            return thunkAPI.rejectWithValue({ error: error.message })
        }
    }
)

function initParams(): ProductParams {
    return {
        pageNumber: 1,
        pageSize: 6,
        orderBy: 'name',
        brands: [],
        types: []
    }
}

const initialState = {
    products: productsAdapter.getInitialState<CatalogState>({
        productsLoaded: false,
        filtersLoaded: false,
        status: 'idle',
        brands: [],
        types: [],
        productParams: initParams(),
        metaData: null
    }),
    comments: commentsAdapter.getInitialState({
        status: 'idle'
    })
  };

export const catalogSlice = createSlice({
    name: 'catalog',
    initialState,
    reducers: {
        setProductParams: (state, action) => {
            state.products.productsLoaded = false;
            state.products.productParams = {...state.products.productParams, ...action.payload, pageNumber: 1}
        },
        setPageNumber: (state, action) => {
            state.products.productsLoaded = false;
            state.products.productParams = {...state.products.productParams, ...action.payload}
        },
        setMetaData: (state, action) => {
            state.products.metaData = action.payload
        },
        resetProductParams: (state) => {
            state.products.productParams = initParams()
        },
        setProduct: (state, action) => {
            productsAdapter.upsertOne(state.products, action.payload);
            state.products.productsLoaded = false;
        },
        removeProduct: (state, action) => {
            productsAdapter.removeOne(state.products, action.payload);
            state.products.productsLoaded = false;
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchProductsAsync.pending, (state) => {
            state.products.status = 'pendingFetchProducts'
        });
        builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
            productsAdapter.setAll(state.products, action.payload);
            state.products.status = 'idle',
                state.products.productsLoaded = true;
        });
        builder.addCase(fetchProductsAsync.rejected, (state, action) => {
            console.log(action.payload);
            state.products.status = 'idle';
        });
        //fetchCommentsAsync
        builder.addCase(fetchCommentsAsync.pending, (state) => {
            state.comments.status = 'pendingFetchProduct'
        });
        builder.addCase(fetchCommentsAsync.fulfilled, (state, action) => {
            commentsAdapter.addMany(state.comments , action.payload);
            state.comments.status = 'idle'
        });
        builder.addCase(fetchCommentsAsync.rejected, (state, action) => {
            console.log(action);
            state.comments.status = 'idle'
        });
        //fetchProductAsync
        builder.addCase(fetchProductAsync.pending, (state) => {
            state.products.status = 'pendingFetchProduct'
        });
        builder.addCase(fetchProductAsync.fulfilled, (state, action) => {
            productsAdapter.upsertOne(state.products, action.payload);
            state.products.status = 'idle'
        });
        builder.addCase(fetchProductAsync.rejected, (state, action) => {
            console.log(action);
            state.products.status = 'idle'
        });
        builder.addCase(fetchFilters.pending, (state) => {
            state.products.status = 'pendingFetchFilters';
        });
        builder.addCase(fetchFilters.fulfilled, (state, action) => {
            state.products.brands = action.payload.brands;
            state.products.types = action.payload.types;
            state.products.status = 'idle';
            state.products.filtersLoaded = true;
        });
        builder.addCase(fetchFilters.rejected, (state) => {
            state.products.status = 'idle';
        });
    })
})

export const {setProductParams, resetProductParams, setMetaData, setPageNumber, setProduct, removeProduct} = catalogSlice.actions;

export const productSelectors = productsAdapter.getSelectors((state: RootState) => state.catalog.products);
export const commentsSelectors = commentsAdapter.getSelectors((state: RootState) => state.catalog.comments);