# =========================
# BUILD
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia tudo do backend
COPY . .

# Restore
RUN dotnet restore ApiConnection.csproj

# Publish
RUN dotnet publish ApiConnection.csproj -c Release -o /app/publish

# =========================
# RUNTIME
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# 🔥 VARIÁVEIS CRÍTICAS PARA O RENDER
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

# Copia o build
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "ApiConnection.dll"]
