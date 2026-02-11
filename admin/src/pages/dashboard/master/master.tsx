import { _axios } from "@/lib/_axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { MdExpandMore} from "react-icons/md";
import { MdExpandLess } from "react-icons/md";
import { GrEdit } from "react-icons/gr";
import {  MdAdd } from "react-icons/md";
// import { SiTicktick } from "react-icons/si";
// import { ImCross } from "react-icons/im";
import { useMutation } from '@tanstack/react-query';
import { ImgBaseUrl } from "@/lib/config";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { RxCrossCircled } from "react-icons/rx";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { Upload } from "lucide-react";
import Topbar from "@/pages/utils/topbar";


export function Master() {
    const [activeComponent, setActiveComponent] = useState<"general" | "specification" | "category"|"banner" >("general");

    const handleSwitchComponent = (component: "general" | "specification" | "category"|"banner") => {
        setActiveComponent(component);
    }

    return (
        <div className="h-screen">
            <div className="flex flex-col w-full  ">
            <Topbar title="Master"  />


            <div className="mt-5 mx-10 w-fit bg-primary/10 border-primary/20 border p-2 rounded-xl">
  <div className="flex space-x-2">
    <button
      onClick={() => handleSwitchComponent("general")}
      className={`p-2 rounded-xl  ${activeComponent === "general" ? " bg-button-gradient text-white" : " text-primaryDark font-medium"}`}
    >
      General
    </button>
    <button
      onClick={() => handleSwitchComponent("specification")}
      className={`p-2 rounded-xl  ${activeComponent === "specification" ? "bg-button-gradient text-white" : "text-primaryDark font-medium"}`}
    >
      Specification
    </button>
    <button
      onClick={() => handleSwitchComponent("category")}
      className={`p-2 rounded-xl  ${activeComponent === "category" ? "bg-button-gradient text-white" : "text-primaryDark font-medium"}`}
    >
      Category
    </button>
    <button
      onClick={() => handleSwitchComponent("banner")}
      className={`p-2 rounded-xl  ${activeComponent === "banner" ? "bg-button-gradient text-white" : "text-primaryDark font-medium"}`}
    >
      Banner
    </button>
  </div>
</div>
<div className="flex py-10 justify-center">
<div className=" w-[90%]">
                    <div className="p-4">
                        {activeComponent === "general" && <GeneralComponent />}
                        {activeComponent === "specification" && <SpecificationComponent />}
                        {activeComponent === "category" && <CategoryComponent />}
                        {activeComponent === "banner" && <BannerComponent />}
                    </div>
                </div>
</div>
             
            </div>
        </div>
    );
}


const GeneralComponent = () => {
    const [categoryFields, setCategoryFields] = useState<string[]>([]);
    const [currentFieldName, setCurrentFieldName] = useState('');
    const [generalFormOpen, setGeneralFormOpen] = useState(false);
    const [generalFields, setGeneralFields] = useState([]);
    const [fieldToDelete, setFieldToDelete] = useState<{ fieldValue: string } | null>(null);

    const handleAddCategoryField = () => {
        if (currentFieldName.trim()) {
            setCategoryFields(prevFields => [...prevFields, currentFieldName]);
            setCurrentFieldName('');
        }
    }

    useEffect(() => {
        fetchGeneralFields();
    }, []);

    const fetchGeneralFields = async () => {
        try {
            const response = await _axios.get("/master/get/general-spec");
            setGeneralFields(response.data.data[0].General);
        } catch (error) {
            console.error("Error fetching general fields:", error);
        }
    };

    const handleFieldChange = (index: number, value: string) => {
        setCategoryFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields[index] = value;
            return updatedFields;
        });
    };

    const handleGeneralSave = async () => {
        try {
            const response = await _axios.post("master/add/general-spec", {
                General: categoryFields,
            });

            if (response.data.ok) {
                fetchGeneralFields();
                setGeneralFormOpen(false);
                setCategoryFields([]);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error saving general fields:", error);
            toast.error("Failed to save general fields. Please try again.");
        }
    };

    const handleDeleteClick = (fieldValue: string) => {
        setFieldToDelete({ fieldValue });
    };

    const deleteField = async () => {
        if (!fieldToDelete) return;
        try {
            const response = await _axios.post("/master/delete/general-spec", {
                field: fieldToDelete.fieldValue,
            });

            if (response.data.ok) {
                fetchGeneralFields()
                setFieldToDelete(null);
            } else {
        toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error deleting field:", error);
            toast.error("Failed to delete field. Please try again.")
        }
    };


    const cancelFieldDeletion = () => {
        setFieldToDelete(null);
    };

    return (
        <>
            <div className="w-full h-full border rounded-xl border-primary/10 shadow">
                <div className="p-5 ">
                    <div className="shadow shadow-primary/20 rounded-xl  border-primary/10 border mb-4 flex items-center justify-between px-3 py-2">
                        <h1 className="text-lg text-primary font-semibold">
                            General
                        </h1>
                        <div>
                            <Dialog open={generalFormOpen} onOpenChange={setGeneralFormOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className="bg-button-gradient  text-sm rounded-xl p-3 px-3 hover:scale-105 duration-300 font-medium text-white"
                                        onClick={() => {
                                            setGeneralFormOpen(true);
                                        }}
                                    >
                                        Add new
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-100">
                                    <DialogHeader>
                                        <DialogTitle className="text-base">Add field</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        {categoryFields.map((field, index) => (
                                            <div key={index} className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right text-base text-gray-500">Field {index + 1}</Label>
                                                <Input
                                                    value={field}
                                                    onChange={(e) => handleFieldChange(index, e.target.value)}
                                                    className="col-span-3 text-base"
                                                />
                                            </div>
                                        ))}
                                        <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                            <Label htmlFor="newField" className="text-right text-base text-gray-500">
                                                New Field
                                            </Label>
                                            <Input
                                                id="newField"
                                                value={currentFieldName}
                                                onChange={(e) => setCurrentFieldName(e.target.value)}
                                                className="col-span-2 h-7"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCategoryField}
                                                className="col-span-1 text-sm p-1 text-white rounded bg-primary"
                                            >
                                                Add Field
                                            </button>
                                        </div>
                                    </div>
                                    <DialogFooter className="w-full">
                                        <button onClick={() => { setGeneralFormOpen(false); }} className="bg-red-500 text-sm p-2 text-white rounded">Cancel</button>
                                        <button
                                            type="button"
                                            className="bg-green-500 text-sm p-2 text-white rounded"
                                            onClick={handleGeneralSave}
                                        >
                                            Save
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="flex flex-col gap-2 pt-3 pl-5 w-full">
                            {generalFields.length === 0 ? (
                                <div className="text-base text-center text-gray-500">No fields available</div>
                            ) : (
                                generalFields.map((field, index) => (
                                    <div key={index} className="flex w-full justify-between items-center p-3 shadow-primary/20  shadow rounded-xl">
                                        <p className="text-base text-gray-800">{field}</p>
                                        <button onClick={() => handleDeleteClick(field)}>
                                         
                                            <AiOutlineDelete  className="text-red-500 text-xl"/>
                                        </button>
                                    </div>
                                ))
                            )}
                        </p>
                    </div>

                </div>
            </div>

            {fieldToDelete && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80">
                    <div className="bg-white p-5 rounded shadow">
                        <h2 className="text-lg font-semibold mb-4">
                            Are you sure you want to delete the "{fieldToDelete.fieldValue}" category?
                        </h2>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={deleteField}
                            >
                                Delete
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={cancelFieldDeletion}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const SpecificationComponent = () => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["specifications"],
        queryFn: () => _axios.get('/master/all'),
        select: (data) => ({
            specifications: data.data.data,
        }),
    });

    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [newField, setNewField] = useState<string>("");
    const [visibleCategoryId, setVisibleCategoryId] = useState<string | null>(null);
    const [editedCategoryName, setEditedCategoryName] = useState<string | null>(null);
    const [editingCategoryFieldsId, setEditingCategoryFieldsId] = useState<string | null>(null);
    const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [fieldToDelete, setFieldToDelete] = useState<{ categoryName: string; fieldValue: string } | null>(null);
    const [addingNewField, setAddingNewField] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryFields, setCategoryFields] = useState<string[]>([]);
    const [currentFieldName, setCurrentFieldName] = useState('');
    const [createFormOpen, setCreateFormOpen] = useState(false);

    const handleEditedFieldChange = (index: number, value: string) => {
        setCategoryFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields[index] = value;
            return updatedFields;
        });
    };

    const handleAddCategoryField = () => {
        if (currentFieldName.trim()) {
            setCategoryFields(prevFields => [...prevFields, currentFieldName]);
            setCurrentFieldName('');
        }
    };

    const handleFieldChange = (index: number, value: string) => {
        setCategoryFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields[index] = value;
            return updatedFields;
        });
    };

    const { mutate: handleSave } = useMutation({
        mutationFn: () => {
            const dataToSend = {
                category: newCategoryName.trim(),
                fields: categoryFields
            };
            console.log("Values being sent to the backend:", dataToSend);
            return _axios.post('/master/addcategory', dataToSend);
        },
        onSuccess: () => {
            toast.success("Specification category created Successfully");
            setCreateFormOpen(false);
            refetch();
        },
        onError: (error: any) => {
                toast.error(error.response.data.message)
        },

    });

    const toggleVisibility = (categoryId: string) => {
        setVisibleCategoryId(visibleCategoryId === categoryId ? null : categoryId);
    };

    const startEditingCategoryName = (categoryId: string, currentName: string) => {
        setEditingCategoryId(categoryId);
        setEditedCategoryName(currentName);
    };

    const saveCategoryName = () => {
        if (editingCategoryId && editedCategoryName) {
            const values = {
                categoryId: editingCategoryId,
                newCategoryName: editedCategoryName
            };

            _axios.post('/master/editcategory', values)
                .then(() => {
                    setEditingCategoryId(null);
                    setEditedCategoryName(null);
                    refetch();
                });
        }
    };

    const cancelCategoryNameEdit = () => {
        setEditingCategoryId(null);
        setEditedCategoryName(null);
    };

   const startEditingFields = (categoryId: string, fields: string[]) => {
        setEditingCategoryFieldsId(categoryId);
        setCategoryFields(fields); 
        setVisibleCategoryId(categoryId);
    };

    const saveFields = (categoryName: string, fields: string[]) => {
        if (categoryName && fields) {
            const payload = {
                category: categoryName,
                fields: fields,
            };

            _axios.patch('/master/editfields', payload)
                .then(() => {
                    setEditingCategoryFieldsId(null);
                    refetch();
                })
                .catch((error) => {
                    console.error("Error updating fields:", error);
                });
           // console.log(payload);
        }
    };


    const cancelFieldsEdit = () => {
        setEditingCategoryFieldsId(null);
        setVisibleCategoryId(null);
    };

    const addField = (categoryName: string) => {
        if (newField.trim() === "") return;
const payload={
    category: categoryName,
    fieldsToAdd:newField
}
        _axios.post(`/master/addfields`, payload)
            .then(() => {
                setNewField("");
                setAddingNewField(null);
                refetch();
            });
        // console.log(payload)
    };

    const cancelAddingField = () => {
        setNewField("");
        setAddingNewField(null);
    };

    const startDeletingCategory = (category: string) => {
        setCategoryToDelete(category);
        setShowDeletePopup(true);
    };

    const deleteCategory = () => {
        if (categoryToDelete) {
            const payload = { category: categoryToDelete };
            _axios.post(`/master/deletecategory`, payload)
                .then(() => {
                    setCategoryToDelete(null);
                    setShowDeletePopup(false);
                    refetch();
                });

        }
    };

    const startDeletingField = (categoryName: string, fieldValue:string) => {
        setFieldToDelete({ categoryName, fieldValue });
    };

    const deleteField = () => {
        if (fieldToDelete) {
           
            const payload = {
                category:fieldToDelete.categoryName,
                field:fieldToDelete.fieldValue
            }
            _axios.post(`/master/deletefield`,payload)
                .then(() => {
                    setFieldToDelete(null);
                    refetch();
                });
           
        }
    };

    const cancelFieldDeletion = () => {
        setFieldToDelete(null);
    };

    if (isLoading) {
        return <div>Loading....</div>;
    }

    return (<>

        <div className="w-full h-full rounded-xl p-2 border border-primary/10  m-3  shadow">
            <div className=" p-5">
                <div className="  shadow shadow-primary/20 rounded-xl  border-primary/10  border mb-4  flex items-center justify-between px-3 py-2">
                    <h1 className="text-lg text-primary font-semibold">
                        Specifications
                    </h1>
                    <div>
                        <Dialog open={createFormOpen}
                            onOpenChange={setCreateFormOpen}>
                            <DialogTrigger asChild>
                                <button
                                    className="bg-button-gradient text-sm font-medium rounded-xl p-3 px-3 hover:scale-105 duration-300 text-white "
                                    onClick={() => {
                                        setNewCategoryName('');
                                        setCategoryFields([]);
                                        setCreateFormOpen(true)
                                    }}
                                >
                                    Add Specification
                                </button>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                                <DialogHeader>
                                    <DialogTitle className="text-lg text-primary">Specification Category</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="categoryName" className="text-right  text-base text-gray-500 ">
                                            Specification Title
                                        </Label>
                                        <Input
                                            id="categoryName"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="col-span-3  text-base h-10"
                                        />
                                    </div>

                                    {categoryFields.map((field, index) => (
                                        <div key={index} className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right text-base text-gray-500 ">Field {index + 1}</Label>
                                            <Input
                                                value={field}
                                                onChange={(e) => handleFieldChange(index, e.target.value)}
                                                className="col-span-3  text-base "
                                            />
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                        <Label htmlFor="newField" className="text-right text-base text-gray-500">
                                            New Field
                                        </Label>
                                        <Input
                                            id="newField"
                                            value={currentFieldName}
                                            onChange={(e) => setCurrentFieldName(e.target.value)}
                                            className="col-span-2 h-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategoryField}
                                            className="col-span-1 text-base p-2 text-white rounded bg-button-gradient"
                                        >
                                            Add Field
                                        </button>
                                    </div>
                                </div>
                                <DialogFooter className="w-full">
                                    <button onClick={() => {
                                        setCreateFormOpen(false)
                                    }} className="bg-red-500 text-sm p-2 text-white rounded">Cancel</button>
                                    <button
                                        type="button"
                                        className="bg-green-700 text-sm p-2 text-white rounded "
                                        onClick={() => { handleSave() }}
                                    >
                                        Save
                                    </button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </div>
                </div>
                <div className="space-y-5">

                    {
                    data?.specifications?.length === 0 ? (
  <div className="text-center text-gray-500">No fields available</div>
) :(
                    data?.specifications?.map((category: any) => (
                        <div key={category._id} className="bg-white p-2.5 rounded-xl shadow shadow-primary/20">
                            <div className="flex justify-between items-center ">
                                <div className="flex items-center ">
                                    {editingCategoryId === category._id ? (
                                        <>
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-2 text-base rounded"
                                                value={editedCategoryName || ""}
                                                onChange={(e) => setEditedCategoryName(e.target.value)}
                                            />
                                            <button
                                                className="ml-5 text-[22px]  text-green-500"
                                                onClick={saveCategoryName}
                                            >
                                              <IoIosCheckmarkCircleOutline />
                                            </button>
                                            <button
                                                className="ml-5 text-xl  text-red-500"
                                                onClick={cancelCategoryNameEdit}
                                            >
                                               <RxCrossCircled  />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h2
                                                className="text-base font-bold cursor-pointer"
                                                onClick={() => toggleVisibility(category._id)}
                                            >
                                                {category.category}
                                            </h2>
                                            <button
                                                className="ml-10 text-base px-1 py-1 border rounded hover:bg-slate-300 bg-slate-100 shadow"
                                                onClick={() => startEditingCategoryName(category._id, category.category)}
                                            >
                                                <GrEdit />
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => toggleVisibility(category._id)}>
                                        {visibleCategoryId === category._id ? (
                                            <MdExpandLess />
                                        ) : (
                                            <MdExpandMore />
                                        )}
                                    </button>
                                    <button
                                        className={"text-green-500  px-1 py-1 rounded"}
                                        onClick={() => {
                                            startEditingFields(category._id, category.fields)
                                        }}
                                    >
                                        <AiOutlineEdit  className="text-xl" />
                                    </button>
                                    <button
                                        className="text-red-500 text-lg px-1 py-1 rounded"
                                        onClick={() => startDeletingCategory(category.category)}
                                    >
                                        <AiOutlineDelete className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            {visibleCategoryId === category._id && (<>
                                <hr className="h-0.5 mt-2 w-full" />
                                <div className="mt-4 px-10 space-y-4 ">
                                    {category.fields.map((field: string, index: number) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center"
                                        >
                                            {editingCategoryFieldsId === category._id ? (
                                                <>

                                                    <input
                                                        type="text"
                                                        className="border border-gray-300 p-2  text-base rounded w-full"
                                                        defaultValue={field}
                                                        onChange={(e) => {
                                                            e.preventDefault()
                                                            handleEditedFieldChange(index, e.target.value);
                                                        }}
                                                    />

                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-full text-base">{field}</span>

                                                    <button
                                                        className="ml-2 text-xl text-red-500"
                                                        onClick={() => startDeletingField(category.category, field)}
                                                    >
                                                       <AiOutlineDelete />
                                                    </button>


                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {editingCategoryFieldsId === category._id ? (
                                        <div className="flex justify-end mt-4">
                                            <button
                                                className="bg-green-500 text-white px-2 py-1  text-sm rounded"
                                                onClick={() => saveFields(category.category, categoryFields)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="bg-gray-500 text-white px-2 py-1 text-sm rounded ml-2"
                                                onClick={cancelFieldsEdit}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {addingNewField === category._id ? (
                                                <div className="flex mt-2  space-x-3 ">
                                                    <input
                                                        type="text"
                                                        className="border border-gray-300 p-1 h-7  rounded"
                                                        value={newField}
                                                        onChange={(e) => setNewField(e.target.value)}
                                                    />
                                                    <button
                                                        className="bg-green-500 text-white px-2 py-1 text-sm rounded"
                                                        onClick={() => addField(category.category)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        className="bg-gray-500 text-white px-2 py-1 text-sm rounded"
                                                        onClick={cancelAddingField}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="my-2 text-sm bg-button-gradient text-white px-3 pr-3 py-3 gap-1 flex justify-center items-center rounded-xl"
                                                    onClick={() => setAddingNewField(category._id)}
                                                >
                                                    <MdAdd /> Add Field
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                            )}
                        </div>

                    )))}

                </div>
            </div>
        </div>

        {
            showDeletePopup && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80">
                    <div className="bg-white p-5 rounded shadow">
                        <h2 className="text-lg  mb-4">
                            Are you sure you want to delete this <span className="font-black">{categoryToDelete}</span> category?
                        </h2>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={deleteCategory}
                            >
                                Delete
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={() => setShowDeletePopup(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )
        }


        {
            fieldToDelete && (
                <div className="fixed inset-0 flex  z-20 items-center justify-center bg-gray-900/50">
                    <div className="bg-white p-5 rounded shadow">
                        <h2 className="text-lg font-semibold mb-4">
                            Are you sure you want to delete this "{fieldToDelete.fieldValue}" field?
                        </h2>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={deleteField}
                            >
                                Delete
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={cancelFieldDeletion}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
    </>



    )
}

const CategoryComponent = () => {
    // const [categoryFields, setCategoryFields] = useState<string[]>([]);
    const [currentFieldName, setCurrentFieldName] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [fields, setFields] = useState<string[]>([]);
    const [fieldToDelete, setFieldToDelete] = useState<{ id: string; categoryName: string } | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [categoryData, setCategoryData] = useState({
        categoryName: '',
        image: '',
        id: '',
    });
const[editformopen,setEditFormOpen]=useState(false);
    useEffect(() => {
        fetchCategory();
    }, []);

    
    const fetchCategory = async () => {
        try {
            const response = await _axios.get("/master/get/category");
            setFields(response.data.data);
        } catch (error) {
            console.error("Error fetching category:", error);
        }
    };
    // const handleFieldChange = (index: number, value: string) => {
    //     setCategoryFields(prevFields => {
    //         const updatedFields = [...prevFields];
    //         updatedFields[index] = value;
    //         return updatedFields;
    //     });
    // };
    const handleEditClick = (category: any) => {
        setCategoryData({
            categoryName: category.categoryName,
            image: category.image ? category.image : null,
            id: category._id,
        });
        setEditFormOpen(true);
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };
    const handleCategoryUpdate = async () => {
        const formData = new FormData();
        formData.append('categoryName', categoryData.categoryName);
        if (image) {
            formData.append('image',image);
        }
        try {
            const response = await _axios.post(`/master/category-update/${categoryData?.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            if (response.data.ok) {
                toast.success("Category updated successfully");
              setEditFormOpen(false);
                setImage(null);
                setCategoryData({
                    categoryName: '',
                    image: '',
                    id: '',
                })
                
fetchCategory();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating banner:", error);
            toast.error("Failed to update banner. Please try again.");
        }
    };

    const handleSave = async () => {
        console.log(currentFieldName,image)
        if (!currentFieldName.trim() || !image) {
            toast.error("Category Name and  Image are mandatory!");
            return;
        }
       
        try {
            const formData = new FormData();
            formData.append('Category', currentFieldName); // Make sure the category is a valid string array
            formData.append('image', image); // Ensure 'image' is the correct key expected by the backend
    
            const response = await _axios.post("/master/add/category", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (response.data.ok) {
                toast.success("Category created successfully");
                fetchCategory();
                setFormOpen(false);
                setCurrentFieldName('');
                setImage(null); // Reset the image after successful save
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error("Failed to save category. Please try again.");
        } 
    };

    const handleDeleteConfirmation = (category: { _id: string, categoryName: string }) => {
        setFieldToDelete({ id: category._id, categoryName: category.categoryName });
    };

    const deleteField = async ({ id, permanent }: { id: string; permanent: boolean }) => {
        if (!fieldToDelete) return;
        try {
            const response = await _axios.delete(`/master/category/${id}`, {
                params: { permanent },
            });
            if (response.data.status===true) {
                toast.success("Category deleted successfully");
                setFieldToDelete(null);
                fetchCategory();

            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error deleting Category:", error);
            toast.error("Failed to delete Category. Please try again.");
        }
    };
    const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
        try {
            // @ts-ignore
            const response = await _axios.delete(`/master/category/${id}`, { active: !currentStatus });
            
            if (response.data.status) {
                toast.success("Category status updated successfully");
                fetchCategory();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating banner status:", error);
            toast.error("Failed to update banner status. Please try again.");
        }
    };
  
    const cancelFieldDeletion = () => {
        setFieldToDelete(null);
    };


    return (
        <>
            <div className="w-full h-full rounded-xl border border-primary/10 shadow">
                <div className="p-5 rounded-xl">
                    <div className="shadow rounded-xl border-primary/20 border mb-4 flex items-center justify-between px-3 py-2">
                        <h1 className="text-lg text-primary font-semibold">Category</h1>
                        <div>
                        <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
                <button
                    className="bg-button-gradient text-sm rounded-xl p-3 px-3 hover:scale-105 duration-300 text-white"
                    onClick={() => {
                        setImage(null);
                        setFormOpen(true);
                    }}
                >
                    Add new
                </button>
            </DialogTrigger>
            <DialogContent className="bg-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-lg text-primary">Add Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                        <Label htmlFor="categoryName" className="text-right text-base text-gray-500">
                            Category Name
                        </Label>
                        <Input
                            id="categoryName"
                            onChange={(e) => setCurrentFieldName(e.target.value)}
                            className="col-span-2 rounded-xl h-10"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                        <Label htmlFor="categoryImage" className="text-right text-base text-gray-500">
                            Category Image
                        </Label>
                        <Input
                            id="categoryImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-base col-span-3"
                        />
                        <div className="col-span-3 justify-center flex items-center gap-4">
                            {image && (
                                <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt="Category Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter className="w-full">
                    <button
                        onClick={() => {
                            setFormOpen(false);
                            setImage(null);
                        }}
                        className="bg-red-500 text-sm p-2 text-white rounded-xl"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="bg-green-700 text-sm p-2 px-3 text-white rounded-xl"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
                        </div>
                    </div>
                    <div className="mt-4">
                    <div className="border rounded-xl p-2 border-primary/10">
                            <table className="min-w-full rounded-xl table-auto border-collapse">
            <thead className="bg-primary/5">
            <tr className="rounded-t-xl ">
                    <th className="px-4 py-4 font-ubuntu text-left text-primary rounded-tl-xl">Category Name</th>
                    <th className="px-4 py-4 font-ubuntu text-center text-primary">Image</th>
                    <th className="px-4 py-4 font-ubuntu text-center text-primary">Active</th>
                    <th className="px-4 py-4 font-ubuntu text-center text-primary rounded-tr-xl">Actions</th>
                </tr>
            </thead>
            <tbody>
                {fields.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="text-center py-2 text-gray-500">
                            No banners available
                        </td>
                    </tr>
                ) : (
                    fields?.map((category:any, index:any) => (
                        <tr key={index} className="border-b">
                            <td className="px-4 py-2 text-gray-700">{category?.categoryName}</td>
                            <td className="px-4 py-2 flex justify-center">
                                <img
                                    src={`${ImgBaseUrl}${category.image}`}
                                    alt={category.categoryName}
                                    className="w-60  h-20 object-contain rounded"
                                />
                            </td>
                            <td className="text-left w-fit">
          <div className="flex items-center gap-5 px-2 justify-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={category.active}
             onChange={() => toggleCategoryStatus(category._id, category.active)}
              />
              <div className="relative w-11 h-6 outline-none bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-indigo-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </td>
                            <td className="px-4 py-2">
                                <section className="flex justify-around">
                                     
                                <button className="text-green-600"  
                                          onClick={() => handleEditClick(category)}
                                >
                                <AiOutlineEdit  className="text-xl" />
                                
                                </button>
                                <button
                                    className="text-red-500"
                                    onClick={()=>{handleDeleteConfirmation(category)}}
                                >
                                    <AiOutlineDelete className="text-xl" />
                                </button>
        
                                </section>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
        
                            </div>
                        </div>
                    </div>
                </div>
                <Dialog open={editformopen} onOpenChange={setEditFormOpen}>
            <DialogContent className="bg-slate-100">
                <DialogHeader>
                    <DialogTitle className="text-lg text-primary">Edit Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                        <Label htmlFor="categoryName" className="text-right text-base text-gray-500">
                            Category Name
                        </Label>
                        <Input
                            id="categoryName"
                            value={categoryData.categoryName}
                            onChange={(e) => setCategoryData((prev) => ({ ...prev, categoryName: e.target.value }))}
                            className="col-span-2 rounded-xl h-10"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                        <Label htmlFor="categoryImage" className="text-right text-base text-gray-500">
                            Category Image
                        </Label>
                        <Input
                            id="categoryImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-base col-span-3"
                        />
                        <div className="col-span-3 justify-center flex items-center gap-4">
                            {image || categoryData.image ? (
                                <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                                    <img
                                        src={image ? URL.createObjectURL(image) : `${ImgBaseUrl}${categoryData.image}`}
                                        alt="Category Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
                <DialogFooter className="w-full">
                    <button
                        onClick={() => {
                            setEditFormOpen(false);
                            setImage(null);
                        }}
                        className="bg-red-500 text-sm p-2 text-white rounded-xl"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="bg-green-700 text-sm p-2 px-3 text-white rounded-xl"
                        onClick={handleCategoryUpdate}
                    >
                        Save Changes
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
            {/* Delete Confirmation Modal */}
            {fieldToDelete && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80">
                    <div className="bg-white p-5 rounded shadow shadow-primary/20">
                        <h2 className="text-lg font-semibold mb-4">
                            Are you sure you want to delete the "{fieldToDelete.categoryName}" category?
                        </h2>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                               onClick={()=>{ deleteField({id:fieldToDelete.id,permanent:true})}}
                            >
                                Delete
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={cancelFieldDeletion}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </>
    );
};

interface Banner {
    _id: string;
    Title: string;
    active:boolean;
    isDeleted:boolean;
    Description: string;
    BannerImage: string;
}
interface DeleteFieldState {
    id:string;
    permanent: boolean;
}

const BannerComponent = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [createFormOpen, setCreateFormOpen] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState<DeleteFieldState | null>(null);
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentEditBanner, setCurrentEditBanner] = useState<Banner | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["Banners"],
        queryFn: () =>
          _axios.get(
            `/banner/all`
          ),
        select(data) {
          return {
            data: data.data,
          };
        },
      });
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        const img = new Image();
        img.src = URL.createObjectURL(file);
    
        img.onload = () => {
            const { width, height } = img;
    
            // Validate width (1024px to 1440px) and height (500px to 600px)
            if (width < 1024 || width > 1440 || height < 500 || height > 700) {
                toast("Image must be between 1024px and 1440px in width and 500px to 700px in height.");
                e.target.value = ""; 
                return;
            }
    
            // If valid, update state
            setBannerImage(file);
            setPreview(URL.createObjectURL(file));
        };
    };
    
    const handleBannerUpdate = async () => {
        if (!currentEditBanner) return;
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (bannerImage) {
            formData.append('BannerImage', bannerImage);
        }
        try {
            const response = await _axios.post(`/banner/update/${currentEditBanner?._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            if (response.data.ok) {
                toast.success("Banner updated successfully");
                setCreateFormOpen(false);
                setTitle('');
                setDescription('');
                setBannerImage(null);
                setPreview(null);
                setEditMode(false);
refetch();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating banner:", error);
            toast.error("Failed to update banner. Please try again.");
        }
    };

    const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
        const banners = data?.data?.banners;
  const activeBanners = banners.filter((banner: any) => banner.active).length;

  if (currentStatus && activeBanners === 1) {
    toast.error("Last active banner cannot be set to inactive.");
    return;
  }
        try {
            // @ts-ignore
            const response = await _axios.delete(`/banner/${id}`, { active: !currentStatus });
            
            if (response.data.status) {
                toast.success("Banner status updated successfully");
                refetch();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating banner status:", error);
            toast.error("Failed to update banner status. Please try again.");
        }
    };
    
    const handleBannerSave = async () => {
        if (!title.trim() || !bannerImage) {
            toast.success("Title and Banner Image are mandatory!");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('BannerImage', bannerImage);

        try {
            const response = await _axios.post("/banner/create", formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.ok) {
                toast.success("Banner created successfully");
                setCreateFormOpen(false);
                setTitle('');
                setDescription('');
                setBannerImage(null);
                setPreview(null);
                setEditMode(false);
                refetch();

            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error saving banner:", error);
            toast.error("Failed to save banner. Please try again.");
        }
    };
    const handleEditClick = (banner: any) => {
        setEditMode(true);
        setCurrentEditBanner(banner);
        setTitle(banner.Title);
        setDescription(banner.Description);
        setPreview(`${ImgBaseUrl}${banner.BannerImage}`);
        setCreateFormOpen(true);
    };
  

    const deleteField = async ({ id, permanent }: { id: string; permanent: boolean }) => {
        if (!fieldToDelete) return;
        const banners = data?.data?.banners;
        const undeletedBanners = banners.filter((banner: any) => !banner.isDeleted).length;
        if (undeletedBanners === 1) {
            toast.error("At least one banner must remain undeleted.");
            return;
        }
        try {
            const response = await _axios.delete(`/banner/${id}`, {
                params: { permanent },
            });
            if (response.data.status===true) {
                toast.success("Banner deleted successfully");
                setFieldToDelete(null);
                refetch();

            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error deleting field:", error);
            toast.error("Failed to delete field. Please try again.");
        }
    };
    const handleDeleteClick = (id: string, permanent: boolean) => {
        setFieldToDelete({ id, permanent });
        deleteField({id:id,permanent:permanent})
      }

    const cancelFieldDeletion = () => {
        setFieldToDelete(null);
    };

    if(isLoading){
        return <div>Loading......</div>
    }

    return (
        <>
            <div className="w-full h-full rounded-xl -mt-10 ">
                <div className=" rounded">
                    <div className=" rounded-xl bg-white   mb-4 flex items-center justify-end px-3 py-2">
                       
                        <div>
                        <button
                                        className="bg-button-gradient text-sm rounded-xl font-medium p-2 px-3 hover:scale-105 duration-300 text-white"
                                        onClick={() => {
                                            if (data?.data?.banners?.length >= 3) {
                                                // Show the toast first
                                                toast.error("Maximum banners limit reached!");
                                                // Don't open the dialog if the limit is reached
                                                return;  // Prevent further execution
                                            } else {
                                                // Only set the form open if the banner limit is not reached
                                                setCreateFormOpen(true);
                                            }
                                        }}
                                    >
                                        Create
                                    </button>
                        <Dialog open={createFormOpen} onOpenChange={(open) => {
                setCreateFormOpen(open);
                if (!open) {
                    setPreview(null);
                    setTitle('');
                    setDescription('');
                    setBannerImage(null);
                    setEditMode(false);
                }
            }}>
                                <DialogContent className="bg-white p-6 rounded-lg shadow-lg shadow-primary/20">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-ubuntu text-primary">
                    Create New Banner
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                {/* Title */}
                <div className="grid gap-2">
                    <label className="text-base font-medium text-primaryDark">Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-300 focus:outline-none text-base shadow-sm"
                        placeholder="Enter title"
                        required
                    />
                </div>
                {/* Description */}
                <div className="grid gap-2">
                    <label className="text-base font-medium text-primaryDark">
                        Description (Optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-300 focus:outline-none text-base shadow-sm resize-none"
                        placeholder="Enter description"
                        rows={3}
                    />
                </div>
                {/* Banner Image Upload */}
                <div className="grid gap-2">
                    <label className="text-base font-medium text-primaryDark">Banner Image</label>
                    <div className="flex items-center gap-4">
                        <div
                            className="border border-dashed rounded-xl border-gray-300 p-9 flex flex-col items-center justify-center w-fit cursor-pointer"
                            onClick={triggerFileInput}
                        >
                            <Upload className="text-gray-400 h-8 w-8" />
                           
                        </div>
                        {preview && (
                            <div className="w-60 h-28">
                                <img
                                    src={preview}
                                    alt="Uploaded Preview"
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            </div>
            <DialogFooter className="w-full flex justify-end gap-4">
                <button
                    onClick={() => setCreateFormOpen(false)}
                    className="bg-red-500 text-base font-medium px-4 py-2 text-white rounded-xl shadow hover:bg-red-600 focus:ring focus:ring-red-300 focus:outline-none transition-all"
                >
                    Cancel
                </button>
                <button
    type="button"
    className="bg-green-700 font-medium text-base px-4 py-2 text-white rounded-xl shadow hover:bg-green-600 focus:ring focus:ring-green-300 focus:outline-none transition-all"
    onClick={editMode ? handleBannerUpdate : handleBannerSave}
>
    {editMode ? "Update Banner" : "Save Banner"}
</button>

            </DialogFooter>
        </DialogContent>


                            </Dialog>
                        </div>
                    </div>
                    <div className="border rounded-xl p-2 border-primary/10">
                    <table className="min-w-full rounded-xl table-auto border-collapse">
    <thead className="bg-primary/5">
    <tr className="rounded-t-xl ">
            <th className="px-4 py-4 font-ubuntu text-left text-primary rounded-tl-xl">Title</th>
            <th className="px-4 py-4 font-ubuntu text-left text-primary">Description</th>
            <th className="px-4 py-4 font-ubuntu text-center text-primary">Banner Image</th>
            <th className="px-4 py-4 font-ubuntu text-center text-primary">Active</th>
            <th className="px-4 py-4 font-ubuntu text-center text-primary rounded-tr-xl">Actions</th>
        </tr>
    </thead>
    <tbody>
        {data?.data?.banners?.length === 0 ? (
            <tr>
                <td colSpan={4} className="text-center py-2 text-gray-500">
                    No banners available
                </td>
            </tr>
        ) : (
            data?.data?.banners?.map((banner:any, index:any) => (
                <tr key={index} className="border-b">
                    <td className="px-4 py-2 text-gray-700">{banner?.Title}</td>
                    <td className="px-4 py-2 text-gray-700 max-w-xs overflow-x-auto">
                        <div className="line-clamp-2">{banner?.Description || "No description"}</div>
                    </td>
                    <td className="px-4 py-2 flex justify-center">
                        <img
                            src={`${ImgBaseUrl}${banner.BannerImage}`}
                            alt={banner.Title}
                            className="w-60  h-20 object-contain rounded"
                        />
                    </td>
                    <td className="text-left w-fit">
  <div className="flex items-center gap-5 px-2 justify-center">
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={banner.active}
        onChange={() => toggleBannerStatus(banner._id, banner.active)}
      />
      <div className="relative w-11 h-6 outline-none bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-indigo-100 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
    </label>
  </div>
</td>
                    <td className="px-4 py-2">
                        <section className="flex justify-around">
                             
                        <button className="text-green-600"  onClick={() => handleEditClick(banner)}>
                        <AiOutlineEdit  className="text-xl" />
                        
                        </button>
                        <button
                            className="text-red-500"
                            onClick={() => handleDeleteClick(banner._id, true)}
                        >
                            <AiOutlineDelete className="text-xl" />
                        </button>

                        </section>
                    </td>
                </tr>
            ))
        )}
    </tbody>
</table>

                    </div>
                </div>
            </div>

            {fieldToDelete && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80">
                    <div className="bg-white p-5 rounded shadow">
                        <h2 className="text-lg font-semibold mb-4">
                            Are you sure you want to delete the category?
                        </h2>
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded"
                                onClick={()=>{deleteField({ id:fieldToDelete?.id, permanent: fieldToDelete?.permanent })}}
                            >
                                Delete
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={cancelFieldDeletion}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};




