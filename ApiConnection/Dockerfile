FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ApiConnection.csproj ./
COPY ../Models/Models.csproj ../Models/

RUN dotnet restore ApiConnection.csproj

COPY . .
RUN dotnet publish ApiConnection.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ApiConnection.dll"]
