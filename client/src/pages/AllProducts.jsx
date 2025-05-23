import React, { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext"
import ProductCard from "../components/ProductCard"
import { dummyProducts } from "../assets/assets"

const AllProducts = () => {

    const { products, searchQuery, setSearchQuery } = useAppContext()
    const [filteredProducts, setFilteredProducts] = useState([])
    // const [searchQuery, setSearchQuery ] = useState({})
    // const products = dummyProducts


    useEffect(() => {
        if(searchQuery.length > 0){
            setFilteredProducts(products.filter(
                product => product.name.toLowerCase().includes(searchQuery.toLowerCase())
            ))
        } else {
            setFilteredProducts(products)
        }
    },[products, searchQuery])

    return (
        <div className="mt-16 flex flex-col">
            <p className="text-2xl font-medium uppercase">All products</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6">
                {filteredProducts.filter((item) => item.inStock).map((product, index) => (
                    <ProductCard product={product} key={index}/>
                ))}    
            </div>
        </div>
    )
}

export default AllProducts