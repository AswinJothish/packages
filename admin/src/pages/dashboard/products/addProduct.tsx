import { useForm} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { _axios } from "@/lib/_axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MdCancel } from "react-icons/md";
import { IoMdArrowBack } from "react-icons/io";


type GeneralValuesType = {
  [key: string]: string; 
};
interface Category {
  _id: string;
  categoryName: string;
}


// type HandleCheckboxChangeType = (field: string) => void;


const formSchema = z.object({
  _id: z.any(),
  productName: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  productCode: z.string().min(1, { message: "Product code must be at least 1 character." }),
  productImages: z.array(z.instanceof(File)),
  description: z.string().nonempty('description is required'),
  purchasedPrice: z.string().nonempty('Purchased Price is required'),
  brand: z.string().nonempty('brand is required'),
  stockQuantity:z.string().nonempty('Stock is required'),
  strikePrice: z.string().nonempty('Strike Price is required'),
  categories: z.array(z.string()),
  category: z.string(),
  offers: z.array(
    z.object({
      from: z.number().positive({ message: "From must be a positive number." }),
      to: z.number().positive({ message: "To must be a positive number." }),
      customerPrice: z.string().min(1, { message: "Customer price must be at least 1 character." }),
      dealerPrice: z.string().min(1, { message: "Dealer price must be at least 1 character." }),
    })
  ).optional(),
  specifications: z.record(z.string(), z.record(z.string(), z.string().optional())),
  general: z.record(z.string(), z.string()).optional(), 
});

export function Addproducts() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [generalFields, setGeneralFields] = useState([]); 
  const [generalValues, setGeneralValues] = useState<GeneralValuesType>({});
  const [selectedGeneralFields, setSelectedGeneralFields] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState<Category>({ _id: '', categoryName: '' });
  const navigate=useNavigate();
//@ts-ignore
   const [generalErrors, setGeneralErrors] = useState<string[]>([]);
   //@ts-ignore
    const [specificationErrors, setSpecificationErrors] = useState<string[]>([]);
    //@ts-ignore
    const [offerErrors, setOfferErrors] = useState<string[]>([]);

  const [offers, setOffers] = useState<{ from: number; to: number; customerPrice: number;dealerPrice:number }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      productCode: "",
      description: "",
      brand: "",
      purchasedPrice: "",
      strikePrice: "",
      stockQuantity:"",
      productImages: [],
      category: "",
      categories: [],
      offers:[],
      general: {},
      specifications: {},
    },
  });

  const { control, handleSubmit, setValue,formState: { errors } } = form;
  const [categoryfields, setCategoryFields] = useState<string[]>([]);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["specifications"],
    queryFn: () => _axios.get('/master/all'),
    select: (data) => ({
      specifications: data.data.data,
    }),
  });


  useEffect(() => {
    if (data) {
      console.log("Fetched data:", data);
     // fetchGeneralFields();
    }
  }, [data]);

  const onCategoryChange = (category: string) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newSelectedCategories);
    setValue("categories", newSelectedCategories);

    const newSpecifications = newSelectedCategories.reduce(
      (acc: any, category: string) => {
        const categoryFields =
          data?.specifications.find((spec: any) => spec.category === category)
            ?.fields || [];
        acc[category] = categoryFields.reduce(
          (fieldAcc: any, field: string) => {
            fieldAcc[field] = "";
            return fieldAcc;
          },
          {}
        );
        return acc;
      },
      {}
    );
    setValue("specifications", newSpecifications);
  };


  // const handleCheckboxChange = (field:any) => {
  //   setSelectedGeneralFields((prev:any) =>
  //     prev.includes(field)
  //       ? prev.filter((f:any) => f !== field) 
  //       : [...prev, field]
  //   );
  // };
  const handleCheckboxChange = (field: string) => {
    setSelectedGeneralFields((prev: any) => {
      if (prev.includes(field)) {
        const updatedFields = prev.filter((f:any) => f !== field);
        const { [field]: _, ...rest } = generalValues; 
        setGeneralValues(rest);
        return updatedFields;
      } else {
        return [...prev, field];
      }
    });
  };


  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // console.log("submit button triggered");

    const requiredFields = [
        { value: data.productName, name: 'Product Name' },
        { value: data.productCode, name: 'Product Code' },
        { value: data.stockQuantity, name: 'Stock Quantity' },
        { value: data.brand, name: 'Brand' },
        { value: data.description, name: 'Description' },
        { value: data.purchasedPrice, name: 'Purchased Price' },
        { value: data.strikePrice, name: 'Strike Price' },
        { value: selectedCategory, name: 'Category' },
    ];

    const emptyFields = requiredFields.filter(field => !field.value);

    if (emptyFields.length > 0) {
        const fieldNames = emptyFields.map(field => field.name).join(', ');
        toast.error(`Please fill all required fields: ${fieldNames}`);
        return; // Stop the submission
    }

    // Check if at least one image is uploaded
    if (imageFiles.length === 0) {
        toast.error("Please upload at least one image.");
        return; // Stop the submission
    }

    setGeneralErrors([]);
    setSpecificationErrors([]);
    setOfferErrors([]);
    const generalErrorsList: string[] = [];
    
    // General fields validation
    if (selectedGeneralFields.length === 0) {
        generalErrorsList.push("Please select at least one general field.");
    } else {
        selectedGeneralFields.forEach(field => {
            if (!generalValues[field]) {
                generalErrorsList.push(`Please fill out the ${field} field.`);
            }
        });
    }

    if (generalErrorsList.length > 0) {
        setGeneralErrors(generalErrorsList);
        toast.error(generalErrorsList.join(' ')); // Display toast for general errors
        return; // Stop the submission
    }
    if (offers.length === 0) {
      setOfferErrors(["Please add at least one offer."]);
      toast.error("Please add at least one offer."); // Show toast for offers
      return; // Stop the submission
  }

  // Check for filled offers
  const emptyOfferFields = offers.filter(offer => !offer.from || !offer.to || !offer.customerPrice);
  if (emptyOfferFields.length > 0) {
      toast.error("Please fill out all fields in offers.");
      return; // Stop the submission
  }
    // Check if at least one specification category is selected
  //   if (!data.specifications || !Array.isArray(data.specifications) || data.specifications.length === 0) {
  //     toast.error("Please select at least one specification.");
  //     return; // Stop the submission
  // }
  if (selectedCategories.length === 0) {
    toast.error("Please select at least one specification category.");
    return; // Stop the submission
}

// Check if any specification fields are empty
const emptySpecificationFields = selectedCategories.flatMap(category => {
    const categorySpec = data.specifications[category]; // Access the specifications based on selected category
    if (categorySpec) {
        // Check each field for emptiness
        return Object.keys(categorySpec).filter(field => !categorySpec[field]);
    }
    return [];
});

if (emptySpecificationFields.length > 0) {
    toast.error("Please fill out all specification fields.");
    return; // Stop the submission
}
    // Offers validation
   

    const formData = new FormData();
    formData.append("productName", data.productName);
    formData.append("productCode", data.productCode || "");

    // Handle image files
    const imagesArray = Array.isArray(imageFiles) ? imageFiles : imageFiles ? [imageFiles] : [];
    if (imagesArray.length > 0) {
        imagesArray.forEach((file) => {
            if (file) {
                formData.append("productImages", file); // Append each file
            }
        });
    }

    // Append other product details
    formData.append("stock", data.stockQuantity.toString());
    formData.append("brand", data.brand || "");
    formData.append("description", data.description || "");
    formData.append("purchasedPrice", data.purchasedPrice.toString() || "");
    if (offers.length > 0) {
      const firstOffer = offers[0];
      formData.append("customerPrice", firstOffer.customerPrice.toString());
      formData.append("dealerPrice", firstOffer.dealerPrice.toString());
  }
    formData.append("strikePrice", data.strikePrice.toString() || "");
    formData.append("general", JSON.stringify(generalValues));

    // Handle specifications
    if (data.specifications) {
      formData.append("specifications", JSON.stringify(data.specifications));
  }
    if (selectedCategory) {
        formData.append("category", selectedCategory._id);
    }

    // Add offers to the FormData as a single JSON string
    if (offers.length > 0) {
        formData.append("offers", JSON.stringify(offers));
    }

    try {
        await _axios.post("/products/create", formData);
        toast.success("Product created successfully");
        form.reset(); 
        navigate('/admin/products');
        setImageFiles([]); 
        setImagePreviews([]);
        setSelectedCategories([]); 
        setSelectedGeneralFields([]); 
        refetch();
    } catch (error: any) {
        console.error("Error creating product", error);
        const errorMessage = error.response?.data?.message || "Error creating product";
        toast.error(errorMessage);
    }

    console.log('Submitting offers:', offers); 
};


const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (files) {
      const fileArray = Array.from(files);
    
      if (fileArray.length > 5) {
          alert('You can only upload a maximum of 5 images.');
          return; 
      }
    setImageFiles((prevFiles) => {
          const updatedFiles = [...prevFiles, ...fileArray];
          if (updatedFiles.length > 5) {
              toast.error('You can only upload a maximum of 5 images.');
              return prevFiles;
          }
          return updatedFiles; 
      });
      setImagePreviews((prevPreviews) => {
          const newPreviews = fileArray.map(file => URL.createObjectURL(file));
          const updatedPreviews = [...prevPreviews, ...newPreviews];
          if (updatedPreviews.length > 5) {
              toast.error('You can only upload a maximum of 5 images.');
              return prevPreviews; 
          }
          return updatedPreviews; 
      });

      form.setValue("productImages", fileArray);
  }
};


  const handleInputChange = (fieldName:any, value:any) => {
    setGeneralValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };


  const fetchGeneralFields = async () => {
    try {
        const response = await _axios.get("/master/get/general-spec");
        setGeneralFields(response.data.data[0].General);
    } catch (error) {
        console.error("Error fetching general fields:", error);
    }
};
useEffect(() => {
  fetchGeneralFields()
  fetchCategory();
}, []);

const fetchCategory = async () => {
  try {
      const response = await _axios.get("/master/get/category");
      setCategoryFields(response.data.data);
  } catch (error) {
      console.error("Error fetching category:", error);
  }
};

//offers

const addOffer = () => {
  // Validate current offers to ensure no empty fields
  const isValid = offers.every((offer) => offer.from && offer.to && offer.customerPrice);
  if (!isValid) {
      alert('Please fill in all fields for the current offers before adding a new one.');
      return;
  }
  // Add a new offer with initial empty values (0 or NaN can be used for numbers)
  setOffers([...offers, { from: 0, to: 0, customerPrice: 0 ,dealerPrice:0}]);
};

//offers End

  if (isLoading) {
    return <div>Loading....</div>;
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-5">
        <div className="bg-white shadow flex flex-row py-5 h-16 items-center">
        <div onClick={() => window.history.back()} className="flex px-5 gap-2 items-center justify-center hover:text-blue-500 cursor-pointer text-gray-400">
<span className="text-xl"><IoMdArrowBack /></span>
</div>
          <h1 className="text-lg text-blue-500 font-bold">Add Product</h1>
        </div>
        <div className="w-full px-5">
        
            </div>
        <div className="w-full flex justify-center">
          <div className="bg-white w-[90%] px-5 py-5 text-sm shadow-xl border border-gray-100">
            <Form {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-2 gap-5"
              >
                <FormField
                  control={control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col ">
                      <FormLabel className="text-base text-gray-500">Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      {form.formState.errors.productName && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.productName.message}
      </p>
    )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="productCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base text-gray-500">Product Code</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      {form.formState.errors.productCode && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.productCode.message}
      </p>
    )}
                    </FormItem>
                  )}
                  {...errors.productName && <p className="text-red-600">{errors.productName.message}</p>}
                />

                <FormField
                  control={control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base text-gray-500">Brand</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      {form.formState.errors.brand && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.brand.message}
      </p>
    )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  
                  name="purchasedPrice"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base text-gray-500">Purchased Price</FormLabel>
                      <FormControl>
                        <Input {...field}  className="h-8" />
                      </FormControl>
                      {form.formState.errors.purchasedPrice && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.purchasedPrice.message}
      </p>
    )}
                    </FormItem>
                  )}
                />
{/* 
                <FormField
                  control={control}
                  name="dealerPrice"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base text-gray-500">Dealer Price</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      {form.formState.errors.dealerPrice && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.dealerPrice.message}
      </p>
    )}
                    </FormItem>
                  )}
                /> */}

                {/* <FormField
                  control={control}
                  name="customerPrice"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base text-gray-500">Customer Price</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8" />
                      </FormControl>
                      {form.formState.errors.customerPrice && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.customerPrice.message}
      </p>
    )}
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={control}
                  name="strikePrice"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base text-gray-500">Strike Price</FormLabel>
                      <FormControl>
                        <Input {...field}  className="h-8" />
                      </FormControl>
                      {form.formState.errors.strikePrice && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.strikePrice.message}
      </p>
    )}
                    </FormItem>
                  )}
                />
                 <FormField
                  control={control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-base text-gray-500">Stock Quantity</FormLabel>
                      <FormControl>
                        <Input {...field}  className="h-8" />
                      </FormControl>
                      {form.formState.errors.stockQuantity && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.stockQuantity.message}
      </p>
    )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-col ">
                      <FormLabel className="text-base text-gray-500">Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="h-3"   />
                      </FormControl>
                      {form.formState.errors.description && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.description.message}
      </p>
    )}
                    </FormItem>
                  )}
                />

                {/* offer Price */}
                <div className="flex flex-col gap-4">
    <FormLabel className="text-base text-gray-500">Offers</FormLabel>
    {offers.map((offer, index) => (
        <div key={index} className="flex flex-row gap-4 items-center">
          <div>
          <FormLabel className="text-sm text-gray-400">Qty From</FormLabel>
                  <Input
                        type="number"
                        placeholder="From"
                        value={offer.from || ''} // Display empty string if value is 0
                        onChange={(e) => {
                            const newOffers = [...offers];
                            newOffers[index].from = Number(e.target.value) || 0; // Convert to number
                            setOffers(newOffers);
                        }}
                    />
                   
          </div>
        <div>
       
        <FormLabel className="text-sm text-gray-400">Qty Upto</FormLabel>
        <Input
                        type="number"
                        placeholder="To"
                        value={offer.to || ''} // Display empty string if value is 0
                        onChange={(e) => {
                            const newOffers = [...offers];
                            newOffers[index].to = Number(e.target.value) || 0; // Convert to number
                            setOffers(newOffers);
                        }}
                    />
        </div>
        <div>
        <FormLabel className="text-sm text-gray-400">Customer Price</FormLabel>
        <Input
                        type="number"
                        placeholder="Price"
                        value={offer.customerPrice || ''} // Display empty string if value is 0
                        onChange={(e) => {
                            const newOffers = [...offers];
                            newOffers[index].customerPrice = Number(e.target.value) || 0; // Convert to number
                            setOffers(newOffers);
                        }}
                    />
                    
                    
        </div> 
        <div>
        <FormLabel className="text-sm text-gray-400">Dealer Price</FormLabel>
     
        <Input
                        type="number"
                        placeholder="Price"
                        value={offer.dealerPrice || ''} // Display empty string if value is 0
                        onChange={(e) => {
                            const newOffers = [...offers];
                            newOffers[index].dealerPrice = Number(e.target.value) || 0; // Convert to number
                            setOffers(newOffers);
                        }}
                    />
                    </div>   
            <button
                type="button"
                className="text-red-500 hover:text-red-700 ml-2"
                onClick={() => {
                    const newOffers = offers.filter((_, i) => i !== index);
                    setOffers(newOffers);
                }}
            >
                
                <MdCancel  className="text-xl"/>
            </button>
        </div>
    ))}
   
    <Button type="button" onClick={addOffer} className="w-fit bg-orange-500/95 text-white border hover:bg-orange-600">
        Add Offer
    </Button>
</div>

  {/* End of offer Price */}
 <div>
      <FormLabel htmlFor="category-select" className="block text-base text-gray-500">
        Select Category
      </FormLabel>
      <select
  id="category-select"
  value={selectedCategory.categoryName} // This binds to categoryName to display it
  onChange={(e) => {
    const selectedCategory = categoryfields.find(
      (category:any) => category.categoryName === e.target.value
    );

    // Always set the state to an object with both _id and categoryName
    // @ts-ignore
    setSelectedCategory(selectedCategory || { _id: '', categoryName: '' });
  }}
  className="mt-1 block h-8 w-full border border-slate-200 rounded-md shadow-sm"
>
  <option className="text-sm text-gray-500" value="">
    --Select a category--
  </option>
  {categoryfields.map((category:any, index) => (
    <option key={index} value={category.categoryName}>
      {category.categoryName}
    </option>
  ))}
</select>

      {form.formState.errors.category && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.category.message}
      </p>
    )}
    </div>

    <div>
        <FormLabel className="text-base text-gray-500">General</FormLabel>
        <div className="">
          <div className="flex gap-2 flex-wrap">
            {generalFields.map((field, index) => (
              <div key={index} className="flex items-center my-2">
                <input
                  type="checkbox"
                  id={`field-${field}`}
                  checked={selectedGeneralFields.includes(field)}
                  onChange={() => handleCheckboxChange(field)}
                  className="hidden"
                />
                <FormLabel
                  htmlFor={`field-${field}`}
                  className="flex items-center cursor-pointer text-sm text-gray-500"
                >
                  <span
                    className={`flex items-center justify-center w-4 h-4 border border-black rounded ${
                      selectedGeneralFields.includes(field) ? 'bg-black' : ''
                    }`}
                  >
                    {selectedGeneralFields.includes(field) && (
                      <span className="text-white">&#10003;</span>
                    )}
                  </span>
                  <span className="ml-2">{field}</span>
                </FormLabel>
              </div>
            ))}
          </div>

          {selectedGeneralFields.map((field, index) => (
            <FormField
              key={index}
              control={control}
              name={field}
              render={({ field: inputField }) => (
                <FormItem className="flex flex-col  mt-4">
                  <FormLabel className="text-base text-gray-500">{field}</FormLabel>
                  <FormControl>
                    <Input
                      {...inputField}
                      value={generalValues[field] || ''} 
                      onChange={(e) => handleInputChange(field, e.target.value)} 
                      className="h-8"
                    />
                  </FormControl>
                  {form.formState.errors.general && (
      <p className="text-red-500 text-sm text-left mt-1">
        {/* {form.formState.errors.general.message} */}
      </p>
    )}
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col ">
    <FormField
        control={control}
        name="productImages"
        // @ts-ignore
        render={({ field }) => (
            <FormItem className="flex flex-col">
                <div className="flex flex-col">
                    <FormLabel className="text-base text-gray-500">Product Images</FormLabel>
                    <FormControl>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                        />
                    </FormControl>
                    {form.formState.errors.productImages && (
      <p className="text-red-500 text-sm text-left mt-1">
        {form.formState.errors.productImages.message}
      </p>
    )}
                </div>
            </FormItem>
        )}
    />
    <div className="w-fit ">
    <div className="w-18 mt-5 flex gap-3 h-18 flex-wrap">
        {imagePreviews.map((preview, index) => (
            <img key={index} src={preview} alt={`Preview ${index}`} className="w-20 h-20" />
        ))}
    </div>
    </div>
   
</div>

                <FormItem className="flex flex-col">
                  <FormLabel className="text-base text-gray-500">Select Specification</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {data?.specifications.map((specification: any) => (
                      <div
                        key={specification._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(
                            specification.category
                          )}
                          onCheckedChange={() =>
                            onCategoryChange(specification.category)
                          }
                        />
                        <FormLabel className="text-sm text-gray-500">{specification.category}</FormLabel>
                      </div>
                    ))}
                  </div>
                </FormItem>

                {selectedCategories.map((category) => {
                  const categorySpec = data?.specifications.find(
                    (spec: any) => spec.category === category
                  );
                  return categorySpec ? (
                    <div
                      key={category}
                      className="border-t border-gray-300 pt-4 mt-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-500 py-2">
                        {category} Fields
                      </h3>
                      {categorySpec.fields.map((field: string) => (
                        <FormField
                          key={field}
                          control={control}
                          name={`specifications.${category}.${field}`}
                          render={({ field: formField }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="mt- text-base text-gray-500">{field}</FormLabel>
                              <FormControl>
                                <Input {...formField} className="h-8"  />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  ) : null;
                })}

                <div className="col-span-2 flex justify-end gap-2">
                  <Button className="bg-button-gradient hover:scale-105 text-white duration-300 transition-all" type="submit">Save Product</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
