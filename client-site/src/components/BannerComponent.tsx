import _axios from "@/lib/_axios";
import { ImgbaseUrl } from "@/lib/config";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 

// Define a type for the Banner
interface Banner {
    BannerImage: string;
    Description: string;
    Title: string;
    active: boolean;
    isDeleted: boolean;
    _id: string;
}

function BannerComponent() {
    const [banners, setBanners] = useState<Banner[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin"],
        queryFn: () => _axios.get(`/banner/all`),
        select(data) {
            return { banner: data.data.banners };
        },
    });

    useEffect(() => {
        if (data) {
            setBanners(data.banner);
        }
    }, [data]);

    console.log(banners);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: banners.length > 1 ? 1 : 1,
        slidesToScroll: 1,
        autoplay: true, 
        autoplaySpeed: 3000, 
        arrows: true, 
    };

    return (
        <div className="lg:pt-16 pt-1">
            {banners.length > 1 ? (
                <Slider {...settings} key={banners.length}>
                    {banners.map((banner, index) => (
                        <div key={index}>
                            <img
                                src={`${ImgbaseUrl}${banner.BannerImage}`}
                                alt={`Banner ${index + 1}`}
                                className="w-full lg:h-[500px] h-[200px] lg:object-fill" 
                            />
                        </div>
                    ))}
                </Slider>
            ) : (
                banners.length === 1 && (
                    <div>
                        <img
                            src={`${ImgbaseUrl}${banners[0].BannerImage}`}
                            alt="Banner"
                            className="w-full lg:h-[600px]  lg:object-fill" 
                        />
                    </div>
                )
            )}
        </div>
    );
}

export default BannerComponent;
