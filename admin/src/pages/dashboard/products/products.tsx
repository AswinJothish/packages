import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoMdAdd } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { FaEdit } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  // DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import Pagination from "../../utils/pagination"
import { _axios } from "@/lib/_axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
// import { z } from "zod";
//import { Textarea } from "@/components/ui/textarea";
//import {BreadcrumbBreadcrumbItem,BreadcrumbLink,BreadcrumbList,BreadcrumbPage,BreadcrumbSeparator,} from "@/components/ui/breadcrumb"
//import { Label } from "@radix-ui/react-label";
import { useSignals } from "@preact/signals-react/runtime";
import { signal } from "@preact/signals-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import { RadioGroup } from "@/components/ui/radio-group";
import Topbar from "@/pages/utils/topbar";
// const formSchema = z.object({
//   _id: z.any(),
//   productName: z.string().min(3, {
//     message: "productname must be at least 3 characters.",
//   }),
//   productCode: z.string().min(1, {
//     message: "productcode must be at least 1 characters.",
//   }),
//   productImage: z.instanceof(File),
//   model: z.string(),
//   brand: z.string(),
//   description: z.string(),
//   purchasedPrice: z.string(),
//   sellingPrice: z.string(),
//   strikePrice: z.string(),
// });



export function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [CategoryDown, setCategorydown] = useState(false);
  // const [editFormOpen, setEditFormOpen] = useState(false);
  const [deleteForm, setDeleteFormOpen] = useState(false);
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  // const form = useForm<z.infer<typeof formSchema>>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     productName: "",
  //     productCode: "",
  //     model: "",
  //     brand: "",
  //     productImage: undefined,
  //     description: "",
  //     purchasedPrice: "",
  //     sellingPrice: "",
  //     strikePrice: "",
  //   },
  // });
  const searchQuery = signal<string>("");
  // const [Editproduct, setEditProduct] = useState<any>({
  //   _id: "",
  //   productName: "",
  //   productCode: "",
  //   model: "",
  //   brand: "",
  //   productImage: undefined,
  //   description: "",
  //   purchasedPrice: "",
  //   sellingPrice: "",
  //   strikePrice: "",
  // });

  const [visibilityStates, setVisibilityStates] = useState({});

 

  const [deleteprd, setDeleteprd] = useState<any>({
    _id: "",
    productName: "",
    productCode: "",
  })
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const fetchCategories = async () => {
    try {
      const response = await _axios.get('products/category'); 
      if (response.data && response.data.data && response.data.data.length > 0) {
    const categoryNames = response.data.data.map((category: { categoryName: any; }) => category.categoryName);
    setFetchedCategories(categoryNames); 
} else {
        setFetchedCategories([]); 
      }

    } catch (error) {
      console.error('Error fetching categories:', error);
   console.log('error fetching product category')
    }
  };
  console.log(fetchedCategories)

  useEffect(() => {
    fetchCategories();
  }, []);
  // // get all prds
  // const { data, isLoading, refetch } = useQuery({
  //   queryKey: [
  //     "Products",
  //     pagination.page,
  //     pagination.limit,
  //     searchQuery.value,
  //   ],
  //   queryFn: () =>
  //    _axios.get(
  //       `/products/all?limit=${pagination.limit}&page=${pagination.page}&q=${searchQuery.value}`
  //     );
  //   },
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "products",
      pagination.page,
      pagination.limit,
      searchQuery.value,
      selectedCategory, 
    ],
    queryFn: () =>
      _axios.get(
        `/products/all?limit=${pagination.limit}&page=${pagination.page}&q=${searchQuery.value}&category=${selectedCategory}` 
      ),
    select(data) {
      return {
        products: data.data.products,
        total: data.data.total,
      };
    },
  });
 

  //delete product
  const { isPending, mutate: deleteProduct } = useMutation({
    mutationFn: (id) => _axios.delete(`/products/product/${id}`),
    onSuccess: () => {
      toast.success("Product Deleted Successfully");
      setDeleteFormOpen(false);
      refetch();
    },
    onError: () => {
      toast.error("Error Deleting Product");
    },
  });

  //edit product
  // const { mutate: editProduct } = useMutation({
  //   mutationFn: async (id: string) => {
  //     const formData = new FormData();
  //     formData.append('productName', Editproduct?.productName || '');
  //     formData.append('productCode', Editproduct.productCode || '');
  //     formData.append('brand', Editproduct?.brand || '');
  //     formData.append('model', Editproduct?.model || '');
  //     formData.append('description', Editproduct.description || '');
  //     formData.append('purchasedPrice', Editproduct?.purchasedPrice || '');
  //     formData.append('sellingPrice', Editproduct?.sellingPrice || '');
  //     formData.append('strikePrice', Editproduct?.strikePrice || '');

  //     if (imageFile) {
  //       formData.append('productImage', imageFile);
  //     }

  //     return _axios.put(`/products/update/${id}`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //   },
  //   onSuccess: () => {
  //     setEditFormOpen(false);
  //     setImageFile(null);
  //     toast.success("Product Updated successfully");
  //     refetch();
  //   },
  //   onError: () => {
  //     toast.error("Error Updating Product");
  //   },
  // });

  //pagination
  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data.total,
      }));
    }
  }, [data]);

  useEffect(() => {
    searchQuery.value = searchTerm;
    refetch();
  }, [searchTerm, pagination.page]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
    refetch();
  };

  // const totalPages = useMemo(
  //   () => Math.ceil(pagination.total / pagination.limit),
  //   [pagination.total, pagination.limit]
  // );

  useSignals();
  const handleToggleOff = async(id:any,productCode:string) => {
    try {
    const response = await _axios.delete(`/products/status-inactive/${id}`);
   if( response.status==200){
toast.success(`Product status set to InActive ${productCode}`)
   }
   else if( response.status==404){
    toast.success("Product Notfound")
       }
       else if( response.status==500){
        toast.success("Internal Server Error")
           }
//  response.status
  } catch (error) {
    console.error("Error updating product status:", error);
    
  }
  };

  // Function to handle when toggle is disabled
  const handleToggleOn =async (id:any,productCode:string) => {
    try {
      const response = await _axios.delete(`/products/status-active/${id}`);
     if( response.status==200){
  toast.success(`Product status set to Active ${productCode}`)
     }
     else if( response.status==404){
      toast.error("Product Not found")
         }
         else if( response.status==500){
          toast.error("Internal Server Error")
             }
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("something went wrong")
    }
  };

  if (isLoading) {
    return <div>Loading....</div>;
  }

  return (
    <>
      <div className="w-full h-full">
        <div className="flex flex-col gap-5">
          <Topbar title="Products"/>
          <div className=" rounded-md mx-2  ">
   <div className="flex justify-end px-4 mt-1">
   <div className=" flex gap-3">
              <div className="flex gap-2">
              <div className="relative w-[350px]">
  <Input
    type="text"
    onChange={(e) => setSearchTerm(e.target.value)}
    className="!border-primary border rounded-lg text-sm focus-visible:ring-2 focus-visible w-full h-10 pl-4 pr-10 placeholder:text-gray-400"
    placeholder="Search Products..."
    value={searchTerm}
  />
  <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
    <CiSearch size={24} />
  </div>
</div>
              </div>
              <div>
              <Button
                      className=" h-10 gap-1 rounded-lg text-base text-white hover:scale-105 duration-500 transition-transform bg-button-gradient"
                      onClick={() => {
                        navigate('/admin/products/add')
                      }}
                    >
                      <IoMdAdd className="" />
                      Add Product
                    </Button>
              </div>
            </div>
   </div>
            <div className="my-3 bg-white rounded-lg py-2 px-2  mx-2">
              {/* <div className="flex justify-between px-4 py-5">
                <h1 className="font-bold text-xl">Product List</h1>
              </div> */}
                 <div className="flex flex-col h-[80vh]">
  <Table className="flex-grow">
                  <TableHeader className="bg-primary/10 ">
                    <TableRow className="text-base font-ubuntu">
                      <TableHead className="text-primaryDark ">SL.No</TableHead>
                      <TableHead className="text-primaryDark">ProductName</TableHead>
                      <TableHead className="text-primaryDark text-left ">Stock</TableHead>
                      <TableHead className="text-primaryDark">ProductCode</TableHead>
                      {/* <TableHead>Product Image</TableHead> */}
                      <TableHead className="text-primaryDark text-left ">Brand</TableHead>
                      <TableHead className="text-primaryDark text-left flex justify-start items-center">
      Category
      <DropdownMenu onOpenChange={(open) => setCategorydown(open)}>
        <DropdownMenuTrigger asChild>
          <button className="">
            {CategoryDown ? (
              <MdArrowDropUp className="text-xl" />
            ) : (
              <MdArrowDropDown className="text-xl" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <RadioGroup
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              setCategorydown(false);
            }}
          >
            {/* Map through fetchedCategories to create dropdown items */}
            <DropdownMenuCheckboxItem
              checked={selectedCategory === "all"}
              onClick={() => {
                setSelectedCategory("all");
                setCategorydown(false);
              }}
            >
              All
            </DropdownMenuCheckboxItem>
            {fetchedCategories.map((category, index) => (
              <DropdownMenuCheckboxItem
                key={index}
                checked={selectedCategory === category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCategorydown(false);
                }}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </RadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableHead>
    
                      <TableHead className="text-left text-primaryDark">Purchased Price</TableHead>
                      
                      <TableHead className="text-primaryDark text-left " >
                        Dealer Price
                      </TableHead>
                      <TableHead className="text-primaryDark text-left ">
                        Customer Price
                      </TableHead>
                      <TableHead className="text-primaryDark text-center w-fit">Active</TableHead>
                      <TableHead className="text-primaryDark text-center w-fit">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
  {data?.products?.length === 0 ? (
    <TableRow>
      <TableCell colSpan={11} className="text-center text-gray-500">
        No products available
      </TableCell>
    </TableRow>
  ) : (
    data?.products.map((item:any, index:any) => (
      <TableRow key={item._id} className="hover:bg-gray-50 text-base">
        <TableCell>
          {(pagination.page - 1) * pagination.limit + (index + 1)}
        </TableCell>
        <TableCell
          onClick={() => {
            console.log(item._id);
            navigate(`/admin/products/product/${item._id}`);
          }}
          className="hover:text-blue-500 hover:underline cursor-pointer"
        >
          {item.productName}
        </TableCell>
        <TableCell className="text-left">{item.stock}</TableCell>
        <TableCell>{item.productCode}</TableCell>
        <TableCell className="text-left">{item.brand}</TableCell>
        <TableCell className="text-left">{item.category.categoryName}</TableCell>
        <TableCell className="text-left">{item.purchasedPrice}</TableCell>
        <TableCell className="text-left">{item.dealerPrice}</TableCell>
        <TableCell className="text-left">{item.customerPrice}</TableCell>

        <TableCell className="text-left w-fit">
  <div className="flex items-center gap-5 px-2 justify-center">
    <label className="inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        value="" 
        className="sr-only peer" 
        //@ts-ignore
        checked={visibilityStates[item._id] !== undefined ? visibilityStates[item._id] : item.active} // Check if the state is defined, otherwise use item.active
        onChange={(e) => {
          const isChecked = e.target.checked; // Get the new checked state
          // Update the state locally for this product only
          setVisibilityStates((prevStates) => ({
            ...prevStates,
            [item._id]: isChecked, // Update the specific product's visibility state
          }));
          
          // Call the respective function based on the checked state
          if (isChecked) {
            handleToggleOn(item._id, item.productCode); // Call function for enabled
          } else {
            handleToggleOff(item._id, item.productCode); // Call function for disabled
          }
        }} 
      />
      <div className="relative w-11 h-6 outline-none bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-indigo-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
    </label>
  </div>
</TableCell>






        <TableCell className="text-left w-fit">
          <div className="flex items-center gap-5 px-2 justify-center">
            <div className="text-red-500 text-base">
              <button
                onClick={() => {
                  setDeleteprd(item);
                  setDeleteFormOpen(true);
                }}
                className="text-red-600 text-xl"
              >
                <AiOutlineDelete />
              </button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>

                </Table>
                  <TableCaption className="mt-auto">
        <Pagination
        total={data?.total}   
        limit={pagination.limit}   
        page={pagination.page}       
        callback={handlePageChange}  
      />
                  </TableCaption>
             
              </div>
            </div>
          </div>
        </div>
       
      </div>

      {/* edit model */}
      {/* <Dialog open={editFormOpen} onOpenChange={setEditFormOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap -mx-4">
            <div className="w-1/2 px-4">
              <div className="flex flex-col gap-2 my-2">
                <Label>Product Name</Label>
                <Input
                  defaultValue={Editproduct?.productName}
                  onChange={(e) => {
                    setEditProduct({
                      ...Editproduct,
                      productName: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Model</Label>
                <Input
                  defaultValue={Editproduct?.model}
                  onChange={(e) => {
                    setEditProduct({
                      ...Editproduct,
                      model: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Purchased Price</Label>
                <Input
                  defaultValue={Editproduct?.purchasedPrice}
                  onChange={(e) => {
                    setEditProduct({
                      ...Editproduct,
                      purchasedPrice: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Product Code</Label>
                <Input
                  defaultValue={Editproduct?.productCode}
                  onChange={(e) => {
                    setEditProduct({
                      ...Editproduct,
                      productCode: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Brand</Label>
                <Input
                  defaultValue={Editproduct?.brand}
                  onChange={(e) => {
                    setEditProduct({
                      ...Editproduct,
                      brand: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="w-1/2 px-4">
              <div className="flex flex-col gap-2 my-2">
                <Label>Selling Price</Label>
                <Input
                  defaultValue={Editproduct?.sellingPrice}
                  onChange={(e) => {
                    setEditProduct({
                      ...Editproduct,
                      sellingPrice: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Strike Price</Label>
                <Input
                  defaultValue={Editproduct?.strikePrice}
                  onChange={(e) => {
                    setEditProduct({
                      ...Editproduct,
                      strikePrice: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Description</Label>
                <Textarea
                  defaultValue={Editproduct?.description}
                  onChange={(e) => {
                    setEditProduct({
                      ...Editproduct,
                      description: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Image Upload</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                />
                {imageFile ? (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Selected"
                      className="w-32 h-32 object-cover"
                    />
                  </div>
                ) : <div className="mt-2">
                  <img
                    src={`http://localhost:4000/api/admin/files/view?key=${Editproduct?.productImage}`}
                    alt="Selected"
                    className="w-32 h-32 object-cover"
                  />
                </div>
                }
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-300 text-black w-full"
              size="sm"
              onClick={() => {
                setEditFormOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full bg-green-500 text-white"
              size="sm"
              onClick={() => {
                editProduct(Editproduct?._id);
              }}
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
     


<Dialog
                                open={deleteForm}
                                onOpenChange={setDeleteFormOpen}
                              >
                                    <>
                                      {" "}
                                      {/* <AiOutlineDelete /> */}
                                      <DialogContent className="bg-white">
                                        <div className="text-center">
                                          <p className="font-bold text-xl">
                                            "{deleteprd.productName}"
                                          </p>
                                          <p className="font-bold">
                                            Do You Want to Delete this Product Permanently?
                                          </p>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            className="bg-gray-300 text-black w-full"
                                            size="sm"
                                            onClick={() => {
                                              setDeleteFormOpen(false);
                                              // setDeleteprd(null)
                                            }}
                                          >
                                            Cancel
                                          </Button>

                                          <Button
                                            type="button"
                                            variant="destructive"
                                            className="w-full bg-red-500 text-white"
                                            size="sm"
                                            onClick={() => {
                                              deleteProduct(deleteprd._id);
                                            }}
                                            disabled={isPending}
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </>
                                 
                              </Dialog>
    </>


  );
}
