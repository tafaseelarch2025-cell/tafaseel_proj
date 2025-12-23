import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";

import CustomButton from "./CustomButton";

interface ImageItem {
  name: string;
  url: string;
}

interface FormProps {
  type: string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formLoading: boolean;

  // handleImageChange: (files: FileList | null, type: "projectImages" | "backgroundImage") => void;
  // handleImageRemove: (index: number, type: "projectImages" | "backgroundImage") => void;
   handleImageChange: (files: FileList | null, type: "projectImages") => void;
  handleImageRemove: (index: number, type: "projectImages") => void;

  projectImages: {
    projectImages: ImageItem[];
    // backgroundImage: ImageItem;
  };

  name: string;
  setName:(v: string) => void;
  category: string;
  setCategory: (v: string) => void;

  isSubmitDisabled: boolean;
}

const Form = ({
  type,
  handleSubmit,
  formLoading,
  handleImageChange,
  handleImageRemove,
  projectImages,
  name,
  category,
  setCategory,
  setName,
  isSubmitDisabled,
}: FormProps) => {
  return (
    <Box marginLeft="60px">
      <Typography fontSize={25} fontWeight={700}>
        {type} a Design
      </Typography>

      <Box mt={2.5} borderRadius="15px" padding="20px" bgcolor="#fcfcfc">
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Design Name */}
          <FormControl>
            <FormHelperText sx={{ margin: "10px 0", fontSize: 16 }}>Enter design name</FormHelperText>
            <TextField fullWidth required name="name" value={name ?? ""} variant="outlined" onChange={(e) => setName && setName(e.target.value)} />
          </FormControl>

          {/* Category Select */}
          <FormControl>
            <FormHelperText sx={{ margin: "10px 0", fontSize: 16 }}>Select Category</FormHelperText>
            <Select name="category" value={category ?? ""} onChange={(e) => setCategory && setCategory(e.target.value)}>
              <MenuItem value="" disabled>
                Choose category
              </MenuItem>
              <MenuItem value="Living Room">Living Room</MenuItem>
              <MenuItem value="Landscape">Landscape</MenuItem>
              <MenuItem value="Entrance">Entrance</MenuItem>
              <MenuItem value="Kids Bedrooms">Kids Bedrooms</MenuItem>
              <MenuItem value="Dress Room">Dress Room</MenuItem>
              <MenuItem value="Dining Room">Dining Room</MenuItem>
              <MenuItem value="Commercial Design">Commercial Design</MenuItem>
              <MenuItem value="Bed Room">Bed Room</MenuItem>
              <MenuItem value="Bathroom">Bathroom</MenuItem>
              <MenuItem value="Architecture">Architecture</MenuItem>
              <MenuItem value="Landscape and Gardens">Landscape and Gardens</MenuItem>
            </Select>
          </FormControl>

          {/* Project Images */}
          <Stack direction="column" gap={2}>
            <Box sx={{ display: "flex", overflowX: "auto", gap: 2, pb: 1 }}>
              {projectImages.projectImages.map((img, index) => (
                <Stack key={index} alignItems="center">
                  <img src={img.url} width={200} height={200} style={{ borderRadius: 8 }} />
                  <IconButton onClick={() => handleImageRemove(index, "projectImages")} size="small">
                    <CancelIcon />
                  </IconButton>
                </Stack>
              ))}
            </Box>

            <Button component="label" variant="outlined">
              Upload Project Images *
              <input type="file" hidden multiple accept="image/*" onChange={(e) => handleImageChange(e.target.files, "projectImages")} />
            </Button>
          </Stack>

          {/* Background Image */}
          {/* <Stack direction="column" gap={2}>
            {projectImages.backgroundImage.url && (
              <Box position="relative">
                <img src={projectImages.backgroundImage.url} width={200} height={200} style={{ borderRadius: 8 }} />
                <IconButton
                  onClick={() => handleImageRemove(0, "backgroundImage")}
                  size="small"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  <CancelIcon />
                </IconButton>
              </Box>
            )}

            <Button component="label" variant="outlined">
              Upload Background Image *
              <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(e.target.files, "backgroundImage")} />
            </Button>
          </Stack> */}

          <CustomButton
            type="submit"
            title={formLoading ? "Submitting..." : "Submit"}
            backgroundColor="#d4af37"
            color="#fff"
            disabled={isSubmitDisabled}
          />
        </form>
      </Box>
    </Box>
  );
};

export default Form;
