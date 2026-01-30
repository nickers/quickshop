@echo off

docker-compose up -d

echo.
echo "in the container run 'gemini'"
echo.

docker-compose exec gemini-cli-dotnet /bin/bash