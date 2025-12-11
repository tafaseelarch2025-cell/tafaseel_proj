import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetIdentity, useOne, useUpdate } from "@refinedev/core";

import Form from "components/common/Form";

interface ImageItem {
  name: string;
  url: string;
}

const EditProject = () => {
  const navigate = useNavigate();

  const { data: user } = useGetIdentity<{ email: string }>();
const params = useParams();
const id = params?.id;

const { data, isLoading } = useGetDesignById(id as string);


  const { data: projectData, isLoading: projectLoading } = useOne({
    resource: "projects",
    id: id!,
  });

  const { mutate: updateProject, isLoading: updateLoading } = useUpdate();

  const project = projectData?.data;

 function useGetDesignById(id: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/projects/${id}`);
        if (!res.ok) throw new Error("Project not found");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, isLoading };
}



  const [projectImages, setProjectImages] = useState<{
    projectImages: ImageItem[];
    backgroundImage: ImageItem;
  }>({
    projectImages: [],
    backgroundImage: { name: "", url: "" },
  });
  const [category, setcategory] = useState<string>('');
  const [name, setName] = useState("");

  // Load existing project images into state
  useEffect(() => {
    if (project) {
      setProjectImages({
        projectImages: project.images?.projectImages?.map((url: string) => ({
          name: url.split("/").pop()?.split(".")[0] || "image",
          url,
        })) || [],
        backgroundImage: project.images?.backgroundImage
          ? {
              name: "background",
              url: project.images.backgroundImage,
            }
          : { name: "", url: "" },
      });
      setcategory(project?.category );
      setName(project?.name)
    }
  }, [project]);

  // Handle new image uploads (converted to base64)
  const handleImageChange = async (
    files: FileList | null,
    type: "projectImages" | "backgroundImage"
  ) => {
    if (!files || files.length === 0) return;

    const readFile = (file: File): Promise<string> =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

    if (type === "backgroundImage") {
      const file = files[0];
      const url = await readFile(file);

      setProjectImages((prev) => ({
        ...prev,
        backgroundImage: { name: file.name, url },
      }));
    } else {
      const newImgs = await Promise.all(
        Array.from(files).map(async (file) => ({
          name: file.name,
          url: await readFile(file),
        }))
      );

      setProjectImages((prev) => ({
        ...prev,
        projectImages: [...prev.projectImages, ...newImgs],
      }));
    }
  };

  // Remove Image
  const handleImageRemove = (
    index: number,
    type: "projectImages" | "backgroundImage"
  ) => {
    if (type === "backgroundImage") {
      setProjectImages((prev) => ({
        ...prev,
        backgroundImage: { name: "", url: "" },
      }));
    } else {
      setProjectImages((prev) => ({
        ...prev,
        projectImages: prev.projectImages.filter((_, i) => i !== index),
      }));
    }
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement)?.value;
    const category = (e.currentTarget.elements.namedItem("category") as HTMLInputElement)?.value;

    if (!name || !category) {
      alert("Please fill name and category");
      return;
    }

    if (projectImages.projectImages.length === 0 || !projectImages.backgroundImage.url) {
      alert("Please upload at least one project image and background image");
      return;
    }

    updateProject(
      {
        resource: "projects",
        id,
        values: {
          name,
          category,
          projectImages: projectImages.projectImages.map((img) => img.url),
          backgroundImage: projectImages.backgroundImage.url,
          email: user?.email,
        },
      },
      {
        onSuccess: () => {
          alert("Project updated successfully!");
          navigate("/projects");
        },
        onError: (error) => {
          console.error(error);
          alert("Failed to update project");
        },
      }
    );
  };

  // Disable Button Condition
  const nameInput = (document.getElementsByName("name")[0] as HTMLInputElement)?.value || "";
  const categoryInput =
    (document.getElementsByName("category")[0] as HTMLInputElement)?.value || "";

  const isSubmitDisabled =
    !nameInput ||
    !categoryInput ||
    projectImages.projectImages.length === 0 ||
    !projectImages.backgroundImage.url;

  return (
    <Form
      type="Edit"
      handleSubmit={handleSubmit}
      formLoading={updateLoading}
      handleImageChange={handleImageChange}
      handleImageRemove={handleImageRemove}
      projectImages={projectImages}
      isSubmitDisabled={false}
name={name}
setName={setName}
category={category}
setCategory={setcategory}


     
    />
  );
};

export default EditProject;

