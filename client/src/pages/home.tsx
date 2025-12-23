import { useList } from "@refinedev/core";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import {
  PieChart,
  CategoreyReferrals,
} from "components";
import ProjectCard from "components/common/ProjectCard";

const Home = () => {
  // Latest 4 projects
  const { data, isLoading, isError } = useList({
    resource: "projects",
    config: { pagination: { pageSize: 4 } },
  });

  // All projects for stats
  const { data: allProjects } = useList({ resource: "projects" });

  const latestProjects = data?.data ?? [];
  const projects = allProjects?.data ?? [];

  const maxProjects = 100;
  const totalProjects = projects.length;

  // --- Calculate total images per category ---
  const categoryImageCounts = projects.reduce((acc: Record<string, number>, project) => {
    const category = project.category || "Uncategorized";

    const images: string[] = [];

    if (Array.isArray(project.images?.projectImages)) images.push(...project.images.projectImages);

    if (images.length > 0) {
      acc[category] = (acc[category] || 0) + images.length;
    }

    return acc;
  }, {});

  const totalImages = Object.values(categoryImageCounts).reduce((sum, count) => sum + count, 0);

  const categoryStats = Object.entries(categoryImageCounts)
    .map(([title, count]) => ({
      title,
      count,
      percentage: totalImages > 0 ? Math.round((count / totalImages) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

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
          value={totalProjects}
          series={[totalProjects, maxProjects - totalProjects]}
          colors={["#d4af37", "#9be1efff"]}
        />
      </Box>

     <Stack
        mt="25px"
        direction={{ xs: "column", lg: "row" }}
        gap={4}
        alignItems="stretch"
      >
  
        <Box
          flex={2}
          borderRadius="15px"
          padding="20px"
          bgcolor="#fcfcfc"
          display="flex"
          flexDirection="column"
        >
          <Typography fontSize="18px" fontWeight={600} color="#11142d">
            Latest Projects
          </Typography>

          <Box mt={2.5} sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {latestProjects.map((project) => (
              <ProjectCard
                key={project._id}
                id={project._id}
                name={project.name}
                backgroundImage={project.images?.projectImages}
                category={project.category}
              />
            ))}
          </Box>
        </Box>

  {categoryStats.length > 0 && (
    <Box flex={1}>
      <CategoreyReferrals
        categories={categoryStats.map((stat) => ({
          ...stat,
          color: "",
        }))}
      />
    </Box>
  )}
</Stack>

    </Box>
  );
};

export default Home;
