# use dotnet+nodejs image
# https://github.com/DotNet-Docker-Images/dotnet-nodejs-docker?tab=readme-ov-file
FROM dotnetimages/microsoft-dotnet-core-sdk-nodejs:9.0_24.x

# Set working directory
WORKDIR /app

# Install gemini-cli globally
RUN npm install -g @google/gemini-cli

# Default command (interactive shell)
CMD [ "bash" ]