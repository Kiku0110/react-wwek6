import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { RotatingLines } from "react-loader-spinner";
import Swal from "sweetalert2";
import * as bootstrap from "bootstrap";
import SingleProductModal from "../../components/SingleProductModal";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Checkout(){
    const [product, setProduct] = useState({});
    const[products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loadingCardId, setLoadingCardId] = useState(null);
    const [loadingProductId, setLoadingProductId] = useState(null);
    const productModalRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        mode:"onChange"
    })

    const getCart = async() => {
        try {
            const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`)
            setCart(response.data.data);
        } catch (error) {
            console.log(error.response.message);
        }
    }

    useEffect(() => {
        const getProducts = async() =>{
            try {
                const response = await axios.get(`${API_BASE}/api/${API_PATH}/products`)
                setProducts(response.data.products)
            } catch (error) {
                Swal.fire({
                    text: `${error.response.data.message}`,
                    icon: "error"
                });
            }
        }
        getProducts();
        getCart();

        productModalRef.current = new bootstrap.Modal("#productModal", {
            keyboard: false
        });

        // Modal 關閉時移除焦點
        document
            .querySelector("#productModal")
            .addEventListener("hide.bs.modal", () => {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            });
    },[])

    const addCart = async(id, qty=1) =>{
        setLoadingCardId(id);
        try {
            const data = {
                product_id: id,
                qty
            }
            const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {data})
            Swal.fire({
                text: `${response.data.message}`,
                icon: "success"
            });
            getCart();
        } catch (error) {
            Swal.fire({
                text: `${error.response.data.message}`,
                icon: "error"
            });
        } finally{
            setLoadingCardId(null);
        }
    }

    //判斷購物車是否為空
    const isCartEmpty = !cart.carts || cart.carts.length === 0;

    const updateCart =async(cardId, productId, qty=1) =>{
        try {
            const data = {
                product_id: productId,
                qty
            }
            // eslint-disable-next-line no-unused-vars
            const response = await axios.put(`${API_BASE}/api/${API_PATH}/cart/${cardId}`, {data})
            getCart();
        } catch (error) {
            console.log(error.response.message)
        }
    }

    const deleteCart =async(cardId) =>{
        //彈跳視窗確認
        const result = await Swal.fire({
            title: "確定要刪除嗎？",
            text: "刪除後將無法恢復此商品！",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "確定！",
            cancelButtonText: "取消"
        });

        if(result.isConfirmed){
            try {
            
                const response = await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${cardId}`)
                Swal.fire({
                    text: `${response.data.message}`,
                    icon: "success"
                });
                getCart();
            } catch (error) {
                Swal.fire({
                    text: `${error.response.data.message}`,
                    icon: "error"
                });
            }
        }
    }

    const deleteAllCart =async() =>{
        const result = await Swal.fire({
            title: "確定要清空購物車嗎？",
            text: "這將會移除購物車內的所有商品！",
            icon: "danger",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "全部清空",
            cancelButtonText: "考慮一下"
        });

        if(result.isConfirmed){
            try {
                // eslint-disable-next-line no-unused-vars
                const response = await axios.delete(`${API_BASE}/api/${API_PATH}/carts`)
                Swal.fire({
                    text: "已清除購物車內容",
                    icon: "success"
                });
                getCart();
            } catch (error) {
                Swal.fire({
                    text: `${error.response.data.message}`,
                    icon: "error"
                });
            }
        }
    }

    const onSubmit = async(formData) =>{
        try {
            const data ={
                user: formData,
                message: formData.message
            };
            const response =await axios.post(`${API_BASE}/api/${API_PATH}/order`, {data})
            Swal.fire({
                text: `${response.data.message}`,
                icon: "success"
            });
            getCart();
            reset(); // 重置表單
        } catch (error) {
            Swal.fire({
                text: `${error.response.message}`,
                icon: "error"
            });
        }
    }

    const handleView = async(id) =>{
        setLoadingProductId(id);
        try {
            const response = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`)
            setProduct(response.data.product);
        } catch (error) {
            console.log(error.response.message);
        } finally{
            setLoadingProductId(null);
        }

        productModalRef.current.show();
    }

    const closeModal = () =>{
        productModalRef.current.hide();
    }


    return(
        <>
            <div className="container">
                {/* 產品列表 */}
                <table className="table align-middle mt-3">
                    <thead>
                        <tr>
                            <th>圖片</th>
                            <th>商品名稱</th>
                            <th>價格</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            products.map( product =>(
                                <tr key={product.id}>
                                    <td style={{ width: "200px" }}>
                                        <div
                                        style={{
                                            height: "100px",
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            backgroundImage: `url(${product.imageUrl})`,
                                        }}
                                        ></div>
                                    </td>
                                    <td>{product.title}</td>
                                    <td>
                                        <del className="h6">原價：{product.origin_price}</del>
                                        <div className="h5">特價：{product.price}</div>
                                    </td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => handleView(product.id)}
                                                disabled={loadingProductId === product.id}
                                            >
                                                {
                                                    loadingProductId === product.id ?(
                                                        <RotatingLines color="grey" width={80} height={16}/>
                                                    ):('查看更多')
                                                }
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-danger"
                                                onClick={() =>addCart(product.id)}
                                                disabled={loadingCardId === product.id}
                                            >
                                            {
                                                loadingCardId === product.id ?(
                                                    <RotatingLines color="red" width={80} height={16}/>
                                                ):('加到購物車')
                                            }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <h2 className="mt-3">結帳列表</h2>
                <div className="text-end mt-4">
                    {/* 修改點：當購物車為空時，禁用按鈕並改變顏色 (Bootstrap btn-secondary) */}
                    <button 
                        type="button" 
                        className={`btn ${isCartEmpty ? "btn-secondary" : "btn-danger"}`} 
                        onClick={() => deleteAllCart()}
                        disabled={isCartEmpty}
                    >
                    清空購物車
                    </button>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">品名</th>
                            <th scope="col">數量/單位</th>
                            <th scope="col">小計</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 修改點：條件渲染 */}
                        {isCartEmpty?(
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                        購物車內目前沒有商品喔！
                                    </td>
                                </tr>
                            ): (cart?.carts?.map(cartItem => (
                                    <tr key={cartItem.id}>
                                        <td>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => deleteCart(cartItem.id)}
                                        >
                                            刪除
                                        </button>
                                        </td>
                                        <th scope="row">{cartItem.product.title}</th>
                                        <td>
                                            <div className="input-group input-group-sm mb-3">
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    min="1"
                                                    aria-label="Sizing example input" 
                                                    aria-describedby="inputGroup-sizing-sm" 
                                                    value={cartItem.qty}
                                                    onChange={(e) => updateCart(cartItem.id, cartItem.product_id, Number(e.target.value))}
                                                />
                                                <span className="input-group-text" id="inputGroup-sizing-sm">{cartItem.product.unit}</span>
                                            </div>
                                        </td>
                                        <td className="text-end">{cartItem.final_total}</td>
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="text-end" colSpan="3">
                            總計
                            </td>
                            <td className="text-end">{cart.final_total}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* 訂單頁面 */}
                <div className="my-5 row justify-content-center">
                    <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-control"
                                placeholder="請輸入 Email"
                                {...register("email", {
                                    required:"請輸入 Email",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Email 格式不正確",
                                    },
                                })}
                            />
                            {
                                errors.email && (
                                    <p className="text-danger">{errors.email.message}</p>
                                )
                            }
                        </div>

                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">
                                收件人姓名
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-control"
                                placeholder="請輸入姓名"
                                {...register("name", {
                                    required:"請輸入姓名",
                                    minLength: {
                                        value: 2,
                                        message: "姓名最少 2 個字",
                                    },
                                })}
                            />
                            {
                                errors.name && (
                                    <p className="text-danger">{errors.name.message}</p>
                                )
                            }
                        </div>

                        <div className="mb-3">
                            <label htmlFor="tel" className="form-label">
                                收件人電話
                            </label>
                            <input
                                id="tel"
                                name="tel"
                                type="tel"
                                className="form-control"
                                placeholder="請輸入電話"
                                {...register("tel", {
                                    required:"請輸入收件人電話",
                                    minLength: {
                                        value: 8,
                                        message: "電話至少 8 碼",
                                    },
                                    pattern: {
                                        value: /^\d+$/,
                                        message: "電話僅能輸入數字",
                                    },
                                })}
                            />
                            {
                                errors.tel && (
                                    <p className="text-danger">{errors.tel.message}</p>
                                )
                            }
                        </div>

                        <div className="mb-3">
                            <label htmlFor="address" className="form-label">
                                收件人地址
                            </label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                className="form-control"
                                placeholder="請輸入地址"
                                {...register("address", {
                                    required: "請輸入收件人地址",
                                })}
                            />
                            {
                                errors.address && (
                                    <p className="text-danger">{errors.address.message}</p>
                                )
                            }
                        </div>

                        <div className="mb-3">
                            <label htmlFor="message" className="form-label">
                                留言
                            </label>
                            <textarea
                                id="message"
                                className="form-control"
                                cols="30"
                                rows="10"
                                {...register("message")}
                            ></textarea>
                        </div>
                        <div className="text-end">
                            <button type="submit" className="btn btn-danger" disabled={isCartEmpty}>
                                送出訂單
                            </button>
                        </div>
                    </form>
                </div>

                <SingleProductModal product={product} addCart={addCart} closeModal={closeModal}/>
            </div>
        </>
    )
}

export default Checkout