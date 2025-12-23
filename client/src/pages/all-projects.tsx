import Add from "@mui/icons-material/Add";
import { useTable } from "@refinedev/core";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { CustomButton } from "components";
import ProjectCard from "components/common/ProjectCard";


const AllProjects = () => {
  const navigate = useNavigate();

  

  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    setPageSize,
    pageCount,
    sorter,
    setSorter,
    filters,
    setFilters,
  } = useTable();

  const allProjects = data?.data ?? [];



  const currentFilterValues = useMemo(() => {
    const logicalFilters = filters.flatMap((item) =>
      "field" in item ? item : [],
    );

    return {
      name: logicalFilters.find((item) => item.field === "name")?.value || "",
      category:
        logicalFilters.find((item) => item.field === "category")?.value ||
        "",
    };
  }, [filters]);

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error...</Typography>;

  return (
    <Box position="relative" padding="20px">
      <Typography fontSize={25} fontWeight={700} color="#11142d" mb={3}>
        {!allProjects.length ? "There are no projects" : "All Projects"}
      </Typography>

      <Box
        mb={2}
        display="flex"
        width="100%"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          mb={{ xs: "20px", sm: 0 }}
          width="100%"
        >
         
          <TextField
            variant="outlined"
            color="info"
            placeholder="Search by name"
            value={currentFilterValues.name}
            onChange={(e) => {
              setFilters([
                {
                  field: "name",
                  operator: "contains",
                  value: e.currentTarget.value
                    ? e.currentTarget.value
                    : undefined,
                },
              ]);
            }}
            sx={{ flex: 1, maxWidth: "300px" }}
          />
          <Select
            variant="outlined"
            color="info"
            displayEmpty
            required
            inputProps={{ "aria-label": "Without label" }}
            defaultValue=""
            value={currentFilterValues.category}
            onChange={(e) => {
              setFilters(
                [
                  {
                    field: "category",
                    operator: "eq",
                    value: e.target.value,
                  },
                ],
                "replace",
              );
            }}
            sx={{ flex: 1, maxWidth: "200px" }}
          >
            <MenuItem value="">All</MenuItem>
            {[
             "Living Room",
              "Landscape",
             "Entrance",
              "Kids Bedrooms",
              "Dress Room",
              "Dining Room",
              "Commercial Design",
              "Bed Room",
              "Bathroom",
              "Architecture",
              "Landscape and Gardens",
            ].map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Box position="absolute" top="20px" right="20px" zIndex={1000}>
        <CustomButton
          title="Add Project"
          handleClick={() => navigate("/projects/create")}
          backgroundColor="#d4af37"
          color="#fcfcfc"
          icon={<Add />}
        />
      </Box>

      <Box mt="40px" sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {allProjects?.map((project) => (
          <ProjectCard
            key={project._id}
            id={project._id}
            name={project.name}
            backgroundImage={project.images.projectImages}
          />
        ))}
      </Box>
      

      {allProjects.length > 0 && (
        <Box display="flex" gap={2} mt={3} flexWrap="wrap">
          <CustomButton
            title="Previous"
            handleClick={() => setCurrent((prev) => prev - 1)}
            backgroundColor="#d4af37"
            color="#fcfcfc"
            disabled={!(current > 1)}
          />
          <Box
            display={{ xs: "hidden", sm: "flex" }}
            alignItems="center"
            gap="5px"
          >
            Page{" "}
            <strong>
              {current} of {pageCount}
            </strong>
          </Box>
          <CustomButton
            title="Next"
            handleClick={() => setCurrent((prev) => prev + 1)}
            backgroundColor="#d4af37"
            color="#ffffff"
            disabled={current === pageCount}
          />
          <Select
            variant="outlined"
            color="info"
            displayEmpty
            required
            inputProps={{ "aria-label": "Without label" }}
            defaultValue={10}
            onChange={(e) =>
              setPageSize(e.target.value ? Number(e.target.value) : 10)
            }
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <MenuItem key={size} value={size}>
                Show {size}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
    </Box>
  );
};

export default AllProjects;
