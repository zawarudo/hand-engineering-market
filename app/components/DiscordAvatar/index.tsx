import { styled } from "~/styles/stitches.config";

const DiscordAvatar = styled("img", {
  width: "$3",
  height: "$3",
  borderRadius: "50%",
  border: "2px solid $neutral500",
  margin: "$3 $3 $3 0",
  alignSelf: "center",
});

export default DiscordAvatar;
