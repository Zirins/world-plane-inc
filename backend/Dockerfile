FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy all project files first (order matters - dependencies before dependents)
COPY ["utils/utils.csproj", "utils/"]
COPY ["dal/dal.csproj", "dal/"]
COPY ["model/model.csproj", "model/"]
COPY ["api/api.csproj", "api/"]
RUN dotnet restore "api/api.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "api/api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "api.dll"]
