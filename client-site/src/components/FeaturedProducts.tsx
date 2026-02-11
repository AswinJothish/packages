import { useEffect, useState } from "react";
import { baseUrl, ImgbaseUrl } from "../lib/config";

type Product = {
  _id: string;
  productName: string;
  dealerPrice: number;
  customerPrice: number;
  strikePrice: number;
  stock: number;
  productImages: string[];
};

type CartItem = {
  productId: {
    _id: string;
    stock: number;
  };
  quantity: number;
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [role, setRole] = useState("customer");

  const getUserData = () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    setRole(userData?.role || "customer");
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/products/newProduct`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getCartItems = () => {
    const userId = localStorage.getItem("_id");
    if (!userId) return;

    fetch(`${baseUrl}/order/getCartItems?Id=${userId}`)
      .then((response) => response.json())
      .then((data) => setCartItems(data.cart))
      .catch((error) => console.error("Error fetching cart items:", error));
  };

  const handleProductClick = (productId: string) => {
    window.location.href = `/products/${productId}`;
  };

  useEffect(() => {
    fetchProducts();
    getUserData();
    getCartItems();
  }, []);

  const FeaturedCard = ({ product, isFeatured = false }: { product: Product; isFeatured?: boolean }) => (
    <div
      onClick={() => handleProductClick(product._id)}
      className={`group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-white shadow-md transition-transform duration-300 hover:scale-[1.02] ${
        isFeatured ? 'lg:h-[620px] h-[250px]' : 'lg:h-[290px] h-[250px]'
      }`}
    >
      <div className="relative flex-1 overflow-hidden p-3">
        <div className="relative h-full w-full">
          <img
            src={`${ImgbaseUrl}${product.productImages[0]}`}
            alt={product.productName}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-95"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded bg-gray-900/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="transform rounded-xl border px-6 py-1 text-blue-100 transition-all duration-300 hover:scale-110">
              Explore
            </p>
          </div>
        </div>
      </div>
      <div 
        style={{ backgroundColor: "rgb(177, 177, 178, 0.1)" }}
        className="relative flex w-full flex-col items-center justify-center px-2 py-3 transition-all duration-200 group-hover:py-4"
      >
        <p
          className={`w-full truncate text-center font-semibold ${
            isFeatured ? 'md:text-lg text-sm' : 'text-sm'
          }`}
          title={product.productName}
        >
          {product.productName}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col md:px-10 px-1">
      <section className="flex justify-center items-center flex-col mt-10">
        <div className="flex flex-col w-full gap-5 justify-center items-center">
          <h1 className="font-semibold md:text-3xl text-xl tracking-wider">
            FEATURED PRODUCT
          </h1>
          <hr className="bg-blue-500/20 h-0.5 md:w-[300px] w-[150px]" />
        </div>

        <div className="pt-10 w-full">
          <div className="flex md:flex-row flex-col justify-center items-center md:gap-10 gap-5">
            {/* Featured Product */}
            <div className="md:w-1/2 w-5/6">
              {products[0] && <FeaturedCard product={products[0]} isFeatured={true} />}
            </div>

            {/* Grid of smaller products */}
            <div className="w-5/6 md:w-1/2 grid md:grid-cols-2 grid-cols-1 md:gap-10 gap-5">
              {products.slice(1, 5).map((product) => (
                <FeaturedCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturedProducts;