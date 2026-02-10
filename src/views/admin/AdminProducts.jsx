import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import * as bootstrap from 'bootstrap'
import Swal from 'sweetalert2'
import ProductModal from '../../components/ProductModal'
import Pagination from '../../components/Pagination'

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

//初始化資料
const INITIAL_TEMPLATE_DATA = {
    id: "",
    title: "",
    category: "",
    origin_price: "",
    price: "",
    unit: "",
    description: "",
    content: "",
    is_enabled: false,
    imageUrl: "",
    imagesUrl: [],
    size: ""
};

function AdminProducts(){
    const [products, setProducts] = useState([]);
    const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
    const [modalType, setModalType] = useState("");

    const [pagination, setPagination] = useState({});

    // useRef 建立對 DOM 元素的參照
    const productModalRef = useRef(null);

    const navigate = useNavigate();

    const handleModalInputChange = (e) =>{
        const {name, value, checked, type} = e.target;
        setTemplateProduct((preData)=>({
            ...preData,
            [name]: type === 'checkbox'? checked : value,
        }));
    }

    const handleModalImageChange = (index, value) =>{
        setTemplateProduct((prev) =>{
            const newImage = [...prev.imagesUrl];
            newImage[index] = value;
            return{
                ...prev,
                imagesUrl: newImage
            }
        })
    }

    const handleAddImage = () =>{
        setTemplateProduct((prev) =>{
            const newImage = [...prev.imagesUrl];
            newImage.push("");
            return{
                ...prev,
                imagesUrl: newImage
            }
        })
    }

    const handleDeleteImage = () =>{
        setTemplateProduct((prev) =>{
        const newImage = [...prev.imagesUrl];
            newImage.pop();
            return{
                ...prev,
                imagesUrl: newImage
            }
        })
    }

    const getProducts = async(page=1) =>{
        try {
            const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`)
            setProducts(response.data.products);
            setPagination(response.data.pagination);
        } catch (error) {
            Swal.fire({
                text: `${error.response.data.message}`,
                icon: "error"
            });
        } 
    }

    const updateProduct = async(id) =>{
        let url = `${API_BASE}/api/${API_PATH}/admin/product`;
        let method = "post";

        if(modalType === "edit"){
            url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
            method = "put";
            Swal.fire({
                text: "已修改完成",
                icon: "success"
            });
        }
        
        const productData = {
            //改變初始化資料的型態(字串轉數字)
            //避免 imagesUrl 傳空字串
            data:{
                ...templateProduct,
                origin_price: Number(templateProduct.origin_price),
                price: Number(templateProduct.price),
                is_enabled: templateProduct.is_enabled ? 1 : 0,
                imagesUrl: [...templateProduct.imagesUrl.filter(url => url !== "")],
            },
        }

        //axios[method] 可依 if 條件切換成 axios.post 或 axios.put
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await axios[method](url, productData)
            if(method === "post"){
                Swal.fire("成功建立商品！");
            }
            getProducts();
            closeModal();
        } catch (error) {
            Swal.fire({
                text: `${error.response.data.message}`,
                icon: "error"
            });
        }
    }

    const delProduct = async(id) =>{
        try {
            const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`)
            Swal.fire({
                text: `${response.data.message}`,
                icon: "success"
            });
            getProducts();
            closeModal();
        } catch (error) {
            Swal.fire({
                text: `${error.response.data.message}`,
                icon: "error"
            });
        }
    }

    const uploadImage = async(e) =>{
        const file = e.target.files?.[0];
        //沒有 file 就 return
        if(!file){
            return
        }

        try {
            const formData = new FormData()
            formData.append('file-to-upload', file)

            const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData)
            setTemplateProduct((pre) =>({
                ...pre,
                imageUrl: response.data.imageUrl
            }))
        } catch (error) {
            Swal.fire({
                text: `${error.response.data.message}`,
                icon: "error"
            });
        }
    }

    useEffect(() =>{
        // 檢查登入狀態
        const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1]; // 讀取 Cookie

        // 有取得 Token 才將 Token 設定到 Header 上
        if(token){
            axios.defaults.headers.common['Authorization'] = token;
        }
        
        //建立 Modal methods
        productModalRef.current = new bootstrap.Modal('#productModal', {
            keyboard: false
        });

        // 檢查管理員權限
        const checkLogin = async()=>{
            try {
                // eslint-disable-next-line no-unused-vars
                const response = await axios.post(`${API_BASE}/api/user/check`)
                getProducts();
            } catch (error) {
                Swal.fire({
                    text: `${error.response?.data.message}`,
                    icon: "error"
                });
                //驗證失敗跳至登入頁
                navigate('/login');
            }
        };
        checkLogin();
    },[])

    const openModal = (type, product) =>{
        setModalType(type)
        //因為新增 size 屬性，所以原本是傳 preData 要改成 INITIAL_TEMPLATE_DATA
        setTemplateProduct({
            ...INITIAL_TEMPLATE_DATA,
            ...product,
        });
        productModalRef.current.show();
    }

    const closeModal = () =>{
        productModalRef.current.hide();
    }


    return(
        <>
            <div className="container">
                {/* 新增產品按鈕 */}
                <div className="text-end mt-4">
                    <button type="button" className="btn btn-dark" onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}>
                        建立新的產品
                    </button>
                </div>
                <h2 className="mt-3 text-center">後台產品管理列表</h2>
                <table className="table table-striped text-center">
                    <thead>
                        <tr>
                        <th scope="col">分類</th>
                        <th scope="col">產品名稱</th>
                        <th scope="col">原價</th>
                        <th scope="col">售價</th>
                        <th scope="col">是否啟用</th>
                        <th scope="col">編輯</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                        products.map((product) => {
                            return(
                            <tr key={product.id}>
                                <td>{product.category}</td>
                                <th scope="row">{product.title}</th>
                                <td>{product.origin_price}</td>
                                <td>{product.price}</td>
                                <td className={`${product.is_enabled ? 'text-primary' : ''}`}>{product.is_enabled ? '啟用': '未啟用'}</td>
                                <td>
                                <div className="btn-group" role="group" aria-label="Basic example">
                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal("edit", product)}>編輯</button>
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => openModal("delete", product)}>刪除</button>
                                </div>
                                </td>
                            </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
                <Pagination pagination={pagination} onChangePage={getProducts}/>
            </div>

            {/* Modal */}
            <ProductModal 
                modalType={modalType}
                templateProduct={templateProduct}
                handleModalInputChange={handleModalInputChange}
                handleModalImageChange={handleModalImageChange}
                handleAddImage={handleAddImage}
                handleDeleteImage={handleDeleteImage}
                updateProduct={updateProduct}
                delProduct={delProduct}
                uploadImage={uploadImage}
                closeModal={closeModal}
            />
        </>
    )
}

export default AdminProducts