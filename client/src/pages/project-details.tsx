import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Modal from "@mui/material/Modal";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useDelete, useGetIdentity, useShow } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import ChatBubble from "@mui/icons-material/ChatBubble";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import Phone from "@mui/icons-material/Phone";
import Place from "@mui/icons-material/Place";

import { CustomButton } from "components";

// Function to check if an image URL is valid
function checkImage(url: string) {
  const img = new Image();
  img.src = url;
  return img.width > 0 && img.height > 0;
}

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity({ v3LegacyAuthProviderCompatible: true });
  const { query: queryResult } = useShow();
  const { mutate } = useDelete();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = queryResult;
  const projectDetails = data?.data ?? {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Something went wrong!</div>;

  // const isCurrentUser = user?.email === projectDetails.creator?.email;

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      mutate(
        { resource: "projects", id: id as string },
        {
          onSuccess: () => navigate("/projects"),
        }
      );
    }
  };

  const handleOpenModal = () => {
    const allImages = projectDetails.images || [];
    const mainAndSmallImages = allImages.slice(0, 4);
    const moreImages = allImages.slice(4);
    setAdditionalImages(moreImages);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const renderImages = (images: string[]) => {
    if (!images || images.length === 0) return null;
    const mainImage = images[0];
    const smallImages = images.slice(1, 4);
    const hasMoreImages = images.length > 4;

    return (
      <Box>
        <img
          src={mainImage}
          alt="project_main_img"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "10px",
            objectFit: "cover",
          }}
        />
        <Stack direction="row" spacing={2} mt={2} alignItems="center">
          {smallImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`project_img_${index}`}
              style={{
                width: "30%",
                height: "auto",
                borderRadius: "10px",
                objectFit: "cover",
              }}
            />
          ))}
         
        </Stack>
      </Box>
    );
  };

  return (
    <Box
      borderRadius="15px"
      padding="20px"
      bgcolor="#FCFCFC"
      width="fit-content"
    >
      <Typography fontSize={25} fontWeight={700} color="#11142D">
        Project Details
      </Typography>

      <Box mt="20px" display="flex" flexDirection={{ xs: "column", lg: "row" }} gap={4}>
        <Box flex={1} maxWidth={764}>
          {renderImages(projectDetails.images.projectImages || [])}

          <Stack mt="15px" spacing={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
            

             
              {projectDetails.images && projectDetails.images.length > 4 && (
                <CustomButton
                  title="More Images"
                  backgroundColor="#475BE8"
                  color="#FCFCFC"
                  handleClick={handleOpenModal}
                />
              )}
            </Stack>
            <Typography fontSize={18} fontWeight={700} color="#11142D">
                  {projectDetails.name}
                </Typography>

            <Grid container spacing={3}>
           
              <Grid item xs={12} sm={6}>
                <Typography fontSize={16} fontWeight={600} color="#11142D">
                  Design Category
                </Typography>
                <Typography fontSize={18} fontWeight={700} color="#dc743c">
                  {projectDetails.category}
                </Typography>
              </Grid>
            
           
    
            </Grid>

          </Stack>
        </Box>

        <Box width="100%" flex={1} maxWidth={326} display="flex" flexDirection="column" gap="20px">
          <Stack
            width="100%"
            p={2}
            direction="column"
            justifyContent="center"
            alignItems="center"
            border="1px solid #E4E4E4"
            borderRadius={2}
          >
           

            <Stack width="100%" mt="25px" direction="row" flexWrap="wrap" gap={2}>
              <CustomButton
                title={ "Edit"}
                backgroundColor="#475BE8"
                color="#FCFCFC"
                fullWidth
                icon={ <Edit />}
                handleClick={() => {
                
                    navigate(`/projects/edit/${projectDetails._id}`);
                  
                }}
              />
              <CustomButton
                title={ "Delete"}
                backgroundColor={ "#d42e2e"}
                color="#FCFCFC"
                fullWidth
                icon={ <Delete />}
                handleClick={() => {
                   handleDeleteProject();
                }}
              />
            </Stack>
          </Stack>
          
        </Box>
      </Box>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: "90%",
            maxHeight: "80%",
            overflowY: "auto",
          }}
        >
          <Typography fontSize={20} fontWeight={600} color="#11142D" mb={2}>
            Additional Images
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {additionalImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`additional_img_${index}`}
                style={{
                  width: "30%",
                  height: "auto",
                  borderRadius: "10px",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />
            ))}
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProjectDetails;
