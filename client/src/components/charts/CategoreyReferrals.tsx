// components/PropertyReferrals.tsx (or wherever it is)

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface CategoryStat {
  title: string;
  count: number;
  percentage: number;
  color: string;
}

interface ProgressBarProps {
  title: string;
  count: number;
  percentage: number;
  color: string;
}

const ProgressBar = ({ title, count, percentage, color }: ProgressBarProps) => (
  <Box width="100%">
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography fontSize={16} fontWeight={500} color="#11142d">
        {title}
      </Typography>
      <Typography fontSize={16} fontWeight={500} color="#11142d">
        {count} images ({percentage}%)
      </Typography>
    </Stack>
    <Box
      mt={2}
      position="relative"
      width="100%"
      height="8px"
      borderRadius={1}
      bgcolor="#e4e8ef"
    >
      <Box
        width={`${percentage}%`}
        bgcolor={color}
        position="absolute"
        height="100%"
        borderRadius={1}
      />
    </Box>
  </Box>
);

interface PropertyReferralsProps {
  categories: CategoryStat[];
}

const CategoreyReferrals: React.FC<PropertyReferralsProps> = ({ categories }) => {
  // Assign nice colors to each category
  const colors = ["#275be8", "#c4e8ef", "#d4af37", "#f4a261", "#e67e22", "#f44336", "#9c27b0"];

  return (
    <Box
      p={4}
      bgcolor="#fcfcfc"
      id="chart"
      minWidth={490}
      display="flex"
      flexDirection="column"
      borderRadius="15px"
    >
      <Typography fontSize={18} fontWeight={600} color="#11142d">
        Images by Category
      </Typography>

      <Stack my="20px" direction="column" gap={4}>
        {categories.length === 0 ? (
          <Typography color="#808191">No images found in any category</Typography>
        ) : (
          categories.map((cat, index) => (
            <ProgressBar
              key={cat.title}
              title={cat.title}
              count={cat.count}
              percentage={cat.percentage}
              color={colors[index % colors.length]}
            />
          ))
        )}
      </Stack>

      {categories.length > 0 && (
        <Typography fontSize={14} color="#808191" textAlign="center">
          Total Images: {categories.reduce((sum, c) => sum + c.count, 0)}
        </Typography>
      )}
    </Box>
  );
};

export default CategoreyReferrals;