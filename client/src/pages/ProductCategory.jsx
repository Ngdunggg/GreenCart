import React from "react"
import { useParams } from "react-router-dom"
import { categories } from "../assets/assets"
import { useAppContext } from "../context/AppContext"
import ProductCard from "../components/ProductCard"

const ProductCategory = () => {

    const { products } = useAppContext()
    const { category } = useParams()
    console.log(category)
    const searchCategory = categories.find((item) => item?.path.toLowerCase() === category)
    const filteredProducts = products.filter((item) => item?.category.toLowerCase() === category)

    return (
        <div className="mt-16">
            <div className="flex flex-col">
                {searchCategory && ( <p className="text-2xl font-medium uppercase">{searchCategory.text}</p> )}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
                        {filteredProducts.filter((item) => item.inStock).map((product, index) => (
                            <ProductCard product={product} key={index}/>
                        ))}    
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[60vh]">
                        <p className="text-2xl font-medium text-primary/90">Không có sản phẩm nào trong loại mặt hàng này</p>
                    </div>    
                )} 
            </div>
            
        </div>
    )
}

export default ProductCategory