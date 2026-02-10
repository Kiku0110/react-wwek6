import { Link, Outlet } from "react-router"

function FrontedLayout(){
    return(
        <>
            <header>
                <nav className="nav bg-light">
                    <Link className="nav-link" to="/">首頁</Link>
                    <Link className="nav-link" to="/product">產品列表</Link>
                    <Link className="nav-link" to="/cart">購物車</Link>
                    <Link className="nav-link" to="/checkout">結帳</Link>
                    <Link className="nav-link" to="/login">登入</Link>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
            <footer className="mt-5 text-center">
                <p>© 2025 All Rights Reserved</p>
            </footer>
        </>
    )
}

export default FrontedLayout