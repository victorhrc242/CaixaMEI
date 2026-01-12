FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ApiConnection.csproj ./
COPY Models/Models.csproj Models/

RUN dotnet restore ApiConnection.csproj

COPY . .
RUN dotnet publish ApiConnection.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ApiConnection.dll"]
