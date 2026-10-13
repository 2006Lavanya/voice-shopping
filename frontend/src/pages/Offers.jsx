import { useEffect, useState } from "react";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

const Offers = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products", { params: { sort: "price_low", limit: 20 } })
      .then(({ data }) => setDeals(data.products.filter((p) => p.discountPrice)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-gradient-to-r from-brand-pink to-brand-pinkDark rounded-3xl p-10 text-white text-center mb-10">
        <h1 className="text-3xl font-extrabold">⚡ Offers & Deals</h1>
        <p className="mt-2 text-white/90">Use code <span className="font-bold">WELCOME10</span> at checkout for 10% off your order!</p>
      </div>
      {loading ? <Loader /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {deals.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Offers;
