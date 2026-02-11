import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoMdAdd } from "react-icons/io";
import {Table,TableBody,TableCaption,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { _axios } from "@/lib/_axios";
import { z } from "zod";
import {Form,FormField,FormLabel,} from "@/components/ui/form";
import { useSignals } from "@preact/signals-react/runtime";
import { useForm } from "react-hook-form";
//import { FaEdit } from "react-icons/fa";
import {Dialog,DialogTrigger,DialogContent,DialogDescription,DialogHeader,DialogTitle,} from "@/components/ui/dialog";
import Pagination from "../../utils/pagination";
import { BiSolidTrash } from "react-icons/bi";
import { BiSolidEdit } from "react-icons/bi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Topbar from "@/pages/utils/topbar";
import { Textarea } from "@/components/ui/textarea";

type Agent = {
  Clientname: string;
  _id: string;
};

const formSchema = z.object({
  Clientname: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be less than 50 characters" }),
    profession: z
    .string()
    .min(1, { message: "Profession is required" })
    .max(20, { message: "Profession must be less than 20 characters" }),
    testimonial: z
    .string()
    .min(1, { message: "Testimonial is required" })
    // .max(100, { message: "Testimonial must be less than 100 characters" }),

});

export function Testimonials() {
  const [editformOpen, setEditFormOpen] = useState(false);
  const [createformOpen, setCreateFormOpen] = useState(false);
  const [deleteForm,  setDeleteFormOpen] = useState(false);
const[deleteTestimonial,setDeleteTestimonial]=useState<Agent>({ Clientname: "", _id: "" })
const[editTestimonial,setEditTestimonial]=useState<any>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Clientname: "",
      profession: "",
      testimonial: "",
    },
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  //getall 
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["Testimonials", pagination.page, pagination.limit],
    queryFn: () =>
      _axios.get(
        `/testimonial/all?limit=${pagination.limit}&page=${pagination.page}`
      ),
    select(data) {
      return {
        data: data.data,
        total: data.data.total,
      };
    },
  });
  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data.total,
      }));
    }
  }, [data]);


  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
    refetch();
  };


  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Validate required fields (if not already handled by zod)
    if (!data.Clientname || !data.profession || !data.testimonial) {
      toast.error("Please fill all fields.");
      return;
    }

    // Create a FormData object to send the form data
    const formData = new FormData();
    formData.append("Clientname", data.Clientname);
    formData.append("profession", data.profession);
    formData.append("testimonial", data.testimonial);

    // Post the form data to the backend
    _axios
      .post("/testimonial/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setCreateFormOpen(false);
        toast.success("Tesimonial Created successfully");
        form.reset();
        refetch();
      })
      .catch((error) => {
        console.error("Error creating Tesimonial:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.";
        toast.error(errorMessage);
      });
  };
  const onUpdate = (data: z.infer<typeof formSchema>) => {
    const updatedData: any = {};
  
    if (data.Clientname !== editTestimonial?.Clientname) {
      updatedData.Clientname = data.Clientname;
    }
    if (data.profession !== editTestimonial?.profession) {
        updatedData.profession = data.profession;
      }
      if (data.testimonial !== editTestimonial?.tesimonial) {
        updatedData.testimonial = data.testimonial;
      }
  

  
    if (Object.keys(updatedData).length === 0) {
      toast.info("No changes detected.");
      return;
    }
  
    const formData = new FormData();
    Object.entries(updatedData).forEach(([key, value]) => {
      formData.append(key, value as any);
    });
  
    _axios
      .put(`/testimonial/${editTestimonial?._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setEditFormOpen(false);
        toast.success("Tesimonial Updated successfully");
        form.reset();
        refetch();
      })
      .catch((error) => {
        console.error("Error updating Testimonial:", error);
        const errorMessage =
          error.response?.data?.message || error.message || "An unexpected error occurred.";
        toast.error(errorMessage);
      });
  };
  
  

  const { mutate: DeleteTestimonial, isPending } = useMutation({
    mutationFn: async ({ id, permanent }: { id: string; permanent: boolean }) => {
      try {
        const response = await _axios.delete(`/testimonial/${id}`, {
          params: { permanent },
        });
        return response.data; 
      } catch (error: any) {
        console.error("Error deleting testimonial:", error);
        const errorMessage =
          error.response?.data?.message || // Backend-provided error message
          error.response?.statusText || // HTTP status text
          error.message || // General error message
          "Failed to delete the testimonial. Please try again."; // Fallback message
        throw new Error(errorMessage); // Pass the error message to `onError`
      }
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Action completed successfully!"); // Show success message
      setDeleteFormOpen(false); 
      refetch(); 
    },
    onError: (error: any) => {
      console.error("Error deleting testimonial:", error);
      toast.error(error.message); // Use the error message passed from `mutationFn`
    },
  });
  
  
  const handleDeleteTestimonial = (id: string, permanent: boolean) => {
    DeleteTestimonial({ id, permanent });
  };
  useSignals();

  if (isLoading) {
    return <div>Loading....</div>;
  }

  return (
    <>
      <div className="w-full h-full">
        <div className="flex flex-col gap-5">
          <Topbar  title="Testimonials"/>
          <div className=" rounded-md mx-2 ">
            <div className="flex justify-end px-5">
            <div className=" flex gap-3">
              <div className="flex gap-2">
              </div>
              <div>
                <Dialog open={createformOpen}  onOpenChange={setCreateFormOpen}>
                  <DialogTrigger>
                    <Button
                      className="h-10 rounded-xl text-base flex text-white items-center gap-1 hover:scale-105 duration-500 transition-transform bg-button-gradient"
                      onClick={() =>{   form.reset({
                        Clientname: "",
                        profession: "",
                        testimonial: "",
                      }) 
                        setCreateFormOpen(true)
                      
                      }}
                    >
                      <IoMdAdd className="text-white" />
                      Add Testimonial
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white p-10 rounded-md shadow-lg w-3/4  overflow-scroll">
                    <DialogHeader>
                      <DialogTitle className="text-center font-bold font-ubuntu text-2xl text-primary mb-10">
                        Add a New Testimonial
                      </DialogTitle>
                      <DialogDescription className="">
                        <Form {...form}>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }}
                            className="space-y-4 flex items-center justify-center flex-col w-full"
                          >
                            <div className="grid grid-cols-1 w-full gap-10">
                              {/* Name Field */}
                              <FormField
                                name="Clientname"
                                control={form.control}
                                render={({ field }) => (
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-3 left-[5%] px-1 bg-white z-10">
                                      Client Name
                                    </FormLabel>
                                    <Input
                                      id="Clientname"
                                      {...field}
                                      className="block w-full p-2 h-14 text-base text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-primary"
                                    />
                                    {form.formState.errors.Clientname && (
                                      <p className="text-red-500 text-base text-center mt-1">
                                        {form.formState.errors.Clientname.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />
                               <FormField
                                name="profession"
                                control={form.control}
                                render={({ field }) => (
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-3 left-[5%] px-1 bg-white z-10">
                                      Client Profession
                                    </FormLabel>
                                    <Input
                                      id="profession"
                                      {...field}
                                      className="block w-full p-2 h-14 text-base text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-primary"
                                    />
                                    {form.formState.errors.profession && (
                                      <p className="text-red-500 text-base text-center mt-1">
                                        {form.formState.errors.profession.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />

<FormField
                                name="testimonial"
                                control={form.control}
                                render={({ field }) => (
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-3 left-[5%] px-1 bg-white z-10">
                                      Testimonial
                                    </FormLabel>
                                    <Textarea
                                      id="testimonial"
                                      {...field}
                                      className="block w-full p-2 h-14 text-base text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-primary"
                                    />
                                    {form.formState.errors.testimonial && (
                                      <p className="text-red-500 text-base text-center mt-1">
                                        {form.formState.errors.testimonial.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />
                           
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-10 justify-center pt-10">
                              <button
                                type="submit"
                                className="px-4 py-2 text-base text-white bg-button-gradient rounded-md hover:scale-105 duration-300"
                              >
                                Add
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
            <div className="my-3 bg-white rounded-lg py-2 px-4   mx-2">
              {/* <div className="flex justify-between px-4 py-5">
                <h1 className="font-bold text-xl">User List</h1>
              </div> */}

              <div className="flex flex-col h-[80vh]">
                <Table className="flex-grow">
                  <TableHeader className="bg-primary/10">
                    <TableRow className="text-base font-ubuntu">
                      <TableHead className="text-left text-primaryDark">
                        Sl.no
                      </TableHead>
                      <TableHead className="text-left text-primaryDark">
                        Client Name
                      </TableHead>
                      <TableHead className="text-left text-primaryDark">
                        Profession
                      </TableHead>
                      <TableHead className="text-left text-primaryDark">
                        Testimonial
                      </TableHead>
                      <TableHead className="text-left text-primaryDark">
                        Active
                      </TableHead>
                      <TableHead className="text-center text-primaryDark">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.testimonials?.length === 0 || data?.total === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-gray-500"
                        >
                          No Testimonials Found
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.data?.testimonials.map((testimonial: any, index: number) => (
                        <TableRow
                          key={testimonial._id}
                          className="hover:bg-gray-50 text-base"
                        >
                          <TableCell>
                            {(pagination.page - 1) * pagination.limit +
                              (index + 1)}
                          </TableCell>
                          <TableCell className="text-left">
                            {testimonial.Clientname}
                          </TableCell>
                          <TableCell className="text-left">
                            {testimonial.profession}
                          </TableCell>
                          <TableCell className="text-left">
                            {testimonial.testimonial}
                          </TableCell>
                        
                          <TableCell className="text-left w-fit">
  <div className="flex items-center gap-5 px-2 justify-center">
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={testimonial.active}
        onChange={() => handleDeleteTestimonial(testimonial._id, false)} 
      />
      <div className="relative w-11 h-6 outline-none bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-indigo-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
    </label>
  </div>
</TableCell>

                          <TableCell className="text-center">
                            <div className="flex items-center gap-5 px-2 justify-center">
                              <div className="">
                                <button
                                 onClick={() => {
                                  form.reset({
                                    Clientname: testimonial.Clientname,
                                    profession: testimonial.profession,
                                    testimonial: testimonial.testimonial,
                                  });
                                  setEditTestimonial(testimonial)
                                    setEditFormOpen(true);
                                  }} 
                                  className="text-xl mt-0.5">
                                <BiSolidEdit />
                                </button>
                              </div>
                              <div className="">
                                <button
                                  onClick={() => {
                                    setDeleteTestimonial(testimonial);
                                    setDeleteFormOpen(true);
                                  }}
                                  className=" text-xl"
                                >
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
      <Dialog
        open={deleteForm}
        onOpenChange={setDeleteFormOpen}
      >

        <>

          <DialogContent className="bg-white">
            <div className="text-center">
              <p className="font-medium">
                Do You Want to Delete <span className="font-bold">{deleteTestimonial.Clientname}'s </span>Tesimonial ?
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
                  setDeleteTestimonial({Clientname: "", _id: "" });
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
                  handleDeleteTestimonial(deleteTestimonial._id,true);
                }}
                disabled={isPending}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </>

      </Dialog>
      <Dialog open={editformOpen}  onOpenChange={setEditFormOpen}>
                  <DialogContent className="bg-white p-10 rounded-md shadow-lg w-3/4  overflow-scroll">
                    <DialogHeader>
                      <DialogTitle className="text-center font-bold font-ubuntu text-2xl text-primary mb-10">
                        Edit Tesimonial
                      </DialogTitle>
                      <DialogDescription className="">
                        <Form {...form}>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              form.handleSubmit(onUpdate)();
                            }}
                            className="space-y-4 flex items-center justify-center flex-col w-full"
                          >
                            <div className="grid grid-cols-1 w-full gap-10">
                              {/* Name Field */}
                              <FormField
                                name="Clientname"
                                control={form.control}
                                render={({ field }) => (
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-3 left-[5%] px-1 bg-white z-10">
                                      Client Name
                                    </FormLabel>
                                    <Input
                                      id="Clientname"
                                      //defaultValue={editAgent?.name}
                                      {...field}
                                      className="block w-full p-2 h-14 text-base text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-primary"
                                    />
                                    {form.formState.errors.Clientname && (
                                      <p className="text-red-500 text-base text-center mt-1">
                                        {form.formState.errors.Clientname.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />
                               <FormField
                                name="profession"
                                control={form.control}
                                render={({ field }) => (
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-3 left-[5%] px-1 bg-white z-10">
                                    Profession
                                    </FormLabel>
                                    <Input
                                      id="profession"
                                      //defaultValue={editAgent?.name}
                                      {...field}
                                      className="block w-full p-2 h-14 text-base text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-primary"
                                    />
                                    {form.formState.errors.profession && (
                                      <p className="text-red-500 text-base text-center mt-1">
                                        {form.formState.errors.profession.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />
                               <FormField
                                name="testimonial"
                                control={form.control}
                                render={({ field }) => (
                                  <div className="relative">
                                    <FormLabel className="absolute text-base text-gray-500 -top-3 left-[5%] px-1 bg-white z-10">
                                    Testimonial
                                    </FormLabel>
                                    <Textarea
                                      id="testimonial"
                                      //defaultValue={editAgent?.name}
                                      {...field}
                                      className="block w-full p-2 h-14 text-base text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-primary"
                                    />
                                    {form.formState.errors.testimonial && (
                                      <p className="text-red-500 text-base text-center mt-1">
                                        {form.formState.errors.testimonial.message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              />
                       
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-10 justify-center pt-10">
                              <button
                                type="submit"
                                className="px-4 py-2 text-base text-white bg-button-gradient rounded-md hover:scale-105 duration-300"
                              >
                                Update
                              </button>
                            </div>
                          </form>
                        </Form>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
    </>
  );
}
