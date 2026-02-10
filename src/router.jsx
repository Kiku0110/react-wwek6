import { createHashRouter } from "react-router";
import FrontedLayout from "./layout/FrontedLayout";
import Home from "./views/front/Home";
import Products from "./views/front/Products";
import SingleProduct from "./views/front/SingleProduct";
import Cart from "./views/front/Cart";
import NotFound from "./views/front/NotFound";
import Checkout from "./views/front/Checkout";
import Login from "./views/Login";
import AdminProducts from "./views/admin/AdminProducts";

export const router = createHashRouter([
    {
        path: '/',
        element: <FrontedLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: 'product',
                element: <Products />
            },
            {
                path: 'product/:id',
                element: <SingleProduct />
            },
            {
                path: 'cart',
                element: <Cart />
            },
            {
                path: 'checkout',
                element: <Checkout />
            },
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'admin/products',
                element: <AdminProducts />
            },
        
        ]
    },
    {
        path: '*',
        element: <NotFound />
    }
])