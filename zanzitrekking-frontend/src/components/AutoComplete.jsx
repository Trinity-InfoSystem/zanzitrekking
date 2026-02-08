import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";

const AutoComplete = ({ categories }) => {
  return (
    <div>
      <Autocomplete
        sx={{
          width: "100%",
          paddingLeft: "140px", // Default padding
          "@media (max-width: 991px)": {
            paddingLeft: "0px", // Padding for smaller screens
          },
        }}
        disablePortal
        options={categories}
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ padding: 0 }}>
            <Link
              className="text-md flex h-full w-full items-center"
              to={`/products?category=${option.name}`}
              style={{
                textDecoration: "none", // Remove default link underline
                color: "inherit", // Inherit the text color
                display: "flex",
                alignItems: "center",
                padding: "8px 14px", // Match the padding of the Box
              }}
            >
              <img
                src={option.image}
                alt=""
                width="30"
                height="30"
                className="mr-2"
              />
              {option.name}
            </Link>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={
              <div className="">
                <span>All Trips Destinations</span>
              </div>
            }
            fullWidth
            sx={{
              position: "relative", // Ensure proper positioning
              "& .MuiInputBase-root": {
                height: "49px", // Set the height of the input
                padding: "0 14px", // Adjust padding for proper text alignment
              },
              "& .MuiInputLabel-root": {
                color: "#059473", // Initial label color
                position: "absolute",
                top: "50%",
                left: "14px", // Adjusted to prevent overlap with the border
                transform: "translateY(-50%)", // Center the label vertically
                transition: "all 0.3s ease", // Smooth transition
                pointerEvents: "none", // Ensure the label doesn’t capture mouse events
              },
              "& .MuiInputLabel-shrink": {
                top: "0",
                left: "14px", // Keep the label aligned with the border
                transform: "translateY(-50%) scale(0.75)", // Move the label to top-left and shrink it
                color: "#059473 !important", // Keep the color consistent when focused
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#e5e7eb", // Default border color
                  borderRadius: "0px",
                },
                "&:hover fieldset": {
                  borderColor: "#e5e7eb", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#e5e7eb", // Keep the border color the same when focused
                  borderWidth: "1px", // Ensure the border width stays the same (you can adjust this as needed)
                },
              },
              "&.Mui-focused": {
                outline: "none", // Remove any default outline effect
              },
            }}
          />
        )}
      />
    </div>
  );
};

export default AutoComplete;
