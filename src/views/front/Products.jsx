import { useEffect, useState } from "react"
import axios from 'axios'
import Swal from 'sweetalert2'
import { useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Products(){
    const[products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() =>{
        const getProducts = async() =>{
            try {
                const response = await axios.get(`${API_BASE}/api/${API_PATH}/products`)
                setProducts(response.data.products);
            } catch (error) {
                Swal.fire({
                    text: `${error.response.data.message}`,
                    icon: "error"
                });
            }
        }
        getProducts();
    },[])

    const handleView = async(id) =>{
        navigate(`/product/${id}`);
    }

    return(
        <>
            <div className="container">
                <h2 className="mt-3">產品列表</h2>
                <div className="row">
                    {
                        products.map(product =>(
                            <div className="col-md-4 mb-3" key={product.id}>
                                <div className="card h-100">
                                    <img src={product.imageUrl} className="card-img-top" alt={product.title} />
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold">{product.title}</h5>
                                        <p className="card-text text-start">{product.description}</p>
                                        <p className="card-text text-start">價格：{product.price}</p>
                                        <p className="card-text text-start">
                                            <small className="text-body-secondary">{product.unit}</small>
                                        </p>
                                        <button type="button" className="btn btn-dark" onClick={() => handleView(product.id)}>查看更多</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}

export default Products