# =========================
# BUILD
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia tudo
COPY . .

# Entra na pasta do projeto principal
WORKDIR /src/ApiConnection

# Restore
RUN dotnet restore ApiConnection.csproj

# Publish
RUN dotnet publish ApiConnection.csproj -c Release -o /app/publish

# =========================
# RUNTIME
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "ApiConnection.dll"]
