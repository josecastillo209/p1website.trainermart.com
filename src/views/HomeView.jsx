import { Link } from 'react-router-dom'
import products from '../data/products.json'
import ProductList from '../components/ProductList'

function HomeView() {
  const featured = products.slice(0, 3)

  return (
    <div>
      <section className="hero-panel text-white py-5">
        <div className="container py-5">
          <p className="hero-kicker text-uppercase small mb-2">TrainerMart</p>
          <h1 className="display-4 fw-bold">Gear for the next route.</h1>
          <p className="lead col-lg-7">
            Adventure sneakers, trail kits, and camp essentials for trainers
            heading out of town. Stock up, pick your colors, and hit the path.
          </p>
          <Link to="/shop" className="btn btn-warning btn-lg mt-3">
            Shop the catalog
          </Link>
        </div>
      </section>

      <section className="container py-5">
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <h3>Route ready</h3>
            <p className="text-muted mb-0">
              Shoes, jackets, and packs built for long walks between towns.
            </p>
          </div>
          <div className="col-md-4">
            <h3>Pick your kit</h3>
            <p className="text-muted mb-0">
              Choose size and color on every item before it goes in the cart.
            </p>
          </div>
          <div className="col-md-4">
            <h3>Camp tonight</h3>
            <p className="text-muted mb-0">
              Tents, bags, bottles, and a cook kit for overnight routes.
            </p>
          </div>
        </div>
      </section>

      <section className="container pb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="mb-1">Featured gear</h2>
            <p className="text-muted mb-0">A few pieces to start the journey.</p>
          </div>
          <Link to="/shop" className="btn btn-outline-dark">View all</Link>
        </div>
        <ProductList products={featured} />
      </section>
    </div>
  )
}

export default HomeView