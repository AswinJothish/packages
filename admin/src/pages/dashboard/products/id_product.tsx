import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { _axios } from "@/lib/_axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { GrEdit } from "react-icons/gr";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu"
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { FaTrashAlt } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";

// type Checked = DropdownMenuCheckboxItemProps["checked"]
interface Offer {
  from: string;
  to: string;
  customerPrice: string;
  dealerPrice: string;
}
interface CategoryFields {
  [category: string]: string[];
}
export function Id_product() {

  const { id } = useParams();
  const location = useLocation();
  const [editEnabled, setEditEnabled] = useState(
    location.state?.editEnabled || false
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [productDetails, setProductDetails] = useState<any>('');
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const [allSpecs, setAllSpecs] = useState<any[]>([])
  const [productSpecs, setProductSpecs] = useState<any>([]);
  const [missingSpecs, setMissingSpecs] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryFields, setCategoryFields] = useState<CategoryFields>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [deleteForm, setdeleteFormOpen] = useState(false);
  const [deleteSpecForm, setdeleteSpecFormOpen] = useState(false);
  const [deleteGeneralForm, setDeleteGeneralForm] = useState(false);

  const [productCategoryfields, setProductCategoryFields] = useState<string[]>([]);

  const [selectedGeneralCategories, setSelectedGeneralCategories] = useState<string[]>([]);
  const [generalInputs, setGeneralInputs] = useState<Record<string, string>>({});
  const [allGeneralSpecs, setAllGeneralSpecs] = useState<any[]>([]);
  const [productGeneralSpecs, setProductGeneralSpecs] = useState<any>({});
  const [missingGeneralSpecs, setMissingGeneralSpecs] = useState<string[]>([]);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true);
  const [localOffers, setLocalOffers] = useState<Offer[]>([]);
  //@ts-ignore
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["currentproduct", id],
    queryFn: () => _axios.get(`/products/get/${id}`),
    enabled: !!id,
    select: (response) => ({
      product: response?.data,
    }),
  });

  const fetchCategory = async () => {
    try {
      const response = await _axios.get("/master/get/category");
      setProductCategoryFields(response.data.data);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  }

  useEffect(() => {
    if (id) {
      refetch();
      fetchCategory();
    }
  }, [id, refetch])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  useEffect(() => {
    if (allSpecs.length > 0) {
      if (Object.keys(productSpecs).length > 0) {
        const productSpecCategories = Object.keys(productSpecs);

        const missing: any = allSpecs
          .filter(spec => !productSpecCategories.includes(spec.category))
          .map(spec => spec.category);

        setMissingSpecs(missing)
      } else {
        const allCategories: any = allSpecs.map(spec => spec.category);
        setMissingSpecs(allCategories)
      }

      if (selectedCategories.length > 0) {
        const selectedFields: Record<string, any> = {};
        selectedCategories.forEach((category: string | number) => {
          const selectedSpec = allSpecs.find(spec => spec.category === category);
          if (selectedSpec) {
            selectedFields[category] = selectedSpec.fields;
          }
        });
        setCategoryFields(selectedFields);
      } else {
        setCategoryFields({});
      }
    }
  }, [allSpecs, productSpecs, selectedCategories]);

  const handleCategorySelect = (category : string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories((prev:any) => prev.filter((cat:any) => cat !== category));
    } else {
      setSelectedCategories((prev:any) => [...prev, category]);
    }
  };

  const handleDeleteCategory = (category: string, fromProductSpec = false) => {
    console.log("Before update:", productSpecs);
    if (fromProductSpec) {
      setProductSpecs((prev: any) => {
        if (typeof prev !== 'object' || prev === null) {
          console.error("Expected prev to be an object, but it is not:", prev);
          return prev;
        }

        const { [category]: _, ...updatedProductSpecs } = prev;

        console.log('Updated productSpecs:', updatedProductSpecs);
        return updatedProductSpecs;
      });
    } else {
      setSelectedCategories((prev: any) => {
        console.log("Selected categories before:", prev);
        if (!Array.isArray(prev)) {
          console.error("Expected prev to be an array, but it is not:", prev);
          return [];
        }
        return prev.filter((cat) => cat !== category);
      });
      setCategoryFields((prev) => {
        const newCategoryFields: any = { ...prev };
        delete newCategoryFields[category];
        return newCategoryFields;
      });
    }
  };

// general field functions 

const getGeneralSpecs = async () => {
  try {
    const response = await _axios.get('/master/get/general-spec');
    setAllGeneralSpecs(response.data.data[0].General);
    console.log('General Specs:', allGeneralSpecs);
  } catch (error) {
    toast.error("Failed to fetch general specifications");
  }
};

const getProductGeneralSpecs = (productDetails: any) => {
  if (productDetails && productDetails.general) {
    setProductGeneralSpecs(product.general);
  }
};

 
useEffect(() => {
  if (productDetails) {
    getProductGeneralSpecs(productDetails);
    compareGeneralSpecs();
  }
}, [productDetails, allGeneralSpecs]);


useEffect(() => {
  if (allGeneralSpecs.length > 0 && Object.keys(productGeneralSpecs).length > 0) {
    compareGeneralSpecs();
  }
}, [allGeneralSpecs, productGeneralSpecs]);

const compareGeneralSpecs = () => {
  if (allGeneralSpecs.length > 0) {
    if (Object.keys(productGeneralSpecs).length > 0) {
      const productGeneralCategories = Object.keys(productGeneralSpecs);

      const missing: string[] = allGeneralSpecs.filter(
        (generalSpec) => !productGeneralCategories.includes(generalSpec)
      );

      setMissingGeneralSpecs(missing);
    } else {
      setMissingGeneralSpecs([...allGeneralSpecs]);
    }
  }
};

const handleGeneralCategorySelect = (category: string) => {
  if (!selectedGeneralCategories.includes(category)) {
    setSelectedGeneralCategories([...selectedGeneralCategories, category]);
    setGeneralInputs((prev) => ({ ...prev, [category]: '' }));
  }
};


const handleInputChange = (category: string, value: string) => {
  setGeneralInputs((prev) => ({
    ...prev, 
    [category]: value, 
  }));
};


const handleDeleteGeneralCategory = (category: string) => {
  setSelectedGeneralCategories((prev) => prev.filter((item) => item !== category));
  setGeneralInputs((prev) => {
    const updatedInputs = { ...prev };
    delete updatedInputs[category];
    return updatedInputs;
  });
};


useEffect(() => {
  if (productDetails && productDetails.general) {
    if (isInitializing) {
      const existingSpecs = Object.keys(productDetails.general);
      setSelectedGeneralCategories(existingSpecs);
      setGeneralInputs((prev) => ({
        ...prev, 
        ...productDetails.general, 
      }));

      setIsInitializing(false);
    }
  }
}, [productDetails, isInitializing]);

const openDeleteDialog = (fieldName: string) => {
  setFieldToDelete(fieldName);
  setDeleteGeneralForm(true);
};

const confirmDelete = () => {
  if (fieldToDelete) {
    handleDeleteGeneralCategory(fieldToDelete);
    setDeleteGeneralForm(false);
    setFieldToDelete(null); 
  }
};


const cancelDelete = () => {
  setDeleteGeneralForm(false);
  setFieldToDelete(null); 
};     



//end of general




  const getSpec = async () => {
    try {
      const response = await _axios.get('/master/all');
      setAllSpecs(response.data.data);
      console.log(allSpecs)
    } catch (error) {
      toast.error("Failed to fetch specifications");
    }
  };
  //console.log(selectedCategories)
  const product = data?.product?.data;
  useEffect(() => {
    getSpec()
    getGeneralSpecs();

    if (product) {
      if (product.productGeneral) {
        setProductGeneralSpecs(product.productGeneral);
      }
    }
    if (product?.productImages) {
      setImageUrls(
        product.productImages.map(
          (image: string) =>
            `http://65.0.108.35:4000/api/admin/files/view?key=${image}`
          // `http://localhost:3000/api/admin/files/view?key=${image}`
        )
      );
      setImageFiles(new Array(product.productImages.length).fill(null));
      refetch();
    }
    setProductDetails(product);

  }, [product, id]);
  
// console.log(productDetails)
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedUrls = [...imageUrls];
      updatedUrls[index] = URL.createObjectURL(file);
      setImageUrls(updatedUrls);

      setImageFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
      });
    }
  };
  const handleRemoveImage = (index: number) => {
    const updatedUrls = [...imageUrls];
    const updatedFiles = [...imageFiles];
  
    updatedUrls.splice(index, 1);
    updatedFiles.splice(index, 1);
    setImageUrls(updatedUrls);
    setImageFiles(updatedFiles);
  
    if (updatedUrls.length === 0) {
      // Reset index if no images are left
      setCurrentImageIndex(0);
    } else if (currentImageIndex >= updatedUrls.length) {
      // If current index is out of bounds, set it to the last image
      setCurrentImageIndex(updatedUrls.length - 1);
    } else if (currentImageIndex > index) {
      // If the current index is after the removed index, decrement the index
      setCurrentImageIndex(currentImageIndex - 1);
    }
};


  const handleAddNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const updatedUrls = [
        ...imageUrls,
        ...filesArray.map((file) => URL.createObjectURL(file)),
      ];
      setImageUrls(updatedUrls);
      setImageFiles((prev) => [...prev, ...filesArray]);
      //refetch()
    }
  };

  const handleSaveImages = async (productId: string) => {
    if (!productId) {
      toast.error("Product ID is required");
      return;
    }
  
    if ((!imageUrls || imageUrls.length === 0) && (!imageFiles || imageFiles.length === 0)) {
      toast.error("Please add at least one image");
      return;
    }
  
    const formData = new FormData();
    formData.append('productId', productId);
  
    // Append image URLs if they are valid
    imageUrls.forEach(url => {
      if (url && !url.startsWith('blob:')) {
        const keyIndex = url.indexOf('key=');
        if (keyIndex !== -1) {
          const keyPart = url.substring(keyIndex + 4);
          formData.append('imageUrls', keyPart);
        }
      }
    });
  
    // Append image files
    imageFiles.forEach(file => {
      if (file instanceof File) {
        formData.append('imageFiles', file);
      }
    });
  
    try {
      const response = await _axios.post('/products/update-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        toast.success('Images updated successfully');
        refetch();
      } else {
        toast.error("Failed uploading images");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.data;
      if (!data.ok) {
        toast.error(data.message);
        throw new Error(data.message);
      }
  
      console.log('Product images updated successfully:', data.message);
      return data;
    } catch (error: any) {
      console.error('Error updating product images:', error.message);
      toast.error(error.message);
      return { ok: false, message: error.message };
    }
  };
  


  const handleSaveProductDetails = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!productDetails.productName) {
      newErrors.productName = "Product Name cannot be empty";
    }
    if (!productDetails.productCode) {
      newErrors.productCode = "Product Code cannot be empty";
    }
    if (!productDetails.description) {
      newErrors.description = "Description cannot be empty";
    }
    if (!productDetails.brand) {
      newErrors.brand = "Brand cannot be empty";
    }
    if (!productDetails.purchasedPrice) {
      newErrors.purchasedPrice = "Purchased Price cannot be empty";
    }
    if (!productDetails.strikePrice) {
      newErrors.strikePrice = "Strike Price cannot be empty";
    }
    if (!productDetails.category) {
      newErrors.category = "Category cannot be empty";
    }
    if (!productDetails.stock) {
      newErrors.stock = "Stock cannot be empty";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill out all fields.");
      return; 
    }
      setErrors({});
    
    const generalErrorsList: string[] = [];
    if (selectedGeneralCategories.length === 0) {
      generalErrorsList.push("Please select at least one general field.");
    } else {
      selectedGeneralCategories.forEach((field) => {
        if (!generalInputs[field] || generalInputs[field].trim() === "") {
          generalErrorsList.push(`Please fill out the ${field} field.`);
        }
      });
    }
  
    const emptySpecificationFields: string[] = [];
    const hasSpecifications = Object.keys(productDetails.specifications).length > 0;
  
    if (!hasSpecifications) {
      newErrors.specifications = "Please add at least one specification.";
    } else {
      selectedCategories.forEach((category) => {
        const categorySpec = productDetails.specifications[category];
        if (categorySpec) {
          Object.keys(categorySpec).forEach((field) => {
            if (!categorySpec[field]) {
              emptySpecificationFields.push(`Please fill out the ${field} field in ${category}.`);
            }
          });
        }
      });
    }
  
    Object.keys(productDetails.specifications).forEach((category) => {
      const categorySpec = productDetails.specifications[category];
      if (categorySpec) {
        Object.keys(categorySpec).forEach((field) => {
          if (!categorySpec[field]) {
            emptySpecificationFields.push(`Existing specification field ${field} in ${category} cannot be empty.`);
          }
        });
      }
    });
  
    const offerErrorsList: string[] = [];
    if (localOffers.length === 0) {
      offerErrorsList.push("Please add at least one offer.");
    } else {
      const emptyOfferFields = localOffers.filter(
        (offer) => !offer.from || !offer.to || !offer.customerPrice || !offer.dealerPrice
      );
      if (emptyOfferFields.length > 0) {
        offerErrorsList.push("Please fill out all fields in each offer.");
      }
    }
  
   
    if (generalErrorsList.length > 0) {
      newErrors.generalFields = generalErrorsList.join(" ");
    }
    if (emptySpecificationFields.length > 0) {
      newErrors.specifications = emptySpecificationFields.join(" ");
    }
    if (offerErrorsList.length > 0) {
      newErrors.offers = offerErrorsList.join(", ");
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill out all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("productName", productDetails.productName);
    formData.append("productCode", productDetails.productCode);
    formData.append("description", productDetails.description);
    formData.append("brand", productDetails.brand);
    formData.append("purchasedPrice", productDetails.purchasedPrice);
    
    // Append the customerPrice and dealerPrice from the first offer if available
    if (localOffers.length > 0) {
      formData.append("customerPrice", localOffers[0].customerPrice);
      formData.append("dealerPrice", localOffers[0].dealerPrice);
    }
  
    formData.append("strikePrice", productDetails.strikePrice);
    formData.append("category", productDetails.category);
    formData.append("stock", productDetails.stock);
  
    // Append general fields as JSON
    const filteredGeneralDetails = Object.keys(generalInputs).reduce((acc, key) => {
      if (generalInputs[key]) {
        acc[key] = generalInputs[key];
      }
      return acc;
    }, {} as Record<string, any>);
  
    if (Object.keys(filteredGeneralDetails).length > 0) {
      formData.append("general", JSON.stringify(filteredGeneralDetails));
    }
  
    // Append specifications as JSON
    formData.append("specifications", JSON.stringify(productDetails.specifications));
  
    // Append offers as JSON
    formData.append("offers", JSON.stringify(localOffers));
  
    // console.log("Product Details:", productDetails);
    // console.log("General Inputs:", generalInputs);
    // console.log("Local Offers:", localOffers);
    // console.log("Errors:", newErrors);
  
    // Submit the form data
    try {
      await _axios.post(`/products/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      refetch();
      setEditEnabled(false);
  
      toast.success("Product details updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteOffer = (index: number) => {
    console.log("Delete offer at index:", index);
    setLocalOffers((prevOffers) => prevOffers.filter((_, i) => i !== index));
    setErrorMessage(null); 
  };


  const handleAddOffer = () => {
    const hasEmptyFields = localOffers.some(
      (offer) => !offer.from || !offer.to || !offer.customerPrice|| !offer.dealerPrice
    );

    if (hasEmptyFields) {
      setErrorMessage("Please fill in all fields above before adding a new offer.");
      return; 
    }

    setLocalOffers((prevOffers) => [
      ...prevOffers,
      { from: "", to: "", customerPrice: "" ,dealerPrice:""}, 
    ]);
    setErrorMessage(null); 

  };



  const handleChangeOffer = (index:any, field:any, value:any) => {
  setLocalOffers((prevOffers) => {
    const updatedOffers = [...prevOffers];
    updatedOffers[index] = {
      ...updatedOffers[index],
      [field]: value === "" ? "" : parseInt(value, 10) || "", 
    };
    return updatedOffers;
  });
};

  useEffect(() => {
    if (product?.offers) {
      setLocalOffers(product.offers);
    }
  }, [productDetails]);

  //diableEdit

  const handleDisableEdit = () => {
    setEditEnabled(false);
    
    const filteredOffers = localOffers.filter(
      (offer) => offer.from || offer.to || offer.customerPrice||offer.dealerPrice
    );
    
    setLocalOffers(filteredOffers); 

    setEditEnabled(false);
    setProductSpecs([]);
    setProductGeneralSpecs(productDetails.general || {}); 
  setImageFiles([])
    setSelectedGeneralCategories([]);
    setGeneralInputs({});
    setIsInitializing(true); 
    setImageFiles([]);
    if (product?.productImages) {
      setImageUrls(
        product.productImages.map(
          (image: string) =>
            `http://65.0.108.35:4000/api/admin/files/view?key=${image}`
          // `http://localhost:3000/api/admin/files/view?key=${image}`
        )
      );}
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="w-full bg-gray-50 flex pb-16 flex-col">
        <div style={{ width: `calc(100vw - 18rem)` }} className={`fixed top-0  h-16 p-3 z-50 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
          }`}>
          <div className="flex  w-full items-center justify-between ">
            <div   onClick={() => window.history.back()} className="flex gap-2 items-center text-gray-400 justify-center hover:text-primary">
              {/* <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/products " className="text-[11px]">Products</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-primary text-[11px]">
                      {product?.productCode}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb> */}
              <span className="text-xl"><IoMdArrowBack /></span>
            </div>
            <div className="flex gap-5 ">
              <div>
                {editEnabled && (
                  <div className="">
                    <button
                      className="bg-green-700 hover:bg-green-700 p-2 text-sm rounded-md text-white"
                      onClick={handleSaveProductDetails}
                    >
                      Update Product
                    </button>
                  </div>
                )}
              </div>
              <div className="mr-10">
                {editEnabled ? (
                  <button
                    className="bg-button-gradient  p-2 text-white hover:bg-blue-800 text-sm rounded-md"
                   onClick={handleDisableEdit}
                  >
                    Disable Edit
                  </button>
                ) : (
                  <button
                    className="bg-button-gradient  p-2 text-white hover:bg-blue-800 text-sm rounded-md"
                    onClick={() => {
                      setEditEnabled(true);
                      setProductSpecs(product?.specifications)
                      setSelectedCategories([])
                    }}
                  >
                    Enable Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full mt-20 gap-5 px-5">
          <div className="flex w-full flex-col gap-5">
            <div className="w-full bg-white  border rounded-lg">
              <Card className="px-10 w-5/6 shadow-none border-none">
                <CardHeader>
                  <CardTitle className="text-primary text-lg">
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-5">
                    <div className="grid gap-1 w-full">
                      <Label htmlFor="productName" className="text-gray-500 ">
                        Product Name
                      </Label>
                      <Input
                        id="productName"
                        type="text"
                        className=" whitespace-pre-wrap text-sm h-7 w-full border-blue-100 resize-none overflow-hidden"
                        defaultValue={product?.productName || ""}
                        readOnly={!editEnabled}
                        onChange={(e) =>
                          setProductDetails((prev: any) => ({
                            ...prev,
                            productName: e.target.value,
                          }))
                        }
                      />
                       {errors.productName && (
    <p className="error-message text-red-600 text-sm">{errors.productName}</p>
  )}
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="productCode" className="text-gray-500">
                        Product Code
                      </Label>
                      <Input
                        id="productCode"
                        type="text"
                        className="w-full text-sm border-blue-100 h-7"
                        defaultValue={product?.productCode || ""}
                        readOnly={!editEnabled}
                        onChange={(e) =>
                          setProductDetails((prev: any) => ({
                            ...prev,
                            productCode: e.target.value,
                          }))
                        }
                      />
                      {errors.productCode && <p className="error-message text-red-600 text-sm">{errors.productCode}</p>}
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="brand" className="text-gray-500 ">
                        Product Brand
                      </Label>
                      <Input
                        id="brand"
                        type="text"
                        className="w-full text-sm h-7 border-blue-100"
                        defaultValue={product?.brand || ""}
                        readOnly={!editEnabled}
                        onChange={(e) =>
                          setProductDetails((prev: any) => ({
                            ...prev,
                            brand: e.target.value,
                          }))
                        }
                      />
                      {errors.brand && <p className="error-message text-red-600 text-sm">{errors.brand}</p>}
                    </div>
                    <div className="grid gap-1 w-full">
                      <Label htmlFor="description" className="text-gray-500 ">
                        Description
                      </Label>
                      <div className="w-full">
                        <textarea id="description"
                          defaultValue={product?.description || ""}
                          //  style={{ height: 'auto', maxHeight: '160px' }}
                          className=" w-full min-h-24 rounded-lg border outline-none p-2 border-blue-100 text-sm"
                          readOnly={!editEnabled}
                          onChange={(e) => {
                            setProductDetails((prev: any) => ({
                              ...prev,
                              description: e.target.value,
                            }));

                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                          }}
                        />
                        {errors.description && <p className="error-message text-red-600 text-sm">{errors.description}</p>}
                      </div>


                    </div>

                    <div className=" grid gap-1">
                    <div>
                        <Label htmlFor="category" className=" text-gray-500">
                          Product Category
                        </Label>
                        <select
                          id="category-select"
                          defaultValue={product?.category ||""}
                          onChange={(e) =>{
                            console.log("Selected category ID:", e.target.value);
                            setProductDetails((prev: any) => ({
                              ...prev,
                              category:e.target.value||'',
                            }))}
                          }
                          disabled={!editEnabled}
                           className={`mt-1 block h-8 text-sm w-3/4 border outline-none border-slate-200 rounded-md shadow-sm  ${!editEnabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} >
                          {/* <option className="text-xs text-gray-300 cursor-not-allowed" value={`${product.category}`} ></option>  */}
                          {productCategoryfields.map((category, index) => (
                            // @ts-ignore
                            <option key={index} value={category?._id}>
                              {/* @ts-ignore */}
                              {category?.categoryName}
                            </option>
                          ))}
                        </select>
                        {errors.category && <p className="error-message text-red-600 text-sm">{errors.category}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

 {/* Offer Price */}
 <div className="w-full ">
 <Card>
                
                  <CardTitle className="text-primary px-16 py-5 text-lg">Prices</CardTitle>
               
                <CardContent>
                  <div className="grid grid-cols-2 px-10 gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="purchasedPrice" className="text-gray-500">
                        Purchased Price
                      </Label>
                      <Input
                        id="purchasedPrice"
                        type="text"
                        className="w-full border-blue-100 text-sm h-7"
                        defaultValue={product?.purchasedPrice || ""}
                        readOnly={!editEnabled}
                        onChange={(e) =>
                          setProductDetails((prev: any) => ({
                            ...prev,
                            purchasedPrice: e.target.value,
                          }))
                        }
                      />
                       {errors.purchasedPrice && <p className="error-message text-red-600 text-sm">{errors.purchasedPrice}</p>}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="strikePrice" className="text-gray-500">
                        Strike Price
                      </Label>
                      <Input
                        id="strikePrice"
                        type="text"
                        className="w-full border-blue-100 text-sm h-7"
                        defaultValue={product?.strikePrice || ""}
                        readOnly={!editEnabled}
                        onChange={(e) =>
                          setProductDetails((prev: any) => ({
                            ...prev,
                            strikePrice: e.target.value,
                          }))
                        }
                      />
                       {errors.strikePrice && <p className="error-message text-red-600 text-sm">{errors.strikePrice}</p>}
                    </div>
                  </div>
                </CardContent>
  
      <CardTitle className="text-primary  px-16 py-3 text-lg">Offer Price</CardTitle>
   
    <CardContent>
      <div className="grid gap-6 px-10">
        {localOffers.length > 0 ? (
          localOffers.map((offer, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 ">
              {/* Offer From Input */}
              <div>
                {index === 0 && (
                  <Label htmlFor={`offerFrom-${index}`} className="text-gray-500">
                    From (Qty)
                  </Label>
                )}
                <Input
                  id={`offerFrom-${index}`}
                  type="text"
                  className="w-full border-blue-100 text-sm h-7"
                  value={offer.from}
                  readOnly={!editEnabled}
                  onChange={(e) =>
                    handleChangeOffer(index, 'from', e.target.value)
                  }
                />
              </div>

              <div>
                {index === 0 && (
                  <Label htmlFor={`offerTo-${index}`} className="text-gray-500">
                    To (Qty)
                  </Label>
                )}
                <Input
                  id={`offerTo-${index}`}
                  type="text"
                  className="w-full border-blue-100 text-sm h-7"
                  value={offer.to}
                  readOnly={!editEnabled}
                  onChange={(e) =>
                    handleChangeOffer(index, 'to', e.target.value)
                  }
                />
              </div>

              <div>
                {index === 0 && (
                  <Label htmlFor={`offerPrice-${index}`} className="text-gray-500">
                    Customer Price
                  </Label>
                )}
                <Input
                  id={`offerPrice-${index}`}
                  type="text"
                  className="w-full border-blue-100 text-sm h-7"
                  value={offer.customerPrice}
                  readOnly={!editEnabled}
                  onChange={(e) =>
                    handleChangeOffer(index, 'customerPrice', e.target.value)
                  }
                />
              </div>

              <div>
                {index === 0 && (
                  <Label htmlFor={`offerPrice-${index}`} className="text-gray-500">
                    Dealer Price
                  </Label>
                )}
                <Input
                  id={`offerPrice-${index}`}
                  type="text"
                  className="w-full border-blue-100 text-sm h-7"
                  value={offer.dealerPrice}
                  readOnly={!editEnabled}
                  onChange={(e) =>
                    handleChangeOffer(index, 'dealerPrice', e.target.value)
                  }
                />
              </div>

              {editEnabled && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    className="bg-red-500 text-white rounded p-1 text-xl"
                    onClick={() => handleDeleteOffer(index)}
                    disabled={!editEnabled}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <>
            <span>No offers available</span>
            {errors.offers && (
              <div className="error-message text-red-600 text-sm">
                <p>{errors.offers}</p>
              </div>
            )}
          </>
        )}
      </div>

      {errors.offers && (
        <div className="error-message text-red-600 text-sm">
          <p>{errors.offers}</p>
        </div>
      )}

      {editEnabled && (
        <div className="mt-4">
          <button
            type="button"
            className="bg-button-gradient text-white rounded px-4 py-2 text-sm"
            onClick={handleAddOffer}
          >
            Add Offer
          </button>
        </div>
      )}
    </CardContent>
  </Card>
</div>

   {/* Offer Price End */}
            {/* general fields */}
            <div className="w-full">
    <Card className="px-10">
        <CardHeader className="flex flex-row justify-between items-center">
            <span>
                <CardTitle className="text-primary text-lg">General</CardTitle>
            </span>
            {editEnabled && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-white bg-button-gradient p-2 rounded text-sm">
                            Add General Spec
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white p-3 text-sm rounded shadow max-h-48 overflow-auto">
                        {missingGeneralSpecs.length > 0 ? (
                            missingGeneralSpecs.map((category) => (
                                <div key={category} className="flex items-center gap-2 p-1">
                                    <Checkbox
                                        checked={selectedGeneralCategories.includes(category)}
                                        onCheckedChange={() => handleGeneralCategorySelect(category)}
                                    />
                                    <span>{category}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm p-0">No General Specs available</p>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </CardHeader>
        <CardContent className="text-slate-700 items-start grid grid-cols-2 gap-5">
  {/* Existing General Specifications */}
  {Object.keys(generalInputs).length > 0 ? (
    Object.entries(generalInputs).map(([key, value]) => (
      <div key={key} className="grid gap-1">
        <div className="flex items-center justify-between">
          <Label className="text-gray-500">{key}</Label>
          {editEnabled && (
            <Dialog open={deleteGeneralForm} onOpenChange={setDeleteGeneralForm}>
              <DialogTrigger>
                <button
                  onClick={() => openDeleteDialog(key)} // Open dialog with the field's name
                  className="ml-2 text-white rounded p-1 bg-red-500 text-lg"
                >
                  <FaTrashAlt />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <div className="text-center">
                  <p className="font-bold">Do You Want to Delete "{fieldToDelete}" General Spec?</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-300 text-black w-full"
                    size="sm"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full bg-red-500 text-white"
                    size="sm"
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Input
          id={key}
          type="text"
          className="w-full border-blue-100 text-sm h-7"
          readOnly={!editEnabled}
          value={value}
          onChange={(e) => handleInputChange(key, e.target.value)}
        />
        {errors.generalFields && Array.isArray(errors.generalFields) && (
          <div className="error-message text-red-600 text-sm">
            {errors.generalFields.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
    ))
  ) : (
    <>
      <p className="text-gray-500 text-sm col-span-2">No general specifications available</p>
      {errors.generalFields && (
        <p className="error-message text-red-600 text-sm">{errors.generalFields}</p>
      )}
    </>
  )}
</CardContent>
    </Card>
</div>




            {/* end of  general fields */}
          
          
          
            {/* specification fields */}
            <div className="w-full">
  <Card className="px-10">
    <CardHeader className="flex flex-row justify-between items-center">
      <span>
        <CardTitle className="text-primary text-lg">Specifications</CardTitle>
      </span>

      {editEnabled && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-white bg-button-gradient p-2 rounded text-sm">
              Add New Specification
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white p-3 text-sm rounded shadow max-h-48 overflow-auto">
            {missingSpecs.length > 0 ? (
              missingSpecs.map((category) => (
                <div key={category} className="flex items-center gap-2 p-1">
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategorySelect(category)}
                  />
                  <span>{category}</span>
                  <hr />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm p-0">No Specification available</p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </CardHeader>

    <CardContent className="text-slate-700 items-start grid grid-cols-2 gap-5">
      {Object.keys(editEnabled ? productSpecs : product?.specifications || {}).length > 0 ||
      (editEnabled && selectedCategories.length > 0) ? (
        (editEnabled ? Object.keys(productSpecs) : Object.keys(product?.specifications || {})).map(
          (category) => (
            <div key={category} className="grid gap-6 w-full mb-2">
              <div className="flex items-center">
                <Label className="font-bold border rounded shadow-blue-300 shadow p-2">
                  {category}
                </Label>
                <hr className="w-3/4 bg-blue-50 h-0.5" />
                {editEnabled && (
                  <Dialog open={deleteSpecForm} onOpenChange={setdeleteSpecFormOpen}>
                    <DialogTrigger>
                      <button
                        onClick={() => setdeleteSpecFormOpen(true)}
                        className="ml-2 text-white rounded p-1 bg-red-500 text-lg"
                      >
                        <FaTrashAlt />
                        <DialogContent className="bg-white">
                          <div className="text-center">
                            <p className="font-bold">Do You Want to Delete this Product Specification?</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="bg-gray-300 text-black w-full"
                              size="sm"
                              onClick={() => setdeleteFormOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              className="w-full bg-red-500 text-white"
                              size="sm"
                              onClick={() => handleDeleteCategory(category, true)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
              <div className="grid gap-3">
                {Object.entries(
                  (editEnabled ? productSpecs[category] : product?.specifications[category]) as Record<string, string>
                ).map(([key, value], index) => (
                  <div key={index} className="grid gap-1">
                    <Label className="text-gray-500" htmlFor={key}>{key}</Label>
                    <Input
                      id={key}
                      type="text"
                      className="w-full border-blue-100 text-sm h-7"
                      defaultValue={value}
                      readOnly={!editEnabled}
                      onChange={(e) =>
                        setProductDetails((prev: any) => ({
                          ...prev,
                          specifications: {
                            ...prev.specifications,
                            [category]: {
                              ...prev.specifications[category],
                              [key]: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                    {/* @ts-ignore */}
                    {(!value || value.trim() === "") && errors.specifications?.[category]?.[key] && (
                      <div className="error-message text-red-600 text-sm">
                        {/* @ts-ignore */}
                        <p>{errors.specifications[category][key] || "This field is required"}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )
      ) : (
        <p className="text-red-500 text-sm col-span-2">No specifications available</p>
      )}

      {selectedCategories.length > 0 && editEnabled && selectedCategories.map((selectedCategory) => (
        <div key={selectedCategory} className="w-full">
          <div className="flex items-center mb-5">
            <Label className="font-bold text-sm border rounded shadow-blue-300 shadow p-2">
              {selectedCategory}
            </Label>
            <hr className="w-3/4 bg-blue-50 h-0.5" />
            <Dialog open={deleteSpecForm} onOpenChange={setdeleteSpecFormOpen}>
              <DialogTrigger>
                <button
                  onClick={() => setdeleteSpecFormOpen(true)}
                  className="ml-2 text-white rounded p-1 bg-red-500 text-lg"
                >
                  <FaTrashAlt />
                  <DialogContent className="bg-white">
                    <div className="text-center">
                      <p className="font-bold">Do You Want to Delete this Product Specification?</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-gray-300 text-black w-full"
                        size="sm"
                        onClick={() => setdeleteFormOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="w-full bg-red-500 text-white"
                        size="sm"
                        onClick={() => handleDeleteCategory(selectedCategory, false)}
                      >
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </button>
              </DialogTrigger>
            </Dialog>
          </div>
          <div className="grid gap-3">
            {categoryFields[selectedCategory] && categoryFields[selectedCategory].map((field, index) => (
              <div key={index} className="grid gap-1">
                <Label htmlFor={`selected-${index}`} className="text-gray-500">{field}</Label>
                <Input
                  id={`selected-${index}`}
                  type="text"
                  className="w-full border-blue-100 text-sm h-7"
                  readOnly={!editEnabled}
                  onChange={(e) =>
                    setProductDetails((prev: any) => ({
                      ...prev,
                      specifications: {
                        ...prev.specifications,
                        [selectedCategory]: {
                          ...prev.specifications[selectedCategory],
                          [field]: e.target.value,
                        },
                      },
                    }))
                  }
                />
                
                {//@ts-ignore
                errors.specifications?. [selectedCategory]?.[field] && (
                  <div className="error-message text-red-600 text-sm">
                                        {/* @ts-ignore */}
                    <p>{errors.specifications[selectedCategory][field] || "This field is required"}</p>
                  </div>
                )}
              </div>
            ))}
            {/* Error message for empty fields */}
            {categoryFields[selectedCategory]?.some(field => !productSpecs[selectedCategory]?.[field]?.trim()) && (
              <div className="text-red-600 text-sm">
                <p>Please fill in all fields for {selectedCategory}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
</div>




           {/* specification fields  End*/}

          </div>

          <div className="flex flex-col w-1/3 gap-5">
            {/* stock */}
            <div className="w-full">
              <Card>
                <CardHeader >
                  <CardTitle className="text-primary text-lg">Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="-mt-3">
                    <div className="flex items-center justify-around">
                      <Label htmlFor="stock" className="text-gray-500">
                        Available Stock
                      </Label>
                      <Input
                        id="stock"
                        type="text"
                        className="text-base w-1/3 text-center  border-blue-100 "
                        defaultValue={product?.stock || ""}
                        readOnly={!editEnabled}
                        onChange={(e) =>
                          setProductDetails((prev: any) => ({
                            ...prev,
                            stock: e.target.value,
                          }))
                        }
                      />
                      {errors.stock && <p className="error-message text-red-600 text-sm">{errors.stock}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

           
{/* product Images */}
            <div className="flex flex-col items-center gap-3">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-primary text-center text-lg">Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col w-full justify-center items-center">
                    <div className="w-full flex justify-center items-center mb-4">
                      <div className=" w-full  flex  gap-2 justify-center items-center max-w-md ">
                        {imageUrls.length > 0 && (
                          <img
                            src={imageUrls[currentImageIndex]}
                            alt={`Image ${currentImageIndex}`}
                            className="object-cover rounded-md w-[100px] h-[100px] shadow-lg"
                          />
                        )}
                        {editEnabled && (
                          <div className=" flex  gap-4 flex-col">
                            <label htmlFor={`file-upload-${currentImageIndex}`} className="bg-primary text-center flex justify-center items-center rounded text-sm hover:bg-blue-600 text-white p-1  cursor-pointer ">
                              <input
                                type="file"
                                id={`file-upload-${currentImageIndex}`}
                                className="hidden"
                                onChange={(e) => handleFileChange(e, currentImageIndex)}
                              />
                              {/* Edit */}
                              <GrEdit className="text-white text-lg" />
                            </label>

                            <Dialog
                              open={deleteForm}
                              onOpenChange={setdeleteFormOpen}
                            >
                              <DialogTrigger>
                                {" "}
                                <button
                                  className="text-white  p-1 text-lg rounded bg-red-500"
                                >
                                  <>
                                    {" "}
                                    <FaTrashAlt />
                                    <DialogContent className="bg-white">
                                      <div className="text-center">
                                        <p className="font-bold">
                                          Do You Want to Delete this ProductImage?
                                        </p>
                                      </div>

                                      <div className="mt-4 flex gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="bg-gray-300 text-black w-full"
                                          size="sm"
                                          onClick={() => {
                                            setdeleteFormOpen(false);
                                          }}
                                        >
                                          Cancel
                                        </Button>

                                        <Button
                                          type="button"
                                          variant="destructive"
                                          className="w-full bg-red-500 text-white"
                                          size="sm"
                                          onClick={() => handleRemoveImage(currentImageIndex)}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </>
                                </button>
                              </DialogTrigger>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center items-center ">
                      {imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative w-[80px] flex justify-center items-center h-[80px]  border-[2px] rounded cursor-pointer"
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={url}
                            alt={`Thumbnail ${index}`}
                         
                            className="object-cover w-16 h-16 rounded-md"
                          />
                        </div>
                      ))}
                      {editEnabled && (
                        <>
                          <label className="flex aspect-square w-[80px] h-[80px] items-center justify-center rounded-md border border-gray-300 border-dashed">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={handleAddNewImages}
                            />
                            <span className="sr-only">Upload</span>
                          </label>
                        </>
                      )}
                    </div>
                    {editEnabled && (
                      <><button onClick={() => { handleSaveImages(product?._id) }} className="p-2 text-sm bg-green-700 text-white rounded mt-5">Update Images</button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

        
        
          </div>

        </div>

      </div>
    </>
  );
} 