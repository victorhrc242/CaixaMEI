# Etapa 1: imagem base (runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Certificados (MongoDB Atlas / HTTPS)
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*


# Etapa 2: build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia apenas o csproj primeiro (melhora cache)
COPY CaixaMEI.csproj ./
RUN dotnet restore "CaixaMEI.csproj"

# Copia o restante do projeto
COPY . .
RUN dotnet build "CaixaMEI.csproj" -c Release -o /app/build


# Etapa 3: publish
FROM build AS publish
RUN dotnet publish "CaixaMEI.csproj" -c Release -o /app/publish


# Etapa 4: imagem final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "CaixaMEI.dll"]
