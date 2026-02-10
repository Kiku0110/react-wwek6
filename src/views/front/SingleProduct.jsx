import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router"
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function SingleProduct(){
    const {id} = useParams();
    const [product, setProduct] = useState();

    useEffect(() => {
        const handleView = async(id) =>{
            try {
                const response = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`)
                setProduct(response.data.product);
            } catch (error) {
                console.log(error.response.message);
            }
        }
        handleView(id);
    },[id])

    const addCart = async(id, qty=1) =>{
        const data = {
            product_id: id,
            qty
        }
        try {
            const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {data})
            Swal.fire({
                text: `${response.data.message}`,
                icon: "success"
            });
        } catch (error) {
            Swal.fire({
                text: `${error.response.data.message}`,
                icon: "error"
            });
        }
    }

    return !product?(
        <h2>查無產品</h2>):(
        <div className="container mt-3">
            <div className="card">
                <div className="row g-0">
                    <div className="col-md-5 p-4">
                        <img src={product.imageUrl} className="img-fluid rounded primary-image" alt={product.title} />
                    </div>
                    <div className="col-md-7">
                        <div className="card-body text-start">
                            <h5 className="card-title fw-bold">{product.title}</h5>
                            <p className="card-text text-start"><span className="fw-bold">商品描述：</span>{product.description}</p>
                            <p className="card-text text-start"><span className="fw-bold">商品內容：</span>{product.content}</p>
                            <div className="d-flex">
                                價格：<del className="text-secondary">{product.origin_price}</del> 元 / {product.price} 元
                            </div>
                            <p className="card-text text-start">
                                <small className="text-body-secondary">{product.unit}</small>
                            </p>
                            <div className="d-flex overflow-auto">
                            {
                                product.imagesUrl.map((url,index)=>{
                                    return <img key={index} src={url} className="images object-fit img-thumbnail" alt="副圖" />
                                })
                            }
                            </div>
                            <div className="text-end">
                                <button type="button" className="btn btn-dark" onClick={() => addCart(product.id)}>加入購物車</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>                    
        </div>
    )
        
}

export default SingleProduct