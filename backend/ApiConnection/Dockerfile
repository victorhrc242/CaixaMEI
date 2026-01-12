# ===== BUILD =====
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia os projetos (paths RELATIVOS AO CONTEXTO)
COPY ApiConnection/ApiConnection.csproj ApiConnection/
COPY Models/Models.csproj Models/

# Restaura dependências
RUN dotnet restore ApiConnection/ApiConnection.csproj

# Copia todo o código
COPY . .

# Build
WORKDIR /src/ApiConnection
RUN dotnet publish -c Release -o /app/publish

# ===== RUNTIME =====
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ApiConnection.dll"]
