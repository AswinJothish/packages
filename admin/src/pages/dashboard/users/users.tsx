import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoMdAdd } from "react-icons/io";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "../../utils/pagination"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { zodResolver } from "@hookform/resolvers/zod";
import { _axios } from "@/lib/_axios";
import { z } from "zod";
import { RadioGroup } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useSignals } from "@preact/signals-react/runtime";
import { useForm } from 'react-hook-form';
//import { FaEdit } from "react-icons/fa";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signal } from "@preact/signals-react";
import { AiOutlineDelete } from "react-icons/ai";
import { MdArrowDropDown } from "react-icons/md";
import { MdArrowDropUp } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Topbar from "@/pages/utils/topbar";
import { CiSearch } from "react-icons/ci";

type Address = {
  tag: string;
  flatNumber: string;
  area: string;
  nearbyLandmark: string;
  receiverName: string;
  receiverMobileNumber: string;
};


const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  mobileNumber: z.string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(10, "Mobile number cannot exceed 10 digits")
    .regex(/^\d+$/, "Mobile number can only contain numbers"),
  role: z.string().nonempty('Role is required'),
  deliveryAddress: z.record(
    z.string(),
    z.object({
      flatNumber: z.string(),
      area: z.string(),
      nearbyLandmark: z.string().optional(),
    })
  ).optional(),
});


export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  // const [editformOpen, setEditFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");
  const [createformOpen, setCreateFormOpen] = useState(false);
  const [deleteForm, setdeleteFormOpen] = useState(false);
  //const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [roleDown, setRoledown] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<{ [key: string]: string | null }>({});

  // const [submitted, setSubmitted] = useState(false);


  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
  
    let errorMessage = '';
  
    switch (name) {
      case 'tag':
        if (!value.trim()) {
          errorMessage = 'Address label is required';
        }
        break;
  
      case 'flatNumber':
        if (!value.trim()) {
          errorMessage = 'Flat number is required';
        }
        break;
  
      case 'area':
        if (!value.trim()) {
          errorMessage = 'Area is required';
        }
        break;
  
      case 'nearbyLandmark':
        if (!value.trim()) {
          errorMessage = 'Nearby landmark is required';
        }
        break;
  
      case 'receiverName':
        if (!value.trim()) {
          errorMessage = 'Receiver\'s name is required';
        }
        break;
  
      case 'receiverMobileNumber':
     
        if (!/^\d*$/.test(value)) {
           // toast.error('Only numbers are allowed');
      return;
        } else if (value.length > 10) {
          errorMessage = 'Only 10 digits are allowed';
        } else if (value.length < 10 && value.length >= 2) {
          errorMessage = 'Minimum 10 digits required';
        }
        break;
  
      default:
        break;
    }
  
    setError((prevError) => ({
      ...prevError,
      [name]: errorMessage || null,
    }));
  
    setAddresses((prevAddresses) => {
      if (!Array.isArray(prevAddresses)) {
        console.error('prevAddresses is not an array:', prevAddresses);
        return prevAddresses;
      }
      const updatedAddresses: any = [...prevAddresses];
      updatedAddresses[index] = { ...updatedAddresses[index], [name]: value };
      return updatedAddresses;
    });
  };

  const handleAddAddress = () => {
    setAddresses((prevAddresses) => [
      ...prevAddresses,
      {
        tag: '',
        flatNumber: '',
        area: '',
        nearbyLandmark: '',
        receiverName: '',
        receiverMobileNumber: ''
      },
    ]);
  };



  const handleRemoveAddress = (index: number) => {
    setAddresses((prevAddresses) => prevAddresses.filter((_, i) => i !== index));
  };



  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // mode: "onChange", // Validate on change
    defaultValues: {
      username: "",
      role: "",
      mobileNumber: "",
      deliveryAddress: {},
    },
  });

  const searchQuery = signal<string>("");

  // const [Edituser, setEditUser] = useState<any>({
  //   _id: "",
  //   username: "",
  //   userid: "",
  //   role: "",
  //   email: "",
  //   profileImage: undefined,
  //   mobileNumber: "",
  // });
  const [deleteuser, setDeleteuser] = useState<any>({
    _id: "",
    username: "",
    userid: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  //getall users
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", pagination.page, pagination.limit, selectedRole],
    queryFn: () =>
      _axios.get(
        `/users/all?limit=${pagination.limit}&page=${pagination.page}&q=${searchQuery.value}&role=${selectedRole}`
      ),
    select(data) {
      return {
        users: data.data.users,
        total: data.data.total,
      };
    },
  });

  // delete user
  const { isPending, mutate: deleteUser } = useMutation({
    mutationFn: (id: string) => {
      return _axios.delete(`/users/${id}`);
    },
    onSuccess: () => {
      setdeleteFormOpen(false);
      toast.success("User Deleted Successfully");
      refetch();
    },
    onError: () => {
      toast.error("Error Deleting User");
    },
  });

  // Edit user
  // const { mutate: editUser } = useMutation({
  //   mutationFn: (id: string) => {
  //     const formData = new FormData();
  //     formData.append("username", Edituser?.username || "");
  //     formData.append("userid", Edituser?.userid || "");
  //     formData.append("role", Edituser?.role || "");
  //     formData.append("email", Edituser?.email || "");
  //     formData.append("mobileNumber", Edituser?.mobileNumber || "");

  //     if (imageFile) {
  //       formData.append("profileImage", imageFile);
  //     }
  //     return _axios.put(`/users/update/${id}`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //   },
  //   onSuccess: () => {
  //     setEditFormOpen(false);
  //     setImageFile(null);
  //     toast.success("User Updated successfully");
  //     refetch();
  //   },
  //   onError: () => {
  //     toast.error("Error Updating User");
  //   },
  // });

  // Pagination
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
  }, [searchTerm, pagination.page, selectedRole]);

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




  const onSubmit = (data: z.infer<typeof formSchema>) => {

    if (!data.username || !data.mobileNumber || !data.role) {
      toast.error("Please fill all fields.");
      return; 
    }
  
    const hasEmptyDeliveryAddress = addresses.some(address => {
      return (
        !address.tag ||
        !address.flatNumber ||  
        !address.area ||
        !address.nearbyLandmark ||
        !address.receiverName ||
        !address.receiverMobileNumber
      );
    });
  
    if (hasEmptyDeliveryAddress) {
      toast.error("Please fill all delivery address fields.");
      return; 
    }
  
    const deliveryAddresses = addresses.map(address => ({
      tag: address.tag || "",
      address: {
        flatNumber: address.flatNumber || "",
        area: address.area || "",
        nearbyLandmark: address.nearbyLandmark || "",
        receiverName: address.receiverName || "",
        receiverMobileNumber: address.receiverMobileNumber || ""
      }
    }));
  
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("mobileNumber", data.mobileNumber);
    formData.append("role", data.role);
    formData.append("deliveryAddress", JSON.stringify(deliveryAddresses));
  
    _axios.post("/users/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(() => {
        setCreateFormOpen(false);
        toast.success("User Created successfully");
        form.reset();
        refetch();
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
        toast.error(errorMessage);
      });
  };
  

  // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
  useSignals();



  if (isLoading) {
    return <div>Loading....</div>;
  }

  return (
    <>
      <div className="w-full h-full">
        <div className="flex flex-col gap-5">
        <Topbar title="Users"  />
        
          <div className=" rounded-md mx-2 ">
            <div className="w-full flex justify-end px-5">
            <div className=" flex gap-3">
              <div className="flex gap-2">
              <div className="relative w-[350px]">
  <Input
    type="text"
    onChange={(e) => setSearchTerm(e.target.value)}
    className="!border-primary border rounded-lg text-sm focus-visible:ring-2 focus-visible w-full h-10 pl-4 pr-10 placeholder:text-gray-400"
    placeholder="Search Users..."
    value={searchTerm}
  />
  <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
    <CiSearch size={24} />
  </div>
</div>
              </div>
              <div>
                <Dialog open={createformOpen} onOpenChange={setCreateFormOpen}>
                  <DialogTrigger>
                    <Button
                      className="h-10 rounded-lg text-base flex text-white items-center gap-1 hover:scale-105 duration-500 transition-transform bg-button-gradient"
                      onClick={() => setCreateFormOpen(true)}
                    >
                      <IoMdAdd className="text-white" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white p-4 rounded-md  shadow-lg max-w-5xl max-h-[600px] overflow-scroll">
                    <DialogHeader>
                      <DialogTitle className="text-center font-bold text-primary mb-5">Add a New User!</DialogTitle>
                      <DialogDescription >
                        <Form {...form}>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }}
                            className="space-y-4 flex items-center justify-center flex-col w-full">
                            <div className="grid grid-cols-3 w-full gap-4">
                              <FormField
                                name="username"
                                control={form.control}
                                render={({ field }) => (
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-2 left-[5%] px-1 bg-white z-10">
                                      User Name
                                    </FormLabel>
                                    <Input
                                      id="username"
                                      {...field}
                                      className="block w-full p-2 h-10 text-base text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-primary"
                                    />
                                    {form.formState.errors.username && (
                                      <p className="text-red-500 text-base text-center mt-1">
                                        {form.formState.errors.username.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />

                              <FormField
                                name="mobileNumber"
                                control={form.control}
                                render={({ field }) => (
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-2 left-[5%] px-1 bg-white z-10">
                                      Mobile Number
                                    </FormLabel>
                                    <Input

                                      {...field}
                                      // type="number"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        field.onChange(value);
                                        if (value.length < 2) {
                                          form.clearErrors("mobileNumber");
                                        } else if (value.length < 10) {
                                          form.setError("mobileNumber", {
                                            type: "manual",
                                            message: "Mobile number must be at least 10 digits",
                                          });
                                        } else if (value.length > 10) {
                                          form.setError("mobileNumber", {
                                            type: "manual",
                                            message: "Mobile number cannot exceed 10 digits",
                                          });
                                        } else {
                                          form.clearErrors("mobileNumber");
                                        }
                                      }}
                                      className="block w-full p-2 h-10 text-base text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-primary"
                                    />
                                    {form.formState.errors.mobileNumber && (
                                      <p className="text-red-500 text-base text-center mt-1">
                                        {form.formState.errors.mobileNumber.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />

                              <FormField
                                name="role"
                                control={form.control}
                                render={({ field }) => (
                                  <FormItem className="flex items-center flex-row justify-center gap-1 -mt-2">
                                    <FormLabel className="text-base -mb-1.5 flex text-center space-x-2 justify-center items-center">Role:</FormLabel>
                                    <FormControl>
                                      <RadioGroup name="role" className="flex flex-row items-center justify-center gap-5">
                                        <FormItem className="flex items-center justify-center  space-x-2">
                                          <label className="flex items-center justify-center space-x-2 cursor-pointer">
                                            <Input
                                              type="radio"
                                              {...field}
                                              value="dealer"
                                              className="hidden peer"
                                            />
                                            <span className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:bg-primary peer-checked:border-white peer-checked:outline peer-checked:outline-gray-200"></span>
                                            <span className="text-base font-normal">Dealer</span>
                                          </label>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2">
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                            <Input
                                              type="radio"
                                              {...field}
                                              value="customer"
                                              className="hidden peer"
                                            />
                                            <span className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:bg-primary peer-checked:border-white peer-checked:outline peer-checked:outline-gray-200"></span>
                                            <span className="text-base font-normal">Customer</span>
                                          </label>
                                        </FormItem>
                                      </RadioGroup>
                                    </FormControl>
                                    {form.formState.errors.role && (
                                      <p className="text-red-500 text-center text-base mt-1">
                                        {form.formState.errors.role.message}
                                      </p>
                                    )}
                                  </FormItem>
                                )}
                              />

                            </div>

                            {Array.isArray(addresses) && addresses.map((address: any, index) => (
                              <div key={index} className="relative grid grid-cols-1 gap-4 px-10 py-10 border rounded-md border-gray-200 shadow">
                                <div className="absolute top-0 left-3 -translate-y-1/2 w-fit bg-white px-3 text-base text-slate-400">
                                  Address {index + 1}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAddress(index)}
                                  className="absolute top-2 text-bold text-xl right-3 text-gray-400 hover:text-red-500"
                                >
                                  &times;
                                </button>

                                <div className="mt-5 grid grid-cols-4 gap-5">
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                      Address Label
                                    </FormLabel>
                                    <Input
                                      name="tag"
                                      value={address.tag || ''}
                                      onChange={(event) => handleInputChange(index, event)}
                                      className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                      placeholder="Eg: Home, Office..."
                                    />
                                  </div>

                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                      Flat Number
                                    </FormLabel>
                                    <Input
                                      name="flatNumber"
                                      value={address.flatNumber || ''}
                                      onChange={(event) => handleInputChange(index, event)}
                                      className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                      placeholder="No.76A"
                                    />
                                  </div>


                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                      Area
                                    </FormLabel>
                                    <Input
                                      name="area"
                                      value={address.area || ''}
                                      onChange={(event) => handleInputChange(index, event)}
                                      className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                      placeholder="Eg: Sector 15A..."
                                    />
                                  </div>

                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                      Landmark
                                    </FormLabel>
                                    <Input
                                      name="nearbyLandmark"
                                      value={address.nearbyLandmark || ''}
                                      onChange={(event) => handleInputChange(index, event)}
                                      className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                                      placeholder="Eg: Near Central Park..."
                                    />
                                  </div>

                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
                                      Receiver's Name
                                    </FormLabel>
                                    <Input
                                      name="receiverName"
                                      value={address.receiverName || ''}
                                      onChange={(event) => handleInputChange(index, event)}
                                      className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"

                                    />
                                  </div>


                                  <div className="relative">
  <FormLabel className="absolute text-base text-gray-500 -top-2 left-3 px-1 bg-white z-10">
    Receiver's Mobile
  </FormLabel>
  <Input
    name="receiverMobileNumber"
    value={address.receiverMobileNumber || ''}
    onChange={(event) => handleInputChange(index, event)}
    className="block w-full p-2 h-10 text-base placeholder:text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
  />
  {error.receiverMobileNumber && (
    <p className="text-red-500 text-xs mt-1">{error.receiverMobileNumber}</p>
  )}
</div> 

                                </div>
                              </div>
                            ))}

                            <div className="flex  gap-10 justify-center pt-10">
                            <button
                              type="button"
                              onClick={handleAddAddress}
                              className=" w-1/2 px-4 py-2  text-white bg-primary rounded-md hover:scale-105 duration-300"
                            >
                              Add Address
                            </button>
                              <button
                                type="submit"
                                className="px-4 py-2 text-white bg-green-700 rounded-md hover:scale-105 duration-300"
                              >
                                Submit
                              </button>
                            </div>
                          </form>
                        </Form>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            </div>
            <div className="mb-5 mt-2 bg-white  rounded-lg py-2 px-4   mx-2">
              {/* <div className="flex justify-between px-4 py-5">
                <h1 className="font-bold text-xl">User List</h1>
              </div> */}

              <div className="flex flex-col h-[80vh]">
                <Table className="flex-grow">


                  <TableHeader className="bg-primary/10">
                    <TableRow className="text-base font-ubuntu">
                      <TableHead className="text-left text-primaryDark">Sl.no</TableHead>
                      <TableHead className="text-left text-primaryDark">User ID</TableHead>
                      <TableHead className="text-left text-primaryDark">Username</TableHead>
                      <TableHead className="text-left text-primaryDark">Mobile Number</TableHead>
                      <TableHead className="text-left text-primaryDark flex justify-start items-center">
                        Role
                        <DropdownMenu onOpenChange={(open) => setRoledown(open)}>
                          <DropdownMenuTrigger asChild>
                            <button className="">
                              {roleDown ? (
                                <MdArrowDropUp className="text-xl" />
                              ) : (
                                <MdArrowDropDown className="text-xl" />
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48">
                            <RadioGroup
                              value={selectedRole}
                              onValueChange={(value) => {
                                setSelectedRole(value);
                                setRoledown(false);
                              }}
                            >
                              <DropdownMenuCheckboxItem
                                checked={selectedRole === "all"}
                                onClick={() => {
                                  setSelectedRole("all");
                                  setRoledown(false);
                                }}
                              >
                                All
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem
                                checked={selectedRole === "dealer"}
                                onClick={() => {
                                  setSelectedRole("dealer");
                                  setRoledown(false);
                                }}
                              >
                                Dealer
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem
                                checked={selectedRole === "customer"}
                                onClick={() => {
                                  setSelectedRole("customer");
                                  setRoledown(false);
                                }}
                              >
                                Customer
                              </DropdownMenuCheckboxItem>
                            </RadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableHead>
                      <TableHead className="text-center text-primaryDark">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {data?.users?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500">
                              No Users available
                            </TableCell>
                          </TableRow>
                        ): 
                        data?.users.map((user: any, index: number) => (
                          <TableRow
                            key={user._id}
                            className="hover:bg-gray-50 text-base"
                          >
                            <TableCell>
                              {(pagination.page - 1) * pagination.limit + (index + 1)}
                            </TableCell>
                            <TableCell
                              onClick={() => {
                                navigate(`/admin/user/${user._id}`);
                              }}
                              className="text-left cursor-pointer hover:text-blue-500 hover:underline"
                            >
                              {user.userid}
                            </TableCell>
                            <TableCell className="cursor-pointer text-left">
                              {user.username ? user.username : '-'}
                            </TableCell>
                            <TableCell className="text-left">{user.mobileNumber}</TableCell>
                            <TableCell className="text-left">{user.role}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center gap-5 px-2 justify-center">
                                <div className="text-red-500">
                                  <button
                                    onClick={() => {
                                      setDeleteuser(user);
                                      setdeleteFormOpen(true)
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
                        }
                
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
      {/* <Dialog open={editformOpen} onOpenChange={setEditFormOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap -mx-4">
            <div className="w-1/2 px-4">
              <div className="flex flex-col gap-2 my-2">
                <Label>UserName</Label>
                <Input
                  defaultValue={Edituser?.username}
                  onChange={(e) => {
                    setEditUser({
                      ...Edituser,
                      username: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>UserID</Label>
                <Input
                  defaultValue={Edituser?.userid}
                  onChange={(e) => {
                    setEditUser({
                      ...Edituser,
                      userid: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Mobile Number</Label>
                <Input
                  defaultValue={Edituser?.mobileNumber}
                  onChange={(e) => {
                    setEditUser({
                      ...Edituser,
                      mobileNumber: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="w-1/2 px-4">
              <div className="flex flex-col gap-2 my-2">
                <Label>Email</Label>
                <Input
                  defaultValue={Edituser?.email}
                  onChange={(e) => {
                    setEditUser({
                      ...Edituser,
                      email: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 my-2">
                <Label>Role</Label>
                <Input
                  defaultValue={Edituser?.role}
                  onChange={(e) => {
                    setEditUser({
                      ...Edituser,
                      role: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
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
            ) : (
              <div className="mt-2">
                <img
                  src={`http://localhost:4000/api/admin/files/view?key=${Edituser?.profileImage}`}
                  alt="Selected"
                  className="w-32 h-32 object-cover"
                />
              </div>
            )}
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
                editUser(Edituser?._id);
              }}
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
      <Dialog
        open={deleteForm}
        onOpenChange={setdeleteFormOpen}
      >

        <>

          <DialogContent className="bg-white">
            <div className="text-center">
              <p className="font-bold text-xl">
                "{deleteuser.username}"
              </p>
              <p className="font-bold">
                Do You Want to Delete this User?
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
                  // setDeleteuser(null);
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
                  deleteUser(deleteuser._id);
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