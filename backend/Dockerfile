# Multi-stage build for optimal image size and caching
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build jar
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create directory for local uploads
RUN mkdir -p /app/uploads

COPY --from=build /app/target/hostelconnect-backend-1.0.0-SNAPSHOT.jar app.jar

ENV PORT=8081
EXPOSE 8081

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
