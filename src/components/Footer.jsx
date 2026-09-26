import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="store-footer text-white mt-auto py-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <h5 className="fw-bold">TrainerMart</h5>
            <p className="text-white-50 mb-0">
              Adventure gear for the next route. Sneakers, trail kits, and camp
              essentials.
            </p>
          </div>
          <div className="col-md-4">
            <h6>Shop</h6>
            <ul className="list-unstyled">
              <li><Link className="link-light link-underline-opacity-0" to="/shop">Catalog</Link></li>
              <li><Link className="link-light link-underline-opacity-0" to="/cart">Cart</Link></li>
              <li><Link className="link-light link-underline-opacity-0" to="/create-account">Create account</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Store</h6>
            <p className="text-white-50 mb-0">
              Fictitious storefront for CS 351 Project 1. No real payments.
            </p>
          </div>
        </div>
        <hr className="border-secondary my-4" />
        <p className="text-white-50 small mb-0">
          © {new Date().getFullYear()} TrainerMart. Inspired adventure theme. Not affiliated with Nintendo.
        </p>
      </div>
    </footer>
  )
}

export default Footer