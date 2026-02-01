// CreateProject.tsx - FIXED & WORKING
import { useState } from "react";
import { useGetIdentity, useCreate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import Form from "components/common/Form";

interface ImageItem {
  name: string;
  url: string;
}

const CreateProject = () => {

  const [name, setName] = useState("");
const [category, setCategory] = useState("");
const [isFeatured, setIsFeatured] = useState(false);

  const navigate = useNavigate();
const { data: user } = useGetIdentity<{ id: string; email: string; name: string; }>();


console.log(user?.email);
  const { mutate, isLoading } = useCreate();


  const [projectImages, setProjectImages] = useState<{
    projectImages: ImageItem[];
  //  backgroundImage: ImageItem;
  }>({
    projectImages: [],
 //   backgroundImage: { name: "", url: "" },
  });

  const handleImageChange = async (
  files: FileList | null,
  type: "projectImages" 
) => {
  if (!files?.length) return;

  const fileArray = Array.from(files);

  // Resize function using Canvas
  const resizeImage = (file: File, maxSize = 1200) =>
    new Promise<{ name: string; url: string }>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // scale dimensions
          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > width && height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx!.drawImage(img, 0, 0, width, height);

          // 0.9 quality JPEG
          const url = canvas.toDataURL("image/jpeg", 0.9);
          resolve({ name: file.name, url });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  /* if (type === "backgroundImage") {
    const resized = await resizeImage(fileArray[0]);
    setProjectImages((prev) => ({
      ...prev,
      backgroundImage: resized,
    }));
  } else { */
    const resizedImages = await Promise.all(fileArray.map(file => resizeImage(file)));
    setProjectImages((prev) => ({
      ...prev,
      projectImages: [...prev.projectImages, ...resizedImages],
    }));
  // }
};


  const handleImageRemove = (index: number, type: "projectImages") => {
    /* if (type === "backgroundImage") {
      setProjectImages(prev => ({ ...prev, backgroundImage: { name: "", url: "" } }));
    } else { */
      setProjectImages(prev => ({
        ...prev,
        projectImages: prev.projectImages.filter((_, i) => i !== index),
      }));
   // }
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!user || !user?.email) {
    alert("User email is missing. Please login.");
    return;
  }

  const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement)?.value;
  const category = (e.currentTarget.elements.namedItem("category") as HTMLInputElement)?.value;

  if (!name || !category) {
    alert("Please fill name and category");
    return;
  }

  if (projectImages.projectImages.length === 0 ) {
    alert("Please upload at least one project image and background image");
    return;
  }

  // Prepare payload
  const payload = {
    name,
    category,
    email: user.email,
    images: {
      projectImages: projectImages.projectImages.map(img => img.url),
      // backgroundImage: projectImages.backgroundImage.url,
    },
    isFeatured,
  };

  mutate(
    {
      resource: "projects",
      values: payload,
    },
    {
      onSuccess: () => {
        alert("Project created successfully!");
        navigate("/projects");
      },
      onError: (error) => {
        console.error(error);
        alert("Failed to create project");
      },
    }
  );
};

// Inside your component, define this:
const nameInput = (document.getElementsByName("name")[0] as HTMLInputElement)?.value || "";
const categoryInput = (document.getElementsByName("category")[0] as HTMLInputElement)?.value || "";
const isSubmitDisabled =

  !nameInput ||
  !categoryInput ||
  projectImages.projectImages.length === 0 ;
  //|| !projectImages.backgroundImage.url;


  return (
    <Form
      type="Create"
      formLoading={isLoading}
      handleImageChange={handleImageChange}
      handleImageRemove={handleImageRemove}
      projectImages={projectImages}
      handleSubmit={handleSubmit} // ← Now we control submit manually
      // Remove register, onFinish, control, etc.
      isSubmitDisabled={isSubmitDisabled}
      name={name}
      setName={setName}
      category={category}
      setCategory={setCategory}
      isFeatured={isFeatured}          // ← pass
      setIsFeatured={setIsFeatured}
      
    />
  );
};

export default CreateProject;