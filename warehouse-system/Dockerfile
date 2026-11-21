# Build stage
FROM maven:3.9.9-eclipse-temurin-25 AS build
WORKDIR /build

# Pre-cache dependencies (best-effort; `package` re-fetches anything missing)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline || true

# Compile and package (tests run separately against Postgres/Testcontainers)
COPY src ./src
RUN mvn -B -q -Dmaven.test.skip=true package

# Runtime stage
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
