import {Table,TableBody,TableCaption,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { _axios } from "@/lib/_axios";
import { z } from "zod";
import { useSignals } from "@preact/signals-react/runtime";
import { useForm } from "react-hook-form";
import Pagination from "../../utils/pagination";
import { BiSolidTrash } from "react-icons/bi";
import { BiSolidEdit } from "react-icons/bi";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import {useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Topbar from "@/pages/utils/topbar";
import { FaPlus } from "react-icons/fa6";

const createSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  products: z.array(z.string()).min(2, "At least two products are required"),
})
const updateSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  products: z.array(z.string()).optional(),
})

export function Sections() {
  const [activeComponent, setActiveComponent] = useState<"list" | "create">("list");
  const [editSection, setEditSection] = useState(null);
  const handleSwitchComponent = (component: "list" | "create") => {
      setActiveComponent(component);
  }
  useSignals();
  return (
    <>
      <div className="w-full h-full">
        <div className="flex flex-col gap-5">
          <Topbar  title="Sections"/>

        <div className="mt-5 mx-10 w-fit bg-primary/10 border-primary/20 border p-2 rounded-xl">
  <div className="flex space-x-2">
    <button
      onClick={() => handleSwitchComponent("list")}
      className={`p-2 rounded-xl hover:text-white hover:bg-button-gradient ${activeComponent === "list" ? " bg-button-gradient text-white" : " text-primaryDark font-medium"}`}
    >
      Section List
    </button>
    <button
      onClick={() => handleSwitchComponent("create")}
      className={`p-2 rounded-xl hover:text-white hover:bg-button-gradient ${activeComponent === "create" ? "bg-button-gradient text-white" : "text-primaryDark font-medium"}`}
    >
  {editSection ? "Edit Section" : "Create Section"}
    </button>

  </div>
</div>
<div className="flex  justify-center">
<div className=" w-[90%]">
                    <div className="p-4">
                        {activeComponent === "list" && <List onEdit={(section:any) => {
                      setEditSection(section);
                      handleSwitchComponent("create");
                    }}  />}
                        {activeComponent === "create" && <Create editData={editSection}
                    onSuccess={() => {
                      setEditSection(null);
                      handleSwitchComponent("list");
                    }} />}
                    </div>
                </div>
</div>
          </div>
        </div>

    </>
  );
}
const List = ({ onEdit }: { onEdit: (section: any) => void }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [deleteForm, setDeleteFormOpen] = useState(false);
  const [deleteSection, setDeleteSection] = useState<any>({
    _id: "",
    Title: "",
  })
  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const updatedStatus = !currentStatus;
      setToggleStates((prev) => ({ ...prev, [id]: updatedStatus }));
      deletesection({ id, permanent: false });
    } catch (error) {
      console.error("Error updating section status:", error);
    }
  };
  

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
    refetch();
  };
  const { isPending, mutate: deletesection } = useMutation({
    mutationFn: async ({ id, permanent }: { id: string; permanent: boolean }) =>
       _axios.delete(`/section/${id}`,{
      params: { permanent },
    }),
    onSuccess: (response) => {
      const message = response?.data?.message || "Section deleted successfully";
      toast.success(message);
      setDeleteFormOpen(false);
      setDeleteSection(null);
      refetch();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Error deleting section";
      toast.error(message);
    },
  });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", pagination.page, pagination.limit],
    queryFn: () =>
      _axios.get(`/section/all?limit=${pagination.limit}&page=${pagination.page}`),
    select(data) {
      return {
        sections: data.data.sections,
        total: data.data.total,
      };
    },
  });

  if (isLoading) {
    return <div>Loading......</div>;
  }

  return (
    <>
      <div className="flex relative flex-col h-[75vh]">
        <Table className="flex-grow">
          <TableHeader className="bg-primary/10">
            <TableRow className="text-base font-ubuntu">
              <TableHead className="text-primaryDark max-w-[50px]">SL.No</TableHead>
              <TableHead className="text-primaryDark">Section Title</TableHead>
              <TableHead className="text-primaryDark">Description</TableHead>
              <TableHead className="text-primaryDark text-left">Products</TableHead>
              <TableHead className="text-primaryDark text-center w-fit">Active</TableHead>
              <TableHead className="text-primaryDark text-center w-fit">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.sections?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-gray-500">
                  No sections available
                </TableCell>
              </TableRow>
            ) : (
              data?.sections?.map((item: any, index: any) => (
                <TableRow key={item._id} className="hover:bg-gray-50 text-base">
                  <TableCell className="max-w-[50px] ">
                    {(pagination.page - 1) * pagination.limit + (index + 1)}
                  </TableCell>
                  <TableCell className="">
                    {item.Title}
                  </TableCell>
                  <TableCell className="text-left max-w-[200px]">{item.Description}</TableCell>
                  <TableCell className="text-left">
                    <span
                      className="cursor-pointer hover:text-blue-600 hover:underline"
                      onClick={() => {
                        setSelectedProducts(item.Products || []);
                        setIsDrawerOpen(true);
                      }}
                    >
                      {item.Products?.length || 0} Products
                    </span>
                  </TableCell>
                  <TableCell className="text-left w-fit">
                    <div className="flex items-center gap-5 px-2 justify-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          value=""
                          className="sr-only peer"
                          checked={toggleStates[item._id] ?? item.active}
                          onChange={() => handleToggle(item._id, item.active)}
                        />
                        <div className="relative w-11 h-6 outline-none bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-indigo-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </TableCell>
                  <TableCell className="text-left w-fit">
                    <div className="flex items-center gap-5 px-2 justify-center">
                      <div className="text-green-600">
                        <button className="text-2xl" onClick={() => onEdit(item)}>
                          <BiSolidEdit />
                        </button>
                      </div>
                      <div className="text-red-500 text-base">
                        <button  onClick={() => {
                  setDeleteSection(item);
                  setDeleteFormOpen(true);
                }} className="text-red-600 text-2xl">
                          <BiSolidTrash />
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
            limit={pagination?.limit}
            page={pagination?.page}
            callback={handlePageChange}
          />
        </TableCaption>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
  <div
    className="fixed inset-0 h-full bg-black/50 flex justify-end"
    onClick={() => setIsDrawerOpen(false)} // Click outside to close
  >
    <div
      className={`w-80 bg-white h-full p-5 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out ${
        isDrawerOpen ? "translate-x-0" : "translate-x-full"
      }`}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the drawer
    >
      <h2 className="text-xl font-semibold my-4">Products in this Section</h2>
      <ul className="flex flex-col gap-5 flex-grow">
        {selectedProducts.length > 0 ? (
          selectedProducts.map((product: any) => (
            <li key={product._id} className="py-2 border-b">
              {product.productCode} - {product.productName}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No products available.</p>
        )}
      </ul>
      <button
        className="mt-auto w-full py-2 rounded-md text-white font-medium bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
        onClick={() => setIsDrawerOpen(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
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
                                            "{deleteSection?.Title}"
                                          </p>
                                          <p className="font-bold">
                                            Do You Want to Delete this Section Permanently?
                                          </p>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                          <button
                                            type="button"
                                            className="bg-gray-300 rounded py-2 text-black w-full"
                                            onClick={() => {
                                              setDeleteFormOpen(false);
                                              // setDeleteprd(null)
                                            }}
                                          >
                                            Cancel
                                          </button>

                                          <button
                                            type="button"
                                            className="w-full py-2 rounded bg-red-600 text-white"
                                            onClick={() => {
                                              deletesection({ id: deleteSection._id, permanent: true });
                                            }}                                                                                        
                                            disabled={isPending}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </DialogContent>
                                    </>
                                 
                              </Dialog>

    </>
  );
};





type CreateSectionSchema = z.infer<typeof createSectionSchema>
type UpdateSectionSchema = z.infer<typeof updateSectionSchema>

const Create = ({ editData, onSuccess }: { editData?: any; onSuccess?: () => void }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateSectionSchema | UpdateSectionSchema>({
    resolver: zodResolver(editData ? updateSectionSchema : createSectionSchema),
    defaultValues: editData
      ? {
          title: editData.Title,
          description: editData.Description,
          products: editData.Products?.map((product: any) => product._id) || [],
        }
      : { title: "", description: "", products: [] },
  })

  const [selectedProducts, setSelectedProducts] = useState<{ _id: string; productName: string; productCode: string }[]>(
    () => {
      if (editData?.Products && Array.isArray(editData.Products)) {
        return editData.Products.map((product: any) => ({
          _id: product._id,
          productName: product.productName,
          productCode: product.productCode,
        }))
      }
      return []
    },
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const toggleProduct = (product: { _id: string; productName: string; productCode: string }) => {
    const updatedProducts = selectedProducts.some((p) => p._id === product._id)
      ? selectedProducts.filter((p) => p._id !== product._id)
      : [
          ...selectedProducts,
          {
            _id: product._id,
            productName: product.productName,
            productCode: product.productCode,
          },
        ]

    setSelectedProducts(updatedProducts)
    setValue(
      "products",
      updatedProducts.map((p) => p._id),
    )
  }

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const { data, isLoading } = useQuery({
    queryKey: ["sections", pagination.page, pagination.limit],
    queryFn: () => _axios.get(`/products/all?limit=${pagination.limit}&page=${pagination.page}`),
    select(data) {
      return {
        products: data.data.products,
        total: data.data.total,
      }
    },
  })

  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data.total,
      }))
    }
  }, [data])

  useEffect(() => {
    register("products")
  }, [register])

  const createSection = (data: CreateSectionSchema) => {
    if (data.products.length < 2) {
      toast.error("At least two products are required.")
      return
    }

    const formData = new FormData()
    formData.append("Title", data.title)
    formData.append("Description", data.description)

    data.products.forEach((productId: string) => {
      formData.append("Products", productId)
    })

    _axios
      .post("/section/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("Section Created successfully")
        reset()
        setSelectedProducts([])
        onSuccess?.()
      })
      .catch((error) => {
        console.error("Error creating Section:", error)
        const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred."
        toast.error(errorMessage)
      })
  }

  const updateSection = (data: UpdateSectionSchema) => {
    if (!editData) {
      toast.error("No section to update.")
      return
    }

    const formData = new FormData()
    formData.append("Title", data.title)
    formData.append("Description", data.description)

    const productsToUpdate =
      data.products && data.products.length > 0 ? data.products : editData.Products.map((product: any) => product._id)

    if (productsToUpdate.length < 2) {
      toast.error("At least two products are required.")
      return
    }

    productsToUpdate.forEach((productId: string) => {
      formData.append("Products", productId)
    })

    _axios
      .put(`/section/${editData._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("Section Updated successfully")
        reset()
        setSelectedProducts([])
        onSuccess?.()
      })
      .catch((error) => {
        console.error("Error updating Section:", error)
        const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred."
        toast.error(errorMessage)
      })
  }

  const onSubmit = editData ? updateSection : createSection

  if (isLoading) {
    return <div>Loading......</div>
  }

  return (
    <div className="p-4 bg-white">
      {/* @ts-ignore */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block font-medium">
            Title
          </label>
          <input
            id="title"
            {...register("title")}
            className="w-full p-2 border rounded-md"
            placeholder="Enter section title"
          />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-medium">
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="w-full p-2 border rounded-md"
            placeholder="Enter description"
          ></textarea>
          {errors.description && <p className="text-red-500">{errors.description.message}</p>}
        </div>

        {/* Product Selection */}
        <div>
          <label className="font-medium flex gap-2 items-center">
            Products <span>({selectedProducts.length || 0})</span>
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(true)
              }}
              className="bg-button-gradient p-1 rounded-lg text-white"
              aria-label="Add products"
            >
              <FaPlus />
            </button>
          </label>

          {selectedProducts.length === 0 ? (
            <p className="py-5 text-sm text-muted-foreground">No products selected</p>
          ) : (
            <div className="space-y-2">
              {selectedProducts.map((product) => (
                <div key={product._id} className="py-2 text-sm text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block w-96 truncate border px-4 py-2 rounded-full" title={product.productName}>
                          {product.productCode} - {product.productName}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">{product.productName}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          )}

          {/* Dropdown Panel */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="fixed font-ubuntu right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Select Products</h2>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-gray-600 hover:text-gray-900"
                    aria-label="Close product selection"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex justify-start px-7 pt-3 items-center">
                  {selectedProducts.length || 0} products selected
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {data?.products.map((product: any) => (
                    <div
                      key={product?._id}
                      className={`flex items-center justify-center text-center gap-2 px-5 py-2 border border-gray-400 rounded-full cursor-pointer transition 
                        ${selectedProducts.some((p) => p._id === product?._id) ? "bg-button-gradient text-white" : "text-gray-600"}`}
                      onClick={() => toggleProduct(product)}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate w-full text-sm overflow-hidden whitespace-nowrap cursor-pointer">
                              {product.productCode} - {product.productName}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-96">{product.productName}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {errors.products && <p className="text-red-500">{errors.products.message}</p>}
        </div>
<div className="flex flex-row gap-5">
<button type="submit" className="w-fit bg-button-gradient hover:scale-105 transition-all duration-300 text-white p-2 rounded-md hover:bg-blue-600">
          {editData ? "Update" : "Create"}
        </button>
        <button
  onClick={() => {
    reset()
    setSelectedProducts([])
    onSuccess?.()
  }}
  className="w-fit text-white p-2 rounded-md bg-gradient-to-r from-red-500 via-red-600 to-red-800 hover:scale-105 transition-all duration-300"
>
  Cancel
</button>
</div>
      </form>
    </div>
  )
}


  