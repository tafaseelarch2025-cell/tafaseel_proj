import { useList } from "@refinedev/core";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import {
  PieChart,
} from "components";
import ProjectCard from "components/common/ProjectCard";

const Home = () => {
  const { data, isLoading, isError } = useList({
    resource: "projects",
    config: {
      pagination: {
        pageSize: 4,
      },
    },
  });

  

  const { data : allProjects } = useList({
    resource: "projects",
  });



  const latestProjects = data?.data ?? [];

  const projects = allProjects?.data ?? [];


   const maxProjects = 100;

  const totalProjects = projects.length;
  const projectPercentage = Math.round((totalProjects / maxProjects) * 100);


  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Something went wrong!</Typography>;

  return (
    <Box>
      <Typography fontSize={25} fontWeight={700} color="#11142D">
        Dashboard
      </Typography>

      <Box mt="20px" display="flex" flexWrap="wrap" gap={4}>
        <PieChart
          title="Projects"
          value={projects.length}
          series={[totalProjects, maxProjects - totalProjects]}
          colors={["#dc743c", "#c4e8ef"]}
        />
       
     
      
      </Box>

      <Stack
        mt="25px"
        width="100%"
        direction={{ xs: "column", lg: "row" }}
        gap={4}
      >
      </Stack>

      <Box
        flex={1}
        borderRadius="15px"
        padding="20px"
        bgcolor="#fcfcfc"
        display="flex"
        flexDirection="column"
        minWidth="100%"
        mt="25px"
      >
        <Typography fontSize="18px" fontWeight={600} color="#11142d">
          Latest Projects
        </Typography>

        <Box mt={2.5} sx={{ display : "flex", flexWrap: "wrap", gap: 4 }}>
          {latestProjects.map((project) => (
            <ProjectCard
              key={project._id}
              id={project._id}
              name={project.name}
           
              backgroundImage={project.images.backgroundImage}
              category={project.category}
            />
          ))}
        </Box>

        
      </Box>
    </Box>
  );
};

export default Home;
